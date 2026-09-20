try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
except ImportError:
    torch = None
    class Dummy:
        def __init__(self, *args, **kwargs):
            pass
    class nn:
        Module = Dummy
        Sequential = Dummy
        Linear = Dummy
        ReLU = Dummy
        MSELoss = Dummy
    optim = None

from pathlib import Path

class SurrogateMLP(nn.Module):
    def __init__(self, input_dim: int = 3, output_dim: int = 2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, output_dim)
        )
        
    def forward(self, x):
        return self.net(x)

def train_surrogate(csv_path: str, model_path: str, epochs: int = 100):
    """
    Trains the PyTorch MLP on the generated CSV dataset.
    """
    import csv
    
    # Very basic loading (ignoring pandas to save dependencies)
    features = []
    targets = []
    
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        next(reader) # skip header
        for row in reader:
            if not row: continue
            features.append([float(row[0]), float(row[1]), float(row[2])])
            targets.append([float(row[3]), float(row[4])])
            
    if not features:
        return
        
    X = torch.tensor(features, dtype=torch.float32)
    Y = torch.tensor(targets, dtype=torch.float32)
    
    model = SurrogateMLP()
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X)
        loss = criterion(outputs, Y)
        loss.backward()
        optimizer.step()
        
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), model_path)
    
def predict(model_path: str, demand_scale: float, weather_penalty: float, capacity_drop: float) -> tuple[float, float]:
    """
    Runs a forward pass to instantly predict KPIs.
    """
    if not Path(model_path).exists():
        return (0.0, 0.0)
        
    model = SurrogateMLP()
    model.load_state_dict(torch.load(model_path))
    model.eval()
    
    with torch.no_grad():
        x = torch.tensor([[demand_scale, weather_penalty, capacity_drop]], dtype=torch.float32)
        out = model(x)
        
    return out[0][0].item(), out[0][1].item()
