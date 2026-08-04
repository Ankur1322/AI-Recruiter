# AI-Recruiter

An enterprise-grade, AI-driven recruitment platform built to evaluate, rank, and match candidate profiles against job descriptions.

[![Live App on Render](https://img.shields.io/badge/Render-Live_App-blue?style=for-the-badge&logo=render&logoColor=white)](https://ai-recruiter-ui-tbqw.onrender.com)
[![System Design Report](https://img.shields.io/badge/Documentation-System_Design_Report-indigo?style=for-the-badge&logo=googledocs&logoColor=white)](./SYSTEM_DESIGN.pdf)

---

## 🏗 System Architecture

The platform uses a modern, decoupled microservices architecture:

* **Frontend:** React (Vite) designed with a clean glassmorphism UI.
* **Backend:** FastAPI (Python) for high-performance API routing and AI logic powered by OpenAI-compatible chat completions.
* **Database:** PostgreSQL for persistent data storage, with Redis for fast caching.
* **Infrastructure:** Fully containerized using Docker and `docker-compose` for seamless local deployment.


---

## 🗄️ Database Schema

The PostgreSQL database is structured to handle applicants and job parameters efficiently:

* **`candidates` table:** Stores applicant details (ID, name, skills, experience level, resume URL).
* **`jobs` table:** Stores job requirements (ID, title, required skills, minimum experience).
* **`matches` table:** Stores the AI-generated ranking score linking candidates to specific jobs.

---

## 🚀 Core Features

* **AI Matching Engine:** Ranks candidates with high precision using advanced algorithms.
* **FastAPI Backend:** Fast, asynchronous, and reliable Python infrastructure.
* **Modern UI:** Responsive and minimalist recruiter dashboard.
* **Dockerized:** One-command setup across any environment.

---

## ⚙️ How to Run Locally

1. Clone this repository: `git clone https://github.com/Ankur1322/AI-Recruiter.git`
2. Open the folder: `cd AI-Recruiter`
3. Set up environment variables: `cp .env.example .env` (Add your actual Gemini API key in `GEMINI_API_KEY` and adjust `GEMINI_MODEL` if needed).
4. Run with Docker: `docker-compose up --build`
5. View the Frontend at `http://localhost:3000` and Backend API at `http://localhost:8000/docs`.
6. After you opened the app wait for the connection when it says connect healthy then upload resume  
