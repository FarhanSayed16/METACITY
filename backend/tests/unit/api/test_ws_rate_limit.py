"""Wave B: rate limiter + WS subscriber caps."""
from api.middleware.limiter import FixedWindowLimiter, MAX_WS_SUBSCRIBERS_PER_RUN
from fastapi.testclient import TestClient
from api.main import app
from jobs.manager import job_manager


def test_fixed_window_limiter_blocks():
    lim = FixedWindowLimiter(max_requests=3, window_seconds=60)
    assert lim.allow("ip1")
    assert lim.allow("ip1")
    assert lim.allow("ip1")
    assert lim.allow("ip1") is False
    assert lim.allow("ip2") is True


def test_ws_subscriber_cap_constant():
    assert MAX_WS_SUBSCRIBERS_PER_RUN >= 1


def test_ws_stream_rejects_when_over_subscribed():
    run_id = "soak_test_run_reject"
    fillers = [lambda _s: None for _ in range(MAX_WS_SUBSCRIBERS_PER_RUN)]
    for cb in fillers:
        job_manager.subscribe(run_id, cb)

    client = TestClient(app)
    rejected = False
    try:
        with client.websocket_connect(f"/runs/{run_id}/stream"):
            rejected = False
    except Exception:
        rejected = True
    finally:
        for cb in fillers:
            job_manager.unsubscribe(run_id, cb)
        job_manager.subscribers.pop(run_id, None)

    assert rejected is True


def test_ws_multi_client_soak_under_cap():
    run_id = "soak_ok_run"
    # Clear any leftovers
    job_manager.subscribers.pop(run_id, None)
    client = TestClient(app)
    with client.websocket_connect(f"/runs/{run_id}/stream") as ws1:
        with client.websocket_connect(f"/runs/{run_id}/stream") as ws2:
            assert len(job_manager.subscribers.get(run_id, [])) == 2
            # Push a fake completion snapshot to both
            for cb in list(job_manager.subscribers.get(run_id, [])):
                cb({"progress_pct": 100.0, "t_mins": 0})
            # Drain so servers can exit cleanly
            try:
                ws1.receive_json()
            except Exception:
                pass
            try:
                ws2.receive_json()
            except Exception:
                pass
    # After context exit, unsubscribe should have run
    assert len(job_manager.subscribers.get(run_id, [])) == 0
