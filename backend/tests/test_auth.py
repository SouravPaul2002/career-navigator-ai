import pytest
from httpx import AsyncClient
from models import User
from auth import verify_password

@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient):
    response = await client.post(
        "/users/signup",
        json={"email": "newuser@example.com", "password": "Password123", "name": "New User"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data

    # Verify user exists in database with hashed password
    db_user = await User.find_one(User.email == "newuser@example.com")
    assert db_user is not None
    assert verify_password("Password123", db_user.hashed_password)

@pytest.mark.asyncio
async def test_signup_weak_password(client: AsyncClient):
    # Too short (< 8 chars)
    res1 = await client.post(
        "/users/signup",
        json={"email": "short@example.com", "password": "Pass1", "name": "Short"}
    )
    assert res1.status_code == 422

    # No number
    res2 = await client.post(
        "/users/signup",
        json={"email": "nonum@example.com", "password": "PasswordOnly", "name": "NoNum"}
    )
    assert res2.status_code == 422

    # No letter
    res3 = await client.post(
        "/users/signup",
        json={"email": "noletter@example.com", "password": "1234567890", "name": "NoLetter"}
    )
    assert res3.status_code == 422

@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    user_payload = {"email": "duplicate@example.com", "password": "Password123", "name": "User One"}
    res1 = await client.post("/users/signup", json=user_payload)
    assert res1.status_code == 200

    res2 = await client.post("/users/signup", json=user_payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post(
        "/users/signup",
        json={"email": "login@example.com", "password": "Password123", "name": "Login User"}
    )
    res = await client.post(
        "/users/login",
        data={"username": "login@example.com", "password": "Password123"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/users/signup",
        json={"email": "wrongpass@example.com", "password": "Password123", "name": "Wrong Pass"}
    )
    res = await client.post(
        "/users/login",
        data={"username": "wrongpass@example.com", "password": "WrongPassword999"}
    )
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    res = await client.post(
        "/users/login",
        data={"username": "nonexistent@example.com", "password": "Password123"}
    )
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_change_password_valid(client: AsyncClient, user_a: dict):
    res = await client.post(
        "/users/me/change-password",
        json={"old_password": "Password123", "new_password": "NewPassword456"},
        headers=user_a["headers"]
    )
    assert res.status_code == 200
    assert res.json()["message"] == "Password changed successfully"

    # Verify old password no longer works
    login_old = await client.post(
        "/users/login",
        data={"username": user_a["email"], "password": "Password123"}
    )
    assert login_old.status_code == 401

    # Verify new password works
    login_new = await client.post(
        "/users/login",
        data={"username": user_a["email"], "password": "NewPassword456"}
    )
    assert login_new.status_code == 200

@pytest.mark.asyncio
async def test_change_password_weak_new_password(client: AsyncClient, user_a: dict):
    res = await client.post(
        "/users/me/change-password",
        json={"old_password": "Password123", "new_password": "short"},
        headers=user_a["headers"]
    )
    assert res.status_code == 422

@pytest.mark.asyncio
async def test_change_password_incorrect_old_password(client: AsyncClient, user_a: dict):
    res = await client.post(
        "/users/me/change-password",
        json={"old_password": "WrongOldPassword99", "new_password": "NewPassword456"},
        headers=user_a["headers"]
    )
    assert res.status_code == 400
    assert "incorrect old password" in res.json()["detail"].lower()
