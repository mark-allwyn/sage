# S.A.G.E Backend

FastAPI backend server for S.A.G.E (Synthetic Audience Generation Engine) - an AI-powered platform for generating and analyzing synthetic survey responses using Large Language Models and Semantic Similarity Rating.

## Installation

### Using uv (Recommended)

[uv](https://github.com/astral-sh/uv) is a fast Python package installer and resolver.

1. Install uv if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# or on macOS:
brew install uv
```

2. Create virtual environment and install dependencies:
```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

Or use uv sync for development:
```bash
uv sync
source .venv/bin/activate
```

### Using pip (Traditional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the backend directory with your LLM provider API keys:

```bash
# Required: At least one LLM provider API key
OPENAI_API_KEY=your-openai-api-key              # For GPT models
ANTHROPIC_API_KEY=your-anthropic-api-key        # For Claude models

# Optional: For evaluation features
DEEPEVAL_API_KEY=your-deepeval-api-key          # For LLM evaluation metrics
```

Or export them as environment variables:
```bash
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"
export DEEPEVAL_API_KEY="your-deepeval-api-key"
```

**Note:** You need at least one LLM provider (OpenAI or Anthropic) configured to run surveys.

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- OpenAPI spec: http://localhost:8000/openapi.json

## API Endpoints

### Survey Management
- `GET /api/surveys` - List all surveys
- `GET /api/surveys/{survey_id}` - Get survey details
- `POST /api/surveys` - Create or update survey from YAML
- `DELETE /api/surveys/{survey_id}` - Delete a survey

### Survey Execution
- `POST /api/run-survey` - Run complete SSR pipeline (profiles → responses → SSR)
- `GET /api/survey-runs` - List all survey run history
- `GET /api/survey-runs/{run_id}` - Get detailed survey run results
- `DELETE /api/survey-runs/{run_id}` - Delete a survey run

### Ground Truth & Validation
- `POST /api/ground-truth/from-ssr` - Generate ground truth via SSR pipeline
- `POST /api/ground-truth/from-csv` - Upload ground truth from real survey data
- `GET /api/ground-truth` - List all ground truth datasets
- `GET /api/ground-truth/{gt_id}` - Get ground truth details
- `DELETE /api/ground-truth/{gt_id}` - Delete ground truth dataset
- `POST /api/ground-truth/compare` - Compare survey run against ground truth

### Evaluation (DeepEval Integration)
- `POST /api/evaluations/evaluate` - Evaluate LLM responses for quality/bias/hallucination
- `GET /api/evaluations` - List all evaluation runs
- `GET /api/evaluations/{eval_id}` - Get evaluation details
- `POST /api/evaluations/compare` - Compare multiple evaluations
- `DELETE /api/evaluations/{eval_id}` - Delete an evaluation

### Settings Management
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings (API keys, enabled providers)

### Health Check
- `GET /` - API status and version
- `GET /docs` - Interactive API documentation (Swagger UI)

## Development

### Install with dev dependencies:
```bash
uv pip install -e ".[dev]"
```

### Run tests:
```bash
pytest
```

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── pyproject.toml       # Project configuration (uv)
├── requirements.txt     # Pip fallback
├── .python-version      # Python version for uv
└── README.md
```

## Key Features

- **Multi-LLM Support**: Generate synthetic responses using OpenAI (GPT) or Anthropic (Claude) models
- **Semantic Similarity Rating (SSR)**: Convert text responses to probability distributions using embedding-based similarity
- **Ground Truth Management**: Create reference datasets from high-fidelity runs or real survey data
- **Statistical Validation**: Compare test runs against ground truth using multiple metrics (Pearson, Spearman, MAE, KL divergence, etc.)
- **LLM Evaluation**: Assess response quality, bias, and hallucination using DeepEval
- **Flexible Configuration**: Control LLM temperature, SSR parameters, sample sizes, and random seeds
- **Data Export**: Export results to CSV for analysis in Excel, R, or Python

## Core Technologies

- **FastAPI** - Modern async web framework
- **Uvicorn** - Lightning-fast ASGI server
- **Pydantic** - Data validation and settings management
- **OpenAI SDK** - GPT model integration
- **Anthropic SDK** - Claude model integration
- **Sentence Transformers** - Semantic embeddings for SSR
- **DeepEval** - LLM response evaluation framework
- **Pandas/NumPy** - Statistical analysis and data processing
- **SciPy** - Advanced statistical metrics
- **PyYAML** - Survey configuration parsing

## Architecture

The backend implements a modular SSR pipeline:

1. **Profile Generation**: Create synthetic respondent profiles from persona groups
2. **Response Generation**: Use LLMs to generate text responses for each profile
3. **SSR Processing**: Convert text responses to probability distributions via semantic similarity
4. **Aggregation & Analysis**: Compute statistics and enable comparison against ground truth

All data is stored locally in the `backend/data/` directory as JSON files.
