"""Playground API routes for real-time inference."""

import json
import tiktoken
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from loguru import logger

from app.modules.common.llm_client import GroqLLMClient
from .schemas import (
    ChatCompletionRequest,
    TokenizeRequest,
    TokenizeResponse,
    TokenInfo,
    ModelsResponse,
)


router = APIRouter(prefix="/playground", tags=["Playground"])


@router.post("/chat/completions")
async def stream_chat_completions(request: ChatCompletionRequest):
    """
    Stream chat completions with token-level metadata.
    
    Returns Server-Sent Events (SSE) with structured token data:
    - token: The generated token text
    - id: Token index in sequence
    - logprob: Log probability of the token
    - entropy: Entropy at this token position
    """
    
    async def event_generator():
        try:
            client = GroqLLMClient()
            
            async for chunk in client.stream_chat_completion(
                system_prompt=request.system_prompt,
                user_prompt=request.user_prompt,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                top_p=request.top_p,
            ):
                if chunk.error:
                    error_data = {"error": chunk.error}
                    yield {
                        "event": "error",
                        "data": json.dumps(error_data),
                    }
                    break
                
                if chunk.done:
                    yield {
                        "event": "done",
                        "data": json.dumps({"done": True}),
                    }
                    break
                
                if chunk.token:
                    token_data = {
                        "id": chunk.token.id,
                        "text": chunk.token.text,
                        "logprob": round(chunk.token.logprob, 6),
                        "entropy": round(chunk.token.entropy, 6),
                    }
                    yield {
                        "event": "token",
                        "data": json.dumps(token_data),
                    }
        
        except ValueError as e:
            # API key not configured
            logger.error(f"Configuration error: {e}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield {
                "event": "error",
                "data": json.dumps({"error": f"Streaming failed: {str(e)}"}),
            }
    
    return EventSourceResponse(event_generator())


@router.post("/tokenize", response_model=TokenizeResponse)
async def tokenize_text(request: TokenizeRequest):
    """
    Tokenize text using the specified model's tokenizer.
    
    Returns a list of tokens with their IDs and text representations.
    """
    try:
        # Use tiktoken with cl100k_base encoding (closest to Llama tokenizer for demo)
        # In production, you'd use the actual model's tokenizer
        encoding = tiktoken.get_encoding("cl100k_base")
        
        # Encode text to get token IDs
        token_ids = encoding.encode(request.text)
        
        # Decode each token to get its text representation
        tokens = []
        for token_id in token_ids:
            token_text = encoding.decode([token_id])
            tokens.append(TokenInfo(id=token_id, text=token_text))
        
        return TokenizeResponse(
            tokens=tokens,
            total_tokens=len(tokens),
        )
    
    except Exception as e:
        logger.error(f"Tokenization error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Tokenization failed: {str(e)}"
        )


@router.get("/models", response_model=ModelsResponse)
async def get_available_models():
    """Get list of available models for inference."""
    try:
        client = GroqLLMClient()
        models = client.get_available_models()
        return ModelsResponse(models=models)
    except ValueError:
        # API key not configured, return default list
        return ModelsResponse(models=[
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "llama-3.2-1b-preview",
            "llama-3.2-3b-preview",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ])
