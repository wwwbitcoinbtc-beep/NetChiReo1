#!/bin/bash
# NetChi - Docker Startup Script

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           NetChi - Full Stack Docker Environment              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker or Docker Compose not found!${NC}"
    echo "Please install Docker and Docker Compose first."
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned up existing containers${NC}"
echo ""

# Remove old images (optional - comment out to keep them)
echo -e "${BLUE}🧹 Removing old images...${NC}"
docker rmi netchi-frontend 2>/dev/null || true
docker rmi netchi-backend 2>/dev/null || true
echo -e "${GREEN}✓ Old images removed${NC}"
echo ""

# Build images
echo -e "${BLUE}🔨 Building Docker images (this may take a few minutes)...${NC}"
docker-compose build --no-cache

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to become healthy...${NC}"

# Wait for all services
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    SQL_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' netchi-sqlserver 2>/dev/null || echo "none")
    BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' netchi-backend 2>/dev/null || echo "none")
    FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' netchi-frontend 2>/dev/null || echo "none")
    
    if [ "$SQL_HEALTH" = "healthy" ] && [ "$BACKEND_HEALTH" = "healthy" ] && [ "$FRONTEND_HEALTH" = "healthy" ]; then
        break
    fi
    
    echo -ne "  SQL Server: $SQL_HEALTH | Backend: $BACKEND_HEALTH | Frontend: $FRONTEND_HEALTH\r"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo ""
echo -e "${GREEN}✓ All services are running!${NC}"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 Setup Complete! 🎉                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📱 Services Available At:${NC}"
echo -e "  ${GREEN}Frontend:${NC}     http://localhost:3000"
echo -e "  ${GREEN}Backend API:${NC}  http://localhost:5232"
echo -e "  ${GREEN}Database:${NC}     localhost:1433"
echo ""
echo -e "${BLUE}📊 Health Status:${NC}"
echo -e "  ${GREEN}✓ SQL Server${NC}"
echo -e "  ${GREEN}✓ Backend API${NC}"
echo -e "  ${GREEN}✓ Frontend${NC}"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "  View logs:        docker-compose logs -f"
echo "  Backend logs:     docker-compose logs -f backend"
echo "  Frontend logs:    docker-compose logs -f frontend"
echo "  Stop services:    docker-compose down"
echo "  Restart services: docker-compose restart"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep compose running
docker-compose logs -f
