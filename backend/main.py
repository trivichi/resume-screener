from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor

from database import init_db, get_db, Resume
from resume_parser import extract_text_from_pdf, parse_resume_with_llm
from llm_matcher import match_resume_with_job

app = FastAPI(title="Smart Resume Screener API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize database
init_db()

# Thread pool for parallel processing
executor = ThreadPoolExecutor(max_workers=5)

@app.get("/")
def root():
    return {
        "message": "Smart Resume Screener API",
        "version": "1.0",
        "endpoints": {
            "POST /upload-resume": "Upload single resume",
            "POST /batch-upload": "Upload multiple resumes",
            "POST /match": "Match resume with job description",
            "GET /resumes": "Get all stored resumes",
            "GET /resumes/{id}": "Get specific resume",
            "DELETE /resumes/{id}": "Delete resume"
        }
    }

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse a single resume"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract text
        resume_text = extract_text_from_pdf(file_path)
        
        # Parse with LLM
        parsed_data = parse_resume_with_llm(resume_text)
        
        # Store in database
        resume_entry = Resume(
            filename=file.filename,
            candidate_name=parsed_data.get('name', 'Unknown'),
            email=parsed_data.get('email', 'Not Found'),
            phone=parsed_data.get('phone', 'Not Found'),
            skills=', '.join(parsed_data.get('skills', [])),
            experience=parsed_data.get('experience', 'Not Found'),
            education=parsed_data.get('education', 'Not Found'),
            raw_text=resume_text
        )
        
        db.add(resume_entry)
        db.commit()
        db.refresh(resume_entry)
        
        return {
            "status": "success",
            "resume_id": resume_entry.id,
            "parsed_data": parsed_data,
            "message": "Resume uploaded and parsed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/batch-upload")
async def batch_upload(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Upload and parse multiple resumes with parallel processing"""
    
    async def process_single_file(file):
        if not file.filename.endswith('.pdf'):
            return {
                "filename": file.filename,
                "status": "error",
                "message": "Only PDF files supported"
            }
        
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        try:
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Extract and parse (in thread pool)
            loop = asyncio.get_event_loop()
            resume_text = await loop.run_in_executor(executor, extract_text_from_pdf, file_path)
            parsed_data = await loop.run_in_executor(executor, parse_resume_with_llm, resume_text)
            
            # Store in database
            resume_entry = Resume(
                filename=file.filename,
                candidate_name=parsed_data.get('name', 'Unknown'),
                email=parsed_data.get('email', 'Not Found'),
                phone=parsed_data.get('phone', 'Not Found'),
                skills=', '.join(parsed_data.get('skills', [])),
                experience=parsed_data.get('experience', 'Not Found'),
                education=parsed_data.get('education', 'Not Found'),
                raw_text=resume_text
            )
            
            db.add(resume_entry)
            db.commit()
            db.refresh(resume_entry)
            
            return {
                "filename": file.filename,
                "status": "success",
                "resume_id": resume_entry.id,
                "parsed_data": parsed_data
            }
            
        except Exception as e:
            return {
                "filename": file.filename,
                "status": "error",
                "message": str(e)
            }
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
    
    # Process all files in parallel
    results = await asyncio.gather(*[process_single_file(file) for file in files])
    
    return {
        "total_files": len(files),
        "successful": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "results": results
    }

@app.post("/match")
async def match_resumes(
    job_description: str = Form(...),
    resume_ids: str = Form(None),
    db: Session = Depends(get_db)
):
    """Match resumes with job description using parallel processing"""
    
    if resume_ids:
        ids = [int(id.strip()) for id in resume_ids.split(',')]
        resumes = db.query(Resume).filter(Resume.id.in_(ids)).all()
    else:
        resumes = db.query(Resume).all()
    
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found")
    
    async def process_single_resume(resume):
        # Prepare resume data
        resume_data = {
            'name': resume.candidate_name,
            'email': resume.email,
            'skills': resume.skills.split(', ') if resume.skills else [],
            'experience': resume.experience,
            'education': resume.education
        }
        
        # Get match analysis (in thread pool for parallel execution)
        loop = asyncio.get_event_loop()
        match_result = await loop.run_in_executor(
            executor, 
            match_resume_with_job, 
            resume_data, 
            job_description
        )
        
        # Update database
        resume.match_score = match_result['overall_score']
        resume.skills_score = match_result['skills_score']
        resume.experience_score = match_result['experience_score']
        resume.education_score = match_result['education_score']
        resume.justification = match_result['justification']
        resume.job_description = job_description
        
        return {
            "resume_id": resume.id,
            "candidate_name": resume.candidate_name,
            "email": resume.email,
            "filename": resume.filename,
            "overall_score": match_result['overall_score'],
            "skills_score": match_result['skills_score'],
            "experience_score": match_result['experience_score'],
            "education_score": match_result['education_score'],
            "strengths": match_result['strengths'],
            "gaps": match_result['gaps'],
            "justification": match_result['justification'],
            "recommendation": match_result['recommendation']
        }
    
    # Process all resumes in parallel (up to 5 at a time)
    results = await asyncio.gather(*[process_single_resume(resume) for resume in resumes])
    
    db.commit()
    
    # Sort by overall score
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return {
        "total_candidates": len(results),
        "job_description": job_description,
        "shortlisted_candidates": results
    }

@app.get("/resumes")
def get_all_resumes(db: Session = Depends(get_db)):
    """Get all stored resumes"""
    resumes = db.query(Resume).all()
    return {
        "total": len(resumes),
        "resumes": [{
            "id": r.id,
            "filename": r.filename,
            "candidate_name": r.candidate_name,
            "email": r.email,
            "phone": r.phone,
            "skills": r.skills,
            "match_score": r.match_score,
            "created_at": r.created_at
        } for r in resumes]
    }

@app.get("/resumes/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get specific resume details"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "filename": resume.filename,
        "candidate_name": resume.candidate_name,
        "email": resume.email,
        "phone": resume.phone,
        "skills": resume.skills,
        "experience": resume.experience,
        "education": resume.education,
        "match_score": resume.match_score,
        "skills_score": resume.skills_score,
        "experience_score": resume.experience_score,
        "education_score": resume.education_score,
        "justification": resume.justification,
        "job_description": resume.job_description,
        "created_at": resume.created_at
    }

@app.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    """Delete a resume"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

@app.delete("/resumes")
def delete_all_resumes(db: Session = Depends(get_db)):
    """Delete all resumes"""
    db.query(Resume).delete()
    db.commit()
    return {"message": "All resumes deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)