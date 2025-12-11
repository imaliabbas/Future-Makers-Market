# Trigger reload for env update
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import settings
from database import db
import os
from routers import auth, storefronts, products, parent, orders, admin

app = FastAPI(title="Future Makers Market Backend")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_details = traceback.format_exc()
    print(f"Global Error: {error_details}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc), "traceback": error_details.split("\n")}
    )

app.include_router(auth.router, prefix="/api/v1")
app.include_router(storefronts.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(parent.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

# Mount static files for image uploads
# Use absolute path to avoid issues with working directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def health_check():
    try:
        # Ping the database to check connection
        await db.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        # Log the error in a real app
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")