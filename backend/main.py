# from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from typing import List
# import os
# import shutil
# from datetime import datetime
# import asyncio
# from concurrent.futures import ThreadPoolExecutor
# import hashlib

# from resume_parser import extract_text_from_pdf
# from llm_matcher import match_resume_with_job

# app = FastAPI(title="Smart Resume Screener API - In-Memory")

# # CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Create uploads directory
# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Thread pool for parallel processing
# executor = ThreadPoolExecutor(max_workers=10)

# # IN-MEMORY STORAGE (no database!)
# resumes_storage = {}  # {resume_id: {filename, raw_text, ...}}
# results_storage = {}  # {resume_id: match_results}
# next_id = 1

# def get_file_hash(content: bytes) -> str:
#     """Generate hash for file content"""
#     return hashlib.md5(content).hexdigest()

# @app.get("/")
# def root():
#     return {
#         "message": "Smart Resume Screener API - In-Memory Mode",
#         "version": "2.0",
#         "storage": "In-Memory (No Database)",
#         "total_resumes": len(resumes_storage),
#         "endpoints": {
#             "POST /batch-upload": "Upload multiple resumes",
#             "POST /match": "Match resumes with job description",
#             "DELETE /resumes/{id}": "Delete specific resume",
#             "DELETE /resumes": "Clear all resumes from memory"
#         }
#     }

# @app.post("/batch-upload")
# async def batch_upload(files: List[UploadFile] = File(...)):
#     global next_id
    
#     async def process_single_file(file):
#         global next_id
        
#         if not file.filename.endswith('.pdf'):
#             return {
#                 "filename": file.filename,
#                 "status": "error",
#                 "message": "Only PDF files supported"
#             }
        
#         try:
#             print(f"Processing: {file.filename}")
            
#             # Read file content
#             file_content = await file.read()
#             file_hash = get_file_hash(file_content)
            
#             # Save temporarily and extract
#             file_path = os.path.join(UPLOAD_DIR, file.filename)
#             with open(file_path, "wb") as buffer:
#                 buffer.write(file_content)
            
#             try:
#                 loop = asyncio.get_event_loop()
#                 resume_text = await loop.run_in_executor(
#                     executor, 
#                     extract_text_from_pdf, 
#                     file_path
#                 )
#             finally:
#                 # Always clean up
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
            
#             # Store in memory
#             resume_id = next_id
#             next_id += 1
            
#             resumes_storage[resume_id] = {
#                 "id": resume_id,
#                 "filename": file.filename,
#                 "raw_text": resume_text,
#                 "file_hash": file_hash
#             }
            
#             print(f"  ✓ Stored in memory: ID {resume_id}")
            
#             return {
#                 "filename": file.filename,
#                 "status": "success",
#                 "resume_id": resume_id,
#                 "text_length": len(resume_text)
#             }
            
#         except Exception as e:
#             print(f"✗ Error: {file.filename}: {str(e)}")
#             return {
#                 "filename": file.filename,
#                 "status": "error",
#                 "message": str(e)
#             }
    
#     print(f"\nUploading {len(files)} files...")
#     start_time = datetime.now()
    
#     results = await asyncio.gather(*[process_single_file(file) for file in files])
    
#     elapsed = (datetime.now() - start_time).total_seconds()
#     print(f"Upload completed in {elapsed:.2f}s")
#     print(f"Total resumes in memory: {len(resumes_storage)}\n")
    
#     return {
#         "total_files": len(files),
#         "successful": len([r for r in results if r["status"] == "success"]),
#         "failed": len([r for r in results if r["status"] == "error"]),
#         "processing_time": f"{elapsed:.2f}s",
#         "results": results
#     }

# @app.post("/match")
# async def match_resumes(job_description: str = Form(...)):
#     """Match ALL resumes in memory with job description using raw text + LLM"""
    
#     if not resumes_storage:
#         raise HTTPException(status_code=404, detail="No resumes found. Please upload resumes first.")
    
