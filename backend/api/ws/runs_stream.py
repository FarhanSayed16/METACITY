from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from jobs.manager import job_manager
from api.middleware.limiter import ws_connect_limiter, MAX_WS_SUBSCRIBERS_PER_RUN

router = APIRouter(tags=["stream"])


@router.websocket("/runs/{run_id}/stream")
async def run_stream(websocket: WebSocket, run_id: str):
    """
    WebSocket endpoint for streaming live simulation snapshots to the UI.
    Rate-limited: connect window per IP + max concurrent subscribers per run.
    """
    client_ip = websocket.client.host if websocket.client else "unknown"

    if not ws_connect_limiter.allow(client_ip):
        await websocket.close(code=1008, reason="WS rate limit exceeded")
        return

    existing = len(job_manager.subscribers.get(run_id, []))
    if existing >= MAX_WS_SUBSCRIBERS_PER_RUN:
        await websocket.close(code=1013, reason="Too many subscribers for this run")
        return

    await websocket.accept()
    queue = asyncio.Queue(maxsize=32)

    def on_snapshot(snapshot: dict):
        try:
            queue.put_nowait(snapshot)
        except asyncio.QueueFull:
            # Drop oldest to stay real-time under load
            try:
                queue.get_nowait()
            except Exception:
                pass
            try:
                queue.put_nowait(snapshot)
            except Exception:
                pass

    job_manager.subscribe(run_id, on_snapshot)

    try:
        while True:
            snapshot = await queue.get()
            await websocket.send_json(snapshot)

            if snapshot.get("progress_pct", 0) >= 100.0:
                await asyncio.sleep(0.5)
                break

    except WebSocketDisconnect:
        pass
    finally:
        job_manager.unsubscribe(run_id, on_snapshot)
