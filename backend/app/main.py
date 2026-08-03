from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# 1. Configure Logging
# This will output logs to your terminal showing the timestamp and error level
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Recruiter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
