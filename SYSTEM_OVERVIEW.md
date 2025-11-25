# S.A.G.E System Overview

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Application Flow](#application-flow)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Analysis Pipeline](#analysis-pipeline)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Key Features Deep Dive](#key-features-deep-dive)
10. [Technology Stack](#technology-stack)

---

## Introduction

S.A.G.E (Synthetic Audience Generation Engine) is a full-stack application that leverages Large Language Models (LLMs) and Semantic Similarity Rating (SSR) to generate synthetic survey responses. The system enables researchers to conduct market research, test survey designs, and validate methodologies using AI-generated respondent profiles.

### Purpose

- Generate realistic synthetic survey responses using LLMs
- Convert qualitative text responses into quantitative probability distributions
- Provide comprehensive statistical analysis and insights
- Enable validation against ground truth data
- Support demographic segmentation and analysis

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│  ┌──────────┬──────────┬──────────┬──────────┬───────────┐ │
│  │   Home   │ Builder  │  Runner  │ History  │ Analysis  │ │
│  │   Page   │   Page   │   Page   │   Page   │ Dashboard │ │
│  └──────────┴──────────┴──────────┴──────────┴───────────┘ │
│           │              │             │            │        │
│           └──────────────┴─────────────┴────────────┘        │
│                          │                                   │
│                    React Query (State Management)            │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP/REST API
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │  Survey    │   Pipeline   │  Analysis   │  Ground Truth│ │
│  │ Management │   Execution  │   Engine    │  Validation  │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
│           │              │            │             │        │
│           └──────────────┴────────────┴─────────────┘        │
│                          │                                   │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │    LLM     │     SSR      │ Demographic │  Statistical │ │
│  │  Clients   │    Model     │  Analyzer   │   Analysis   │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
│           │              │                                   │
└───────────┼──────────────┼───────────────────────────────────┘
            │              │
    ┌───────┴────┐    ┌────┴─────┐
    │ OpenAI API │    │Anthropic │
    │ Claude API │    │  Ollama  │
    └────────────┘    └──────────┘
```

---

## Application Flow

### 1. Survey Creation Flow

```
User Input (Survey Builder)
    │
    ├─→ Survey Metadata (name, description, context)
    ├─→ Questions (text, type, scales, reference statements)
    ├─→ Persona Groups (demographics, descriptions, weights)
    ├─→ Categories (optional, for multi-product surveys)
    │
    ↓
YAML Generation
    │
    ↓
Save to config/ directory
    │
    ↓
Available in Survey Runner
```

### 2. Survey Execution Flow

```
Survey Selection
    │
    ↓
Configuration
    ├─→ Sample Size (10-500 profiles)
    ├─→ LLM Provider (OpenAI, Anthropic, Ollama)
    ├─→ LLM Model (GPT-4, Claude 3.5 Sonnet, etc.)
    ├─→ Temperatures (LLM: 0.0-2.0, SSR: 0.1-5.0)
    └─→ Random Seed (for reproducibility)
    │
    ↓
Pipeline Execution
    │
    ├─→ 1. Profile Generation
    │   └─→ Create demographic profiles from persona groups
    │
    ├─→ 2. LLM Response Generation
    │   └─→ Generate qualitative text responses
    │
    ├─→ 3. SSR Processing
    │   └─→ Convert text to probability distributions
    │
    ├─→ 4. Aggregation
    │   └─→ Compute statistics and distributions
    │
    └─→ 5. Analysis
        └─→ Generate insights and summaries
    │
    ↓
Results Saved to results/ directory
    │
    ↓
Automatic Analysis Generation
    │
    ↓
Results Display & Analysis Dashboard
```

### 3. Analysis Flow

```
Survey Run Completion
    │
    ↓
Analysis Pipeline Triggered
    │
    ├─→ Executive Summary Generation
    │   ├─→ Total respondents count
    │   ├─→ Demographic breakdown
    │   ├─→ Key insights extraction
    │   └─→ Category summaries
    │
    ├─→ Question-Level Analysis
    │   ├─→ Statistical metrics (mean, median, std dev)
    │   ├─→ Confidence intervals (95%)
    │   ├─→ Top-box percentage calculation
    │   ├─→ Net scores
    │   ├─→ Performance grading (A-D)
    │   └─→ Response distributions
    │
    ├─→ Demographic Analysis
    │   ├─→ Segment identification
    │   ├─→ Cross-tabulation
    │   ├─→ Comparative statistics
    │   └─→ Segment-specific findings
    │
    └─→ Category Comparisons (if applicable)
        ├─→ Category-level metrics
        └─→ Cross-category analysis
    │
    ↓
Analysis Results Available via API
    │
    ↓
Rendered in Analysis Dashboard
```

---

## Core Components

### Frontend Components

#### 1. Survey Builder (`SurveyBuilderPage.tsx`)
- Intuitive form-based interface for survey creation
- Real-time YAML preview
- Question type selection and configuration
- Persona group management
- Category support for multi-product surveys

#### 2. Survey Runner (`SurveyRunnerPage.tsx`)
- Survey selection dropdown
- Parameter configuration panel
- Real-time streaming progress display
- Error handling and status updates

#### 3. Survey History (`SurveyHistoryPage.tsx`)
- Paginated table of all survey runs
- Search and filter capabilities
- Quick actions (view, analyze, delete)
- Run metadata display

#### 4. Analysis Dashboard (`AnalysisDashboardPage.tsx`)
- Executive Summary Panel
- Question Analysis Table
- Demographic Overview
- Export functionality

#### 5. Analysis Components
- `ExecutiveSummaryPanel.tsx`: Overview metrics and key findings
- `QuestionAnalysisPanel.tsx`: Sortable question-level metrics table
- `DemographicOverview.tsx`: Demographic segmentation display
- `QuestionDemographicChart.tsx`: Per-question demographic comparisons

### Backend Modules

#### 1. Survey Management
- YAML parsing and validation
- Survey CRUD operations
- Configuration persistence

#### 2. Pipeline Execution (`services/survey_pipeline.py`)
- Profile generation from persona groups
- LLM client orchestration
- SSR processing
- Progress tracking and streaming

#### 3. Analysis Engine (`analysis/`)
- `MetricsCalculator`: Statistical computations
- `DemographicAnalyzer`: Segmentation analysis
- `CategoryComparator`: Cross-category analysis
- `InsightGenerator`: AI-powered insight generation
- `ExportFormatter`: Multi-format data export

#### 4. LLM Clients (`ssr_core/llm_client.py`)
- OpenAI integration (GPT models)
- Anthropic integration (Claude models)
- Ollama support (local models)
- Streaming response handling

#### 5. SSR Model (`ssr_core/ssr_model.py`)
- Semantic embedding generation
- Similarity calculation
- Probability distribution generation
- Temperature-based sharpening

---

## Data Flow

### Survey Run Data Structure

```json
{
  "run_id": "uuid",
  "survey_id": "lottery_general_survey",
  "timestamp": "2025-01-15T10:30:00Z",
  "config": {
    "llm_provider": "anthropic",
    "llm_model": "claude-3-5-sonnet-20250219",
    "llm_temperature": 0.7,
    "ssr_temperature": 1.0,
    "sample_size": 200,
    "seed": 42
  },
  "results": {
    "responses": [
      {
        "profile_id": "p001",
        "demographics": {
          "age_group": "35-44",
          "gender": "Female",
          "occupation": "Professional"
        },
        "persona_group": "Regular Players",
        "question_responses": {
          "play_frequency": {
            "llm_response": "text...",
            "distribution": {
              "Never": 0.05,
              "Rarely (few times a year)": 0.10,
              "Occasionally (monthly)": 0.25,
              "Regularly (weekly)": 0.45,
              "Very frequently (multiple times per week)": 0.15
            }
          }
        }
      }
    ],
    "aggregated_distributions": {...},
    "statistics": {...}
  }
}
```

### Analysis Data Structure

```json
{
  "executive_summary": {
    "total_respondents": 200,
    "total_questions": 8,
    "demographic_fields": ["age_group", "gender", "occupation"],
    "has_demographics": true,
    "key_insights": [
      "Insight 1...",
      "Insight 2..."
    ],
    "question_findings": [
      {
        "question_id": "play_frequency",
        "question": "How often do you purchase lottery tickets?",
        "type": "likert_5",
        "category": null,
        "n": 200,
        "mean": 3.4,
        "median": 3.0,
        "std": 1.2,
        "finding": "Most respondents play regularly...",
        "distribution": {...}
      }
    ]
  },
  "question_analysis": [
    {
      "question_id": "play_frequency",
      "question_text": "How often do you purchase lottery tickets?",
      "mean": 3.4,
      "median": 3.0,
      "std": 1.2,
      "ci_95_lower": 3.2,
      "ci_95_upper": 3.6,
      "top_box_pct": 35.5,
      "net_score": 25.0,
      "grade": "B",
      "sample_size": 200,
      "category": null
    }
  ],
  "context": {
    "survey_name": "General Lottery Player Survey",
    "demographic_fields": ["age_group", "gender", "occupation"],
    "has_demographics": true,
    "has_categories": false
  }
}
```

---

## Analysis Pipeline

### Statistical Metrics

#### 1. Basic Statistics
- **Mean**: Average response value across all respondents
- **Median**: Middle value when responses are ordered
- **Standard Deviation**: Measure of response variability
- **Confidence Intervals (95%)**: Range where true mean likely falls

#### 2. Performance Metrics
- **Top-Box %**: Percentage of responses in top response category
- **Net Score**: Top-box % minus bottom-box %
- **Grade**: A (4.0+), B (3.0-3.99), C (2.0-2.99), D (<2.0)

#### 3. Demographic Analysis
- **Segment Breakdown**: Response patterns by demographic group
- **Cross-Tabulation**: Multi-dimensional demographic analysis
- **Comparative Statistics**: Mean differences across segments

#### 4. Category Analysis (Multi-Product Surveys)
- **Category Means**: Average scores per product/category
- **Relative Performance**: Rankings and comparisons
- **Category-specific Insights**: Product positioning analysis

### Insight Generation

The system automatically generates insights by:
1. Identifying statistical patterns in responses
2. Comparing demographic segments
3. Highlighting significant findings
4. Detecting outliers and anomalies
5. Summarizing key trends

---

## Frontend Architecture

### State Management

Uses **React Query** for server state:
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Request deduplication

### Routing

**React Router v6** for navigation:
- `/` - Home Page
- `/builder` - Survey Builder
- `/run` - Survey Runner
- `/history` - Survey History
- `/runs/:runId` - Run Details
- `/analysis/:runId` - Analysis Dashboard
- `/experiments` - Ground Truth Testing

### Component Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── Analysis/
│   │   ├── ExecutiveSummaryPanel.tsx
│   │   ├── QuestionAnalysisPanel.tsx
│   │   ├── DemographicOverview.tsx
│   │   └── QuestionDemographicChart.tsx
│   ├── SurveyBuilder/
│   ├── SurveyRunner/
│   └── Common/
├── pages/
│   ├── HomePage.tsx
│   ├── SurveyBuilderPage.tsx
│   ├── SurveyRunnerPage.tsx
│   ├── SurveyHistoryPage.tsx
│   ├── SurveyRunDetailPage.tsx
│   └── AnalysisDashboardPage.tsx
├── services/
│   ├── api.ts
│   ├── hooks.ts
│   └── types.ts
└── theme/
    ├── colors.ts
    └── components.ts
```

---

## Backend Architecture

### Module Organization

```
backend/
├── main.py                    # FastAPI application
├── analysis/                  # Analysis engine
│   ├── metrics_calculator.py
│   ├── demographic_analyzer.py
│   ├── category_comparator.py
│   ├── insight_generator.py
│   └── export_formatter.py
├── services/
│   ├── survey_pipeline.py    # Pipeline orchestration
│   └── ground_truth_parser.py
├── ssr_core/                  # Core SSR modules
│   ├── survey.py
│   ├── llm_client.py
│   ├── ssr_model.py
│   └── demographics.py
├── ground_truth_metrics.py    # Validation metrics
└── constants.py               # Configuration constants
```

### API Design

RESTful API with the following patterns:
- Resource-based URLs
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Error handling with appropriate status codes
- Streaming support for long-running operations

### Data Persistence

- **Surveys**: Stored as YAML files in `config/`
- **Survey Runs**: JSON files in `results/`
- **Ground Truth**: JSON files in `ground_truths/`
- **Experiments**: JSON files in `experiments/`

---

## Key Features Deep Dive

### 1. Semantic Similarity Rating (SSR)

SSR converts qualitative LLM text responses into quantitative probability distributions:

1. **LLM generates text response** based on persona and question
2. **Embedding generation** for both response and reference statements
3. **Similarity calculation** using cosine similarity
4. **Softmax normalization** with temperature parameter
5. **Probability distribution** over response options

Benefits:
- Preserves LLM's qualitative reasoning
- Produces quantitative data for statistical analysis
- Adjustable temperature for distribution sharpness
- Reproducible with random seeds

### 2. Demographic Segmentation

Automatic demographic analysis:
- **Profile Generation**: Creates diverse respondent profiles based on persona groups
- **Segment Analysis**: Breaks down responses by demographic fields
- **Cross-Tabulation**: Multi-dimensional demographic analysis
- **Comparative Statistics**: Mean differences and statistical significance

### 3. Performance Grading

Questions receive grades based on statistical thresholds:
- **A Grade**: Mean ≥ 4.0 (Excellent performance)
- **B Grade**: Mean ≥ 3.0 (Good performance)
- **C Grade**: Mean ≥ 2.0 (Fair performance)
- **D Grade**: Mean < 2.0 (Needs improvement)

### 4. Ground Truth Validation

Compare synthetic responses against real survey data:
- **Multiple Metrics**: Pearson/Spearman correlation, MAE, RMSE, KL divergence
- **Distribution Comparison**: Jensen-Shannon divergence
- **Confusion Matrices**: Visual comparison of distributions
- **Accuracy Scoring**: Overall fidelity assessment

---

## Technology Stack

### Frontend
- **React 18**: UI library with concurrent features
- **TypeScript 4.9**: Type safety and developer experience
- **Material-UI v5**: Component library with custom theme
- **React Query v4**: Server state management
- **React Router v6**: Client-side routing
- **Recharts**: Data visualization
- **Axios**: HTTP client

### Backend
- **FastAPI**: Modern async web framework
- **Python 3.12**: Core language
- **Pydantic v2**: Data validation
- **Uvicorn**: ASGI server
- **OpenAI SDK**: GPT integration
- **Anthropic SDK**: Claude integration
- **Sentence Transformers**: Semantic embeddings
- **NumPy/Pandas**: Statistical computation
- **SciPy**: Advanced statistics

### Data Formats
- **YAML**: Survey configuration
- **JSON**: Runtime data and results
- **CSV**: Data export

---

## Conclusion

S.A.G.E provides a comprehensive platform for synthetic survey research, combining the power of LLMs with rigorous statistical analysis. The modular architecture supports extensibility, while the intuitive interface makes it accessible to researchers and practitioners.

For more information, refer to:
- Main README for setup instructions
- Backend README for API details
- Research paper: [ArXiv 2510.08338](https://arxiv.org/abs/2510.08338)