#     print(f"\nAnalyzing {len(resumes_storage)} resumes with LLM...")
#     start_time = datetime.now()
    
#     async def process_single_resume(resume_data):
#         try:
#             # LLM extracts info AND matches in ONE call with raw text!
#             loop = asyncio.get_event_loop()
#             result = await loop.run_in_executor(
#                 executor,
#                 extract_and_match_raw_text,
#                 resume_data['raw_text'],
#                 job_description
#             )
            
#             print(f"  ✓ {result['name']}: {result['overall_score']:.1f}/10")
            
#             # Store result
#             results_storage[resume_data['id']] = result
            
#             return {
#                 "resume_id": resume_data['id'],
#                 "candidate_name": result['name'],
#                 "email": result['email'],
#                 "phone": result['phone'],
#                 "filename": resume_data['filename'],
#                 "skills": result['skills'],
#                 "overall_score": result['overall_score'],
#                 "skills_score": result['skills_score'],
#                 "experience_score": result['experience_score'],
#                 "education_score": result['education_score'],
#                 "strengths": result['strengths'],
#                 "gaps": result['gaps'],
#                 "justification": result['justification'],
#                 "recommendation": result['recommendation']
#             }
#         except Exception as e:
#             print(f"  ✗ Error analyzing {resume_data['filename']}: {str(e)}")
#             return None
    
#     # Process in parallel
#     results = await asyncio.gather(*[
#         process_single_resume(resume) for resume in resumes_storage.values()
#     ])
#     results = [r for r in results if r is not None]  # Filter out errors
    
#     elapsed = (datetime.now() - start_time).total_seconds()
#     print(f"Analysis completed in {elapsed:.2f}s\n")
    
#     # Sort by score
#     results.sort(key=lambda x: x['overall_score'], reverse=True)
    
#     return {
#         "total_candidates": len(results),
#         "job_description": job_description,
#         "processing_time": f"{elapsed:.2f}s",
#         "shortlisted_candidates": results
#     }

# def extract_and_match_raw_text(resume_text, job_description):
#     """Single LLM call: Extract info + Match with job - using RAW TEXT!"""
#     import google.generativeai as genai
#     import json
#     import re
    
#     prompt = f"""You are an expert HR recruiter. Analyze this resume against the job description.

# RESUME (RAW TEXT):
# {resume_text}

# JOB DESCRIPTION:
# {job_description}

# Extract candidate info AND analyze fit. Return ONLY valid JSON:
# {{
#   "name": "Full Name or 'Not Found'",
#   "email": "email@example.com or 'Not Found'",
#   "phone": "phone number or 'Not Found'",
#   "skills": ["skill1", "skill2", "skill3"],
#   "overall_score": 8.5,
#   "skills_score": 9.0,
#   "experience_score": 8.0,
#   "education_score": 8.5,
#   "strengths": ["strength 1", "strength 2", "strength 3"],
#   "gaps": ["gap 1", "gap 2"],
#   "justification": "Detailed 3-4 sentence analysis of fit",
#   "recommendation": "Highly Recommended / Recommended / Maybe / Not Recommended"
# }}

# Scoring: 0-10 for each metric. NO markdown, ONLY JSON."""

#     try:
#         model = genai.GenerativeModel('gemini-2.0-flash-exp')
#         response = model.generate_content(prompt)
#         result_text = response.text.strip()
        
#         # Remove markdown
#         if result_text.startswith("```"):
#             result_text = re.sub(r'```json\n?|\n?```', '', result_text).strip()
        
#         data = json.loads(result_text)
        
