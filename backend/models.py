from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional, Annotated, List
from enum import Enum

# Helper for MongoDB ObjectId handling in Pydantic v2
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserRole(str, Enum):
    KID_SELLER = "kid_seller"
    PARENT_GUARDIAN = "parent_guardian"
    BUYER = "buyer"
    ADMIN = "admin"

class StorefrontStatus(str, Enum):
    ACTIVE = "active"
    DRAFT = "draft"

class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    role: UserRole
    parent_id: Optional[str] = None
    birthday: Optional[str] = None # YYYY-MM-DD

class UserCreate(UserBase):
    password: str
    parent_email: Optional[EmailStr] = None # Used to link kid to parent during signup

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = None
    
class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    password_hash: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class StorefrontBase(BaseModel):
    display_name: str
    description: str
    status: StorefrontStatus = StorefrontStatus.DRAFT

class StorefrontCreate(StorefrontBase):
    pass

class StorefrontUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StorefrontStatus] = None

class StorefrontResponse(StorefrontBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    kid_id: PyObjectId

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class ProductStatus(str, Enum):
    ACTIVE = "active"
    PENDING_APPROVAL = "pending_approval"
    REJECTED = "rejected"
    SOLD_OUT = "sold_out"

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
    images: List[str] = []
    image_names: List[str] = []
    size: Optional[str] = None
    materials: Optional[str] = None
    time_required: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    images: Optional[List[str]] = None
    image_names: Optional[List[str]] = None
    status: Optional[ProductStatus] = None
    size: Optional[str] = None
    materials: Optional[str] = None
    time_required: Optional[str] = None

class ProductResponse(ProductBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    storefront_id: PyObjectId
    status: ProductStatus
    storefront_name: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float
    product_name: str
    storefront_id: str

class OrderStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"

class OrderBase(BaseModel):
    buyer_id: Optional[str] = None
    items: List[OrderItem]
    total: float
    status: OrderStatus = OrderStatus.COMPLETED
    created_at: Optional[str] = None

class OrderCreateItem(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderCreateItem]

class OrderResponse(OrderBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True