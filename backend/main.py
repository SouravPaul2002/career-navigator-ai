from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.career.career_routes import router as career_router
from routes.users.user_routes import router as users_router
from routes.common.common_routes import router as common_router
from routes.career.interview_routes import router as interview_router
from routes.career.guidance_routes import router as guidance_router
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the route routers
app.include_router(career_router, prefix="/career", tags=["career"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(interview_router, prefix="/interview", tags=["interview"])
app.include_router(guidance_router, prefix="/guidance", tags=["guidance"])
app.include_router(common_router, tags=["common"])