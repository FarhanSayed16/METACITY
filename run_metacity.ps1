Write-Host "Starting METACITY (api + worker + frontend)..." -ForegroundColor Cyan
docker-compose up --build -d
Write-Host "METACITY is running at http://localhost:5173" -ForegroundColor Green
Write-Host "API: http://localhost:8000  |  Worker polls pending runs from shared DB volume" -ForegroundColor DarkGray
