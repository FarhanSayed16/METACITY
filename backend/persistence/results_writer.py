import json
import dataclasses
from pathlib import Path
from core.metrics.kpis import NetworkMetrics
from api.settings import Settings

settings = Settings()

def write_run_result(run_id: str, kpis: NetworkMetrics) -> None:
    """
    Write the simulation results for a given run to the filesystem.
    """
    run_dir = Path(settings.data_dir) / "runs" / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    
    kpi_dict = dataclasses.asdict(kpis)
    
    # Store top-level KPIs as JSON
    (run_dir / "kpis.json").write_text(json.dumps(kpi_dict, indent=2))
    
    # In a full production implementation, link_metrics would be written to parquet here.
    
def read_run_kpis(run_id: str) -> dict | None:
    path = Path(settings.data_dir) / "runs" / run_id / "kpis.json"
    if path.exists():
        return json.loads(path.read_text())
    return None
