"""Celery tasks for async evaluation processing."""

import json
import time
from datetime import datetime
from typing import List, Dict, Any

from loguru import logger

from app.core.celery_app import celery_app
from app.core.database import async_session_factory
from app.modules.common.llm_client import GroqLLMClient
from app.modules.common.math_utils import calculate_perplexity
from .models import EvalRun, EvalStatus


def validate_json_output(output: str) -> tuple[bool, str | None]:
    """Validate if output is valid JSON."""
    try:
        json.loads(output)
        return True, None
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {str(e)}"


def validate_length(output: str, expected_length: int, tolerance: float = 0.2) -> tuple[bool, str | None]:
    """Validate output length within tolerance."""
    actual_length = len(output)
    min_length = int(expected_length * (1 - tolerance))
    max_length = int(expected_length * (1 + tolerance))
    
    if min_length <= actual_length <= max_length:
        return True, None
    return False, f"Length {actual_length} not within {min_length}-{max_length}"


@celery_app.task(bind=True)
def run_evaluation_task(self, run_id: str):
    """
    Celery task to run evaluation asynchronously.
    
    This task:
    1. Loads the eval run from database
    2. Processes each input through the LLM
    3. Validates outputs against metric config
    4. Updates progress and stores results
    """
    import asyncio
    
    async def _run_eval():
        async with async_session_factory() as session:
            # Load the eval run
            run = await session.get(EvalRun, run_id)
            if not run:
                logger.error(f"Eval run {run_id} not found")
                return
            
            try:
                # Update status to processing
                run.status = EvalStatus.PROCESSING.value
                run.started_at = datetime.utcnow()
                await session.commit()
                
                # Initialize client
                client = GroqLLMClient()
                
                inputs = run.inputs or []
                results = []
                latencies = []
                passed_count = 0
                all_logprobs = []
                
                for i, input_data in enumerate(inputs):
                    try:
                        start_time = time.time()
                        
                        # Collect full response
                        full_response = ""
                        token_logprobs = []
                        
                        async for chunk in client.stream_chat_completion(
                            system_prompt=input_data.get("system_prompt", "You are a helpful assistant."),
                            user_prompt=input_data.get("user_prompt", ""),
                            model=run.model,
                            temperature=0.7,
                            max_tokens=1024,
                        ):
                            if chunk.token:
                                full_response += chunk.token.text
                                token_logprobs.append(chunk.token.logprob)
                            if chunk.done:
                                break
                            if chunk.error:
                                raise Exception(chunk.error)
                        
                        latency_ms = (time.time() - start_time) * 1000
                        latencies.append(latency_ms)
                        all_logprobs.extend(token_logprobs)
                        
                        # Validate output
                        passed = True
                        failure_reason = None
                        metric_config = run.metric_config or {}
                        
                        if metric_config.get("check_json"):
                            passed, failure_reason = validate_json_output(full_response)
                        
                        if passed and metric_config.get("check_length"):
                            passed, failure_reason = validate_length(
                                full_response, 
                                metric_config["check_length"]
                            )
                        
                        if passed:
                            passed_count += 1
                        
                        results.append({
                            "input_prompt": input_data.get("user_prompt", ""),
                            "output": full_response,
                            "latency_ms": latency_ms,
                            "passed": passed,
                            "failure_reason": failure_reason,
                        })
                        
                        # Update progress
                        run.completed_items = i + 1
                        await session.commit()
                        
                    except Exception as e:
                        logger.error(f"Error processing item {i}: {e}")
                        results.append({
                            "input_prompt": input_data.get("user_prompt", ""),
                            "output": "",
                            "latency_ms": 0,
                            "passed": False,
                            "failure_reason": str(e),
                        })
                
                # Calculate final metrics
                run.status = EvalStatus.COMPLETED.value
                run.completed_at = datetime.utcnow()
                run.results = results
                run.outputs = [r["output"] for r in results]
                run.avg_latency_ms = sum(latencies) / len(latencies) if latencies else 0
                run.pass_rate = passed_count / len(inputs) if inputs else 0
                
                if all_logprobs:
                    run.avg_perplexity = calculate_perplexity(all_logprobs)
                
                await session.commit()
                logger.info(f"Eval run {run_id} completed successfully")
                
            except Exception as e:
                logger.error(f"Eval run {run_id} failed: {e}")
                run.status = EvalStatus.FAILED.value
                run.error_message = str(e)
                run.completed_at = datetime.utcnow()
                await session.commit()
    
    # Run the async function
    asyncio.run(_run_eval())


def run_evaluation_sync(run_id: str):
    """
    Synchronous version of evaluation for when Celery/Redis is not available.
    
    This can be called directly for development/testing.
    """
    import asyncio
    
    async def _run():
        async with async_session_factory() as session:
            run = await session.get(EvalRun, run_id)
            if not run:
                return
            
            # Simplified sync processing
            run.status = EvalStatus.PROCESSING.value
            run.started_at = datetime.utcnow()
            await session.commit()
            
            try:
                client = GroqLLMClient()
                inputs = run.inputs or []
                results = []
                latencies = []
                passed_count = 0
                
                for i, input_data in enumerate(inputs):
                    start_time = time.time()
                    full_response = ""
                    
                    async for chunk in client.stream_chat_completion(
                        system_prompt=input_data.get("system_prompt", "You are a helpful assistant."),
                        user_prompt=input_data.get("user_prompt", ""),
                        model=run.model,
                    ):
                        if chunk.token:
                            full_response += chunk.token.text
                        if chunk.done or chunk.error:
                            break
                    
                    latency_ms = (time.time() - start_time) * 1000
                    latencies.append(latency_ms)
                    
                    passed = True
                    results.append({
                        "input_prompt": input_data.get("user_prompt", ""),
                        "output": full_response,
                        "latency_ms": latency_ms,
                        "passed": passed,
                    })
                    passed_count += 1
                    
                    run.completed_items = i + 1
                    await session.commit()
                
                run.status = EvalStatus.COMPLETED.value
                run.completed_at = datetime.utcnow()
                run.results = results
                run.avg_latency_ms = sum(latencies) / len(latencies) if latencies else 0
                run.pass_rate = passed_count / len(inputs) if inputs else 0
                await session.commit()
                
            except Exception as e:
                run.status = EvalStatus.FAILED.value
                run.error_message = str(e)
                await session.commit()
    
    asyncio.run(_run())
