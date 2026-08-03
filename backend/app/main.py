from io import BytesIO
import hashlib
import json
import logging
import os
import re

from docx import Document
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pypdf import PdfReader
import requests

JOB_ROLES = {
    "AI Engineer": {
        "skills": ["Python", "PyTorch", "Deep Learning", "NLP"],
        "min_exp": 3,
        "education": "Master",
    },
    "Machine Learning (ML) Engineer": {
        "skills": ["Scikit-learn", "TensorFlow", "MLOps", "SQL"],
        "min_exp": 2,
        "education": "Bachelor",
    },
    "Data Scientist": {
        "skills": ["Python", "R", "SQL", "Pandas", "Tableau"],
        "min_exp": 3,
        "education": "Master",
    },
    "Full Stack Developer": {
        "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
        "min_exp": 4,
        "education": "Bachelor",
    },
    "Frontend Developer": {
        "skills": ["HTML", "CSS", "JavaScript", "React", "Tailwind"],
        "min_exp": 2,
        "education": "Bachelor",
    },
    "Backend Developer": {
        "skills": ["Python", "Django", "PostgreSQL", "Redis"],
        "min_exp": 3,
        "education": "Bachelor",
    },
    "DevOps Engineer": {
        "skills": ["AWS", "Docker", "Kubernetes", "CI/CD pipelines"],
        "min_exp": 4,
        "education": "Bachelor",
    },
    "Cloud Architect": {
        "skills": ["AWS", "Azure", "System Design", "Terraform"],
        "min_exp": 6,
        "education": "Master",
    },
}

MAX_RESUME_CHARS = 18000

# 1. Configure Logging
# This will output logs to your terminal showing the timestamp and error level
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Recruiter API")

# Configure allowed origins dynamically for local development and cloud production
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Global Exception Handler
# This catches ANY unhandled server error and returns a clean JSON response
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred in the AI Recruiter backend."},
    )

# 3. Example Endpoint (to test the connection)
@app.get("/api/health")
def health_check():
    logger.info("Health check endpoint was called by the frontend.")
    return {"status": "healthy", "message": "API is running securely"}


@app.post("/api/process")
async def process_resume(file: UploadFile = File(...), role: str = Form(...)):
    if role not in JOB_ROLES:
        raise HTTPException(status_code=400, detail=f"Unsupported role: {role}")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded resume is empty")

    text = extract_resume_text(file.filename or "", content)
    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from this resume",
        )

    candidate = analyze_resume_with_gemini(
        filename=file.filename or "resume",
        content=content,
        text=text,
        role=role,
    )

    logger.info("Gemini processed resume %s for %s with score %s", file.filename, role, candidate["score"])
    return {"candidate": candidate}


def extract_resume_text(filename: str, content: bytes) -> str:
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension == "pdf":
        reader = PdfReader(BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if extension == "docx":
        document = Document(BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    if extension in {"txt", "text"}:
        return content.decode("utf-8", errors="ignore")

    raise HTTPException(
        status_code=415,
        detail="Unsupported file type. Upload a PDF, DOCX, or TXT resume.",
    )


def stable_candidate_id(filename: str, content: bytes) -> int:
    digest = hashlib.sha256(filename.encode("utf-8") + content).hexdigest()
    return int(digest[:12], 16)


def analyze_resume_with_gemini(filename: str, content: bytes, text: str, role: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="API key is missing. Set GEMINI_API_KEY in .env.",
        )

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    role_profile = JOB_ROLES[role]
    prompt = build_resume_analysis_prompt(filename, text, role, role_profile)

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    try:
        response = requests.post(
            api_url,
            headers={
                "Content-Type": "application/json",
            },
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.1,
                    "maxOutputTokens": 4000,
                }
            },
            timeout=45,
        )
    except requests.RequestException as exc:
        logger.exception("Gemini request failed")
        raise HTTPException(status_code=502, detail="Could not reach the AI API.") from exc

    if not response.ok:
        logger.error("Gemini API error %s: %s", response.status_code, response.text[:500])
        # Try a local fallback analyzer so the app can still produce results for demos
        try:
            fallback = local_analyze_resume(filename, content, text, role, role_profile)
            logger.info("Falling back to local analyzer for %s (AI status=%s)", filename, response.status_code)
            return normalize_candidate(fallback, filename, content, role, role_profile)
        except Exception:
            raise HTTPException(
                status_code=502,
                detail=f"AI API returned an error while processing the resume. Status: {response.status_code}",
            )

    candidate = parse_gemini_candidate(response.json())
    return normalize_candidate(candidate, filename, content, role, role_profile)


