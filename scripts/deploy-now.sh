#!/bin/bash
# One-command deployment to Fly.io
# This script handles everything: flyctl install, auth, secrets, deploy

set -e

APP_NAME="tradetrace"
REGION="lhr"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 tradetrace Fly.io Deployment                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check OS and install flyctl if needed
echo -e "${BLUE}[1/7]${NC} Checking flyctl..."
if ! command -v flyctl &> /dev/null; then
    echo -e "${YELLOW}→ Installing flyctl...${NC}"
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

flyctl_version=$(flyctl version)
echo -e "${GREEN}✓${NC} flyctl $flyctl_version installed"
echo ""

# 2. Check authentication
echo -e "${BLUE}[2/7]${NC} Checking Fly.io authentication..."
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}→ Not authenticated. Opening Fly.io login...${NC}"
    flyctl auth login
fi

user=$(flyctl auth whoami)
echo -e "${GREEN}✓${NC} Authenticated as: $user"
echo ""

# 3. Create or verify app
echo -e "${BLUE}[3/7]${NC} Setting up Fly.io app..."
if flyctl apps list | grep -q "$APP_NAME"; then
    echo -e "${GREEN}✓${NC} App '$APP_NAME' already exists"
else
    echo -e "${YELLOW}→ Creating app '$APP_NAME'...${NC}"
    flyctl launch --name "$APP_NAME" --region "$REGION" --no-deploy 2>/dev/null || true
    echo -e "${GREEN}✓${NC} App created"
fi
echo ""

# 4. Generate secure passwords
echo -e "${BLUE}[4/7]${NC} Generating secure credentials..."

# Generate random passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
NEO4J_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

echo -e "${YELLOW}→ Generated secure DB_PASSWORD${NC}"
echo -e "${YELLOW}→ Generated secure NEO4J_PASSWORD${NC}"
echo ""

# 5. Get Infura key
echo -e "${BLUE}[5/7]${NC} Configuring Ethereum integration..."
echo ""
echo "You need an Infura API key for Ethereum Sepolia testnet."
echo "Get one free at: https://infura.io"
echo ""
read -p "Enter your Infura API key (or press Enter to skip blockchain): " INFURA_KEY

if [ -z "$INFURA_KEY" ]; then
    echo -e "${YELLOW}⚠ Blockchain disabled (Infura key not provided)${NC}"
else
    echo -e "${GREEN}✓${NC} Infura key configured"
fi
echo ""

# 6. Set secrets on Fly.io
echo -e "${BLUE}[6/7]${NC} Uploading secrets to Fly.io..."
echo ""

flyctl secrets set \
  DB_PASSWORD="$DB_PASSWORD" \
  NEO4J_PASSWORD="$NEO4J_PASSWORD" \
  -a "$APP_NAME" \
  --stage

if [ -n "$INFURA_KEY" ]; then
    flyctl secrets set \
      INFURA_KEY="$INFURA_KEY" \
      -a "$APP_NAME" \
      --stage
fi

echo -e "${GREEN}✓${NC} Secrets uploaded"
echo ""

# 7. Deploy
echo -e "${BLUE}[7/7]${NC} Deploying to Fly.io..."
echo ""

cd "$(dirname "$0")/.."

flyctl deploy -a "$APP_NAME" --remote-only

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "║${GREEN}                    ✅ DEPLOYMENT COMPLETE${NC}                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get the app URL
APP_URL=$(flyctl open -a "$APP_NAME" --show-url 2>/dev/null || echo "https://$APP_NAME.fly.dev")

echo -e "${GREEN}🌍 Your app is live!${NC}"
echo ""
echo "    App URL:  $APP_URL"
echo "    API Base: $APP_URL/api"
echo ""
echo "Quick test:"
echo "    curl $APP_URL/api/health"
echo ""
echo "Credentials stored on Fly.io (not your machine):"
echo "    DB_PASSWORD:     (hidden)"
echo "    NEO4J_PASSWORD:  (hidden)"
if [ -n "$INFURA_KEY" ]; then
    echo "    INFURA_KEY:      (hidden)"
fi
echo ""

# Wait a moment for app to stabilize
echo "Waiting for app to be ready..."
sleep 5

# Test health endpoint
echo ""
echo "Testing API..."
if curl -f "$APP_URL/api/health" &> /dev/null; then
    echo -e "${GREEN}✓${NC} API is responding"
else
    echo -e "${YELLOW}⚠${NC} API not yet ready (may take a few moments)"
    echo "  Check status: flyctl status -a $APP_NAME"
    echo "  View logs:    flyctl logs -a $APP_NAME -f"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                       📚 NEXT STEPS                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Share the URL:"
echo "   $APP_URL"
echo ""
echo "2. Monitor the app:"
echo "   flyctl status -a $APP_NAME"
echo "   flyctl logs -a $APP_NAME -f"
echo ""
echo "3. Set up GitHub CI/CD (optional):"
echo "   a) Get Fly token: flyctl auth token"
echo "   b) Add to GitHub Secrets as FLY_API_TOKEN"
echo "   c) Push to main → auto-deploys!"
echo ""
echo "4. Visit the dashboard:"
echo "   https://fly.io/apps/$APP_NAME"
echo ""
echo "Docs:"
echo "   • Full guide:     docs/DEPLOYMENT.md"
echo "   • Quick start:    docs/GETTING_STARTED_FLY.md"
echo "   • Blockchain:     docs/BLOCKCHAIN.md"
echo ""
echo "Questions? See DEPLOYMENT_READY.md"
echo ""
