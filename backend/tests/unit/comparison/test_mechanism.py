from comparison.mechanism import trace_mechanisms

def test_trace_mechanisms_improvement():
    b_kpis = {}
    s_kpis = {}
    b_links = [
        {"id": "L1", "travel_time": 10.0, "volume": 1000, "vc_ratio": 1.1},
        {"id": "L2", "travel_time": 5.0, "volume": 500, "vc_ratio": 0.5}
    ]
    s_links = [
        {"id": "L1", "travel_time": 6.0, "volume": 800, "vc_ratio": 0.8},
        {"id": "L2", "travel_time": 5.0, "volume": 500, "vc_ratio": 0.5}
    ]
    
    insights = trace_mechanisms(b_kpis, s_kpis, b_links, s_links)
    
    assert len(insights) > 0
    assert "improved" in insights[0]
    assert "L1" in insights[0]

def test_trace_mechanisms_new_link():
    b_kpis = {}
    s_kpis = {}
    b_links = [
        {"id": "L1", "travel_time": 10.0, "volume": 1000, "vc_ratio": 1.1}
    ]
    s_links = [
        {"id": "L1", "travel_time": 10.0, "volume": 500, "vc_ratio": 0.5},
        {"id": "L2", "travel_time": 5.0, "volume": 500, "vc_ratio": 0.5} # new bypass
    ]
    
    insights = trace_mechanisms(b_kpis, s_kpis, b_links, s_links)
    
    assert len(insights) > 0
    assert "New link" in insights[0]
    assert "L2" in insights[0]

def test_trace_mechanisms_modal_shift():
    b_kpis = {"transit_ridership": 100}
    s_kpis = {"transit_ridership": 200} # > 10% increase
    b_links = []
    s_links = []
    
    insights = trace_mechanisms(b_kpis, s_kpis, b_links, s_links)
    
    assert len(insights) == 1
    assert "Modal shift" in insights[0]
    assert "100 trips" in insights[0]

def test_trace_mechanisms_no_change():
    b_kpis = {}
    s_kpis = {}
    b_links = [{"id": "L1", "travel_time": 5.0, "volume": 100, "vc_ratio": 0.5}]
    s_links = [{"id": "L1", "travel_time": 5.0, "volume": 100, "vc_ratio": 0.5}]
    
    insights = trace_mechanisms(b_kpis, s_kpis, b_links, s_links)
    
    assert len(insights) == 1
    assert "stable" in insights[0]
