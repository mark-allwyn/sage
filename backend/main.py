"""
FastAPI Backend for SSR Pipeline Demo Application

This backend provides REST API endpoints for the React demo app to:
- Load and manage survey configurations
- Generate respondent profiles from persona groups
- Generate LLM text responses
- Apply SSR to convert text to probability distributions
- View response datasets
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import sys
import json
import asyncio
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import time
import hashlib
import shutil
import csv
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Import core SSR modules from bundled ssr_core package
from ssr_core.survey import Survey, PersonaGroup, Question, Category
from ssr_core.llm_client import LLMClient, generate_diverse_profiles, RespondentProfile, Response
from ssr_core.ssr_model import SemanticSimilarityRater, RatingDistribution
from ssr_core.model_validator import ModelValidator, validate_survey_model, ModelIncompatibleError
from collections import defaultdict
import numpy as np

# Import ground truth metrics
from ground_truth_metrics import compare_survey_runs

# Import constants
from constants import DEFAULT_CATEGORY, DEFAULT_MAX_CONCURRENT

# Import services
from services.survey_pipeline import SurveyPipeline, PipelineConfig, PipelineProgress


# Helper function to convert numpy types to Python native types
def convert_numpy_types(obj):
    """Recursively convert numpy types to Python native types for JSON serialization"""
    import math

    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        val = float(obj)
        # Handle NaN and Infinity
        if math.isnan(val):
            return None  # Convert NaN to null in JSON
        elif math.isinf(val):
            return None  # Convert Infinity to null in JSON
        return val
    elif isinstance(obj, (float, int)) and not isinstance(obj, bool):
        # Handle Python native float/int that might be NaN or Inf
        if isinstance(obj, float):
            if math.isnan(obj):
                return None
            elif math.isinf(obj):
                return None
        return obj
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    return obj

def build_response_lookup(responses: List[Response]) -> Dict[tuple, Response]:
    """
    Build O(1) lookup dictionary for responses by (respondent_id, question_id).

    Fixes N+1 query pattern: Instead of searching through all responses for each
    distribution (O(n²)), we build this lookup once and use it repeatedly (O(n)).

    For 5,000 distributions with 5,000 responses: ~2,500× speedup
    """
    return {(r.respondent_id, r.question_id): r for r in responses}

# Initialize FastAPI app
app = FastAPI(
    title="SSR Pipeline Demo API",
    description="API for SSR (Semantic Similarity Rating) Pipeline Demo Application",
    version="1.0.0"
)

# Enable CORS for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================
# File Upload Configuration
# ===================

# Setup upload directories
UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Subdirectories for different media types
IMAGES_DIR = UPLOAD_DIR / "images"
CACHE_DIR = UPLOAD_DIR / "cache"

IMAGES_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

# Mount static files for serving uploaded media
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# ===================
# Pydantic Models
# ===================

class SurveyListItem(BaseModel):
    id: str
    name: str
    description: str
    num_questions: int
    num_persona_groups: int
    has_categories: bool

class PersonaGroupSchema(BaseModel):
    name: str
    description: str
    personas: List[str]
    target_demographics: Dict[str, List[str]]
    weight: float

class CategorySchema(BaseModel):
    id: str
    name: str
    description: str
    context: str
    # Multi-modal fields
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    media_path: Optional[str] = None

class QuestionSchema(BaseModel):
    id: str
    text: str
    type: str
    scale: Optional[Dict[int, str]] = None
    options: Optional[List[str]] = None
    category: Optional[str] = None
    categories_compared: Optional[List[str]] = None

class SurveySchema(BaseModel):
    name: str
    description: str
    context: str
    questions: List[QuestionSchema]
    persona_groups: List[PersonaGroupSchema]
    categories: Optional[List[CategorySchema]] = None
    demographics: List[str]
    sample_size: int

class CreateSurveyRequest(BaseModel):
    yaml_content: str
    filename: str

class GenerateProfilesRequest(BaseModel):
    survey_id: str
    num_profiles: int = Field(default=100, ge=10, le=500)

class GenerateResponsesRequest(BaseModel):
    survey_id: str
    profiles: List[Dict[str, Any]]
    llm_provider: str = Field(default="openai", pattern="^(openai|anthropic)$")
    model: str = "gpt-4"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)

class ApplySSRRequest(BaseModel):
    survey_id: str
    responses: List[Dict[str, Any]]
    temperature: float = Field(default=1.0, ge=0.1, le=5.0)
    normalize_method: str = Field(default="paper", pattern="^(paper|softmax|linear)$")

class RunSurveyRequest(BaseModel):
    survey_id: str
    num_profiles: int = Field(default=100, ge=10, le=500)
    llm_provider: str = Field(default="openai", pattern="^(openai|anthropic|ollama)$")
    model: str = "gpt-4"
    llm_temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    ssr_temperature: float = Field(default=1.0, ge=0.1, le=5.0)
    normalize_method: str = Field(default="paper", pattern="^(paper|softmax|linear)$")
    seed: int = Field(default=100, ge=0, le=10000)

class CreateGroundTruthFromSSRRequest(BaseModel):
    survey_id: str
    name: str
    description: str
    num_profiles: int = Field(default=500, ge=10, le=2000)
    llm_provider: str = Field(default="openai", pattern="^(openai|anthropic|ollama)$")
    model: str = "gpt-4"
    llm_temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    ssr_temperature: float = Field(default=1.0, ge=0.1, le=5.0)
    normalize_method: str = Field(default="paper", pattern="^(paper|softmax|linear)$")
    seed: int = Field(default=42, ge=0, le=10000)

class UploadGroundTruthRequest(BaseModel):
    survey_id: str
    name: str
    description: str
    distributions: Dict[str, Any]

# Settings Models
class ProviderConfig(BaseModel):
    enabled: bool
    api_key: Optional[str] = None
    models: List[str] = Field(default_factory=list)

class SystemSettings(BaseModel):
    providers: Dict[str, ProviderConfig]

class UpdateProviderRequest(BaseModel):
    provider: str
    enabled: bool
    api_key: Optional[str] = None
    models: List[str] = Field(default_factory=list)

# ===================
# Helper Functions
# ===================

def get_config_dir() -> Path:
    """Get path to config directory"""
    return Path(__file__).parent.parent / "config"

def get_results_dir() -> Path:
    """Get path to results directory"""
    results_dir = Path(__file__).parent.parent / "results"
    results_dir.mkdir(exist_ok=True)
    return results_dir

def get_ground_truths_dir() -> Path:
    """Get path to ground truths directory"""
    gt_dir = Path(__file__).parent.parent / "ground_truths"
    gt_dir.mkdir(exist_ok=True)
    return gt_dir

def get_experiments_dir() -> Path:
    """Get path to experiments directory"""
    exp_dir = Path(__file__).parent.parent / "experiments"
    exp_dir.mkdir(exist_ok=True)
    return exp_dir

def get_survey_path(survey_id: str) -> Path:
    """Get path to survey YAML file"""
    config_dir = get_config_dir()
    yaml_path = config_dir / f"{survey_id}.yaml"
    if not yaml_path.exists():
        raise HTTPException(status_code=404, detail=f"Survey '{survey_id}' not found")
    return yaml_path

def save_survey_run(run_result: dict) -> None:
    """Save survey run results to disk"""
    results_dir = get_results_dir()
    run_path = results_dir / f"{run_result['run_id']}.json"
    run_path.write_text(json.dumps(run_result, indent=2))

def get_settings_path() -> Path:
    """Get path to settings file"""
    backend_dir = Path(__file__).parent
    return backend_dir / "settings.json"

def load_settings() -> SystemSettings:
    """Load settings from file or return defaults"""
    settings_path = get_settings_path()

    if settings_path.exists():
        try:
            with open(settings_path, 'r') as f:
                data = json.load(f)
                return SystemSettings(**data)
        except Exception as e:
            logger.warning(f"Error loading settings: {e}, using defaults")

    # Return default settings
    return SystemSettings(
        providers={
            "openai": ProviderConfig(enabled=False, api_key=None, models=[]),
            "anthropic": ProviderConfig(enabled=False, api_key=None, models=[]),
            "gemini": ProviderConfig(enabled=False, api_key=None, models=[]),
            "ollama": ProviderConfig(enabled=True, api_key=None, models=["gemma3:latest"]),
        }
    )

def save_settings(settings: SystemSettings) -> None:
    """Save settings to file"""
    settings_path = get_settings_path()
    with open(settings_path, 'w') as f:
        json.dump(settings.dict(), f, indent=2)

def get_api_key_for_provider(provider: str) -> Optional[str]:
    """Get API key for a provider from settings or environment"""
    import os

    # First check settings file
    settings = load_settings()
    if provider in settings.providers:
        provider_config = settings.providers[provider]
        if provider_config.api_key:
            return provider_config.api_key

    # Fallback to environment variables
    env_var_map = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "gemini": "GEMINI_API_KEY",
    }

    if provider in env_var_map:
        return os.getenv(env_var_map[provider])

    return None

def aggregate_distributions_by_question(distributions: List[RatingDistribution], responses: List[Response]) -> Dict:
    """Aggregate individual respondent distributions into per-question averages"""
    aggregated = {}

    # Build O(1) lookup dictionary (fixes N+1 pattern)
    response_lookup = build_response_lookup(responses)

    # Group by category and question
    by_question = defaultdict(list)
    for dist in distributions:
        # Find category from responses using O(1) lookup
        response = response_lookup.get((dist.respondent_id, dist.question_id))
        category = response.category or DEFAULT_CATEGORY if response else DEFAULT_CATEGORY

        key = (category, dist.question_id)
        by_question[key].append(dist)

    # Calculate averages
    for (category, question_id), dists in by_question.items():
        if category not in aggregated:
            aggregated[category] = {}

        # Stack all probability distributions
        prob_arrays = [d.distribution for d in dists]

        # Average across respondents
        mean_probs = np.mean(prob_arrays, axis=0)
        std_probs = np.std(prob_arrays, axis=0)

        aggregated[category][question_id] = {
            "mean_probabilities": mean_probs.tolist(),
            "std_probabilities": std_probs.tolist(),
            "sample_size": len(dists),
            "mean_mode": int(np.mean([d.mode for d in dists])),
            "mean_expected_value": float(np.mean([d.expected_value for d in dists])),
            "mean_entropy": float(np.mean([d.entropy for d in dists]))
        }

    return aggregated

def save_ground_truth(ground_truth: dict) -> None:
    """Save ground truth to disk"""
    gt_dir = get_ground_truths_dir()
    gt_path = gt_dir / f"{ground_truth['id']}.json"
    gt_path.write_text(json.dumps(ground_truth, indent=2))

    # Update index
    index_path = gt_dir / "ground_truths_index.json"
    if index_path.exists():
        index = json.loads(index_path.read_text())
    else:
        index = []

    # Add metadata to index
    index.append({
        "id": ground_truth["id"],
        "name": ground_truth["name"],
        "survey_id": ground_truth["survey_id"],
        "source": ground_truth["source"],
        "created_at": ground_truth["created_at"],
        "num_profiles": ground_truth.get("num_profiles"),
        "num_responses": ground_truth.get("num_responses"),
        "generation_config": ground_truth.get("generation_config")
    })

    index_path.write_text(json.dumps(index, indent=2))

def load_survey(survey_id: str) -> Survey:
    """Load survey from YAML file"""
    survey_path = get_survey_path(survey_id)
    try:
        return Survey.from_config(str(survey_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading survey: {str(e)}")

def survey_to_schema(survey: Survey) -> SurveySchema:
    """Convert Survey object to Pydantic schema"""
    questions_schema = []
    for q in survey.questions:
        q_dict = {
            "id": q.id,
            "text": q.text,
            "type": q.type,
            "category": q.category,
            "categories_compared": q.categories_compared
        }
        if q.scale:
            q_dict["scale"] = q.scale.labels
        if q.options:
            q_dict["options"] = q.options
        questions_schema.append(QuestionSchema(**q_dict))

    persona_groups_schema = []
    for pg in survey.persona_groups:
        persona_groups_schema.append(PersonaGroupSchema(
            name=pg.name,
            description=pg.description,
            personas=pg.personas,
            target_demographics=pg.target_demographics,
            weight=pg.weight
        ))

    categories_schema = None
    if survey.categories:
        categories_schema = [
            CategorySchema(
                id=c.id,
                name=c.name,
                description=c.description,
                context=c.context,
                media_type=c.media_type,
                media_url=c.media_url,
                media_path=c.media_path
            ) for c in survey.categories
        ]

    return SurveySchema(
        name=survey.name,
        description=survey.description,
        context=survey.context,
        questions=questions_schema,
        persona_groups=persona_groups_schema,
        categories=categories_schema,
        demographics=survey.demographics,
        sample_size=survey.sample_size
    )

# ===================
# API Endpoints
# ===================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SSR Pipeline Demo API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/surveys", response_model=List[SurveyListItem])
async def get_surveys():
    """List all available surveys"""
    config_dir = get_config_dir()
    if not config_dir.exists():
        return []

    surveys = []
    for yaml_file in config_dir.glob("*.yaml"):
        try:
            survey = Survey.from_config(str(yaml_file))
            surveys.append(SurveyListItem(
                id=yaml_file.stem,
                name=survey.name,
                description=survey.description,
                num_questions=len(survey.questions),
                num_persona_groups=len(survey.persona_groups),
                has_categories=survey.has_categories()
            ))
        except Exception as e:
            # Log and skip invalid survey files
            logger.error(f"Failed to load survey from {yaml_file.name}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            continue

    return surveys

@app.get("/api/surveys/{survey_id}", response_model=SurveySchema)
async def get_survey(survey_id: str):
    """Get survey configuration"""
    survey = load_survey(survey_id)
    return survey_to_schema(survey)

@app.post("/api/surveys")
async def create_survey(request: CreateSurveyRequest):
    """Create new survey from YAML content"""
    config_dir = get_config_dir()
    config_dir.mkdir(exist_ok=True)

    # Validate filename
    if not request.filename.endswith('.yaml'):
        request.filename += '.yaml'

    survey_path = config_dir / request.filename
    if survey_path.exists():
        raise HTTPException(status_code=400, detail="Survey with this name already exists")

    # Validate YAML by trying to load it
    try:
        import yaml
        survey_config = yaml.safe_load(request.yaml_content)
        if 'survey' not in survey_config:
            raise ValueError("YAML must contain 'survey' key")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {str(e)}")

    # Save survey
    survey_path.write_text(request.yaml_content)

    return {
        "survey_id": survey_path.stem,
        "status": "created",
        "path": str(survey_path)
    }

@app.put("/api/surveys/{survey_id}")
async def update_survey(survey_id: str, request: CreateSurveyRequest):
    """Update existing survey with new YAML content"""
    survey_path = get_survey_path(survey_id)

    # Validate YAML by trying to load it
    try:
        import yaml
        survey_config = yaml.safe_load(request.yaml_content)
        if 'survey' not in survey_config:
            raise ValueError("YAML must contain 'survey' key")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML: {str(e)}")

    # Save updated survey
    survey_path.write_text(request.yaml_content)

    return {
        "survey_id": survey_id,
        "status": "updated",
        "path": str(survey_path)
    }

@app.delete("/api/surveys/{survey_id}")
async def delete_survey(survey_id: str):
    """Delete a survey"""
    survey_path = get_survey_path(survey_id)

    try:
        survey_path.unlink()
        return {
            "survey_id": survey_id,
            "status": "deleted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting survey: {str(e)}")

@app.post("/api/generate-profiles")
async def generate_profiles(request: GenerateProfilesRequest):
    """Generate respondent profiles from persona groups"""
    survey = load_survey(request.survey_id)

    try:
        profiles = generate_diverse_profiles(
            n_profiles=request.num_profiles,
            persona_groups=survey.persona_groups
        )

        return {
            "survey_id": request.survey_id,
            "num_profiles": len(profiles),
            "profiles": [p.to_dict() for p in profiles]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating profiles: {str(e)}")

@app.post("/api/generate-responses")
async def generate_responses(request: GenerateResponsesRequest):
    """Generate LLM text responses"""
    survey = load_survey(request.survey_id)

    # Convert dict profiles back to RespondentProfile objects
    profiles = []
    for p_dict in request.profiles:
        profile = RespondentProfile(
            description=p_dict.get('description', ''),
            respondent_id=p_dict.get('respondent_id'),
            gender=p_dict.get('gender', 'Unknown'),
            age_group=p_dict.get('age_group', 'Unknown'),
            persona_group=p_dict.get('persona_group', 'General'),
            occupation=p_dict.get('occupation', 'Unknown')
        )
        profiles.append(profile)

    try:
        # Initialize LLM client
        llm_client = LLMClient(
            provider=request.llm_provider,
            model=request.model,
            temperature=request.llm_temperature
        )

        # Generate responses (using concurrent version for better performance)
        responses = llm_client.generate_responses_concurrent(survey, profiles, max_concurrent=DEFAULT_MAX_CONCURRENT)

        return {
            "survey_id": request.survey_id,
            "num_responses": len(responses),
            "responses": [
                {
                    "respondent_id": r.respondent_id,
                    "question_id": r.question_id,
                    "text_response": r.text_response,
                    "respondent_profile": r.respondent_profile,
                    "category": r.category
                } for r in responses
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating responses: {str(e)}")

@app.post("/api/apply-ssr")
async def apply_ssr(request: ApplySSRRequest):
    """Apply SSR to convert text responses to probability distributions"""
    survey = load_survey(request.survey_id)

    # Convert dict responses back to Response objects
    responses = []
    for r_dict in request.responses:
        response = Response(
            respondent_id=r_dict['respondent_id'],
            question_id=r_dict['question_id'],
            text_response=r_dict['text_response'],
            respondent_profile=r_dict['respondent_profile'],
            category=r_dict.get('category')
        )
        responses.append(response)

    try:
        # Initialize SSR rater
        rater = SemanticSimilarityRater(
            temperature=request.temperature,
            normalize_method=request.normalize_method
        )

        # Apply SSR
        distributions = rater.rate_responses(responses, survey, show_progress=False)

        # Build O(1) lookup dictionary (fixes N+1 pattern)
        response_lookup = build_response_lookup(responses)

        # Organize by category and question
        organized_distributions = {}
        for dist in distributions:
            # Get category and profile using O(1) lookup
            response = response_lookup.get((dist.respondent_id, dist.question_id))
            category = response.category or DEFAULT_CATEGORY if response else DEFAULT_CATEGORY
            profile = response.respondent_profile if response else {}

            if category not in organized_distributions:
                organized_distributions[category] = {}

            if dist.question_id not in organized_distributions[category]:
                organized_distributions[category][dist.question_id] = {}

            organized_distributions[category][dist.question_id][dist.respondent_id] = {
                "probabilities": dist.distribution.tolist(),
                "mode": int(dist.mode),
                "expected_value": float(dist.expected_value),
                "entropy": float(dist.entropy),
                "text_response": dist.text_response,
                "gender": profile.get('gender', 'Unknown'),
                "age_group": profile.get('age_group', 'Unknown'),
                "persona_group": profile.get('persona_group', 'General'),
                "occupation": profile.get('occupation', 'Unknown')
            }

        return {
            "survey_id": request.survey_id,
            "num_distributions": len(distributions),
            "distributions": organized_distributions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying SSR: {str(e)}")

@app.post("/api/run-survey-stream")
async def run_survey_stream(request: RunSurveyRequest):
    """Run complete survey pipeline with streaming progress updates"""

    async def generate():
        try:
            survey = load_survey(request.survey_id)

            # Validate model compatibility with survey media content
            try:
                validate_survey_model(survey, request.llm_provider, request.model)
            except ModelIncompatibleError as e:
                error_data = {'status': 'error', 'message': str(e), 'progress': 0}
                yield f"data: {json.dumps(error_data)}\n\n"
                return

            # Send initial status
            msg_data = {'status': 'starting', 'message': f'Starting survey: {survey.name}', 'progress': 0}
            yield f"data: {json.dumps(msg_data)}\n\n"
            await asyncio.sleep(0.1)

            # Configure and run pipeline
            config = PipelineConfig(
                llm_provider=request.llm_provider,
                model=request.model,
                llm_temperature=request.llm_temperature,
                ssr_temperature=request.ssr_temperature,
                normalize_method=request.normalize_method,
                num_profiles=request.num_profiles,
                seed=request.seed
            )

            pipeline = SurveyPipeline(survey, config)

            # Define progress callback for streaming updates
            def progress_callback(progress: PipelineProgress):
                msg_data = {
                    'status': progress.status,
                    'message': progress.message,
                    'progress': progress.progress
                }
                # Note: Can't yield from callback, will collect and yield after
                nonlocal last_progress
                last_progress = msg_data

            last_progress = None

            # Run pipeline (currently runs synchronously in background thread)
            result = await pipeline.run_async()

            # Convert PipelineResult dataclass to dict for JSON serialization
            result_dict = {
                "run_id": result.run_id,
                "survey_id": result.survey_id,
                "survey_name": result.survey_name,
                "timestamp": result.timestamp,
                "num_profiles": result.num_profiles,
                "num_responses": result.num_responses,
                "num_distributions": result.num_distributions,
                "distributions": result.distributions,
                "config": result.config
            }

            # Save run results to disk
            save_survey_run(result_dict)

            # Send completion with results
            print(f"\n=== Preparing Completion Message ===")
            print(f"Result size - Profiles: {result.num_profiles}, Responses: {result.num_responses}, Distributions: {result.num_distributions}")
            print(f"Pipeline timing: {result.timing}")

            completion_data = {
                'status': 'complete',
                'message': 'Survey complete!',
                'progress': 100,
                'result': result_dict
            }

            print("Serializing completion data to JSON...")
            try:
                json_str = json.dumps(completion_data)
                print(f"JSON serialization successful! Length: {len(json_str)} characters")
                yield f"data: {json_str}\n\n"
                print("Completion message sent successfully")
            except Exception as json_error:
                print(f"ERROR during JSON serialization: {type(json_error).__name__}: {str(json_error)}")
                raise

        except Exception as e:
            error_data = {
                'status': 'error',
                'message': f'Error: {str(e)}',
                'progress': 0
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/run-survey")
async def run_survey(request: RunSurveyRequest):
    """Run complete survey pipeline (profiles → responses → SSR)"""
    survey = load_survey(request.survey_id)

    # Validate model compatibility with survey media content
    try:
        validate_survey_model(survey, request.llm_provider, request.model)
    except ModelIncompatibleError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        # Step 1: Generate profiles
        profiles = generate_diverse_profiles(
            n_profiles=request.num_profiles,
            persona_groups=survey.persona_groups
        )

        # Step 2: Generate LLM responses
        llm_client = LLMClient(
            provider=request.llm_provider,
            model=request.model,
            temperature=request.llm_temperature
        )
        responses = llm_client.generate_responses_concurrent(survey, profiles, max_concurrent=DEFAULT_MAX_CONCURRENT)

        # Step 3: Apply SSR
        rater = SemanticSimilarityRater(
            temperature=request.ssr_temperature,
            normalize_method=request.normalize_method
        )
        distributions = rater.rate_responses(responses, survey, show_progress=False)

        # Build O(1) lookup dictionary (fixes N+1 pattern)
        response_lookup = build_response_lookup(responses)

        # Organize results
        organized_distributions = {}
        for dist in distributions:
            # Get category and profile using O(1) lookup
            response = response_lookup.get((dist.respondent_id, dist.question_id))
            category = response.category or DEFAULT_CATEGORY if response else DEFAULT_CATEGORY
            profile = response.respondent_profile if response else {}

            if category not in organized_distributions:
                organized_distributions[category] = {}

            if dist.question_id not in organized_distributions[category]:
                organized_distributions[category][dist.question_id] = {}

            organized_distributions[category][dist.question_id][dist.respondent_id] = {
                "probabilities": dist.distribution.tolist(),
                "mode": int(dist.mode),
                "expected_value": float(dist.expected_value),
                "entropy": float(dist.entropy),
                "text_response": dist.text_response,
                "gender": profile.get('gender', 'Unknown'),
                "age_group": profile.get('age_group', 'Unknown'),
                "persona_group": profile.get('persona_group', 'General'),
                "occupation": profile.get('occupation', 'Unknown')
            }

        # Generate run ID
        run_id = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        logger.info(f"Survey run complete! Run ID: {run_id}")
        logger.info(f"  - Profiles: {len(profiles)}")
        logger.info(f"  - Responses: {len(responses)}")
        logger.info(f"  - Distributions: {len(distributions)}")

        response_data = {
            "run_id": run_id,
            "survey_id": request.survey_id,
            "num_profiles": len(profiles),
            "num_responses": len(responses),
            "num_distributions": len(distributions),
            "distributions": organized_distributions,
            "config": {
                "llm_provider": request.llm_provider,
                "model": request.model,
                "llm_temperature": request.llm_temperature,
                "ssr_temperature": request.ssr_temperature,
                "normalize_method": request.normalize_method,
                "seed": request.seed
            }
        }

        # Save survey run to file
        results_dir = get_results_dir()
        results_dir.mkdir(exist_ok=True)
        run_path = results_dir / f"{run_id}.json"
        run_path.write_text(json.dumps(response_data, indent=2))

        # Update runs index
        index_path = results_dir / "runs_index.json"
        index = []
        if index_path.exists():
            index = json.loads(index_path.read_text())

        # Add new run to index
        index.append({
            "run_id": run_id,
            "survey_id": request.survey_id,
            "timestamp": datetime.now().isoformat(),
            "num_profiles": len(profiles),
            "num_responses": len(responses),
            "config": response_data["config"]
        })
        index_path.write_text(json.dumps(index, indent=2))

        logger.info(f"Survey run saved: {run_path}")

        # Convert numpy types to Python native types for JSON serialization
        return convert_numpy_types(response_data)
    except Exception as e:
        import traceback
        logger.error(f"Error running survey: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error running survey: {str(e)}")

# ===================
# Survey History Endpoints
# ===================

@app.get("/api/survey-runs")
async def get_survey_runs(survey_id: Optional[str] = None):
    """List all survey runs with optional filtering by survey_id"""
    results_dir = get_results_dir()

    # Scan directory for run files (more robust than relying on index file)
    runs = []
    for run_file in results_dir.glob("run_*.json"):
        try:
            data = json.loads(run_file.read_text())
            # Create metadata entry for the list
            run_meta = {
                "run_id": data.get("run_id"),
                "survey_id": data.get("survey_id"),
                "survey_name": data.get("survey_name"),
                "timestamp": data.get("timestamp"),
                "num_profiles": data.get("num_profiles"),
                "num_responses": data.get("num_responses"),
                "config": data.get("config", {})
            }
            runs.append(run_meta)
        except Exception as e:
            logger.error(f"Error reading run file {run_file}: {e}")
            continue

    # Filter by survey_id if provided
    if survey_id:
        runs = [run for run in runs if run["survey_id"] == survey_id]

    # Sort by timestamp descending (newest first)
    runs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    return runs

@app.get("/api/survey-runs/{run_id}")
async def get_survey_run(run_id: str):
    """Get specific survey run details"""
    results_dir = get_results_dir()
    run_path = results_dir / f"{run_id}.json"

    if not run_path.exists():
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")

    return json.loads(run_path.read_text())

@app.delete("/api/survey-runs/{run_id}")
async def delete_survey_run(run_id: str):
    """Delete a survey run"""
    results_dir = get_results_dir()
    run_path = results_dir / f"{run_id}.json"

    if not run_path.exists():
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")

    # Remove from index
    index_path = results_dir / "runs_index.json"
    if index_path.exists():
        index = json.loads(index_path.read_text())
        index = [run for run in index if run["run_id"] != run_id]
        index_path.write_text(json.dumps(index, indent=2))

    # Delete file
    run_path.unlink()

    return {"run_id": run_id, "status": "deleted"}

# ===================
# Ground Truth Endpoints
# ===================

@app.post("/api/ground-truths/from-ssr")
async def create_ground_truth_from_ssr(request: CreateGroundTruthFromSSRRequest):
    """Generate ground truth by running full SSR pipeline with personas"""
    survey = load_survey(request.survey_id)

    try:
        # Step 1: Generate profiles from persona groups
        profiles = generate_diverse_profiles(
            n_profiles=request.num_profiles,
            persona_groups=survey.persona_groups
        )

        # Step 2: Generate LLM responses
        llm_client = LLMClient(
            provider=request.llm_provider,
            model=request.model,
            temperature=request.llm_temperature
        )
        responses = llm_client.generate_responses_concurrent(
            survey=survey,
            respondent_profiles=profiles,
            max_concurrent=DEFAULT_MAX_CONCURRENT
        )

        # Step 3: Apply SSR
        rater = SemanticSimilarityRater(
            temperature=request.ssr_temperature,
            normalize_method=request.normalize_method
        )
        distributions = rater.rate_responses(responses, survey, show_progress=False)

        # Step 4: Aggregate distributions per question
        aggregated_distributions = aggregate_distributions_by_question(distributions, responses)

        # Build O(1) lookup dictionary (fixes N+1 pattern)
        response_lookup = build_response_lookup(responses)

        # Step 5: Organize raw distributions
        organized_distributions = {}
        for dist in distributions:
            # Get category and profile using O(1) lookup
            response = response_lookup.get((dist.respondent_id, dist.question_id))
            category = response.category or DEFAULT_CATEGORY if response else DEFAULT_CATEGORY
            profile = response.respondent_profile if response else {}

            if category not in organized_distributions:
                organized_distributions[category] = {}
            if dist.question_id not in organized_distributions[category]:
                organized_distributions[category][dist.question_id] = {}

            organized_distributions[category][dist.question_id][dist.respondent_id] = {
                "probabilities": dist.distribution.tolist(),
                "mode": int(dist.mode),
                "expected_value": float(dist.expected_value),
                "entropy": float(dist.entropy),
                "text_response": dist.text_response or "",
                "gender": profile.get('gender', 'Unknown'),
                "age_group": profile.get('age_group', 'Unknown'),
                "persona_group": profile.get('persona_group', 'General'),
                "occupation": profile.get('occupation', 'Unknown')
            }

        # Calculate persona distribution
        persona_distribution = {}
        for profile in profiles:
            pg = profile.persona_group
            persona_distribution[pg] = persona_distribution.get(pg, 0) + 1

        # Step 6: Save as ground truth
        ground_truth_id = f"gt_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        ground_truth = {
            "id": ground_truth_id,
            "name": request.name,
            "description": request.description,
            "survey_id": request.survey_id,
            "survey_name": survey.name,
            "source": "ssr_generated",
            "created_at": datetime.now().isoformat(),
            "num_profiles": request.num_profiles,
            "num_responses": len(responses),
            "generation_config": {
                "num_profiles": request.num_profiles,
                "llm_provider": request.llm_provider,
                "model": request.model,
                "llm_temperature": request.llm_temperature,
                "ssr_temperature": request.ssr_temperature,
                "normalize_method": request.normalize_method,
                "seed": request.seed,
                "persona_groups": [pg.name for pg in survey.persona_groups],
                "persona_distribution": persona_distribution
            },
            "aggregated_distributions": aggregated_distributions,
            "raw_distributions": organized_distributions
        }

        save_ground_truth(ground_truth)

        return {
            "id": ground_truth_id,
            "status": "created",
            "name": request.name,
            "num_profiles": request.num_profiles,
            "num_responses": len(responses)
        }

    except Exception as e:
        import traceback
        error_detail = f"Error creating ground truth: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # Log to console
        raise HTTPException(status_code=500, detail=f"Error creating ground truth: {str(e)}")

@app.post("/api/ground-truths/from-upload")
async def create_ground_truth_from_upload(request: UploadGroundTruthRequest):
    """Create ground truth from uploaded data"""
    survey = load_survey(request.survey_id)

    ground_truth_id = f"gt_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    ground_truth = {
        "id": ground_truth_id,
        "name": request.name,
        "description": request.description,
        "survey_id": request.survey_id,
        "survey_name": survey.name,
        "source": "uploaded",
        "created_at": datetime.now().isoformat(),
        "aggregated_distributions": request.distributions
    }

    save_ground_truth(ground_truth)

    return {
        "id": ground_truth_id,
        "status": "created",
        "name": request.name
    }


def parse_ground_truth_csv(csv_content: str, survey: Survey):
    """Parse CSV ground truth data (simple answer format) and validate against survey structure"""
    validation_errors = []
    validation_warnings = []

    # Parse CSV
    csv_file = io.StringIO(csv_content)
    reader = csv.DictReader(csv_file)

    # Collect rows
    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    # Check required columns for simple answer format
    required_cols = {'Respondent ID', 'Question ID', 'Answer'}
    first_row_cols = set(rows[0].keys())

    if not required_cols.issubset(first_row_cols):
        missing = required_cols - first_row_cols
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {', '.join(missing)}. Expected format: Respondent ID, Question ID, Answer, Category (optional), Demographics (optional)"
        )

    # Organize data: respondent -> category -> question -> answer
    raw_answers = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))
    categories = set()
    questions = set()
    respondent_ids = set()

    # Build survey question map
    survey_questions = {}
    for q in survey.questions:
        survey_questions[q.id] = q

    for line_num, row in enumerate(rows, start=2):  # Line 2 because of header
        try:
            respondent_id = row.get('Respondent ID', '').strip()
            question_id = row.get('Question ID', '').strip()
            answer = int(row.get('Answer', '0'))
            category = row.get('Category', 'general').strip()

            # Optional demographics
            gender = row.get('Gender', '').strip()
            age_group = row.get('Age Group', '').strip()
            persona_group = row.get('Persona Group', '').strip()
            occupation = row.get('Occupation', '').strip()

            if not respondent_id or not question_id:
                validation_errors.append({
                    "line_number": line_num,
                    "field": "Respondent ID or Question ID",
                    "message": "Respondent ID and Question ID are required",
                    "severity": "error"
                })
                continue

            # Validate question exists in survey
            if question_id not in survey_questions:
                validation_errors.append({
                    "line_number": line_num,
                    "field": "Question ID",
                    "message": f"Question '{question_id}' not found in survey",
                    "severity": "error"
                })
                continue

            question = survey_questions[question_id]

            # Validate answer is within valid range
            if question.type == 'likert_5':
                valid_range = (1, 5)
            elif question.type == 'likert_7':
                valid_range = (1, 7)
            elif question.type == 'yes_no':
                valid_range = (1, 2)
            else:
                valid_range = (1, len(question.options) if question.options else 5)

            if not (valid_range[0] <= answer <= valid_range[1]):
                validation_errors.append({
                    "line_number": line_num,
                    "field": "Answer",
                    "message": f"Answer {answer} out of valid range {valid_range} for question type {question.type}",
                    "severity": "error"
                })
                continue

            # Validate category if present
            if question.category and category != question.category:
                validation_warnings.append({
                    "line_number": line_num,
                    "field": "Category",
                    "message": f"Category mismatch: CSV has '{category}', survey expects '{question.category}'",
                    "severity": "warning"
                })

            categories.add(category)
            questions.add(question_id)
            respondent_ids.add(respondent_id)

            # Store answer with demographics
            raw_answers[respondent_id][category][question_id] = {
                "answer": answer,
                "gender": gender,
                "age_group": age_group,
                "persona_group": persona_group,
                "occupation": occupation
            }

        except (ValueError, KeyError) as e:
            validation_errors.append({
                "line_number": line_num,
                "field": "unknown",
                "message": f"Parse error: {str(e)}",
                "severity": "error"
            })

    if validation_errors:
        return {
            "success": False,
            "validation_errors": validation_errors,
            "validation_warnings": validation_warnings
        }

    # Calculate answer frequency distributions (aggregated statistics)
    aggregated_distributions = defaultdict(lambda: defaultdict(dict))
    raw_distributions = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))

    for category in categories:
        for question_id in questions:
            if question_id not in survey_questions:
                continue

            question = survey_questions[question_id]

            # Determine number of rating options
            if question.type == 'likert_5':
                num_ratings = 5
            elif question.type == 'likert_7':
                num_ratings = 7
            elif question.type == 'yes_no':
                num_ratings = 2
            else:
                num_ratings = len(question.options) if question.options else 5

            # Collect all answers for this question
            answers_list = []
            for respondent_id in respondent_ids:
                if category in raw_answers[respondent_id] and question_id in raw_answers[respondent_id][category]:
                    answer_data = raw_answers[respondent_id][category][question_id]
                    answer = answer_data["answer"]
                    answers_list.append(answer)

                    # Store raw answer (not as distribution)
                    raw_distributions[category][question_id][respondent_id] = {
                        "answer": answer,
                        "gender": answer_data["gender"],
                        "age_group": answer_data["age_group"],
                        "persona_group": answer_data["persona_group"],
                        "occupation": answer_data["occupation"]
                    }

            if answers_list:
                # Calculate frequency distribution from answers
                answer_counts = defaultdict(int)
                for ans in answers_list:
                    answer_counts[ans] += 1

                # Convert counts to probabilities (frequencies)
                total = len(answers_list)
                freq_probs = [answer_counts.get(i+1, 0) / total for i in range(num_ratings)]

                # Calculate statistics from answers
                mean_answer = float(np.mean(answers_list))
                std_answer = float(np.std(answers_list))
                mode_answer = int(max(answer_counts.items(), key=lambda x: x[1])[0]) if answer_counts else 0

                # Calculate expected value from frequency distribution
                mean_expected_value = float(sum((i+1) * freq_probs[i] for i in range(len(freq_probs))))

                # Calculate entropy from frequency distribution
                mean_entropy = float(-sum(p * np.log(p + 1e-10) for p in freq_probs if p > 0))

                # Calculate std of probabilities (variance across rating options)
                # For ground truth, this represents variability in population preferences
                std_probs = [0.0] * num_ratings  # No per-rating std for simple answers

                # Store in SSR-compatible format
                aggregated_distributions[category][question_id] = {
                    "mean_probabilities": freq_probs,  # Matches SSR format!
                    "std_probabilities": std_probs,  # Placeholder for compatibility
                    "sample_size": total,
                    "mean_mode": float(mode_answer),  # Mode of actual answers
                    "mean_expected_value": mean_expected_value,
                    "mean_entropy": mean_entropy,
                    # Additional metadata for ground truth
                    "answer_counts": dict(answer_counts),
                    "mean_answer": mean_answer,
                    "std_answer": std_answer,
                    "source": "uploaded_answers"  # Flag to identify this as answer-based
                }

    # Create sample data for preview
    sample_data = []
    for respondent_id in list(respondent_ids)[:5]:  # First 5 respondents
        for category in list(categories):
            if category in raw_answers[respondent_id]:
                for question_id in list(raw_answers[respondent_id][category].keys())[:3]:  # First 3 questions
                    answer_data = raw_answers[respondent_id][category][question_id]
                    sample_data.append({
                        "category": category,
                        "question_id": question_id,
                        "respondent_id": respondent_id,
                        "answer": answer_data["answer"]
                    })

    return {
        "success": True,
        "format_detected": "simple_answers",
        "num_respondents": len(respondent_ids),
        "num_questions": len(questions),
        "num_categories": len(categories),
        "categories": sorted(list(categories)),
        "questions": sorted(list(questions)),
        "sample_data": sample_data[:10],  # Limit to 10 rows
        "validation_errors": validation_errors,
        "validation_warnings": validation_warnings,
        "aggregated_distributions": dict(aggregated_distributions),
        "raw_distributions": dict(raw_distributions),
        "num_responses": len(rows)
    }


@app.post("/api/ground-truths/upload-csv")
async def upload_ground_truth_csv(
    file: UploadFile = File(...),
    survey_id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...)
):
    """Upload ground truth from CSV file"""
    try:
        # Load survey to validate against
        survey = load_survey(survey_id)

        # Read CSV content
        csv_content = await file.read()
        csv_text = csv_content.decode('utf-8')

        # Parse and validate CSV
        parse_result = parse_ground_truth_csv(csv_text, survey)

        if not parse_result["success"]:
            return {
                "success": False,
                "preview": parse_result,
                "errors": parse_result["validation_errors"]
            }

        # Create ground truth
        ground_truth_id = f"gt_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        ground_truth = {
            "id": ground_truth_id,
            "name": name,
            "description": description,
            "survey_id": survey_id,
            "survey_name": survey.name,
            "source": "uploaded",
            "created_at": datetime.now().isoformat(),
            "num_profiles": parse_result.get("num_respondents", 0),
            "num_responses": parse_result.get("num_responses", 0),
            "aggregated_distributions": parse_result["aggregated_distributions"]
        }

        # Add raw distributions if available
        if parse_result.get("raw_distributions"):
            ground_truth["raw_distributions"] = parse_result["raw_distributions"]

        # Convert numpy types before saving
        ground_truth = convert_numpy_types(ground_truth)

        # Save ground truth
        save_ground_truth(ground_truth)

        return {
            "success": True,
            "ground_truth_id": ground_truth_id,
            "preview": {
                "format_detected": parse_result["format_detected"],
                "num_respondents": parse_result.get("num_respondents"),
                "num_questions": parse_result["num_questions"],
                "num_categories": parse_result["num_categories"],
                "categories": parse_result["categories"],
                "questions": parse_result["questions"],
                "sample_data": parse_result["sample_data"],
                "validation_errors": [],
                "validation_warnings": parse_result["validation_warnings"]
            },
            "message": f"Ground truth '{name}' created successfully"
        }

    except Exception as e:
        logger.error(f"Error uploading CSV ground truth: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")


@app.get("/api/ground-truths")
async def get_ground_truths(survey_id: Optional[str] = None):
    """List all ground truths with optional filtering by survey_id"""
    gt_dir = get_ground_truths_dir()
    index_path = gt_dir / "ground_truths_index.json"

    if not index_path.exists():
        return []

    index = json.loads(index_path.read_text())

    # Filter by survey_id if provided
    if survey_id:
        index = [gt for gt in index if gt["survey_id"] == survey_id]

    # Sort by created_at descending (newest first)
    index.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return index

@app.get("/api/ground-truths/{gt_id}")
async def get_ground_truth(gt_id: str):
    """Get specific ground truth details"""
    gt_dir = get_ground_truths_dir()
    gt_path = gt_dir / f"{gt_id}.json"

    if not gt_path.exists():
        raise HTTPException(status_code=404, detail=f"Ground truth '{gt_id}' not found")

    return json.loads(gt_path.read_text())

@app.delete("/api/ground-truths/{gt_id}")
async def delete_ground_truth(gt_id: str):
    """Delete a ground truth"""
    gt_dir = get_ground_truths_dir()
    gt_path = gt_dir / f"{gt_id}.json"

    if not gt_path.exists():
        raise HTTPException(status_code=404, detail=f"Ground truth '{gt_id}' not found")

    # Remove from index
    index_path = gt_dir / "ground_truths_index.json"
    if index_path.exists():
        index = json.loads(index_path.read_text())
        index = [gt for gt in index if gt["id"] != gt_id]
        index_path.write_text(json.dumps(index, indent=2))

    # Delete file
    gt_path.unlink()

    return {"id": gt_id, "status": "deleted"}

@app.post("/api/ground-truths/compare")
async def compare_run_to_ground_truth(run_id: str, ground_truth_id: str):
    """Compare a survey run against ground truth"""
    # Load ground truth
    gt_dir = get_ground_truths_dir()
    gt_path = gt_dir / f"{ground_truth_id}.json"
    if not gt_path.exists():
        raise HTTPException(status_code=404, detail=f"Ground truth '{ground_truth_id}' not found")
    ground_truth = json.loads(gt_path.read_text())

    # Load survey run
    results_dir = get_results_dir()
    run_path = results_dir / f"{run_id}.json"
    if not run_path.exists():
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    test_run = json.loads(run_path.read_text())

    # Verify they're for the same survey
    if ground_truth["survey_id"] != test_run["survey_id"]:
        raise HTTPException(
            status_code=400,
            detail="Ground truth and run are for different surveys"
        )

    try:
        # Perform comparison
        comparison_results = compare_survey_runs(ground_truth, test_run)

        response_data = {
            "run_id": run_id,
            "ground_truth_id": ground_truth_id,
            "survey_id": test_run["survey_id"],
            "comparison": comparison_results,
            # Include distributions for visualization
            "test_run_distributions": test_run.get("distributions", {}),
            "ground_truth_distributions": ground_truth.get("aggregated_distributions", {})
        }

        # Convert numpy types to Python native types for JSON serialization
        return convert_numpy_types(response_data)
    except Exception as e:
        import traceback
        logger.error(f"Error comparing: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error comparing: {str(e)}")

# ===================
# File Upload Endpoints
# ===================

@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file for a category.
    Returns the file path and URL for the uploaded image.
    """
    try:
        # Validate file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
            )

        # Generate unique filename using hash
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        file_hash = hashlib.md5(content).hexdigest()
        unique_filename = f"{file_hash}{file_ext}"
        file_path = IMAGES_DIR / unique_filename

        # Save file
        with open(file_path, "wb") as f:
            f.write(content)

        # Return relative path for storage and URL for access
        relative_path = f"uploads/images/{unique_filename}"

        logger.info(f"Uploaded image: {unique_filename}")

        return {
            "success": True,
            "media_type": "image",
            "media_path": str(file_path),
            "media_url": f"http://localhost:8000/{relative_path}",
            "filename": unique_filename
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/api/process/webpage-url")
async def process_webpage_url(media_url: str = Form(...)):
    """
    Process a webpage URL.
    Takes a screenshot for visual analysis.
    """
    try:
        if not media_url.startswith(('http://', 'https://')):
            raise HTTPException(
                status_code=400,
                detail="Invalid URL. Must start with http:// or https://"
            )

        logger.info(f"Processing webpage URL: {media_url}")

        # For now, just return URL - screenshot functionality can be added later with playwright
        # TODO: Add screenshot capture using playwright

        return {
            "success": True,
            "media_type": "webpage",
            "media_url": media_url,
            "message": "Webpage URL saved. Screenshot capture coming soon."
        }

    except Exception as e:
        logger.error(f"Error processing webpage URL: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
# ===================
# Settings API Endpoints
# ===================

@app.get("/api/settings")
async def get_settings():
    """Get current system settings (with masked API keys)"""
    try:
        settings = load_settings()

        # Mask API keys in response (show only last 4 characters)
        masked_settings = settings.dict()
        for provider, config in masked_settings["providers"].items():
            if config["api_key"]:
                key = config["api_key"]
                if len(key) > 4:
                    masked_settings["providers"][provider]["api_key"] = "****" + key[-4:]
                else:
                    masked_settings["providers"][provider]["api_key"] = "****"

        return masked_settings
    except Exception as e:
        logger.error(f"Error loading settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/settings/provider")
async def update_provider_settings(request: UpdateProviderRequest):
    """Update settings for a specific provider"""
    try:
        # Load current settings
        settings = load_settings()

        # Validate provider
        if request.provider not in settings.providers:
            raise HTTPException(status_code=400, detail=f"Invalid provider: {request.provider}")

        # Update provider config
        settings.providers[request.provider] = ProviderConfig(
            enabled=request.enabled,
            api_key=request.api_key,
            models=request.models
        )

        # Save settings
        save_settings(settings)

        logger.info(f"Updated settings for provider: {request.provider}")

        return {"message": f"Settings updated for {request.provider}", "success": True}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating provider settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/settings/reset")
async def reset_settings():
    """Reset settings to defaults"""
    try:
        default_settings = SystemSettings(
            providers={
                "openai": ProviderConfig(enabled=False, api_key=None, models=[]),
                "anthropic": ProviderConfig(enabled=False, api_key=None, models=[]),
                "gemini": ProviderConfig(enabled=False, api_key=None, models=[]),
                "ollama": ProviderConfig(enabled=True, api_key=None, models=["gemma3:latest"]),
            }
        )

        save_settings(default_settings)

        logger.info("Settings reset to defaults")

        return {"message": "Settings reset to defaults", "success": True}

    except Exception as e:
        logger.error(f"Error resetting settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================
# Evaluation Endpoints
# ===================

from evaluation import create_evaluator, ResponseEvaluator


class EvaluateResponsesRequest(BaseModel):
    """Request to evaluate survey responses"""
    survey_id: str
    run_id: Optional[str] = None
    sample_size: Optional[int] = None
    metrics: Optional[List[str]] = Field(default=None)
    evaluator_model: str = Field(default="gpt-4o-mini")
    threshold: float = Field(default=0.5)


class EvaluationListItem(BaseModel):
    """Summary of an evaluation"""
    evaluation_id: str
    survey_id: str
    timestamp: str
    evaluated_responses: int
    overall_score: float
    success: bool


@app.post("/api/evaluations/evaluate")
async def evaluate_responses(request: EvaluateResponsesRequest):
    """
    Evaluate LLM responses for a survey run

    This endpoint evaluates responses using DeepEval metrics including
    answer relevancy, bias detection, and hallucination detection.
    """
    try:
        logger.info(f"Starting evaluation for survey {request.survey_id}")

        # Load survey configuration (load_survey expects survey_id, not path)
        survey_config = load_survey(request.survey_id)

        # Load responses - either from specific run or latest run
        results_dir = get_results_dir()
        if request.run_id:
            run_file = results_dir / f"{request.run_id}.json"
            if not run_file.exists():
                raise HTTPException(status_code=404, detail=f"Run {request.run_id} not found")
        else:
            # Find latest run for this survey
            run_files = list(results_dir.glob(f"{request.survey_id}_*.json"))
            if not run_files:
                raise HTTPException(status_code=404, detail=f"No runs found for survey {request.survey_id}")
            run_file = max(run_files, key=lambda p: p.stat().st_mtime)

        with open(run_file, 'r') as f:
            run_data = json.load(f)

        # Extract responses
        responses = []
        for category, cat_data in run_data.get("distributions", {}).items():
            for question_id, question_data in cat_data.items():
                for respondent_id, dist_data in question_data.items():
                    responses.append({
                        "question_id": question_id,
                        "respondent_id": respondent_id,
                        "text_response": dist_data.get("text_response", ""),
                        "category": category,
                    })

        if not responses:
            raise HTTPException(status_code=400, detail="No responses found to evaluate")

        # Create evaluator
        evaluator = create_evaluator(
            metrics=request.metrics,
            evaluator_model=request.evaluator_model,
            threshold=request.threshold,
        )

        # Run evaluation
        # Convert Survey object questions to dict format expected by evaluator
        questions_dict = [{"id": q.id, "text": q.text} for q in survey_config.questions]

        # Pass survey context for proper hallucination detection
        survey_context = survey_config.context if hasattr(survey_config, 'context') else None
        logger.info(f"Survey context available: {survey_context is not None}, length: {len(survey_context) if survey_context else 0}")

        # Extract run_id from the run file name
        actual_run_id = run_file.stem  # This gives us the filename without extension

        result = evaluator.evaluate_survey_responses(
            survey_id=request.survey_id,
            responses=responses,
            questions=questions_dict,
            sample_size=request.sample_size,
            survey_context=survey_context,
            run_id=actual_run_id,
        )

        logger.info(f"Evaluation complete for survey {request.survey_id}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating responses: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/evaluations")
async def list_evaluations(survey_id: Optional[str] = None):
    """
    List all evaluations, optionally filtered by survey_id
    """
    try:
        evaluator = ResponseEvaluator()
        evaluations = evaluator.list_evaluations(survey_id=survey_id)

        return {
            "evaluations": evaluations,
            "count": len(evaluations),
        }

    except Exception as e:
        logger.error(f"Error listing evaluations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/evaluations/{evaluation_id}")
async def get_evaluation(evaluation_id: str):
    """
    Get detailed evaluation results
    """
    try:
        evaluator = ResponseEvaluator()
        result = evaluator.load_evaluation(evaluation_id)

        if not result:
            raise HTTPException(status_code=404, detail=f"Evaluation {evaluation_id} not found")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading evaluation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/evaluations/{evaluation_id}")
async def delete_evaluation(evaluation_id: str):
    """
    Delete an evaluation
    """
    try:
        evaluator = ResponseEvaluator()
        filepath = evaluator.results_dir / f"{evaluation_id}.json"

        if not filepath.exists():
            raise HTTPException(status_code=404, detail=f"Evaluation {evaluation_id} not found")

        filepath.unlink()
        logger.info(f"Deleted evaluation {evaluation_id}")

        return {
            "evaluation_id": evaluation_id,
            "status": "deleted",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting evaluation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/evaluations/compare")
async def compare_evaluations(evaluation_ids: List[str]):
    """
    Compare multiple evaluations to see trends
    """
    try:
        evaluator = ResponseEvaluator()
        result = evaluator.compare_evaluations(evaluation_ids)

        return result

    except Exception as e:
        logger.error(f"Error comparing evaluations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# WebSocket endpoint for real-time progress (future enhancement)
@app.websocket("/ws/run-survey")
async def websocket_run_survey(websocket: WebSocket):
    """WebSocket endpoint for real-time survey execution progress"""
    await websocket.accept()
    try:
        # Receive request
        data = await websocket.receive_text()
        request_data = json.loads(data)

        # Send progress updates as survey runs
        await websocket.send_json({"status": "starting", "progress": 0})

        # TODO: Implement progress tracking
        # For now, just acknowledge
        await websocket.send_json({"status": "complete", "progress": 100})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"status": "error", "message": str(e)})

# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
