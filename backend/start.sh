#!/bin/bash

# Backend start script for SAGE application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting SAGE Backend...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Creating .env file from example..."
    
    # Create a basic .env file
    cat > .env << EOF
# API Keys - Add your keys here
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Optional: Port configuration
# PORT=8000
EOF
    
    echo -e "${YELLOW}Please edit .env file with your API keys before running surveys${NC}"
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    
    # Check if uv is installed
    if command -v uv &> /dev/null; then
        echo "Using uv to create virtual environment..."
        uv venv
        source .venv/bin/activate
        echo "Installing dependencies with uv..."
        uv pip install -e .
    else
        echo "Using standard Python venv..."
        python -m venv .venv
        source .venv/bin/activate
        echo "Installing dependencies with pip..."
        pip install -r requirements.txt
    fi
else
    echo "Activating existing virtual environment..."
    source .venv/bin/activate
fi

# Check if dependencies are installed
if ! python -c "import fastapi" &> /dev/null; then
    echo "Dependencies not found, installing..."
    if command -v uv &> /dev/null; then
        uv pip install -e .
    else
        pip install -r requirements.txt
    fi
fi

# Start the server
echo -e "${GREEN}Starting FastAPI server on http://localhost:8000${NC}"
echo "API documentation available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py