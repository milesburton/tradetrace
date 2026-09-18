# Deployment Guide

tradetrace is deployed on **Fly.io** free tier for public access.

## Quick Start

### Prerequisites

1. **Fly.io Account** — Sign up at [fly.io](https://fly.io)
2. **Flyctl CLI** — Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/)
3. **GitHub Secrets** — For CI/CD automated deploys

### One-Time Setup

```bash
# 1. Authenticate with Fly
flyctl auth login

# 2. Create app
cd tradetrace
flyctl launch --name tradetrace

# 3. Create Postgres database
flyctl postgres create --name tradetrace-db
flyctl postgres attach tradetrace-db

# 4. Set secrets
flyctl secrets set DB_PASSWORD=your_secure_password
flyctl secrets set NEO4J_PASSWORD=your_secure_password
flyctl secrets set INFURA_KEY=your_infura_key
flyctl secrets set ETH_CONTRACT_ADDRESS=0x...
flyctl secrets set ETH_PRIVATE_KEY=0x...

# 5. Deploy
flyctl deploy
```

## Architecture

### Free Tier Specs

| Component | Tier | Limit |
| --- | --- | --- |
| **App VMs** | Free | 3 shared-cpu-1x (256MB RAM each) across 3 regions |
| **Postgres** | Free | 3GB storage, 1 shared instance |
| **Neo4j** | Self-hosted | In Docker container (community edition) |
| **Bandwidth** | Free | 160GB/month (ample for demo) |
| **Cost** | Free | $0 (no paid add-ons) |

### Service Deployment

**Single Docker container** runs:
- Deno API server (port 3000)
- Postgres database (port 5432)
- Neo4j graph database (port 7687)

All services in one Fly.io app for free tier efficiency.

### Regions

Fly deploys to 3 regions for resilience:
- **lhr** (London) — primary
- **ams** (Amsterdam) — replica
- **syd** (Sydney) — replica

Auto-failover if one region goes down.

## Configuration

### Environment Variables

Set via `flyctl secrets`:

```bash
# Database
DB_PASSWORD=secure_password
NEO4J_PASSWORD=secure_password

# Ethereum
INFURA_KEY=your_infura_key  # Free from infura.io
ETH_CONTRACT_ADDRESS=0x...
ETH_PRIVATE_KEY=0x...        # Account must have Sepolia ETH

# Server
PORT=3000
ENVIRONMENT=production
LOG_LEVEL=info
```

**Never commit secrets to GitHub.** Use `flyctl secrets` instead.

### Health Checks

Fly monitors `/api/health` every 30 seconds. If unhealthy for 3+ checks, restarts the VM.

```
GET https://tradetrace.fly.dev/api/health
→ { "status": "ok" }
```

## Deployment Methods

### Method 1: CLI Deploy

```bash
# Deploy directly
flyctl deploy

# View logs
flyctl logs

# SSH into VM (debugging)
flyctl ssh console
```

### Method 2: GitHub Actions (Recommended)

Automatic deploys on every push to `main`:

1. **Add Fly API token to GitHub Secrets**
   ```bash
   flyctl auth token
   # Copy token and add as GitHub secret: FLY_API_TOKEN
   ```

2. **Push to main** → GitHub Actions deploys automatically

3. **View deployment**
   ```bash
   flyctl status
   flyctl logs -f
   ```

## Monitoring

### Fly Dashboard

- https://fly.io/apps/tradetrace
- View app status, metrics, logs
- Scale instances, manage secrets

### Logs

```bash
# Stream logs
flyctl logs -f

# Search logs
flyctl logs --json | grep error

# Historical logs
flyctl logs --lines 100
```

### Metrics

- CPU usage
- Memory usage
- Request count
- Error rate
- Data transfer

Available in Fly dashboard.

## Scaling

### Free Tier Limits

