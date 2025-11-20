"""
Pytest Fixtures and Configuration

Shared fixtures for test suite.
"""
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import sys

# Add backend to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

@pytest.fixture
def test_client():
    """Create a test client for FastAPI app"""
    from main import app
    return TestClient(app)

@pytest.fixture
def mock_survey_config():
    """Sample survey configuration for testing"""
    return {
        "name": "Test Survey",
        "description": "A test survey",
        "persona_groups": [
            {
                "name": "Test Group",
                "size": 10,
                "description": "Test respondents"
            }
        ],
        "categories": [
            {
                "id": "general",
                "name": "General Questions",
                "questions": [
                    {
                        "id": "q1",
                        "text": "Test question?",
                        "rating_scale": [1, 2, 3, 4, 5]
                    }
                ]
            }
        ]
    }

@pytest.fixture
def mock_responses():
    """Sample responses for testing"""
    from ssr_core.llm_client import Response, RespondentProfile

    return [
        Response(
            respondent_id=f"resp_{i}",
            question_id="q1",
            response_text=f"Test response {i}",
            category="general",
            respondent_profile=RespondentProfile(
                id=f"resp_{i}",
                characteristics={"age": 25 + i}
            )
        )
        for i in range(3)
    ]
