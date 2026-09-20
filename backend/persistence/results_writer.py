import json
from pathlib import Path
from datetime import datetime, timezone
import pyarrow as pa
import pyarrow.parquet as pq

from core.config import SimConfig
from core.metrics.collector import Result
from core.version import MODEL_VERSION, SCHEMA_VERSION
from persistence.paths import get_data_dir

def write_run_result(
    run_id: str,
    config: SimConfig,
    seed: int,
    result: Result,
    calibration_status: str = "synthetic_uncalibrated",
    isolation: dict | None = None,
):
    """
    Persists the final results of a simulation run.
    Writes meta.json and kpis.parquet to data/runs/{run_id}/
    """
    run_dir = get_data_dir() / "runs" / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Write meta.json
    meta = {
        "run_id": run_id,
        "seed": seed,
        "model_version": MODEL_VERSION,
        "schema_version": SCHEMA_VERSION,
        "calibration_status": calibration_status,
        "status": result.status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "equilibrium_method": result.equilibrium_method,
        "final_gap": result.final_gap,
        "iterations": result.iterations,
        "converged": result.final_gap < config.msa_epsilon,
        "config": {
            k: getattr(config, k) for k in config.__dataclass_fields__
        }
    }
    if isolation:
        meta["isolation"] = {
            "component_count": isolation.get("component_count"),
            "largest_component_size": isolation.get("largest_component_size"),
            "isolated_node_count": len(isolation.get("isolated_nodes") or []),
            "isolation_ratio": isolation.get("isolation_ratio"),
        }
    
    with open(run_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    
    # 2. Write equilibrium.json
    equilibrium = {
        "method": "MSA",
        "final_gap": result.final_gap,
        "iterations": result.iterations,
        "converged": result.final_gap < config.msa_epsilon
    }
    with open(run_dir / "equilibrium.json", "w", encoding="utf-8") as f:
        json.dump(equilibrium, f, indent=2)
        
    # 2. Write KPIs (JSON for scalar, Parquet for distributions if needed)
    kpi_scalars = {
        "total_trips_completed": result.total_trips_completed,
        "average_travel_time_mins": result.average_travel_time_mins,
        "final_gap": result.final_gap,
        "iterations": result.iterations,
        "mode_counts": result.mode_counts,
        "co2_tonnes": result.co2_tonnes,
        "electricity_kwh": result.electricity_kwh,
        "water_liters": result.water_liters,
    }
    if isolation:
        kpi_scalars["isolation_ratio"] = isolation.get("isolation_ratio", 0.0)
        kpi_scalars["isolated_node_count"] = len(isolation.get("isolated_nodes") or [])
        kpi_scalars["component_count"] = isolation.get("component_count", 1)
    with open(run_dir / "kpis.json", "w", encoding="utf-8") as f:
        json.dump(kpi_scalars, f, indent=2)
        
    # 3. Write detailed trip durations to Parquet using PyArrow
    if result.trip_durations_mins:
        table = pa.table({
            "trip_duration_mins": result.trip_durations_mins
        })
        pq.write_table(table, run_dir / "trips.parquet")
    else:
        # Create an empty table with the correct schema if no trips
        schema = pa.schema([
            ("trip_duration_mins", pa.float64())
        ])
        empty_table = pa.Table.from_batches([], schema=schema)
        pq.write_table(empty_table, run_dir / "trips.parquet")

    # 4. Write link metrics
    if result.link_metrics:
        with open(run_dir / "link_metrics.json", "w", encoding="utf-8") as f:
            json.dump(result.link_metrics, f, indent=2)

def read_run_meta(run_id: str) -> dict:
    """Reads the metadata from the run directory."""
    run_dir = get_data_dir() / "runs" / run_id
    meta_file = run_dir / "meta.json"
    if not meta_file.exists():
        return {}
    with open(meta_file, "r", encoding="utf-8") as f:
        return json.load(f)

def read_run_kpis(run_id: str) -> dict:
    """Reads the basic scalar KPIs from the run directory."""
    run_dir = get_data_dir() / "runs" / run_id
    kpi_file = run_dir / "kpis.json"
    if not kpi_file.exists():
        return {}
    with open(kpi_file, "r", encoding="utf-8") as f:
        return json.load(f)

def read_run_link_metrics(run_id: str) -> list[dict]:
    """Reads the per-link metrics for mechanism tracing."""
    run_dir = get_data_dir() / "runs" / run_id
    lm_file = run_dir / "link_metrics.json"
    if not lm_file.exists():
        return []
    with open(lm_file, "r", encoding="utf-8") as f:
        return json.load(f)

