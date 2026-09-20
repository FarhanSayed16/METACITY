"""Dump OpenAPI schema from FastAPI app (no running server required)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Ensure backend package root is importable when run as a script
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


def main() -> None:
    from api.main import app

    out = BACKEND_ROOT.parent / "frontend" / "openapi.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    schema = app.openapi()
    out.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
