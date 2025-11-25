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

Stored in `/results/run_YYYYMMDD_HHMMSS.json`

```json
{
  "run_id": "run_20251125_162002",
  "survey_id": "lottery_general_survey",
  "survey_name": "General Lottery Player Survey",
  "timestamp": "2025-11-25T16:20:02.441158",
  "num_profiles": 200,
  "num_responses": 1600,
  "num_distributions": 1600,
  "config": {
    "llm_provider": "openai",
    "model": "gpt-3.5-turbo",
    "llm_temperature": 0.7,
    "ssr_temperature": 1.0,
    "normalize_method": "paper",
    "num_profiles": 200,
    "seed": 100
  },
  "distributions": {
    "general": {  // Category level (could be "Category A", "Category B", etc.)
      "play_frequency": {  // Question ID
        "R001": {  // Respondent ID
          "probabilities": [0.05, 0.10, 0.25, 0.45, 0.15],
          "mode": 4,
          "expected_value": 3.55,
          "entropy": 1.32,
          "text_response": "I typically buy lottery tickets once or twice a week...",

          // Demographics embedded at individual response level
          "gender": "Female",
          "age_group": "35-44",
          "occupation": "Professional",
          "persona_group": "Regular Players",
          "persona_description": "Sarah, 38, never misses her weekly lottery routine"
        },
        "R002": {
          // Similar structure for next respondent
        }
      },
      "trust_fairness": {
        // Similar nested structure for other questions
      }
    },
    "Category A": {
      // If multi-category survey, repeat structure for other categories
    }
  }
}
```

**Key Structure Notes:**
- **Three-level nesting**: Category → Question ID → Respondent ID
- **Demographics at response level**: Each individual distribution includes all demographic fields
- **SSR outputs**: `probabilities`, `mode`, `expected_value`, `entropy` from SSR model
- **Original text**: `text_response` contains the LLM's original qualitative answer
- **Flexible categories**: Can be "general" for single-category surveys or named categories for multi-product surveys

### Analysis Data Structure

Analysis is computed on-demand from survey run data. The system provides multiple analysis views optimized for different use cases.

#### Executive Summary Endpoint: `/api/analysis/{run_id}/summary`

```json
{
  "context": {
    "survey_type": "MULTI_CATEGORY",  // or "GENERAL"
    "has_categories": true,
    "has_demographics": true,
    "demographic_fields": ["age_group", "gender", "occupation"],
    "num_questions": 8,
    "sample_size": 200
  },
  "executive_summary": {
    "total_respondents": 200,
    "total_questions": 8,
    "key_insights": [
      "Category A outperformed Category B by 15%",
      "Highest scoring question: trust_reliability (mean: 4.2)"
    ],
    "question_findings": [
      {
        "question_id": "play_frequency",
        "question": "How often do you purchase lottery tickets?",
        "type": "likert_7",
        "category": "general",
        "n": 200,
        "mean": 4.5,
        "median": 5.0,
        "finding": "67% found it appealing (ratings 6-7), 15% were neutral",
        "distribution": {
          "Not at all": 10,
          "Slightly": 15,
          "Moderately": 20,
          "Somewhat": 30,
          "Quite": 45,
          "Very": 50,
          "Extremely": 30
        }
      }
    ]
  }
}
```

**Key Fields:**
- **finding**: Natural language interpretation using actual scale labels and percentages (e.g., "67% found it appealing" instead of "mean: 4.5")
- **distribution**: Uses actual scale labels (e.g., "Strongly Agree") instead of numeric values
- **context**: Provides metadata about survey structure for proper interpretation

#### Question Analysis Endpoint: `/api/analysis/{run_id}/questions`

```json
[
  {
    "question_id": "play_frequency",
    "question_text": "How often do you purchase lottery tickets?",
    "category": "general",
    "mean": 4.5,
    "median": 5.0,
    "std": 1.2,
    "ci_95_lower": 4.3,
    "ci_95_upper": 4.7,
    "top_box_pct": 45.5,
    "bottom_box_pct": 12.5,
    "net_score": 33.0,
    "grade": "A",
    "sample_size": 200,
    "mean_distribution": [0.05, 0.08, 0.10, 0.15, 0.22, 0.25, 0.15]
  }
]
```

**Statistical Metrics:**
- **mean/median/std**: Basic statistics on response values
- **ci_95_lower/upper**: 95% confidence intervals
- **top_box_pct**: Percentage of responses in top categories (≥6 for 7-point scales)
- **bottom_box_pct**: Percentage in bottom categories (≤2)
- **net_score**: top_box_pct - bottom_box_pct
- **grade**: Performance grade (A/B+/B/C+/C/D) based on mean thresholds
- **mean_distribution**: Averaged probability distribution across all respondents

#### Category Comparison Endpoint: `/api/analysis/{run_id}/categories`

```json
{
  "winner": {
    "name": "Category A",
    "mean": 4.8,
    "sample_size": 400
  },
  "ranked_categories": [
    {
      "name": "Category A",
      "mean": 4.8,
      "std": 0.9,
      "sample_size": 400,
      "num_questions": 5,
      "rank": 1,
      "top_questions": [
        {"question_id": "Q001", "mean": 5.2},
        {"question_id": "Q002", "mean": 5.0}
      ],
      "bottom_questions": [
        {"question_id": "Q005", "mean": 4.1}
      ]
    }
  ],
  "category_performance": {
    "Category A": {
      /* same structure as ranked_categories items */
    }
  }
}
```

#### Demographic Analysis Endpoint: `/api/analysis/{run_id}/demographics/{field}`

