from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from database import db
from models import ProductCreate, ProductResponse, ProductUpdate, UserRole, UserResponse, ProductStatus
from auth import get_current_user
from typing import List, Optional
from bson import ObjectId
import shutil
import os
import uuid

router = APIRouter(prefix="/products", tags=["products"])

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BACKEND_DIR, "static", "uploads")

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.KID_SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only kids can upload product images"
        )
    
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return the relative URL
        # In production this would be a full URL or cloud storage path
        # The 'static' mount in main.py maps /static to backend/static
        url = f"/static/uploads/{unique_filename}"
        return {"url": url, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload image: {str(e)}")

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.role != UserRole.KID_SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only kids can create products"
        )
    
    # Get kid's storefront
    storefront = await db.storefronts.find_one({"kid_id": str(current_user.id)})
    if not storefront:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must create a storefront before adding products"
        )
        
    product_data = product.model_dump()
    product_data["storefront_id"] = str(storefront["_id"])
    product_data["status"] = ProductStatus.PENDING_APPROVAL.value
    
    new_product = await db.products.insert_one(product_data)
    created_product = await db.products.find_one({"_id": new_product.inserted_id})
    
    return ProductResponse(**created_product)

@router.get("/", response_model=List[ProductResponse])
async def list_products(
    seller_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    
    # If seller_id is provided, assuming it's a valid ObjectId string for storefront_id or kid_id.
    # Since products link to storefront_id, let's treat seller_id as storefront_id for public search.
    # OR we could look up the storefront by kid_id (seller_id).
    # Let's look up storefront if the ID matches a user (kid).

    if seller_id and seller_id != "me":
        # Check if it's a kid_id
        storefront = await db.storefronts.find_one({"kid_id": seller_id})
        if storefront:
             query["storefront_id"] = str(storefront["_id"])
        else:
             # Assume it might be a direct storefront_id
             query["storefront_id"] = seller_id

    if status:
        query["status"] = status
    else:
        # Default public view: only active products unless specified otherwise
        query["status"] = ProductStatus.ACTIVE.value

    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    products_cursor = db.products.find(query)
    products = await products_cursor.to_list(length=100)
    return [ProductResponse(**p) for p in products]

@router.get("/marketplace", response_model=List[ProductResponse])
async def list_marketplace_products(search: Optional[str] = None):
    # Treat empty string as None
    if search is not None and search.strip() == "":
        search = None

    query = {
        "status": ProductStatus.ACTIVE.value,
        "quantity": {"$gt": 0}
    }
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
        
    products_cursor = db.products.find(query)
    products = await products_cursor.to_list(length=100)
    
    # Enrich with storefront name efficiently
    if products:
        storefront_ids = list(set([p["storefront_id"] for p in products]))
        storefronts_cursor = db.storefronts.find({"_id": {"$in": [ObjectId(sid) for sid in storefront_ids]}})
        storefronts = await storefronts_cursor.to_list(length=len(storefront_ids))
        storefront_map = {str(sf["_id"]): sf["display_name"] for sf in storefronts}
        
        for p in products:
            p["storefront_name"] = storefront_map.get(str(p["storefront_id"]), "Unknown Store")
            
    return [ProductResponse(**p) for p in products]

@router.get("/mine", response_model=List[ProductResponse])
async def list_my_products(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.KID_SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only kids have products"
        )
        
    storefront = await db.storefronts.find_one({"kid_id": str(current_user.id)})
    if not storefront:
        return []

    products_cursor = db.products.find({"storefront_id": str(storefront["_id"])})
    products = await products_cursor.to_list(length=100)
    return [ProductResponse(**p) for p in products]

@router.get("/{id}", response_model=ProductResponse)
async def get_product(id: str):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return ProductResponse(**product)

@router.patch("/{id}", response_model=ProductResponse)
async def update_product(
    id: str,
    product_update: ProductUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    if not product:
         raise HTTPException(status_code=404, detail="Product not found")
         
    # Check ownership via storefront
    storefront = await db.storefronts.find_one({"_id": ObjectId(product["storefront_id"])})
    if not storefront or str(storefront["kid_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own products"
        )
        
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    
    if update_data:
        # If important fields are changed, maybe reset status to pending_approval?
        # For now, let's keep it simple.
        await db.products.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
    updated_product = await db.products.find_one({"_id": ObjectId(id)})
    return ProductResponse(**updated_product)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(id: str, current_user: UserResponse = Depends(get_current_user)):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check ownership via storefront
    storefront = await db.storefronts.find_one({"_id": ObjectId(product["storefront_id"])})
    if not storefront or str(storefront["kid_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own products"
        )

    await db.products.delete_one({"_id": ObjectId(id)})
    return None