def local_analyze_resume(filename: str, content: bytes, text: str, role: str, role_profile: dict) -> dict:
    """Simple rule-based resume analyzer used as a fallback when the AI provider fails.

    Returns a candidate-shaped dict (before normalization).
    """
    txt = text or ""
    lower = txt.lower()

    # find email
    email = clean_email(lower)

    # crude experience extractor
    exp = 0
    m = re.search(r"(\d+)\+?\s+years", lower)
    if m:
        try:
            exp = int(m.group(1))
        except Exception:
            exp = 0

    # education
    education = "Unknown"
    for key, label in [("phd", "PhD"), ("master", "Master"), ("bachelor", "Bachelor"), ("diploma", "Diploma"), ("high school", "High School")]:
        if key in lower:
            education = label
            break

    # skills matching (simple substring check)
    required = role_profile.get("skills", [])
    matched = [s for s in required if s.lower() in lower]

    # scoring heuristic
    base = 40
    base += min(50, len(matched) * 15)
    try:
        base += max(0, (exp - role_profile.get("min_exp", 0)) * 5)
    except Exception:
        pass
    score = max(0, min(100, int(base)))

    return {
        "name": filename_to_name(filename),
        "email": email,
        "score": score,
        "status": status_for_score(score),
        "experience": exp,
        "education": education,
        "skills": matched,
        "missing": ", ".join([s for s in required if s not in matched]) if required else "None",
        "matchedCount": len(matched),
        "unmatchedCount": len(required) - len(matched) if required else 0,
    }


def build_resume_analysis_prompt(filename: str, text: str, role: str, role_profile: dict) -> str:
    resume_text = text[:MAX_RESUME_CHARS]
    return f"""
You are an AI recruiter screening one resume against one job role.

Return only valid JSON. Do not wrap the JSON in markdown.

Job role: {role}
Required skills: {", ".join(role_profile["skills"])}
Minimum experience: {role_profile["min_exp"]} years
Required education level: {role_profile["education"]}

Analyze the resume text and produce this exact JSON shape:
{{
  "name": "candidate full name or filename-derived name",
  "email": "candidate email or not-found@example.com",
  "score": 0,
  "status": "Highly Recommended | Recommended | Needs Review",
  "experience": 0,
  "education": "Unknown | High School | Diploma | Bachelor | Master | PhD",
  "skills": ["only required skills that are clearly present or strongly evidenced"],
  "missing": "comma-separated required skills that are missing, or None",
  "matchedCount": 0,
  "unmatchedCount": 0
}}

Scoring rules:
- Score must be an integer from 0 to 100.
- Skills are the main factor. Experience and education should affect the final score.
- matchedCount must equal the length of skills.
- unmatchedCount must equal the number of missing required skills.
- status should be Highly Recommended for score >= 85, Recommended for score >= 60, otherwise Needs Review.

Filename: {filename}

Resume text:
{resume_text}
""".strip()


def parse_gemini_candidate(response_data: dict) -> dict:
    try:
        text = response_data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        logger.error("Unexpected Gemini response shape: %s", response_data)
        raise HTTPException(status_code=502, detail="AI API returned an unexpected response.") from exc

    try:
        return json.loads(strip_json_fences(text))
    except json.JSONDecodeError as exc:
        logger.error("AI API returned invalid JSON: %s", text[:500])
        raise HTTPException(status_code=502, detail="AI API returned invalid JSON.") from exc


def strip_json_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def normalize_candidate(
    candidate: dict,
    filename: str,
    content: bytes,
    role: str,
    role_profile: dict,
) -> dict:
    required_skills = role_profile["skills"]
    skills = candidate.get("skills") or []
    if not isinstance(skills, list):
        skills = []

    normalized_skills = []
    for required_skill in required_skills:
        if any(str(skill).strip().lower() == required_skill.lower() for skill in skills):
            normalized_skills.append(required_skill)

    missing_skills = [skill for skill in required_skills if skill not in normalized_skills]
    score = clamp_int(candidate.get("score"), 0, 100)
    status = status_for_score(score)

    return {
        "id": stable_candidate_id(filename, content),
        "name": clean_text(candidate.get("name")) or filename_to_name(filename),
        "email": clean_email(candidate.get("email")),
        "score": score,
        "status": status,
        "experience": clamp_int(candidate.get("experience"), 0, 50),
        "education": normalize_education(candidate.get("education")),
        "skills": normalized_skills,
        "missing": ", ".join(missing_skills) if missing_skills else "None",
        "matchedCount": len(normalized_skills),
        "unmatchedCount": len(missing_skills),
        "role": role,
    }


def clamp_int(value, minimum: int, maximum: int) -> int:
    try:
        number = int(round(float(value)))
    except (TypeError, ValueError):
        number = minimum
    return max(minimum, min(number, maximum))


def clean_text(value) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value).strip()


def clean_email(value) -> str:
    text = clean_text(value)
    match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
    return match.group(0) if match else "not-found@example.com"


def filename_to_name(filename: str) -> str:
    stem = filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").strip()
    return stem.title() if stem else "Candidate"


def normalize_education(value) -> str:
    education = clean_text(value).lower()
    mapping = {
        "high school": "High School",
        "diploma": "Diploma",
        "bachelor": "Bachelor",
        "master": "Master",
        "phd": "PhD",
        "doctorate": "PhD",
        "unknown": "Unknown",
    }
    for key, label in mapping.items():
        if key in education:
            return label
    return "Unknown"


def status_for_score(score: int) -> str:
    if score >= 85:
        return "Highly Recommended"
    if score >= 60:
        return "Recommended"
    return "Needs Review"
