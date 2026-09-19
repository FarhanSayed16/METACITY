import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from core.schema.scene import Scene

def main():
    schema = Scene.model_json_schema()
    out_path = Path(__file__).parent.parent / "data" / "schemas" / "scene_schema.json"
    out_path.write_text(json.dumps(schema, indent=2))
    print(f"Schema written to {out_path}")

if __name__ == "__main__":
    main()
