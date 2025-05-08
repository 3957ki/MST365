#!/bin/bash
set -e

echo "🔧 Setting up apt sources..."
echo -e "deb http://deb.debian.org/debian bullseye main\n\
deb http://security.debian.org/ bullseye-security main\n\
deb http://deb.debian.org/debian bullseye-updates main" > /etc/apt/sources.list

echo "Running apt update & upgrade..."
apt update
apt upgrade -y

echo "Installing Python 3, venv, pip..."
apt install python3 python3-venv python3-pip -y

echo "Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

echo "Installing uv..."
pip install uv --break-system-packages

echo "Syncing uv dependencies..."
uv sync

# --- Playwright 준비: 캐시 위치 고정 ---
cd mcp
npm install

# 워크스페이스 안에 브라우저 바이너리 보관
export PLAYWRIGHT_BROWSERS_PATH=./.playwright-browsers

npx playwright install --with-deps chromium

cd ..

echo "Environment setup complete!"
