"""Evals API routes for batch evaluation processing."""

import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from loguru import logger

from app.core.database import get_db
from .models import EvalRun, EvalStatus
from .schemas import (
    EvalRunRequest,
    EvalRunResponse,
    EvalStatusResponse,
    EvalStatusEnum,
    EvalReportResponse,
    EvalItemResult,
    EvalListResponse,
    EvalListItem,
)
from .tasks import run_evaluation_sync


router = APIRouter(prefix="/evals", tags=["Evaluations"])


async def run_eval_background(run_id: str):
    """Background task to run evaluation."""
    try:
        # Try Celery first, fall back to sync
        try:
            from .tasks import run_evaluation_task
            run_evaluation_task.delay(run_id)
            logger.info(f"Dispatched eval {run_id} to Celery")
        except Exception as e:
            logger.warning(f"Celery not available, running sync: {e}")
            run_evaluation_sync(run_id)
    except Exception as e:
        logger.error(f"Failed to run evaluation: {e}")


@router.post("/run", response_model=EvalRunResponse)
async def create_eval_run(
    request: EvalRunRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Create and start a new evaluation run.
    
    Returns immediately with a run_id. Use /status/{run_id} to check progress.
    """
    try:
        # Create eval run
        run_id = str(uuid.uuid4())
        
        eval_run = EvalRun(
            id=run_id,
            status=EvalStatus.PENDING.value,
            model=request.model,
            dataset_name=request.dataset_name,
            metric_config=request.metric_config.model_dump() if request.metric_config else None,
            inputs=[inp.model_dump() for inp in request.inputs],
            total_items=len(request.inputs),
            completed_items=0,
            created_at=datetime.utcnow(),
        )
        
        db.add(eval_run)
        await db.commit()
        
        # Start background processing
        background_tasks.add_task(run_eval_background, run_id)
        
        logger.info(f"Created eval run {run_id} with {len(request.inputs)} items")
        
        return EvalRunResponse(
            run_id=run_id,
            status=EvalStatusEnum.PENDING,
            total_items=len(request.inputs),
        )
    
    except Exception as e:
        logger.error(f"Failed to create eval run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{run_id}", response_model=EvalStatusResponse)
async def get_eval_status(
    run_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the current status and progress of an evaluation run."""
    run = await db.get(EvalRun, run_id)
    
    if not run:
        raise HTTPException(status_code=404, detail=f"Eval run {run_id} not found")
    
    progress = (run.completed_items / run.total_items * 100) if run.total_items > 0 else 0
    
    return EvalStatusResponse(
        run_id=run.id,
        status=EvalStatusEnum(run.status),
        total_items=run.total_items,
        completed_items=run.completed_items,
        progress_percent=round(progress, 1),
        error_message=run.error_message,
    )


@router.get("/report/{run_id}", response_model=EvalReportResponse)
async def get_eval_report(
    run_id: str,
    include_results: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Get the full report for a completed evaluation run."""
    run = await db.get(EvalRun, run_id)
    
    if not run:
        raise HTTPException(status_code=404, detail=f"Eval run {run_id} not found")
    
    results = run.results or []
    
    # Calculate metrics
    passed_items = sum(1 for r in results if r.get("passed", False))
    failed_items = len(results) - passed_items
    latencies = [r.get("latency_ms", 0) for r in results if r.get("latency_ms")]
    
    # Build detailed results if requested
    detailed_results = None
    if include_results and results:
        detailed_results = [
            EvalItemResult(
                input_prompt=r.get("input_prompt", ""),
                output=r.get("output", ""),
                latency_ms=r.get("latency_ms", 0),
                perplexity=r.get("perplexity"),
                passed=r.get("passed", False),
                failure_reason=r.get("failure_reason"),
            )
            for r in results
        ]
    
    return EvalReportResponse(
        run_id=run.id,
        status=EvalStatusEnum(run.status),
        model=run.model,
        dataset_name=run.dataset_name,
        total_items=run.total_items,
        passed_items=passed_items,
        failed_items=failed_items,
        pass_rate=run.pass_rate or 0,
        avg_latency_ms=run.avg_latency_ms or 0,
        min_latency_ms=min(latencies) if latencies else 0,
        max_latency_ms=max(latencies) if latencies else 0,
        avg_perplexity=run.avg_perplexity,
        created_at=run.created_at,
        started_at=run.started_at,
        completed_at=run.completed_at,
        results=detailed_results,
    )


@router.get("/runs", response_model=EvalListResponse)
async def list_eval_runs(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List all evaluation runs."""
    # Get total count
    count_stmt = select(EvalRun)
    all_runs = (await db.execute(count_stmt)).scalars().all()
    total = len(all_runs)
    
    # Get paginated runs
    stmt = select(EvalRun).order_by(desc(EvalRun.created_at)).offset(offset).limit(limit)
    result = await db.execute(stmt)
    runs = result.scalars().all()
    
    items = [
        EvalListItem(
            id=run.id,
            status=run.status,
            model=run.model,
            dataset_name=run.dataset_name,
            total_items=run.total_items,
            completed_items=run.completed_items,
            pass_rate=run.pass_rate,
            avg_latency_ms=run.avg_latency_ms,
            created_at=run.created_at,
        )
        for run in runs
    ]
    
    return EvalListResponse(runs=items, total=total)


@router.delete("/{run_id}")
async def delete_eval_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an evaluation run."""
    run = await db.get(EvalRun, run_id)
    
    if not run:
        raise HTTPException(status_code=404, detail=f"Eval run {run_id} not found")
    
    await db.delete(run)
    await db.commit()
    
    return {"message": f"Eval run {run_id} deleted"}
