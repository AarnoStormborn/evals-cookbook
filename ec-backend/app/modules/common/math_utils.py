"""Mathematical utilities for LLM analysis metrics."""

import math
from typing import List
import numpy as np


def calculate_entropy(logprobs: List[float]) -> float:
    """
    Calculate entropy from log probabilities.
    
    Entropy measures uncertainty in the model's predictions.
    Higher entropy = more uncertainty.
    
    Formula: H = -sum(p * log(p)) = -sum(exp(logp) * logp)
    
    Args:
        logprobs: List of log probabilities for top tokens
        
    Returns:
        Entropy value (non-negative)
    """
    if not logprobs:
        return 0.0
    
    # Convert logprobs to probabilities
    probs = [math.exp(lp) for lp in logprobs]
    
    # Normalize probabilities (they should already be normalized, but just in case)
    total = sum(probs)
    if total == 0:
        return 0.0
    probs = [p / total for p in probs]
    
    # Calculate entropy: H = -sum(p * log(p))
    entropy = 0.0
    for p in probs:
        if p > 0:
            entropy -= p * math.log(p)
    
    return entropy


def calculate_perplexity(logprobs: List[float]) -> float:
    """
    Calculate perplexity from log probabilities.
    
    Perplexity = exp(-mean(log_probabilities))
    
    Lower perplexity = more confident predictions.
    
    Args:
        logprobs: List of log probabilities for each token
        
    Returns:
        Perplexity value (>= 1)
    """
    if not logprobs:
        return 1.0
    
    mean_logprob = np.mean(logprobs)
    perplexity = math.exp(-mean_logprob)
    
    return perplexity


def calculate_burstiness(text: str) -> float:
    """
    Calculate burstiness (coefficient of variation of sentence lengths).
    
    Burstiness measures how uneven the token distribution is across sentences.
    High burstiness = variable sentence lengths (more human-like).
    Low burstiness = uniform sentence lengths (more machine-like).
    
    Formula: CoV = StdDev(tokens_per_sentence) / Mean(tokens_per_sentence)
    
    Args:
        text: Input text to analyze
        
    Returns:
        Burstiness coefficient (>= 0)
    """
    import nltk
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        nltk.download('punkt', quiet=True)
    
    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        nltk.download('punkt_tab', quiet=True)
    
    # Tokenize into sentences
    sentences = nltk.sent_tokenize(text)
    
    if len(sentences) < 2:
        return 0.0
    
    # Count words per sentence (simple tokenization)
    token_counts = [len(sentence.split()) for sentence in sentences]
    
    mean_count = np.mean(token_counts)
    if mean_count == 0:
        return 0.0
    
    std_count = np.std(token_counts)
    burstiness = std_count / mean_count
    
    return float(burstiness)


def calculate_token_entropy(logprob: float, top_logprobs: List[float] | None = None) -> float:
    """
    Calculate entropy for a single token from its logprobs.
    
    If top_logprobs are provided, uses them to estimate entropy.
    Otherwise, returns a simple estimate based on the main logprob.
    
    Args:
        logprob: Log probability of the selected token
        top_logprobs: Optional list of top alternative logprobs
        
    Returns:
        Estimated entropy for this token position
    """
    if top_logprobs:
        return calculate_entropy(top_logprobs)
    
    # Simple estimate: higher |logprob| = lower probability = higher uncertainty
    # Map logprob to a 0-1 entropy estimate
    # logprob of 0 = probability of 1 = entropy of 0
    # logprob of -inf = probability of 0 = entropy of inf
    prob = math.exp(logprob)
    if prob >= 1.0:
        return 0.0
    if prob <= 0.0:
        return float('inf')
    
    # For a single token, entropy is just -p*log(p) - (1-p)*log(1-p)
    # But since we only have the selected token, we'll use a simplified version
    entropy = -logprob * prob
    return entropy
