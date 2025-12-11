from fastapi import APIRouter, HTTPException, status, Depends
from database import db
from models import OrderCreate, OrderResponse, OrderItem, UserResponse, UserRole
from auth import get_current_user
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_create: OrderCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    # 1. Validate items and calculate total
    order_items = []
    total_amount = 0.0
    
    for item in order_create.items:
        try:
            product = await db.products.find_one({"_id": ObjectId(item.product_id)})
        except:
             raise HTTPException(status_code=400, detail=f"Invalid Product ID: {item.product_id}")
             
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.product_id}")
            
        if product["quantity"] < item.quantity:
             raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock for product: {product['name']}"
            )
            
        # Deduct inventory immediately (Optimistic locking for MVP)
        # In a real high-concurrency app, we'd use transactions or more robust checks
        result = await db.products.update_one(
            {"_id": ObjectId(item.product_id), "quantity": {"$gte": item.quantity}},
            {"$inc": {"quantity": -item.quantity}}
        )
        
        if result.modified_count == 0:
             raise HTTPException(
                status_code=400, 
                detail=f"Failed to secure stock for product: {product['name']}. Please try again."
            )

        item_total = product["price"] * item.quantity
        total_amount += item_total
        
        order_items.append(OrderItem(
            product_id=str(product["_id"]),
            quantity=item.quantity,
            price=product["price"],
            product_name=product["name"],
            storefront_id=str(product["storefront_id"])
        ))
        
    # 2. Create Order
    order_data = {
        "buyer_id": str(current_user.id),
        "items": [item.model_dump() for item in order_items],
        "total": total_amount,
        "status": "completed", # Simulating immediate success for MVP
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    new_order = await db.orders.insert_one(order_data)
    created_order = await db.orders.find_one({"_id": new_order.inserted_id})
    
    return OrderResponse(**created_order)

@router.get("/mine", response_model=list[OrderResponse])
async def get_my_orders(current_user: UserResponse = Depends(get_current_user)):
    # If user is a buyer (or acting as one), show purchases
    # If user is a seller, show sales? 
    # The requirement says "Get orders for current user (Buyer view or Seller view)"
    # Let's try to return both or merge them, or decide based on query param?
    # For simplicity:
    # 1. Find orders where I am the buyer
    buyer_orders_cursor = db.orders.find({"buyer_id": str(current_user.id)})
    buyer_orders = await buyer_orders_cursor.to_list(length=100)
    
    seller_orders = []
    if current_user.role == UserRole.KID_SELLER:
        # Find orders that contain items from my storefront
        storefront = await db.storefronts.find_one({"kid_id": str(current_user.id)})
        if storefront:
            storefront_id = str(storefront["_id"])
            seller_orders_cursor = db.orders.find({"items.storefront_id": storefront_id})
            seller_orders = await seller_orders_cursor.to_list(length=100)
    
    # Merge and deduplicate (though unlikely to overlap unless I buy my own stuff)
    all_orders = {str(o["_id"]): o for o in buyer_orders + seller_orders}
    
    # Sort by date desc
    sorted_orders = sorted(
        all_orders.values(), 
        key=lambda x: x.get("created_at", ""), 
        reverse=True
    )
    
    return [OrderResponse(**o) for o in sorted_orders]