import numpy as np

def multinomial_logit_probs(utilities: np.ndarray, theta: float = 1.0) -> np.ndarray:
    """
    Calculate choice probabilities using Multinomial Logit Model.
    
    P_i = exp(V_i * theta) / sum(exp(V_j * theta))
    
    Args:
        utilities: Array of utility values for each alternative
        theta: Scale parameter
        
    Returns:
        Array of probabilities summing to 1.
    """
    # Shift utilities to prevent overflow (max utility = 0)
    shifted_v = utilities - np.max(utilities)
    exp_v = np.exp(shifted_v * theta)
    return exp_v / np.sum(exp_v)
