"""Pydantic schemas for Playground module."""

from pydantic import BaseModel, Field
from typing import List, Optional


class ChatCompletionRequest(BaseModel):
    """Request schema for chat completions."""
    
    system_prompt: str = Field(
        default="You are a helpful assistant.",
        description="System message to set the AI's behavior"
    )
    user_prompt: str = Field(
        ...,
        description="User's input message"
    )
    model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model identifier"
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Sampling temperature"
    )
    max_tokens: int = Field(
        default=1024,
        ge=1,
        le=8192,
        description="Maximum tokens to generate"
    )
    top_p: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Top-p sampling parameter"
    )


class TokenData(BaseModel):
    """Token data with metadata."""
    
    id: int = Field(..., description="Token index in sequence")
    text: str = Field(..., description="Token string value")
    logprob: float = Field(..., description="Log probability of the token")
    entropy: float = Field(default=0.0, description="Entropy at this token position")


class TokenizeRequest(BaseModel):
    """Request schema for tokenization."""
    
    text: str = Field(..., description="Text to tokenize")
    model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model to use for tokenization"
    )


class TokenInfo(BaseModel):
    """Token information from tokenization."""
    
    id: int = Field(..., description="Token ID in vocabulary")
    text: str = Field(..., description="Token string representation")


class TokenizeResponse(BaseModel):
    """Response schema for tokenization."""
    
    tokens: List[TokenInfo] = Field(..., description="List of tokenized tokens")
    total_tokens: int = Field(..., description="Total number of tokens")


class ModelsResponse(BaseModel):
    """Response schema for available models."""
    
    models: List[str] = Field(..., description="List of available model IDs")
