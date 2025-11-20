# S.A.G.E - Synthetic Audience Generation Engine

A full-stack professional application for creating and running synthetic audience surveys using Large Language Models (LLMs) and Semantic Similarity Rating (SSR). This enterprise-grade application provides a modern, intuitive interface to design surveys, generate LLM responses, apply SSR to convert qualitative text into quantitative probability distributions, and validate results against ground truth data.

**Note:** This is a standalone version with all dependencies self-contained within this directory.

## Quick Start

1. **Backend**: Navigate to `backend/`, install dependencies, set API keys, run `python main.py`
2. **Frontend**: Navigate to `frontend/`, run `npm install` and `npm start`
3. Open your browser to `http://localhost:3000`

See detailed installation instructions below.

## Features

### Core Application Features

- **🏠 Modern Home Page**: Beautiful landing page with statistics, features showcase, and workflow visualization
- **🔧 Survey Builder**: Intuitive interface to create and configure surveys with:
  - Questions with multiple types (Yes/No, Likert scales, multiple choice, preference scales)
  - Persona groups with demographic targeting and weights
  - Optional categories for multi-product comparisons
  - Real-time YAML preview
  - Survey editing and management
  - Image and link support in questions
- **▶️ Survey Runner**: Execute the complete SSR pipeline with:
  - Configurable LLM providers (OpenAI, Anthropic, Ollama)
  - Adjustable parameters (temperature, sample size, seed)
  - Real-time streaming progress updates
  - Automatic navigation to results
- **📊 Survey History**: Browse and manage all survey runs with:
  - Searchable table with filters
  - Run metadata and configuration details
  - Direct access to detailed results
- **🔬 Ground Truth Experiments**: Advanced validation system with:
  - Ground truth creation from high-quality runs
  - Experiment tracking and comparison
  - Comprehensive metrics (accuracy, correlation, Jensen-Shannon divergence)
  - Confusion matrices and distribution visualizations
- **📈 System Overview**: Interactive documentation with:
  - Workflow diagrams
  - Technical architecture visualization
  - Data dictionary
  - Best practices guide

### User Experience Features

- **🎨 Modern Design System**:
  - Professional color palette (Indigo, Cyan, Purple gradients)
  - Consistent typography and spacing
  - Apple/Stripe-inspired aesthetic
  - Responsive layout for all screen sizes
- **🔄 Real-time Updates**: Streaming progress for long-running operations
- **📱 Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **♿ Accessibility**: WCAG-compliant with proper ARIA labels and keyboard navigation
- **💫 Smooth Animations**: Polished interactions with cubic-bezier transitions
- **📋 Empty States**: Helpful guidance when no data is available
- **🎯 Interactive Breadcrumbs**: Clear navigation context

### LLM Integration Features

- **Multiple Providers**: OpenAI, Anthropic Claude, Ollama (local models)
- **Model Selection**: Choose from latest models (GPT-4, Claude 3.5 Sonnet, etc.)
- **Streaming Support**: Real-time response streaming from LLMs
- **Error Handling**: Robust retry logic and error messages

### Data & Analytics Features

- **📊 Distribution Visualizations**: Bar charts, heatmaps, confusion matrices
- **📄 CSV Export**: Download results for external analysis
- **💾 Automatic Persistence**: All surveys and runs saved automatically
- **🔍 Search & Filter**: Find surveys and runs quickly
- **📝 Detailed Metadata**: Track all configuration parameters

## Architecture

### Backend (FastAPI)
- **REST API** for survey management and pipeline execution
- **Bundled SSR core modules** (survey, llm_client, ssr_model, demographics)
- **Ground truth testing** with comprehensive comparison metrics
- **Streaming endpoints** for real-time progress updates
- **CORS-enabled** for local development
- **Located** in `backend/`

### Frontend (React + TypeScript)
- **React 18** with modern hooks and concurrent features
- **TypeScript** for type safety and developer experience
- **Material-UI (MUI v5)** with custom theme system
- **React Query** for efficient server state management
- **React Router v6** for navigation
- **Recharts** for data visualization
- **Custom Design System** with:
  - PageHeader component for consistency
  - LoadingSkeleton components
  - EmptyState components
  - Reusable UI patterns
- **Located** in `frontend/`

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **API Keys**: OpenAI and/or Anthropic API key (Ollama requires local installation)

## Installation

### Backend Setup

#### Using uv (Recommended - Fast!)

1. Install uv if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# or on macOS: brew install uv
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Create virtual environment and install dependencies:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

Or use uv sync:
```bash
uv sync
source .venv/bin/activate
```

4. Set environment variables:
```bash
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"
# Optional for Ollama:
# Ollama runs locally, no API key needed
```

5. Start the backend server:
```bash
python main.py
```

#### Using pip (Traditional)

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables:
```bash
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"
```

5. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional - defaults work for local development):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Usage Guide

### 1. Creating a Survey

