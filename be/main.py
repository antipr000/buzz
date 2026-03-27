from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import config
import models  # noqa: F401 — side-effect: load every mapped class so relationships resolve
from user.routes.user_router import user_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Server is starting: {config.app_name}")
    yield
    print("Server is shutting down...")

app = FastAPI(
    title=config.app_name,
    debug=config.debug,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": f"Welcome to {config.app_name}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
