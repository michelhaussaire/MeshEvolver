"""
Configuration module.
Contains environment variables and settings for the backend.
"""

import os

# Admin token for cache management endpoints
# In production, this should be set via environment variable
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "dev-token-change-in-production")
