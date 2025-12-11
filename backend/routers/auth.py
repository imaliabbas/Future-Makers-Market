from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from database import db
from models import UserCreate, UserResponse, UserInDB, Token, UserRole, UserUpdate
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from config import settings
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    try:
        # Check if user already exists
        if await db.users.find_one({"email": user.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        parent_id = None

        # Handle Kid Seller logic
        if user.role == UserRole.KID_SELLER:
            if not user.parent_email:
                 raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent email is required for kid accounts"
                )
            
            # In a real app, we might want to ensure the parent exists.
            # For this sprint, if the parent email is provided, we check if it exists in DB.
            parent = await db.users.find_one({"email": user.parent_email, "role": UserRole.PARENT_GUARDIAN.value})
            if not parent:
                 raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent account not found with provided email"
                )
            parent_id = str(parent["_id"])
        
        hashed_password = get_password_hash(user.password)
        
        user_data = {
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role.value, # Store enum value as string
            "password_hash": hashed_password,
            "parent_id": parent_id or user.parent_id,
            "birthday": user.birthday
        }

        new_user = await db.users.insert_one(user_data)
        created_user = await db.users.find_one({"_id": new_user.inserted_id})
        return UserResponse(**created_user)
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Signup Error: {str(e)}") # Simple logging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm expects 'username' and 'password' fields.
    # We are using email as username.
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_update: UserUpdate, current_user: UserResponse = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
        
    if not update_data:
        return current_user
        
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    return UserResponse(**updated_user)