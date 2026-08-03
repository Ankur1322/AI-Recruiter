import os
import requests
from pypdf import PdfReader
from io import BytesIO

def main():
    env_path = "../.env"
    ai_key = None
    with open(env_path, "r") as f:
        for line in f:
            if "GEMINI_API_KEY" in line:
                ai_key = line.split("=", 1)[1].strip().strip("'\"")

    if not ai_key:
        print("GEMINI_API_KEY not found in .env")
        return

    # Extract PDF text
    pdf_path = "/home/ankur/Downloads/Ajju Resume/Ankur_Rawat_new resume.pdf"
    if not os.path.exists(pdf_path):
        print(f"PDF not found at {pdf_path}")
        return

    reader = PdfReader(pdf_path)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    print(f"Extracted {len(text)} characters from the PDF.")

    role_profile = {
        "skills": ["Python", "PyTorch", "Deep Learning", "NLP"],
        "min_exp": 3,
        "education": "Master",
    }
    role = "AI Engineer"
    
    # Simple prompt builder
    prompt = f"""
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

Filename: Ankur_Rawat_new resume.pdf

Resume text:
{text[:18000]}
""".strip()

    model = "gemini-2.5-flash"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={ai_key}"

    print("Sending request to Gemini...")
    response = requests.post(
        api_url,
        headers={"Content-Type": "application/json"},
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
        timeout=30
    )

    print(f"Status: {response.status_code}")
    with open("raw_gemini_response.txt", "w") as out:
        out.write(response.text)
    print("Wrote raw response to raw_gemini_response.txt")

if __name__ == "__main__":
    main()
