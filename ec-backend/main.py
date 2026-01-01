"""EC-Backend: LLM Evals Cookbook Backend API."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import init_db
from app.modules.playground.router import router as playground_router
from app.modules.evals.router import router as evals_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info("Starting EC-Backend...")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down EC-Backend...")


# Create FastAPI application
app = FastAPI(
    title="EC-Backend",
    description="Backend API for LLM Evals Cookbook - Playground inference and batch evaluations",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(playground_router)
app.include_router(evals_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "EC-Backend",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "groq_configured": bool(settings.groq_api_key),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
