from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
import hashlib
from resume_parser import extract_text_from_pdf
from llm_matcher import extract_and_match_raw_text

app = FastAPI(title="Smart Resume Screener API - In-Memory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

executor = ThreadPoolExecutor(max_workers=10)

resumes_storage = {}
results_storage = {}
next_id = 1

def get_file_hash(content: bytes) -> str:
    return hashlib.md5(content).hexdigest()

@app.get("/")
def root():
    return {
        "message": "Smart Resume Screener API - In-Memory Mode",
        "version": "2.0",
        "storage": "In-Memory (No Database)",
        "total_resumes": len(resumes_storage),
        "endpoints": {
            "POST /batch-upload": "Upload multiple resumes",
            "POST /match": "Match resumes with job description",
            "DELETE /resumes/{id}": "Delete specific resume",
            "DELETE /resumes": "Clear all resumes from memory"
        }
    }

@app.post("/batch-upload")
async def batch_upload(files: List[UploadFile] = File(...)):
    global next_id

    async def process_single_file(file):
        global next_id
        if not file.filename.endswith('.pdf'):
            return {"filename": file.filename, "status": "error", "message": "Only PDF files supported"}
        try:
            file_content = await file.read()
            file_hash = get_file_hash(file_content)
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
            try:
                loop = asyncio.get_event_loop()
                resume_text = await loop.run_in_executor(executor, extract_text_from_pdf, file_path)
            finally:
                if os.path.exists(file_path):
                    os.remove(file_path)
            resume_id = next_id
            next_id += 1
            resumes_storage[resume_id] = {
                "id": resume_id,
                "filename": file.filename,
                "raw_text": resume_text,
                "file_hash": file_hash
            }
            return {"filename": file.filename, "status": "success", "resume_id": resume_id, "text_length": len(resume_text)}
        except Exception as e:
            return {"filename": file.filename, "status": "error", "message": str(e)}

    start_time = datetime.now()
    results = await asyncio.gather(*[process_single_file(file) for file in files])
    elapsed = (datetime.now() - start_time).total_seconds()
    return {
        "total_files": len(files),
        "successful": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "processing_time": f"{elapsed:.2f}s",
        "results": results
    }

@app.post("/match")
async def match_resumes(job_description: str = Form(...)):
    if not resumes_storage:
        raise HTTPException(status_code=404, detail="No resumes found. Please upload resumes first.")

    start_time = datetime.now()

    async def process_single_resume(resume_data):
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(executor, extract_and_match_raw_text, resume_data['raw_text'], job_description)
            results_storage[resume_data['id']] = result
            return {
                "resume_id": resume_data['id'],
                "candidate_name": result['name'],
                "email": result['email'],
                "phone": result['phone'],
                "filename": resume_data['filename'],
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
        except Exception:
            return None

    results = await asyncio.gather(*[process_single_resume(resume) for resume in resumes_storage.values()])
    results = [r for r in results if r is not None]
    elapsed = (datetime.now() - start_time).total_seconds()
    results.sort(key=lambda x: x['overall_score'], reverse=True)
    return {
        "total_candidates": len(results),
        "job_description": job_description,
        "processing_time": f"{elapsed:.2f}s",
        "shortlisted_candidates": results
    }

@app.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int):
    if resume_id not in resumes_storage:
        raise HTTPException(status_code=404, detail="Resume not found")
    filename = resumes_storage[resume_id]['filename']
    del resumes_storage[resume_id]
    if resume_id in results_storage:
        del results_storage[resume_id]
    return {"message": "Resume deleted successfully", "deleted_id": resume_id, "remaining": len(resumes_storage)}

@app.delete("/resumes")
def delete_all_resumes():
    count = len(resumes_storage)
    resumes_storage.clear()
    results_storage.clear()
    return {"message": f"All {count} resumes deleted successfully", "storage_cleared": True}

@app.get("/resumes")
def get_all_resumes():
    return {
        "total": len(resumes_storage),
        "resumes": [{"id": r['id'], "filename": r['filename'], "text_length": len(r['raw_text'])} for r in resumes_storage.values()]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
