import shutil
import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from resume_analyzer import invoke_agent
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
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Read file content to check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )
    
    # Save the uploaded file temporarily
    temp_file_path = f"temp_{file.filename}"
    try:
        with open(temp_file_path, "wb") as buffer:
            buffer.write(contents)
        
        # Invoke the agent with the file path
        res = invoke_agent(temp_file_path)
        
        # Save analysis to database
        db_analysis = ResumeAnalysis(
            user_id=str(current_user.id),
            filename=file.filename,
            analysis_data=res
        )
        await db_analysis.insert()
        
        return {"message": "Resume analyzed successfully", "data": res, "id": str(db_analysis.id)}
    
    except Exception as e:
        print("Resume analysis error:", e)
        raise HTTPException(
        status_code=500,
        detail="Resume analysis failed. Please try again."
        )
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

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
    analysis = await ResumeAnalysis.find_one(ResumeAnalysis.id == analysis_id if len(analysis_id) == 24 else None) 
    # Beanie handles ObjectId conversion automatically if we pass the ObjectId, but if we query by 'id', it usually expects ObjectId type or string if configured.
    # Actually, simpler: await ResumeAnalysis.get(analysis_id)
    
    if not analysis:
        # try finding by custom query if .get() fails or if we want to ensure ownership
        analysis = await ResumeAnalysis.get(analysis_id)
    
    if not analysis or analysis.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis.analysis_data
