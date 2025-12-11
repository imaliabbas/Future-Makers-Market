from fastapi import APIRouter, HTTPException, status, Depends, Body
from database import db
from models import StorefrontCreate, StorefrontResponse, StorefrontUpdate, UserRole, UserResponse
from auth import get_current_user
from typing import List
from bson import ObjectId

router = APIRouter(prefix="/storefronts", tags=["storefronts"])

@router.post("/", response_model=StorefrontResponse, status_code=status.HTTP_201_CREATED)
async def create_storefront(
    storefront: StorefrontCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.role != UserRole.KID_SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only kids can create storefronts"
        )
    
    # Check if kid already has a storefront
    existing_storefront = await db.storefronts.find_one({"kid_id": str(current_user.id)})
    if existing_storefront:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a storefront"
        )

    storefront_data = storefront.model_dump()
    storefront_data["kid_id"] = str(current_user.id)
    
    new_storefront = await db.storefronts.insert_one(storefront_data)
    created_storefront = await db.storefronts.find_one({"_id": new_storefront.inserted_id})
    
    return StorefrontResponse(**created_storefront)

@router.get("/mine", response_model=StorefrontResponse)
async def get_my_storefront(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.KID_SELLER:
        raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="Only kids have storefronts"
        )
        
    storefront = await db.storefronts.find_one({"kid_id": str(current_user.id)})
    if not storefront:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Storefront not found"
        )
    
    return StorefrontResponse(**storefront)

@router.get("/{id}", response_model=StorefrontResponse)
async def get_storefront(id: str):
    try:
        storefront = await db.storefronts.find_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not storefront:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Storefront not found"
        )
    
    return StorefrontResponse(**storefront)

@router.patch("/{id}", response_model=StorefrontResponse)
async def update_storefront(
    id: str,
    storefront_update: StorefrontUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        storefront = await db.storefronts.find_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not storefront:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Storefront not found"
        )
        
    # Ensure ownership
    if str(storefront["kid_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own storefront"
        )

    update_data = {k: v for k, v in storefront_update.model_dump().items() if v is not None}

    if update_data:
        await db.storefronts.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_data}
        )
        
    updated_storefront = await db.storefronts.find_one({"_id": ObjectId(id)})
    return StorefrontResponse(**updated_storefront)