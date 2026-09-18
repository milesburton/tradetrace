#!/bin/bash
# Deploy tradetrace to Fly.io free tier
# Usage: ./scripts/deploy-fly.sh

set -e

echo "🚀 tradetrace Fly.io Deployment Script"
echo "========================================="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Install with:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if authenticated
if ! flyctl auth whoami &> /dev/null; then
    echo "⚠️  Not authenticated with Fly.io"
    echo "Run: flyctl auth login"
    exit 1
fi

APP_NAME=${1:-tradetrace}
REGION=${2:-lhr}

echo "📦 App Name: $APP_NAME"
echo "🌍 Primary Region: $REGION"
echo ""

# 1. Check if app exists
if flyctl apps list | grep -q "$APP_NAME"; then
    echo "✅ App '$APP_NAME' already exists"
else
    echo "🆕 Creating app '$APP_NAME'..."
    flyctl launch --name "$APP_NAME" --region "$REGION" --no-deploy
fi

echo ""
echo "🔑 Setting secrets..."
echo ""
echo "You will be prompted for the following values:"
echo "  • DB_PASSWORD (PostgreSQL password)"
echo "  • NEO4J_PASSWORD (Neo4j password)"
echo "  • INFURA_KEY (get free key from infura.io)"
echo "  • ETH_CONTRACT_ADDRESS (deployed contract address, leave blank if not deployed)"
echo "  • ETH_PRIVATE_KEY (account private key, leave blank if not using blockchain)"
echo ""

read -p "Enter DB_PASSWORD: " -s db_pass
echo ""
flyctl secrets set -a "$APP_NAME" "DB_PASSWORD=$db_pass"

read -p "Enter NEO4J_PASSWORD: " -s neo_pass
echo ""
flyctl secrets set -a "$APP_NAME" "NEO4J_PASSWORD=$neo_pass"

read -p "Enter INFURA_KEY (leave blank to skip): " -r infura_key
if [ -n "$infura_key" ]; then
    flyctl secrets set -a "$APP_NAME" "INFURA_KEY=$infura_key"
fi

read -p "Enter ETH_CONTRACT_ADDRESS (leave blank to skip): " eth_contract
if [ -n "$eth_contract" ]; then
    flyctl secrets set -a "$APP_NAME" "ETH_CONTRACT_ADDRESS=$eth_contract"
fi

read -p "Enter ETH_PRIVATE_KEY (leave blank to skip): " -s eth_key
echo ""
if [ -n "$eth_key" ]; then
    flyctl secrets set -a "$APP_NAME" "ETH_PRIVATE_KEY=$eth_key"
fi

echo ""
echo "🚀 Deploying to Fly.io..."
flyctl deploy -a "$APP_NAME"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Live at: https://$APP_NAME.fly.dev"
echo ""
echo "Quick commands:"
echo "  • View logs:    flyctl logs -a $APP_NAME -f"
echo "  • SSH access:   flyctl ssh console -a $APP_NAME"
echo "  • View status:  flyctl status -a $APP_NAME"
echo "  • Rollback:     flyctl releases -a $APP_NAME"
echo ""
