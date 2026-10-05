from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "message": "Server is running"}

@router.get("/info")
async def server_info():
    return {"app": "Career Navigator API", "version": "1.0.0"}