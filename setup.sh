#!/usr/bin/env bash

# Bash Setup Script for Docker Express Template

echo "🚀 Setting up Docker Express Template..."

# 1. Install npm dependencies locally
echo "📦 Installing npm dependencies..."
npm install

# 2. Check if Docker is running
echo "🐳 Checking Docker status..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running or not installed! Please start Docker and run this script again."
    exit 1
fi

# 3. Build and spin up containers
echo "🛠️  Building and starting Docker containers (Express, MySQL, phpMyAdmin)..."
docker compose up -d --build

# 4. Summary
echo ""
echo "✅ Setup complete! All services are up and running."
echo "  - Express API:     http://localhost:8000"
echo "  - DB Test Route:   http://localhost:8000/db-test"
echo "  - phpMyAdmin UI:   http://localhost:8080 (User: root, Pass: root_password)"
echo ""
echo "To view logs: npm run docker:logs or 'docker compose logs -f'"
echo "To stop services: npm run docker:down or 'docker compose down'"
