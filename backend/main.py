from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.utils.database import Base, engine
from backend.routes import auth, bots, admin
from backend.config import settings
import os

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Nail API",
    description="AI Assistant SaaS Platform API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "*"],  # Allow all for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(bots.router)

# Serve static files (uploads and widget)
uploads_path = os.path.join(os.path.dirname(__file__), "..", "uploads")
widget_path = os.path.join(os.path.dirname(__file__), "..", "widget")

if os.path.exists(uploads_path):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

if os.path.exists(widget_path):
    app.mount("/widget", StaticFiles(directory=widget_path), name="widget")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Nail API",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
