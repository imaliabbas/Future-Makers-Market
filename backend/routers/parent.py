from fastapi import APIRouter, HTTPException, status, Depends, Body
from database import db
from models import ProductResponse, UserRole, UserResponse, ProductStatus, UserBase, UserInDB
from auth import get_current_user
from typing import List
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/parent", tags=["parent"])

@router.get("/children", response_model=List[UserResponse])
async def get_my_children(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.PARENT_GUARDIAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can view their children"
        )
    
    # Find all users where parent_id matches current user's ID
    children_cursor = db.users.find({"parent_id": str(current_user.id)})
    children = await children_cursor.to_list(length=100)
    return [UserResponse(**child) for child in children]

@router.get("/approvals", response_model=List[ProductResponse])
async def get_pending_approvals(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.PARENT_GUARDIAN:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can view pending approvals"
        )
    
    # 1. Get all children IDs
    children_cursor = db.users.find({"parent_id": str(current_user.id)})
    children = await children_cursor.to_list(length=100)
    kid_ids = [str(child["_id"]) for child in children]
    
    if not kid_ids:
        return []

    # 2. Get all storefronts for these kids
    storefronts_cursor = db.storefronts.find({"kid_id": {"$in": kid_ids}})
    storefronts = await storefronts_cursor.to_list(length=100)
    storefront_ids = [str(sf["_id"]) for sf in storefronts]
    
    if not storefront_ids:
        return []

    # 3. Get pending products from these storefronts
    products_cursor = db.products.find({
        "storefront_id": {"$in": storefront_ids},
        "status": ProductStatus.PENDING_APPROVAL.value
    })
    products = await products_cursor.to_list(length=100)

    # 4. Enrich with storefront name
    storefront_map = {str(sf["_id"]): sf["display_name"] for sf in storefronts}
    
    results = []
    for p in products:
        p["storefront_name"] = storefront_map.get(str(p["storefront_id"]), "Unknown Store")
        results.append(ProductResponse(**p))
    
    return results

@router.get("/stats")
async def get_parent_stats(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.PARENT_GUARDIAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can view stats"
        )
        
    # 1. Get Children count
    children_cursor = db.users.find({"parent_id": str(current_user.id)})
    children = await children_cursor.to_list(length=100)
    kid_ids = [str(child["_id"]) for child in children]
    linked_kid_sellers = len(children)
    
    pending_approvals_count = 0
    total_child_earnings = 0.0
    
    if kid_ids:
        # 2. Get Pending Approvals count
        # Get storefronts for kids
        storefronts_cursor = db.storefronts.find({"kid_id": {"$in": kid_ids}})
        storefronts = await storefronts_cursor.to_list(length=100)
        storefront_ids = [str(sf["_id"]) for sf in storefronts]
        
        if storefront_ids:
            # Count pending products
            pending_approvals_count = await db.products.count_documents({
                "storefront_id": {"$in": storefront_ids},
                "status": ProductStatus.PENDING_APPROVAL.value
            })
            
            # 3. Calculate Total Earnings
            # Find orders where items.storefront_id is in our storefront_ids
            # Since orders have items, and items have storefront_id, we need to aggregate or filter
            # Simplified approach: Find orders that contain items from these storefronts
            
            pipeline = [
                # Unwind items to process each item individually
                {"$unwind": "$items"},
                # Match items belonging to the kids' storefronts
                {"$match": {
                    "items.storefront_id": {"$in": storefront_ids},
                    "status": "completed" # Only count completed orders
                }},
                # Group to sum the total earnings
                {"$group": {
                    "_id": None,
                    "total_earnings": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
                }}
            ]
            
            result = await db.orders.aggregate(pipeline).to_list(length=1)
            if result:
                total_child_earnings = result[0]["total_earnings"]

    return {
        "linked_kid_sellers": linked_kid_sellers,
        "pending_approvals_count": pending_approvals_count,
        "total_child_earnings": total_child_earnings
    }

@router.post("/approvals/{product_id}")
async def approve_reject_product(
    product_id: str, 
    action: str = Body(..., embed=True), # Expects {"action": "approve"} or {"action": "reject"}
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.role != UserRole.PARENT_GUARDIAN:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can approve/reject products"
        )
    
    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be 'approve' or 'reject'"
        )

    try:
        product = await db.products.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid Product ID")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Verify parental relationship
    storefront = await db.storefronts.find_one({"_id": ObjectId(product["storefront_id"])})
    if not storefront:
        raise HTTPException(status_code=404, detail="Storefront not found")
    
    kid = await db.users.find_one({"_id": ObjectId(storefront["kid_id"])})
    if not kid:
        raise HTTPException(status_code=404, detail="Kid account not found")
        
    if str(kid.get("parent_id")) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the parent of this seller"
        )

    new_status = ProductStatus.ACTIVE.value if action == "approve" else ProductStatus.REJECTED.value
    
    update_data = {
        "status": new_status,
        "parent_approved_by_user_id": str(current_user.id),
        "parent_approval_date": datetime.now(timezone.utc).isoformat()
    }

    await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    
    return {"message": f"Product {action}d successfully"}