import fitz  # PyMuPDF
import re
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using PyMuPDF"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        raise Exception(f"Error extracting PDF: {str(e)}")

def parse_resume_with_llm(resume_text):
    """Use Gemini to extract structured data from resume"""
    
    prompt = f"""You are a resume parser. Extract the following information from the resume text and return it in JSON format:

Resume Text:
{resume_text}

Extract and return ONLY a valid JSON object with these exact keys:
{{
  "name": "candidate full name or 'Not Found'",
  "email": "email address or 'Not Found'",
  "phone": "phone number or 'Not Found'",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": "brief summary of work experience (2-3 sentences) or 'Not Found'",
  "education": "education details (degree, institution) or 'Not Found'"
}}

Rules:
- For skills: Extract ALL technical and professional skills mentioned
- For experience: Summarize key roles and companies
- For education: Include degree and institution name
- If any field is not found, use "Not Found" or empty array for skills
- Return ONLY valid JSON, no markdown, no extra text"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith("```"):
            result_text = re.sub(r'```json\n?|\n?```', '', result_text).strip()
        
        import json
        parsed_data = json.loads(result_text)
        
        return parsed_data
    except Exception as e:
        print(f"LLM parsing error: {str(e)}")
        # Fallback to basic regex parsing
        return {
            "name": extract_name_regex(resume_text),
            "email": extract_email_regex(resume_text),
            "phone": extract_phone_regex(resume_text),
            "skills": extract_skills_regex(resume_text),
            "experience": "Unable to parse",
            "education": "Unable to parse"
        }

def extract_email_regex(text):
    """Fallback email extraction"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else "Not Found"

def extract_phone_regex(text):
    """Fallback phone extraction"""
    phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
    phones = re.findall(phone_pattern, text)
    return phones[0] if phones else "Not Found"

def extract_name_regex(text):
    """Fallback name extraction - first line usually"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines[0] if lines else "Not Found"

def extract_skills_regex(text):
    """Fallback skills extraction"""
    common_skills = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'html', 'css', 
                     'c++', 'c', 'mongodb', 'express', 'angular', 'vue', 'django', 'flask',
                     'aws', 'docker', 'kubernetes', 'git', 'machine learning', 'ai']
    
    text_lower = text.lower()
    found_skills = [skill for skill in common_skills if skill in text_lower]
    return found_skills if found_skills else []