# Backend Test Suite

## Overview

This directory contains the test suite for the SSR Pipeline backend.

## Directory Structure

```
tests/
├── __init__.py           # Test package initialization
├── conftest.py           # Shared pytest fixtures
├── unit/                 # Unit tests for individual functions/classes
│   ├── test_helpers.py   # Tests for main.py helper functions
│   └── test_constants.py # Tests for constants.py
└── integration/          # Integration tests for API endpoints
```

## Running Tests

### Install Dependencies

```bash
cd backend
pip install -r requirements-dev.txt
```

### Run All Tests

```bash
pytest
```

### Run with Coverage Report

```bash
pytest --cov=. --cov-report=html
```

Then open `htmlcov/index.html` in your browser to view the detailed coverage report.

### Run Specific Test File

```bash
pytest tests/unit/test_helpers.py
```

### Run Specific Test Class or Function

```bash
pytest tests/unit/test_helpers.py::TestBuildResponseLookup
pytest tests/unit/test_helpers.py::TestBuildResponseLookup::test_empty_responses
```

### Run with Verbose Output

```bash
pytest -v
```

### Run Only Failed Tests

```bash
pytest --lf  # Last failed
pytest --ff  # Failed first
```

## Writing Tests

### Test Naming Conventions

- Test files: `test_*.py`
- Test classes: `Test*`
- Test functions: `test_*`

### Example Unit Test

```python
def test_my_function():
    """Test description"""
    from module import my_function

    result = my_function(input_value)
    assert result == expected_value
```

### Example Integration Test

```python
def test_api_endpoint(test_client):
    """Test API endpoint"""
    response = test_client.get("/api/endpoint")
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```

## Coverage Goals

- **Phase 1 (Current)**: 60% coverage - Critical path unit tests
- **Phase 2**: 75% coverage - Integration tests
- **Phase 3**: 80% coverage - Frontend component tests
- **Phase 4**: Full E2E coverage - Critical user journeys

## Continuous Integration

Tests should be run in CI/CD pipeline before merging to main branch.

## Test Data

Use fixtures defined in `conftest.py` for consistent test data across tests.
