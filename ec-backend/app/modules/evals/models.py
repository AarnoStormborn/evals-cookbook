"""SQLAlchemy models for Evals module."""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, JSON, DateTime, Enum as SQLEnum, Integer, Float
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
import enum

from app.core.database import Base


class EvalStatus(str, enum.Enum):
    """Status of an evaluation run."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EvalRun(Base):
    """Model for storing evaluation runs."""
    
    __tablename__ = "eval_runs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(String, default=EvalStatus.PENDING.value, nullable=False)
    
    # Configuration
    model = Column(String, nullable=False)
    dataset_name = Column(String, nullable=True)
    metric_config = Column(JSON, nullable=True)  # e.g., {"check_json": true, "check_length": 100}
    
    # Input data (stored as JSON array)
    inputs = Column(JSON, nullable=True)
    
    # Results
    outputs = Column(JSON, nullable=True)  # List of model outputs
    results = Column(JSON, nullable=True)  # Aggregated results
    
    # Progress tracking
    total_items = Column(Integer, default=0)
    completed_items = Column(Integer, default=0)
    
    # Metrics
    avg_latency_ms = Column(Float, nullable=True)
    avg_perplexity = Column(Float, nullable=True)
    pass_rate = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Error tracking
    error_message = Column(String, nullable=True)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "status": self.status,
            "model": self.model,
            "dataset_name": self.dataset_name,
            "metric_config": self.metric_config,
            "total_items": self.total_items,
            "completed_items": self.completed_items,
            "avg_latency_ms": self.avg_latency_ms,
            "avg_perplexity": self.avg_perplexity,
            "pass_rate": self.pass_rate,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error_message": self.error_message,
        }
