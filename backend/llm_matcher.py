import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

def extract_and_match_raw_text(resume_text, job_description):
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    prompt = f"""
    You are an expert technical recruiter and talent evaluator. 
    Your task is to analyze a candidate's resume and evaluate how well they match a given job description. 
    Focus on the quality of alignment between the candidate's **skills, experience, and education** with the **requirements and responsibilities** in the job description.

    ---

    ### INPUTS

    **Resume (raw text):**
    {resume_text}

    **Job Description:**
    {job_description}

    ---

    ### TASK INSTRUCTIONS

    1. **Understand both documents deeply:**
    - Extract and normalize candidate information (skills, experience, education, and contact details).
    - Interpret the job description's key skills, responsibilities, and preferred experience.
    - Evaluate *semantic* rather than just keyword similarity (e.g., “TensorFlow” ≈ “Machine Learning Frameworks”).

    2. **Scoring and Analysis:**
    - Assign scores (0-10) for the following:
        - `skills_score`: Alignment of technical and soft skills.
        - `experience_score`: Relevance and depth of professional experience.
        - `education_score`: Fit of academic background.
        - `overall_score`: Overall candidate-job fit considering all factors.
    - Provide concise reasoning behind the scores.

    3. **Output requirements:**
    - Return only valid JSON.
    - Be objective, consistent, and concise.
    - Do not include markdown, text outside JSON, or explanations beyond the JSON structure.

    ---

    ### JSON OUTPUT FORMAT

    Return your final structured analysis as **strictly valid JSON** with this exact format:

    {{
    "name": "Candidate full name or 'Not Found'",
    "email": "email@example.com or 'Not Found'",
    "phone": "phone number or 'Not Found'",
    "skills": ["skill1", "skill2", "skill3"],
    "summary": "One-sentence professional summary of the candidate.",
    "overall_score": 8.3,
    "skills_score": 8.5,
    "experience_score": 8.0,
    "education_score": 7.5,
    "strengths": ["Strong data analysis skills", "Relevant Python experience", "Good communication"],
    "gaps": ["Limited leadership experience", "No direct cloud deployment experience"],
    "justification": "Summarize in 3-5 sentences why the candidate received this score and how they align with the job requirements.",
    "recommendation": "Highly Recommended / Recommended / Maybe / Not Recommended"
    }}

    ---

    ### SCORING GUIDELINES

    - **9-10:** Exceptional match — exceeds all major requirements.
    - **7-8:** Strong match — meets most requirements well.
    - **5-6:** Moderate match — some gaps but potentially trainable.
    - **3-4:** Weak match — lacks key qualifications.
    - **0-2:** Poor match — unrelated or missing essential experience.

    ---

    ### OUTPUT RULES

    - Output **only** the JSON structure — no markdown, code blocks, or commentary.
    - Be deterministic and consistent — if unsure, infer logically based on available information.
    - Ensure numbers are floats (e.g., 8.0 not "eight").
    - Use plain text values, no special characters or formatting.

    Begin your analysis now.
    """


    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        if result_text.startswith("```"):
            result_text = re.sub(r'```json\n?|\n?```', '', result_text).strip()
        data = json.loads(result_text)

        return {
            "name": data.get("name", "Not Found"),
            "email": data.get("email", "Not Found"),
            "phone": data.get("phone", "Not Found"),
            "skills": data.get("skills", []),
            "overall_score": data.get("overall_score", 5.0),
            "skills_score": data.get("skills_score", 5.0),
            "experience_score": data.get("experience_score", 5.0),
            "education_score": data.get("education_score", 5.0),
            "strengths": data.get("strengths", []),
            "gaps": data.get("gaps", []),
            "justification": data.get("justification", "Analysis not available"),
            "recommendation": data.get("recommendation", "Needs Review")
        }
    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return {
            "name": "Error",
            "email": "Error",
            "phone": "Error",
            "skills": [],
            "overall_score": 0.0,
            "skills_score": 0.0,
            "experience_score": 0.0,
            "education_score": 0.0,
            "strengths": ["Error analyzing resume"],
            "gaps": ["Error analyzing resume"],
            "justification": f"Error: {str(e)}",
            "recommendation": "Needs Manual Review"
        }
