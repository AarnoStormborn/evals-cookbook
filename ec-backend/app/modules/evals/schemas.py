"""Pydantic schemas for Evals module."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class EvalStatusEnum(str, Enum):
    """Status of an evaluation run."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class MetricConfig(BaseModel):
    """Configuration for evaluation metrics."""
    
    check_json: bool = Field(default=False, description="Validate JSON output")
    check_length: Optional[int] = Field(default=None, description="Expected output length")
    custom_rules: Optional[Dict[str, Any]] = Field(default=None, description="Custom validation rules")


class EvalInput(BaseModel):
    """Single input for evaluation."""
    
    system_prompt: str = Field(default="You are a helpful assistant.")
    user_prompt: str = Field(..., description="User prompt to evaluate")
    expected_output: Optional[str] = Field(default=None, description="Expected output for comparison")


class EvalRunRequest(BaseModel):
    """Request to start an evaluation run."""
    
    model: str = Field(default="llama-3.1-8b-instant", description="Model to evaluate")
    dataset_name: Optional[str] = Field(default=None, description="Name for this dataset")
    inputs: List[EvalInput] = Field(..., description="List of inputs to evaluate")
    metric_config: Optional[MetricConfig] = Field(default=None, description="Metric configuration")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1024, ge=1, le=8192)


class EvalRunResponse(BaseModel):
    """Response when starting an evaluation run."""
    
    run_id: str = Field(..., description="Unique identifier for this run")
    status: EvalStatusEnum = Field(..., description="Current status")
    total_items: int = Field(..., description="Total items to process")


class EvalStatusResponse(BaseModel):
    """Status response for an evaluation run."""
    
    run_id: str
    status: EvalStatusEnum
    total_items: int
    completed_items: int
    progress_percent: float = Field(..., description="Completion percentage")
    error_message: Optional[str] = None


class EvalItemResult(BaseModel):
    """Result for a single evaluation item."""
    
    input_prompt: str
    output: str
    latency_ms: float
    perplexity: Optional[float] = None
    passed: bool
    failure_reason: Optional[str] = None


class EvalReportResponse(BaseModel):
    """Full report for a completed evaluation run."""
    
    run_id: str
    status: EvalStatusEnum
    model: str
    dataset_name: Optional[str]
    
    # Summary metrics
    total_items: int
    passed_items: int
    failed_items: int
    pass_rate: float
    
    # Performance metrics
    avg_latency_ms: float
    min_latency_ms: float
    max_latency_ms: float
    avg_perplexity: Optional[float]
    
    # Timestamps
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Detailed results (optional, can be large)
    results: Optional[List[EvalItemResult]] = None


class EvalListItem(BaseModel):
    """Summary item for listing eval runs."""
    
    id: str
    status: str
    model: str
    dataset_name: Optional[str]
    total_items: int
    completed_items: int
    pass_rate: Optional[float]
    avg_latency_ms: Optional[float]
    created_at: datetime


class EvalListResponse(BaseModel):
    """Response for listing eval runs."""
    
    runs: List[EvalListItem]
    total: int
