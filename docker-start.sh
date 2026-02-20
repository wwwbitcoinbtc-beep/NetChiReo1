#!/bin/bash
# NetChi - Quick Docker Start Script

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🐳 NetChi Docker Launcher                   ║"
echo "║                  نت چی - سامانه جامع کافی‌نت                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Kill existing processes on ports
echo "🔍 Checking ports..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "serve -s dist" 2>/dev/null || true
sleep 2

# Start Docker Compose
echo "🚀 Starting Docker services..."
echo ""

cd "$(dirname "$0")"

docker-compose down --remove-orphans 2>/dev/null || true
sleep 3

# Start services
docker-compose up -d

# Wait for SQL Server
echo "⏳ Waiting for SQL Server to start..."
sleep 15

# Start frontend (if it didn't start automatically)
docker start netchi-frontend 2>/dev/null || true
sleep 10

# Show status
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ All Services Running! ✅                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🌐 Access Points                            ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  Frontend:  http://localhost:3000                              ║"
echo "║  Backend:   http://localhost:5232                              ║"
echo "║  Health:    http://localhost:5232/health                       ║"
echo "║  Database:  localhost:1433                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Useful Commands:"
echo ""
echo "  View logs:              docker-compose logs -f"
echo "  Backend logs:           docker-compose logs -f backend"
echo "  Frontend logs:          docker-compose logs -f frontend"
echo "  Database logs:          docker-compose logs -f sqlserver"
echo ""
echo "  Stop all services:      docker-compose down"
echo "  Restart services:       docker-compose restart"
echo "  Rebuild images:         docker-compose build --no-cache"
echo ""
echo "📁 Project Structure:"
echo ""
echo "  ├── frontend/           (React + Vite application)"
echo "  ├── backend/            (ASP.NET Core API)"
echo "  ├── docker-compose.yml  (Orchestration)"
echo "  ├── Dockerfile.frontend (Frontend container)"
echo "  └── backend/Dockerfile  (Backend container)"
echo ""

# Open browser
echo "🌍 Opening frontend in browser..."
sleep 2

if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
elif command -v start > /dev/null; then
    start http://localhost:3000
fi

echo ""
echo "✅ Setup complete! Press Ctrl+C to stop services."
echo ""

# Keep running
docker-compose logs -f
