from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio

router = APIRouter(tags=["stream"])

@router.websocket("/runs/{run_id}/stream")
async def run_stream(websocket: WebSocket, run_id: str):
    """
    WebSocket endpoint for streaming live simulation snapshots to the UI.
    For MVP, we just accept the connection and stream a dummy heartbeat.
    """
    await websocket.accept()
    try:
        while True:
            # In the full implementation, this reads from an asyncio queue 
            # or pubsub channel populated by the job runner.
            await asyncio.sleep(2.0)
            await websocket.send_json({"run_id": run_id, "status": "heartbeat"})
    except WebSocketDisconnect:
        pass
