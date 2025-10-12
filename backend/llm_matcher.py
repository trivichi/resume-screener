import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def match_resume_with_job(resume_data, job_description):
    """Use Gemini to match resume with job description and provide detailed scoring"""
    
    prompt = f"""You are an expert HR recruiter. Analyze this candidate's resume against the job description and provide detailed scoring.

CANDIDATE RESUME:
Name: {resume_data.get('name', 'N/A')}
Email: {resume_data.get('email', 'N/A')}
Skills: {', '.join(resume_data.get('skills', [])) if resume_data.get('skills') else 'N/A'}
Experience: {resume_data.get('experience', 'N/A')}
Education: {resume_data.get('education', 'N/A')}

JOB DESCRIPTION:
{job_description}

Provide a detailed analysis in the following JSON format:
{{
  "overall_score": 8.5,
  "skills_score": 9.0,
  "experience_score": 8.0,
  "education_score": 8.5,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "justification": "A detailed 3-4 sentence explanation of why this candidate is a good/poor fit, mentioning specific skills and experiences that align with the job requirements.",
  "recommendation": "Highly Recommended / Recommended / Maybe / Not Recommended"
}}

Scoring Guidelines:
- overall_score: 0-10 (overall fit for the role)
- skills_score: 0-10 (technical skills match)
- experience_score: 0-10 (relevant work experience)
- education_score: 0-10 (educational background fit)

Return ONLY valid JSON, no markdown formatting."""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        result_text = response.text.strip()
        
        # Remove markdown code blocks
        if result_text.startswith("```"):
            result_text = re.sub(r'```json\n?|\n?```', '', result_text).strip()
        
        analysis = json.loads(result_text)
        
        # Ensure all required fields exist
        return {
            "overall_score": analysis.get("overall_score", 5.0),
            "skills_score": analysis.get("skills_score", 5.0),
            "experience_score": analysis.get("experience_score", 5.0),
            "education_score": analysis.get("education_score", 5.0),
            "strengths": analysis.get("strengths", []),
            "gaps": analysis.get("gaps", []),
            "justification": analysis.get("justification", "Analysis not available"),
            "recommendation": analysis.get("recommendation", "Needs Review")
        }
        
    except Exception as e:
        print(f"Matching error: {str(e)}")
        # Return default scoring if LLM fails
        return {
            "overall_score": 5.0,
            "skills_score": 5.0,
            "experience_score": 5.0,
            "education_score": 5.0,
            "strengths": ["Unable to analyze"],
            "gaps": ["Unable to analyze"],
            "justification": f"Error during analysis: {str(e)}",
            "recommendation": "Needs Manual Review"
        }

def batch_match_resumes(resumes_data, job_description):
    """Match multiple resumes against a job description"""
    results = []
    
    for resume_data in resumes_data:
        match_result = match_resume_with_job(resume_data, job_description)
        results.append({
            "resume": resume_data,
            "match": match_result
        })
    
    # Sort by overall score descending
    results.sort(key=lambda x: x["match"]["overall_score"], reverse=True)
    
    return results