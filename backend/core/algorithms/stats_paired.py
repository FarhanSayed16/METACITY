import numpy as np
from scipy import stats

def paired_t_test(sample1: np.ndarray, sample2: np.ndarray, alpha: float = 0.05) -> dict:
    """
    Perform a paired t-test between two samples (e.g. before/after scenarios).
    
    Returns:
        dict with mean difference, t-statistic, p-value, and confidence interval.
    """
    if len(sample1) != len(sample2):
        raise ValueError("Samples must have the same length for paired t-test")
        
    diff = sample2 - sample1
    n = len(diff)
    
    if n < 2:
        return {
            "mean_diff": float(np.mean(diff)) if n > 0 else 0.0,
            "t_stat": 0.0,
            "p_value": 1.0,
            "ci_lower": 0.0,
            "ci_upper": 0.0,
            "significant": False
        }
        
    mean_diff = np.mean(diff)
    std_diff = np.std(diff, ddof=1)
    se = std_diff / np.sqrt(n)
    
    if se == 0:
        return {
            "mean_diff": float(mean_diff),
            "t_stat": float('inf') if mean_diff > 0 else float('-inf') if mean_diff < 0 else 0.0,
            "p_value": 0.0 if mean_diff != 0 else 1.0,
            "ci_lower": float(mean_diff),
            "ci_upper": float(mean_diff),
            "significant": bool(mean_diff != 0)
        }
        
    t_stat = mean_diff / se
    df = n - 1
    p_value = 2 * (1 - stats.t.cdf(abs(t_stat), df))
    
    # Critical value
    t_crit = stats.t.ppf(1 - alpha/2, df)
    margin = t_crit * se
    
    return {
        "mean_diff": float(mean_diff),
        "t_stat": float(t_stat),
        "p_value": float(p_value),
        "ci_lower": float(mean_diff - margin),
        "ci_upper": float(mean_diff + margin),
        "significant": bool(p_value < alpha)
    }
