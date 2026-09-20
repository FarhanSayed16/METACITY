Write-Host "Starting METACITY (Local Terminal Mode)..." -ForegroundColor Cyan

Write-Host "Starting METACITY Backend..." -ForegroundColor DarkCyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:PYTHONPATH='.'; python -m uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload"

Write-Host "Starting METACITY Frontend..." -ForegroundColor DarkCyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host "METACITY is starting up in new windows!" -ForegroundColor Green
Write-Host "Frontend will be at http://localhost:5173" -ForegroundColor Green
Write-Host "API will be at http://localhost:8001" -ForegroundColor DarkGray