1. Click **"Create Survey"** from the home page or navigate to **Survey Builder**
2. **Choose mode**: Create new or edit existing
3. **Fill in basic information**:
   - Name (required)
   - Description
   - Context for LLM (important for better responses)
4. **Add categories** (optional, for multi-product comparisons):
   - Category name
   - Description
   - Image URL and link (optional)
5. **Add questions**:
   - Question text (supports markdown)
   - Question type (Yes/No, Likert 5/7, Multiple choice, Preference)
   - Reference statements for SSR
   - Optional: Category, image, and link
6. **Create persona groups**:
   - Persona description (who they are)
   - Demographics (gender, age, occupation)
   - Sampling weight (auto-normalized)
7. **Preview YAML** to verify configuration
8. **Enter filename** and click **"Save Survey"**

### 2. Running a Survey

1. Navigate to **"Run Survey"** page
2. **Select a survey** from the dropdown
3. **Configure run parameters**:
   - **Number of profiles**: 10-500 (more = higher quality, slower)
   - **LLM provider**: OpenAI, Anthropic, or Ollama
   - **Model**: Latest models available per provider
   - **LLM temperature**: 0.0-2.0 (higher = more creative)
   - **SSR temperature**: 0.1-5.0 (higher = sharper distributions)
   - **Normalization**: Use "paper" method
   - **Random seed**: For reproducibility
4. **Click "Run Survey"**
5. **Watch real-time progress** as the system:
   - Generates demographic profiles
   - Creates LLM prompts
   - Streams LLM responses
   - Applies SSR to convert text to distributions
6. **Review results** automatically opened after completion

### 3. Viewing Results

1. Navigate to **"Results"** (Survey History)
2. **Search or filter** runs by survey, model, or run ID
3. **Click "View"** to see detailed results:
   - Response dataset table
   - Probability distributions for each question
   - Demographic breakdowns
   - Confusion matrices (if ground truth available)
4. **Export to CSV** for further analysis

### 4. Ground Truth Testing

1. Navigate to **"Experiments"** (Ground Truth Testing)
2. **Follow the stepper workflow**:

   **Step 1: Create Ground Truth**
   - Select a survey
   - Configure high-quality run parameters
   - Run and save as ground truth baseline

   **Step 2: Run Experiment**
   - Select ground truth
   - Configure experimental parameters
   - Run test survey

   **Step 3: Compare Results**
   - View comprehensive metrics
   - Analyze confusion matrices
   - Check distribution correlations
   - Assess Jensen-Shannon divergence

3. **Export comparisons** for documentation

## Project Structure

```
sage/
├── backend/
│   ├── ssr_core/            # Bundled SSR modules
│   │   ├── survey.py        # Survey data models
│   │   ├── llm_client.py    # LLM integrations (OpenAI, Anthropic, Ollama)
│   │   ├── ssr_model.py     # SSR algorithm implementation
│   │   └── demographics.py  # Demographic definitions
│   ├── main.py              # FastAPI application with streaming
│   ├── ground_truth_metrics.py  # Comparison metrics
│   ├── requirements.txt     # Python dependencies
│   └── pyproject.toml       # Project configuration
├── config/                  # Survey YAML configurations
├── results/                 # Survey run results (JSON)
├── ground_truths/           # Ground truth baseline data
├── experiments/             # Experiment comparison tracking
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Layout/      # Navigation and footer
│   │   │   ├── SurveyBuilder/  # Survey creation UI
│   │   │   ├── SurveyPreview/  # Survey viewing components
│   │   │   ├── SurveyRunner/   # Run execution components
│   │   │   ├── PageHeader.tsx  # Consistent page headers
│   │   │   ├── LoadingSkeleton.tsx  # Loading states
│   │   │   └── EmptyState.tsx      # Empty state guidance
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx             # Landing page
│   │   │   ├── SurveyBuilderPage.tsx   # Survey creation
│   │   │   ├── SurveyRunnerPage.tsx    # Survey execution
│   │   │   ├── SurveyHistoryPage.tsx   # Results browser
│   │   │   ├── GroundTruthTestingPage.tsx  # Experiments
│   │   │   └── SystemOverviewPage.tsx      # Documentation
│   │   ├── services/        # API and data management
│   │   │   ├── api.ts       # Axios API client
│   │   │   ├── hooks.ts     # React Query hooks
│   │   │   └── types.ts     # TypeScript type definitions
│   │   ├── theme/           # MUI custom theme
│   │   │   ├── colors.ts    # Color palette
│   │   │   ├── spacing.ts   # Spacing system
│   │   │   └── components.ts # Component overrides
│   │   ├── App.tsx          # Main app component with routing
│   │   ├── index.tsx        # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

### Surveys
- `GET /api/surveys` - List all surveys
- `GET /api/surveys/{survey_id}` - Get survey details
- `POST /api/surveys` - Create new survey from YAML
- `PUT /api/surveys/{survey_id}` - Update existing survey
- `DELETE /api/surveys/{survey_id}` - Delete survey

### Survey Runs
- `GET /api/runs` - List all survey runs
- `GET /api/runs/{run_id}` - Get run details
- `POST /api/run-survey` - Execute complete pipeline
- `POST /api/run-survey-stream` - Execute with streaming progress
- `DELETE /api/runs/{run_id}` - Delete survey run

### Ground Truth
- `GET /api/ground-truths` - List ground truth datasets
- `GET /api/ground-truths/{gt_id}` - Get ground truth details
- `POST /api/ground-truths/from-ssr` - Create from SSR run
- `DELETE /api/ground-truths/{gt_id}` - Delete ground truth
- `POST /api/ground-truths/compare` - Compare run to ground truth

### System
- `GET /api/health` - Health check and version info

## Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Serve static build
npx serve -s build
```

