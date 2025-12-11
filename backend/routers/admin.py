from fastapi import APIRouter, HTTPException, status, Depends
from database import db
from models import UserResponse, StorefrontResponse, ProductResponse, OrderResponse, UserRole
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

async def check_admin(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(admin: UserResponse = Depends(check_admin)):
    users_cursor = db.users.find({})
    users = await users_cursor.to_list(length=1000)
    return [UserResponse(**u) for u in users]

@router.get("/storefronts", response_model=List[StorefrontResponse])
async def list_all_storefronts(admin: UserResponse = Depends(check_admin)):
    cursor = db.storefronts.find({})
    storefronts = await cursor.to_list(length=1000)
    return [StorefrontResponse(**s) for s in storefronts]

@router.get("/products", response_model=List[ProductResponse])
async def list_all_products(admin: UserResponse = Depends(check_admin)):
    cursor = db.products.find({})
    products = await cursor.to_list(length=1000)
    return [ProductResponse(**p) for p in products]

@router.get("/orders", response_model=List[OrderResponse])
async def list_all_orders(admin: UserResponse = Depends(check_admin)):
    cursor = db.orders.find({})
    orders = await cursor.to_list(length=1000)
    return [OrderResponse(**o) for o in orders]