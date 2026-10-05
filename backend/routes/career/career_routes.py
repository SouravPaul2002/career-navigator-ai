import os
import tempfile
import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from starlette.concurrency import run_in_threadpool
from resume_analyzer import invoke_agent
from beanie import PydanticObjectId
from auth import get_current_user
from models import User, ResumeAnalysis

router = APIRouter()

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Endpoint to analyze a resume and return career insights."""
    if not (file.filename and file.filename.lower().endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Read file content to check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )

    # Check %PDF magic bytes
    if not contents.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file.")
    
    # Save the uploaded file temporarily using a UUID tempfile path
    temp_file_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.pdf")
    try:
        with open(temp_file_path, "wb") as buffer:
            buffer.write(contents)
        
        # Invoke the blocking agent work with run_in_threadpool
        res = await run_in_threadpool(invoke_agent, temp_file_path)
        
        # Save analysis to database
        db_analysis = ResumeAnalysis(
            user_id=str(current_user.id),
            filename=file.filename or "resume.pdf",
            analysis_data=res
        )
        await db_analysis.insert()
        
        return {"message": "Resume analyzed successfully", "data": res, "id": str(db_analysis.id)}
    
    except HTTPException:
        raise
    except Exception as e:
        print("Resume analysis error:", e)
        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed. Please try again."
        )
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except OSError:
                pass

@router.get("/history", response_model=List[dict])
async def get_history(
    current_user: User = Depends(get_current_user)
):
    """Fetch history of resume analyses for the current user."""
    # Find all analyses for this user, sorted by created_at desc
    results = await ResumeAnalysis.find(ResumeAnalysis.user_id == str(current_user.id)).sort("-created_at").to_list()
    
    # We'll return a simplified list for history (just metadata + maybe score)
    history = []
    for item in results:
        history.append({
            "id": str(item.id),
            "filename": item.filename,
            "created_at": item.created_at,
            "score": item.analysis_data.get("analysis", {}).get("score", 0),
            "domain": item.analysis_data.get("analysis", {}).get("identified_domain", "N/A")
        })
    return history

@router.get("/analysis/{analysis_id}")
async def get_analysis_detail(
    analysis_id: str,
    current_user: User = Depends(get_current_user)
):
    """Fetch details of a specific past analysis."""
    if not PydanticObjectId.is_valid(analysis_id):
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis = await ResumeAnalysis.get(PydanticObjectId(analysis_id))
    if not analysis or analysis.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis.analysis_data