- **3 shared VMs maximum** (auto-scaled across regions)
- **160GB bandwidth/month** (~3,200 requests/second avg)
- **3GB Postgres storage**

### If You Hit Limits

Option 1: **Upgrade to paid tier** (shared-cpu-2x, more bandwidth)
```bash
flyctl scale count 2  # Scale up
```

Option 2: **Optimize** (recommended first)
- Cache frequently requested data
- Compress responses
- Batch blockchain recordings

## Troubleshooting

### App Won't Deploy

```bash
# Check build logs
flyctl deploy --verbose

# Common issues:
# 1. Secret not set → flyctl secrets list
# 2. Dockerfile error → docker build . locally
# 3. Fly region issues → flyctl regions available
```

### Database Connection Failed

```bash
# Check Postgres status
flyctl postgres status tradetrace-db

# Reconnect
flyctl postgres attach tradetrace-db

# Check DATABASE_URL is set
flyctl secrets list | grep DATABASE
```

### Health Check Failing

```bash
# SSH and debug
flyctl ssh console

# Inside VM:
curl http://localhost:3000/api/health
curl http://neo4j:7687  # Check Neo4j
psql postgresql://postgres:$DB_PASSWORD@localhost:5432/tradetrace  # Check Postgres
```

### Out of Memory

```bash
# Increase instance size
flyctl scale memory 512

# OR downsize data:
# - Archive old reviews to external storage
# - Reduce Postgres retention
# - Optimize Neo4j indexes
```

## Maintenance

### Database Backups

Fly Postgres has **automatic daily backups**:

```bash
# List backups
flyctl postgres backups list tradetrace-db

# Restore from backup
flyctl postgres restore tradetrace-db -b <backup-id>
```

### Updates

```bash
# Update dependencies
git pull origin main

# Deploy new version
flyctl deploy

# Rollback if needed
flyctl releases
flyctl releases rollback <release-id>
```

### Zero-Downtime Deployments

Fly handles traffic during deploys:
- Rolling restart (one VM at a time)
- Health checks before traffic rerouting
- No request loss

## Cost Optimization

### Current Cost

- **Free tier**: $0/month
- **Postgres**: Included in free tier
- **Neo4j**: Self-hosted (no cost)
- **Ethereum**: Infura free tier (no cost)

### If You Need Paid Features

| Need | Solution | Cost |
| --- | --- | --- |
| More bandwidth | Upgrade to standard tier | ~$5/mo + bandwidth |
| Faster Postgres | Dedicated Postgres | $7-15/mo |
| Faster Neo4j | Neo4j Aura | $10-50/mo |
| Private networking | Wireguard tunnel | $10/mo |

**Recommendation**: Stay on free tier for demo. Upgrade individual components only if needed.

## Production Considerations

### Before Going Live

- [ ] Set up SSL certificate (automatic via Fly)
- [ ] Configure custom domain (optional)
- [ ] Enable security headers
- [ ] Set up rate limiting (in Deno app)
- [ ] Monitor logs and metrics
- [ ] Backup database strategy
- [ ] Disaster recovery plan

### Performance Optimization

```bash
# Monitor response times
flyctl logs --json | jq '.timestamp, .message'

# Identify slow endpoints
flyctl metrics
```

### Security

- Secrets never in code (use flyctl secrets)
- SSH access restricted (GitHub SSH keys only)
- Firewall rules (internal communication only)
- Regular security updates

## Support

- **Fly.io Docs**: https://fly.io/docs/
- **Community**: https://community.fly.io/
- **Issues**: Report in [tradetrace GitHub](https://github.com/milesburton/tradetrace/issues)

## Next Steps

- [ ] Get Fly.io free account
- [ ] Set up Postgres database
- [ ] Add GitHub secret for CI/CD
- [ ] Deploy main branch
- [ ] Verify at tradetrace.fly.dev
- [ ] Configure custom domain (optional)

---

**Deployed app**: https://tradetrace.fly.dev
