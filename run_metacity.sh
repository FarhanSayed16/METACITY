#!/bin/bash
echo "Starting METACITY (api + worker + frontend)..."
docker-compose up --build -d
echo "METACITY is running at http://localhost:5173"
echo "API: http://localhost:8000  |  Worker polls pending runs from shared DB volume"