#         return {
#             "name": data.get("name", "Not Found"),
#             "email": data.get("email", "Not Found"),
#             "phone": data.get("phone", "Not Found"),
#             "skills": data.get("skills", []),
#             "overall_score": data.get("overall_score", 5.0),
#             "skills_score": data.get("skills_score", 5.0),
#             "experience_score": data.get("experience_score", 5.0),
#             "education_score": data.get("education_score", 5.0),
#             "strengths": data.get("strengths", []),
#             "gaps": data.get("gaps", []),
#             "justification": data.get("justification", "Analysis not available"),
#             "recommendation": data.get("recommendation", "Needs Review")
#         }
#     except Exception as e:
#         print(f"LLM Error: {str(e)}")
#         return {
#             "name": "Error",
#             "email": "Error",
#             "phone": "Error",
#             "skills": [],
#             "overall_score": 0.0,
#             "skills_score": 0.0,
#             "experience_score": 0.0,
#             "education_score": 0.0,
#             "strengths": ["Error analyzing resume"],
#             "gaps": ["Error analyzing resume"],
#             "justification": f"Error: {str(e)}",
#             "recommendation": "Needs Manual Review"
#         }

# @app.delete("/resumes/{resume_id}")
# def delete_resume(resume_id: int):
#     """Delete a specific resume from memory"""
#     if resume_id not in resumes_storage:
#         raise HTTPException(status_code=404, detail="Resume not found")
    
#     filename = resumes_storage[resume_id]['filename']
#     del resumes_storage[resume_id]
    
#     # Also delete result if exists
#     if resume_id in results_storage:
#         del results_storage[resume_id]
    
#     print(f"Deleted: {filename} (ID: {resume_id})")
#     print(f"Remaining resumes: {len(resumes_storage)}")
    
#     return {
#         "message": "Resume deleted successfully",
#         "deleted_id": resume_id,
#         "remaining": len(resumes_storage)
#     }

# @app.delete("/resumes")
# def delete_all_resumes():
#     """Clear all resumes from memory"""
#     count = len(resumes_storage)
#     resumes_storage.clear()
#     results_storage.clear()
    
#     print(f"Cleared all {count} resumes from memory")
    
#     return {
#         "message": f"All {count} resumes deleted successfully",
#         "storage_cleared": True
#     }

# @app.get("/resumes")
# def get_all_resumes():
#     """Get list of all resumes in memory"""
#     return {
#         "total": len(resumes_storage),
#         "resumes": [
#             {
#                 "id": r['id'],
#                 "filename": r['filename'],
#                 "text_length": len(r['raw_text'])
#             }
#             for r in resumes_storage.values()
#         ]
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)










from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
import os
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
import hashlib
from resume_parser import extract_text_from_pdf
from llm_matcher import extract_and_match_raw_text
from database import init_db, get_db, Resume

app = FastAPI(title="Smart Resume Screener API - Database Integrated")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
init_db()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

executor = ThreadPoolExecutor(max_workers=10)

def get_file_hash(content: bytes) -> str:
    return hashlib.md5(content).hexdigest()

@app.get("/")
def root(db: Session = Depends(get_db)):
    total_resumes = db.query(Resume).count()
    return {
        "message": "Smart Resume Screener API - Database Integrated",
        "version": "3.0",
        "storage": "SQLite Database (Persistent)",
        "total_resumes": total_resumes,
        "endpoints": {
            "POST /batch-upload": "Upload multiple resumes",
            "POST /match": "Match resumes with job description",
            "GET /resumes": "Get all stored resumes",
            "DELETE /resumes/{id}": "Delete specific resume",
            "DELETE /resumes": "Clear all resumes from database"
        }
    }

