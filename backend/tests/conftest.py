import os
import pytest
from httpx import AsyncClient, ASGITransport

# Set environment variables for testing before importing application modules
os.environ["SECRET_KEY"] = "test-secret-key-1234567890-test-key"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

# Patch mongomock.database.Database.list_collection_names for Beanie 2 compatibility
import mongomock.database
_orig_list = mongomock.database.Database.list_collection_names
def _patched_list(self, *args, **kwargs):
    kwargs.pop("authorizedCollections", None)
    kwargs.pop("nameOnly", None)
    return _orig_list(self, *args, **kwargs)
mongomock.database.Database.list_collection_names = _patched_list

from mongomock_motor import AsyncMongoMockClient
from beanie import init_beanie
from models import User, UserRoadmap, InterviewSession, ResumeAnalysis
from main import app

@pytest.fixture(autouse=True)
async def init_test_db():
    client = AsyncMongoMockClient()
    db = client.get_database("test_career_navigator")
    await init_beanie(
        database=db,
        document_models=[User, UserRoadmap, InterviewSession, ResumeAnalysis]
    )
    yield
    await User.delete_all()
    await UserRoadmap.delete_all()
    await InterviewSession.delete_all()
    await ResumeAnalysis.delete_all()

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def user_a(client: AsyncClient):
    signup_res = await client.post(
        "/users/signup",
        json={"email": "usera@example.com", "password": "Password123", "name": "User A"}
    )
    assert signup_res.status_code == 200
    login_res = await client.post(
        "/users/login",
        data={"username": "usera@example.com", "password": "Password123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    user_db = await User.find_one(User.email == "usera@example.com")
    return {
        "email": "usera@example.com",
        "id": str(user_db.id),
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }

@pytest.fixture
async def user_b(client: AsyncClient):
    signup_res = await client.post(
        "/users/signup",
        json={"email": "userb@example.com", "password": "Password123", "name": "User B"}
    )
    assert signup_res.status_code == 200
    login_res = await client.post(
        "/users/login",
        data={"username": "userb@example.com", "password": "Password123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    user_db = await User.find_one(User.email == "userb@example.com")
    return {
        "email": "userb@example.com",
        "id": str(user_db.id),
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"}
    }
