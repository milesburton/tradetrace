# Getting Started: Deploy tradetrace to Fly.io

Follow these steps to deploy tradetrace to Fly.io's free tier (costs $0/month).

## Prerequisites (5 minutes)

- [ ] **Fly.io Account** — Sign up at [fly.io](https://fly.io) (free)
- [ ] **Flyctl CLI** — Download from [fly.io/docs/hands-on/install-flyctl/](https://fly.io/docs/hands-on/install-flyctl/)
- [ ] **Git** — Clone this repo

### Verify Installation

```bash
flyctl version
flyctl auth whoami  # Should show your Fly.io username
```

If not authenticated, run:
```bash
flyctl auth login
```

## Step 1: Prepare Environment (5 minutes)

Get API keys:

1. **Infura Key** (for Ethereum Sepolia testnet):
   - Visit [infura.io](https://infura.io)
   - Sign up (free)
   - Create a project
   - Copy API key

2. **Ethereum Contract** (optional, for blockchain):
   - Deploy `contracts/TradetraceReviewRegistry.sol` to Sepolia
   - OR leave blank to skip blockchain for now
   - See [docs/BLOCKCHAIN.md](./BLOCKCHAIN.md) for details

## Step 2: Deploy (2 minutes)

```bash
cd tradetrace

# Automated deployment script
chmod +x scripts/deploy-fly.sh
./scripts/deploy-fly.sh

# OR manual deployment
flyctl launch --name tradetrace --region lhr
flyctl secrets set DB_PASSWORD=secure_password
flyctl secrets set NEO4J_PASSWORD=secure_password
flyctl secrets set INFURA_KEY=your_infura_key
flyctl deploy
```

The script prompts for:
- **DB_PASSWORD** — PostgreSQL password (make it strong!)
- **NEO4J_PASSWORD** — Neo4j password
- **INFURA_KEY** — From infura.io
- **ETH_CONTRACT_ADDRESS** — (optional) Smart contract address
- **ETH_PRIVATE_KEY** — (optional) Your Ethereum account key

**Never hardcode secrets in code.** Always use `flyctl secrets set`.

## Step 3: Verify Deployment (3 minutes)

```bash
# Check deployment status
flyctl status -a tradetrace

# View logs
flyctl logs -a tradetrace -f

# Test health endpoint
curl https://tradetrace.fly.dev/api/health
# Should return: {"status":"ok"}
```

Expected output:
```
{
  "status": "ok"
}
```

## Step 4: Test API (5 minutes)

```bash
# Create a tradesman
curl -X POST https://tradetrace.fly.dev/api/tradesmen \
  -H "Content-Type: application/json" \
  -d '{"business_name":"John Plumbing","trade_category":"plumbing"}'

# Response:
# {"id":1,"user_id":1,"business_name":"John Plumbing",...}

# Submit a review
curl -X POST https://tradetrace.fly.dev/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"tradesman_id":1,"reviewer_id":2,"rating":5,"text":"Great work!"}'

# Get review with blockchain status
curl https://tradetrace.fly.dev/api/reviews/1/blockchain
```

## Step 5: Configure CI/CD (Optional, 3 minutes)

Automatic deploys on push to `main`:

1. Get your Fly API token:
   ```bash
   flyctl auth token
   ```

2. Add to GitHub Secrets:
   - Go to GitHub repo → Settings → Secrets → New repository secret
   - Name: `FLY_API_TOKEN`
   - Value: (paste token)

3. Push to main:
   ```bash
   git push origin main
   # GitHub Actions automatically deploys!
   ```

## Troubleshooting

### "flyctl command not found"
→ Install flyctl: https://fly.io/docs/hands-on/install-flyctl/

### "Not authenticated"
→ Run `flyctl auth login`

### "Deployment failed"
→ Check logs: `flyctl logs -a tradetrace -f`

### "Health check failing"
→ SSH in: `flyctl ssh console -a tradetrace`
→ Test manually: `curl http://localhost:3000/api/health`

### "Out of memory"
→ Free tier has 256MB per VM. Check if Neo4j or Postgres needs optimization.

## What You Get (Free Tier)

| Resource | Limit | Status |
| --- | --- | --- |
| Compute | 3 shared-cpu-1x (256MB RAM each) | ✅ Free |
| Database (Postgres) | 3GB storage | ✅ Free |
| Graph (Neo4j) | Self-hosted community | ✅ Free |
| Bandwidth | 160GB/month | ✅ Free |
| SSL/HTTPS | Automatic | ✅ Free |
| **Total Cost** | — | **$0/month** |

## Live Demo

Once deployed, your app is live at:
```
https://tradetrace.fly.dev
```

Share this URL! It's publicly accessible.

## Next Steps

1. ✅ **Deployed** — tradetrace is live
2. 📱 **Frontend** — Build React UI (see docs/FRONTEND.md)
3. 🔗 **Domain** — Point custom domain (optional)
4. 📊 **Monitoring** — Set up alerts in Fly dashboard
5. 🚀 **Scale** — Upgrade if traffic increases

## Useful Commands

```bash
# View app dashboard
flyctl open -a tradetrace

# SSH into machine
flyctl ssh console -a tradetrace

# View recent deployments
flyctl releases -a tradetrace

# Rollback to previous deployment
flyctl releases rollback -a tradetrace

# View secrets (redacted)
flyctl secrets list -a tradetrace

# Update a secret
flyctl secrets set KEY=value -a tradetrace

# View metrics
flyctl status -a tradetrace --detailed

# Scale to multiple regions
flyctl scale count 2 -a tradetrace

# Check database backups
flyctl postgres backups list tradetrace-db
```

## Support

- **Fly.io Docs**: https://fly.io/docs/
- **Tradetrace Docs**: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: https://github.com/milesburton/tradetrace/issues

---

**You're done!** 🎉 tradetrace is now live and publicly accessible.
