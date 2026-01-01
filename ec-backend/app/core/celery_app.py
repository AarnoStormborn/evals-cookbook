"""Celery application configuration."""

from celery import Celery
from .config import settings

# Create Celery app
celery_app = Celery(
    "ec_backend",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.modules.evals.tasks"],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Rate limiting to avoid flooding upstream APIs
    task_default_rate_limit="10/m",
    # Concurrency limit
    worker_concurrency=4,
)
