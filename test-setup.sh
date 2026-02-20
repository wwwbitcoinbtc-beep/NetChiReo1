#!/bin/bash
# 🚀 Quick Start Script for NetChi Testing
# Usage: bash test-setup.sh

echo "🎯 NetChi Testing Environment Setup"
echo "===================================="
echo ""

# Check if Backend is running
echo "1️⃣  Checking Backend status..."
BACKEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://localhost:5001/api/v1/health 2>/dev/null || echo "offline")

if [ "$BACKEND_CHECK" = "200" ]; then
    echo "✅ Backend is running (HTTP 200)"
else
    echo "⚠️  Backend appears to be offline"
    echo "   To start: cd backend && dotnet run"
fi

echo ""

# Check Frontend
echo "2️⃣  Checking Frontend..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Frontend is not running"
    echo "   To start: npm run dev"
fi

echo ""

# Check npm packages
echo "3️⃣  Checking npm packages..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists ($(ls -1 node_modules | wc -l) packages)"
else
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
fi

echo ""

# Check TypeScript
echo "4️⃣  Checking TypeScript compilation..."
if npm run build 2>&1 | grep -q "built successfully"; then
    echo "✅ TypeScript build successful"
else
    echo "⚠️  TypeScript has errors (run: npm run build)"
fi

echo ""
echo "===================================="
echo "✅ Setup Check Complete!"
echo ""
echo "📖 Testing Guide: cat TESTING_GUIDE.md"
echo "🚀 Next: Open http://localhost:3000"
