"""Groq LLM Client with streaming support and logprobs extraction."""

import json
from typing import AsyncGenerator
from dataclasses import dataclass

from groq import Groq, AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from loguru import logger

from app.core.config import settings
from .math_utils import calculate_token_entropy


@dataclass
class TokenData:
    """Token data with metadata."""
    id: int
    text: str
    logprob: float
    entropy: float


@dataclass
class StreamChunk:
    """A chunk of streamed data."""
    token: TokenData | None = None
    done: bool = False
    error: str | None = None


# Models known to NOT support logprobs (updated as we discover them)
MODELS_WITHOUT_LOGPROBS = {
    "llama-3.1-8b-instant",
    "llama-3.2-1b-preview", 
    "llama-3.2-3b-preview",
}


class GroqLLMClient:
    """Client for Groq API with streaming and logprobs support."""
    
    def __init__(self, api_key: str | None = None):
        """Initialize the Groq client."""
        self.api_key = api_key or settings.groq_api_key
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is required. Set it in .env file.")
        
        self.client = Groq(api_key=self.api_key)
        self.async_client = AsyncGroq(api_key=self.api_key)
    
    async def stream_chat_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str = "llama-3.1-8b-instant",
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 1.0,
    ) -> AsyncGenerator[StreamChunk, None]:
        """
        Stream chat completion with logprobs when supported.
        
        Args:
            system_prompt: System message
            user_prompt: User message
            model: Model identifier (e.g., "llama-3.1-8b-instant")
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            top_p: Top-p sampling parameter
            
        Yields:
            StreamChunk with token data or completion signal
        """
        # Check if model supports logprobs
        supports_logprobs = model not in MODELS_WITHOUT_LOGPROBS
        
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
            
            logger.debug(f"Starting stream for model {model} (logprobs: {supports_logprobs})")
            
            # Build request params
            request_params = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "top_p": top_p,
                "stream": True,
            }
            
            # Add logprobs only if supported
            if supports_logprobs:
                request_params["logprobs"] = True
                request_params["top_logprobs"] = 5
            
            stream = await self.async_client.chat.completions.create(**request_params)
            
            token_id = 0
            async for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    choice = chunk.choices[0]
                    delta = choice.delta
                    
                    if delta and delta.content:
                        text = delta.content
                        
                        # Extract logprob from the chunk (if available)
                        logprob = -0.1  # Default fallback (simulated medium confidence)
                        top_logprobs = None
                        
                        if supports_logprobs and hasattr(choice, 'logprobs') and choice.logprobs:
                            content_logprobs = choice.logprobs.content
                            if content_logprobs and len(content_logprobs) > 0:
                                token_logprob = content_logprobs[0]
                                logprob = token_logprob.logprob
                                
                                # Get top logprobs for entropy calculation
                                if hasattr(token_logprob, 'top_logprobs') and token_logprob.top_logprobs:
                                    top_logprobs = [tlp.logprob for tlp in token_logprob.top_logprobs]
                        
                        # Calculate entropy
                        entropy = calculate_token_entropy(logprob, top_logprobs)
                        
                        token_data = TokenData(
                            id=token_id,
                            text=text,
                            logprob=logprob,
                            entropy=entropy,
                        )
                        
                        token_id += 1
                        yield StreamChunk(token=token_data)
                    
                    # Check for finish reason
                    if choice.finish_reason:
                        yield StreamChunk(done=True)
                        break
            
            logger.debug(f"Stream completed, {token_id} tokens generated")
            
        except Exception as e:
            error_msg = str(e)
            
            # If logprobs failed, try again without them
            if "logprobs" in error_msg.lower() and supports_logprobs:
                logger.warning(f"Model {model} doesn't support logprobs, retrying without")
                MODELS_WITHOUT_LOGPROBS.add(model)  # Remember for next time
                
                async for chunk in self.stream_chat_completion(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=top_p,
                ):
                    yield chunk
                return
            
            logger.error(f"Stream error: {e}")
            yield StreamChunk(error=error_msg)
    
    def get_available_models(self) -> list[str]:
        """Get list of available Groq models."""
        return [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "llama-3.2-1b-preview",
            "llama-3.2-3b-preview",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ]
    
    def model_supports_logprobs(self, model: str) -> bool:
        """Check if a model supports logprobs."""
        return model not in MODELS_WITHOUT_LOGPROBS