@app.post("/batch-upload")
async def batch_upload(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    async def process_single_file(file):
        if not file.filename.endswith('.pdf'):
            return {"filename": file.filename, "status": "error", "message": "Only PDF files supported"}
        
        try:
            # Read file content (using the same method as original)
            file_content = await file.read()
            file_hash = get_file_hash(file_content)
            
            # Save temporarily
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
            
            try:
                # Extract text
                loop = asyncio.get_event_loop()
                resume_text = await loop.run_in_executor(executor, extract_text_from_pdf, file_path)
            finally:
                # Clean up temp file
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Save to database
            new_resume = Resume(
                filename=file.filename,
                raw_text=resume_text,
                candidate_name="Pending Analysis",
                created_at=datetime.utcnow()
            )
            db.add(new_resume)
            db.commit()
            db.refresh(new_resume)
            
            return {
                "filename": file.filename, 
                "status": "success", 
                "resume_id": new_resume.id, 
                "text_length": len(resume_text)
            }
        except Exception as e:
            db.rollback()
            return {"filename": file.filename, "status": "error", "message": str(e)}

    start_time = datetime.now()
    results = await asyncio.gather(*[process_single_file(file) for file in files])
    elapsed = (datetime.now() - start_time).total_seconds()
    
    successful_count = len([r for r in results if r["status"] == "success"])
    
    return {
        "total_files": len(files),
        "successful": successful_count,
        "failed": len([r for r in results if r["status"] == "error"]),
        "processing_time": f"{elapsed:.2f}s",
        "results": results
    }

@app.post("/match")
async def match_resumes(job_description: str = Form(...), db: Session = Depends(get_db)):
    resumes = db.query(Resume).all()
    
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found. Please upload resumes first.")

    start_time = datetime.now()

    async def process_single_resume(resume: Resume):
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                executor, 
                extract_and_match_raw_text, 
                resume.raw_text, 
                job_description
            )
            
            # Update resume with match results
            resume.candidate_name = result['name']
            resume.email = result['email']
            resume.phone = result['phone']
            resume.skills = ", ".join(result['skills'])
            resume.experience = result['experience']
            resume.education = result['education']
            resume.match_score = result['overall_score']
            resume.skills_score = result['skills_score']
            resume.experience_score = result['experience_score']
            resume.education_score = result['education_score']
            resume.justification = result['justification']
            resume.job_description = job_description
            
            db.commit()
            
            return {
                "resume_id": resume.id,
                "candidate_name": result['name'],
                "email": result['email'],
                "phone": result['phone'],
                "filename": resume.filename,
                "skills": result['skills'],
                "overall_score": result['overall_score'],
                "skills_score": result['skills_score'],
                "experience_score": result['experience_score'],
                "education_score": result['education_score'],
                "strengths": result['strengths'],
                "gaps": result['gaps'],
                "justification": result['justification'],
                "recommendation": result['recommendation']
            }
        except Exception as e:
            print(f"Error processing resume {resume.id}: {str(e)}")
            return None

    results = await asyncio.gather(*[process_single_resume(resume) for resume in resumes])
    results = [r for r in results if r is not None]
    elapsed = (datetime.now() - start_time).total_seconds()
    
    # Sort by overall score
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return {
        "total_candidates": len(results),
        "job_description": job_description,
        "processing_time": f"{elapsed:.2f}s",
        "shortlisted_candidates": results
    }

@app.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    filename = resume.filename
    db.delete(resume)
    db.commit()
    
    remaining = db.query(Resume).count()
    return {
        "message": "Resume deleted successfully", 
        "deleted_id": resume_id, 
        "filename": filename,
        "remaining": remaining
    }

@app.delete("/resumes")
def delete_all_resumes(db: Session = Depends(get_db)):
    count = db.query(Resume).count()
    db.query(Resume).delete()
    db.commit()
    
    return {
        "message": f"All {count} resumes deleted successfully", 
        "storage_cleared": True
    }

@app.get("/resumes")
def get_all_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).all()
    return {
        "total": len(resumes),
        "resumes": [
            {
                "id": r.id,
                "filename": r.filename,
                "candidate_name": r.candidate_name,
                "email": r.email,
                "match_score": r.match_score,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } 
            for r in resumes
        ]
    }

@app.get("/resume/{resume_id}")
def get_resume_details(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "filename": resume.filename,
        "candidate_name": resume.candidate_name,
        "email": resume.email,
        "phone": resume.phone,
        "skills": resume.skills.split(", ") if resume.skills else [],
        "experience": resume.experience,
        "education": resume.education,
        "match_score": resume.match_score,
        "skills_score": resume.skills_score,
        "experience_score": resume.experience_score,
        "education_score": resume.education_score,
        "justification": resume.justification,
        "job_description": resume.job_description,
        "created_at": resume.created_at.isoformat() if resume.created_at else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)