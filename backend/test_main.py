import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

import pytest
from fastapi.testclient import TestClient
from app.main import app, strip_json_fences, parse_gemini_candidate, clamp_int

client = TestClient(app)

def test_health_check_returns_200():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "message": "API is running securely"}

def test_invalid_endpoint_returns_404():
    response = client.get("/api/this-does-not-exist")
    assert response.status_code == 404

def test_strip_json_fences():
    assert strip_json_fences("```json\n{\"test\": 1}\n```") == "{\"test\": 1}"
    assert strip_json_fences("```\n{\"test\": 2}\n```") == "{\"test\": 2}"
    assert strip_json_fences("{\"test\": 3}") == "{\"test\": 3}"

def test_clamp_int():
    assert clamp_int(5, 0, 10) == 5
    assert clamp_int(-5, 0, 10) == 0
    assert clamp_int(15, 0, 10) == 10
    assert clamp_int("abc", 0, 10) == 0

def test_parse_gemini_candidate():
    mock_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"score\": 90,\n  \"status\": \"Highly Recommended\"\n}"
                        }
                    ]
                }
            }
        ]
    }
    parsed = parse_gemini_candidate(mock_response)
    assert parsed["name"] == "John Doe"
    assert parsed["score"] == 90
