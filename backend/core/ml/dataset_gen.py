"""Deprecated — moved to backend/ml/dataset_gen.py to avoid core→persistence imports."""
# Keep a re-export for backwards compatibility
try:
    from ml.dataset_gen import generate_dataset  # noqa: F401
except ImportError:
    pass
