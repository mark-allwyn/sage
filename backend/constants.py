"""
Application Constants

Centralized configuration values for the SSR Pipeline backend.
Extracted from main.py to improve maintainability and testability.
"""

# Default values for survey processing
DEFAULT_CATEGORY = "general"
DEFAULT_SEED = 100
DEFAULT_MAX_CONCURRENT = 20

# SSR Configuration defaults
DEFAULT_SSR_TEMPERATURE = 1.0
DEFAULT_NORMALIZE_METHOD = "paper"

# LLM Configuration defaults
DEFAULT_LLM_TEMPERATURE = 0.7

# File upload limits
MAX_UPLOAD_SIZE_MB = 10
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

# Allowed media types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/webm"}

# Processing limits
MIN_NUM_PROFILES = 10
MAX_NUM_PROFILES = 500
DEFAULT_NUM_PROFILES = 50