```json
{
  "demographic_field": "age_group",
  "segments": {
    "18-24": {
      "sample_size": 40,
      "questions": [
        {
          "question_id": "play_frequency",
          "question_text": "How often do you purchase lottery tickets?",
          "question_type": "likert_7",
          "scale_labels": {
            "1": "Not at all",
            "7": "Extremely"
          },
          "probabilities": [0.05, 0.08, 0.10, 0.15, 0.22, 0.25, 0.15],
          "sample_size": 40
        }
      ]
    },
    "25-34": {
      /* similar structure */
    }
  },
  "statistical_tests": {
    "play_frequency": {
      "chi2": 15.3,
      "p_value": 0.018,
      "significant": true
    }
  }
}
```

**Features:**
- Returns full probability distributions for each demographic segment
- Includes chi-squared tests to identify statistically significant differences
- Provides scale labels for proper visualization

### Ground Truth Data Structure

Ground truth data is used to validate synthetic survey runs against real survey responses. Stored in `/ground_truths/gt_*.json`

```json
{
  "id": "gt_lottery_20251125",
  "name": "Lottery Study - Real Responses",
  "survey_id": "lottery_general_survey",
  "survey_name": "General Lottery Player Survey",
  "source": "ssr_generated",  // or "uploaded"
  "created_at": "2025-11-25T15:57:35.123456",
  "num_profiles": 200,
  "num_responses": 1600,
  "description": "Ground truth baseline for lottery study",

  // If SSR-generated, includes generation config
  "generation_config": {
    "num_profiles": 200,
    "llm_provider": "anthropic",
    "model": "claude-3-5-sonnet-20250219",
    "llm_temperature": 0.7,
    "ssr_temperature": 1.0,
    "normalize_method": "paper",
    "seed": 42,
    "persona_groups": ["Heavy Players", "Casual Players", "Non-Players"],
    "persona_distribution": {
      "Heavy Players": 0.3,
      "Casual Players": 0.5,
      "Non-Players": 0.2
    }
  },

  // Aggregated distributions (averaged across all respondents)
  "aggregated_distributions": {
    "general": {
      "play_frequency": {
        "mean_probabilities": [0.05, 0.10, 0.25, 0.40, 0.20],
        "std_probabilities": [0.02, 0.03, 0.05, 0.06, 0.04],
        "sample_size": 200,
        "mean_mode": 3.8,
        "mean_expected_value": 3.6,
        "mean_entropy": 1.42
      }
    }
  },

  // Optional: raw distributions (same structure as survey run)
  "raw_distributions": {
    /* Same structure as survey run distributions */
  }
}
```

**Key Features:**
- **source**: Either "ssr_generated" (from a survey run) or "uploaded" (from real survey data)
- **aggregated_distributions**: Population-level averaged distributions for comparison
- **generation_config**: Tracks SSR parameters if generated synthetically
- **raw_distributions**: Optional individual-level data for detailed analysis

### Ground Truth Comparison Structure

Comparison results measure how well a test run matches ground truth. Stored in `/comparisons/comp_*.json`

```json
{
  "id": "comp_20251125_162113",
  "run_id": "run_20251125_162002",
  "ground_truth_id": "gt_lottery_20251125",
  "survey_id": "lottery_general_survey",
  "created_at": "2025-11-25T16:21:13.456789",

  "comparison": {
    "overall_metrics": {
      "mean_kl_divergence": 0.0245,
      "std_kl_divergence": 0.0132,
      "mean_js_divergence": 0.0812,
      "std_js_divergence": 0.0421,
      "mean_wasserstein": 0.1234,
      "std_wasserstein": 0.0567,
      "mean_mae": 0.0345,
      "std_mae": 0.0189,
      "num_questions_compared": 8
    },

    "by_category": {
      "general": {
        "mean_kl_divergence": 0.0245,
        "mean_js_divergence": 0.0812,
        "mean_wasserstein": 0.1234,
        "mean_mae": 0.0345,
        "num_questions": 8
      }
    },

    "by_question": {
      "general_play_frequency": {
        "kl_divergence": 0.0187,
        "js_divergence": 0.0654,
        "wasserstein_distance": 0.0987,
        "chi_squared": 3.42,
        "chi_squared_p_value": 0.489,
        "significant_difference": false,
        "mean_absolute_error": 0.0276
      },
      "general_trust_fairness": {
        "kl_divergence": 0.0312,
        "js_divergence": 0.0921,
        "wasserstein_distance": 0.1456,
        "chi_squared": null,
        "chi_squared_p_value": null,
        "significant_difference": false,
        "mean_absolute_error": 0.0412
      }
    }
  },

  // Optional: distribution data for visualization
  "test_run_distributions": {
    /* Distributions from test run */
  },
  "ground_truth_distributions": {
    /* Aggregated distributions from ground truth */
  }
}
```

**Comparison Metrics:**
- **KL Divergence**: Measures information loss; Range: [0, ∞), lower is better, 0 = identical
- **JS Divergence**: Symmetric version of KL; Range: [0, 1], 0 = identical, 1 = completely different
- **Wasserstein Distance**: "Earth Mover's Distance"; accounts for scale ordering
- **Chi-Squared Test**: Statistical significance test; p < 0.05 means significantly different
  - **Note**: Returns null when expected frequencies < 1.0 (chi-squared test invalid)
- **MAE**: Simple average absolute difference between probability values

**Important Notes:**
- Chi-squared test requires minimum expected frequency ≥ 1.0 for validity
- Expected frequency = probability × sample_size
- Ground truth with zero/near-zero probabilities will result in null chi-squared values
- Lower divergence values indicate better match to ground truth population distribution

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