### Code Quality
```bash
# Backend linting
cd backend
flake8

# Frontend linting
cd frontend
npm run lint
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic v2** - Data validation
- **Uvicorn** - High-performance ASGI server
- **SSR Pipeline** - Custom semantic similarity rating
- **OpenAI SDK** - GPT model integration
- **Anthropic SDK** - Claude model integration
- **Ollama** - Local LLM support

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript 4.9** - Type safety
- **Material-UI v5** - Component library with custom theme
- **React Query v4** - Server state management
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client with interceptors

### Design System
- **Color Palette**: Indigo (primary), Cyan (secondary), Purple (accent)
- **Typography**: SF Pro-inspired font system
- **Spacing**: 8px base unit system
- **Animations**: Cubic-bezier easing
- **Accessibility**: WCAG AA compliant

## Configuration

### Environment Variables

**Backend** (`.env` or environment):
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=8000  # Optional, defaults to 8000
```

**Frontend** (`.env`):
```bash
REACT_APP_API_URL=http://localhost:8000  # Optional, defaults to this
```

### Survey Configuration

Surveys are configured in YAML format:
```yaml
name: "My Survey"
description: "Survey description"
context: "Important context for LLM"
categories:  # Optional
  - name: "Product A"
    description: "Description"
questions:
  - text: "Question text?"
    type: "likert_7"
    reference_statements:
      - "Strongly disagree"
      - "Disagree"
      # ... etc
persona_groups:
  - name: "Group 1"
    persona: "Description of persona"
    demographics:
      gender: ["Male", "Female"]
      age_group: ["25-34", "35-44"]
    weight: 0.5
sample_size: 100
```

## Best Practices

### Survey Design
1. **Write clear questions**: Avoid ambiguity
2. **Provide good context**: Helps LLM understand survey purpose
3. **Use appropriate question types**: Match to response format
4. **Write precise reference statements**: Critical for SSR accuracy
5. **Define realistic personas**: Based on real target audiences
6. **Balance sample sizes**: 100-200 profiles for most surveys

### Running Surveys
1. **Start with smaller samples**: Test with 50 profiles first
2. **Use appropriate temperatures**: 0.7 for LLM, 1.0 for SSR
3. **Set reproducible seeds**: For consistent results
4. **Monitor progress**: Watch streaming updates
5. **Export results**: Save CSV for further analysis

### Ground Truth Testing
1. **Use high-quality baselines**: Run with 200+ profiles
2. **Keep parameters consistent**: Only vary what you're testing
3. **Document experiments**: Track what you learn
4. **Compare multiple runs**: Build confidence in results

## Troubleshooting

### Backend Issues
- **API key errors**: Verify environment variables are set
- **Port conflicts**: Change PORT in environment
- **Import errors**: Reinstall dependencies with pip/uv

### Frontend Issues
- **Build errors**: Clear node_modules and reinstall
- **API connection failed**: Ensure backend is running on port 8000
- **Styling issues**: Clear browser cache

### Common Problems
- **Slow survey runs**: Reduce number of profiles or use faster model
- **Out of memory**: Reduce batch size in backend configuration
- **CORS errors**: Backend CORS is configured, check browser console

## Notes

- The backend must be running for the frontend to work
- Survey configurations are saved to the `config/` directory
- LLM API keys must be set as environment variables
- Ollama requires local installation and running daemon
- The application is designed for local development and demonstration
- For production deployment, additional security measures are recommended

## Research & Documentation

This application implements the Semantic Similarity Rating (SSR) methodology for converting qualitative LLM responses into quantitative probability distributions.

**Research Paper**: [ArXiv 2510.08338](https://arxiv.org/abs/2510.08338)

**Key Innovation**: SSR enables researchers to leverage the qualitative reasoning capabilities of LLMs while producing statistically rigorous quantitative data suitable for traditional market research analysis.

## Contributing

While this is a demonstration application, contributions are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

This project is provided for research and demonstration purposes.

## Support

For questions or issues:
- Check the **System Overview** page in the application
- Review API documentation at `/docs`
- Refer to the research paper for methodology details

---

**Built with ❤️ using React, TypeScript, FastAPI, and Large Language Models**
