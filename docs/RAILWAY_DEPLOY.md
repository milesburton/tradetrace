# Deploy tradetrace on Railway.app (Simple)

Railway.app is the easiest way to deploy tradetrace with zero command-line setup.

## Step-by-Step (5 minutes)

### 1. Go to Railway.app
```
https://railway.app
```

### 2. Sign Up (GitHub login is easiest)
- Click "Sign up"
- Choose "Continue with GitHub"
- Authorize Railway

### 3. Create New Project
- Click "Create"
- Choose "Deploy from GitHub repo"

### 4. Connect Your GitHub Account
- Click "Connect GitHub account" if not already connected
- Authorize Railway to access your repos

### 5. Select tradetrace Repo
- Find and click `milesburton/tradetrace`
- Choose branch: `main`
- Click "Deploy"

### 6. Add Environment Variables
Once deployment starts, click on the app card and go to "Variables":

Add these:
```
DATABASE_URL = postgresql://postgres:password@postgres:5432/tradetrace
NEO4J_URI = bolt://neo4j:7687
NEO4J_USER = neo4j
NEO4J_PASSWORD = password
INFURA_KEY = your_infura_key_here (optional)
ETH_CONTRACT_ADDRESS = (leave blank if no blockchain yet)
ETH_PRIVATE_KEY = (leave blank if no blockchain yet)
```

### 7. Wait for Deployment
- Railway automatically builds and deploys
- You'll see logs streaming in real-time
- Once green checkmark appears, it's live

### 8. Get Your URL
- Click the app name
- Look for "Public URL" or "Deployments"
- Your URL will be something like: `https://tradetrace-production.up.railway.app`

**That's it!** Your app is now live. 🎉

## What You Get (Railway Free Tier)

| Feature | Limit |
| --- | --- |
| Compute | $5/month credit (usually free for small projects) |
| Databases | Included |
| Public URL | Free |
| SSL/HTTPS | Automatic |
| Bandwidth | Included |

**Cost: Free or very cheap** ($5 credit/month for most small demos)

## Testing Your Deployment

Once live, test with:

```bash
# Replace with your actual URL
RAILS_URL="https://your-railway-url.up.railway.app"

# Health check
curl $RAILS_URL/api/health

# Create tradesman
curl -X POST $RAILS_URL/api/tradesmen \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Test","trade_category":"plumbing"}'
```

## Adding a Database

Railway can add Postgres/MongoDB automatically:

1. Click your project
2. Click "Create" → "Database"
3. Choose "PostgreSQL"
4. It auto-creates `DATABASE_URL` variable
5. Redeploy (automatic)

## If Something Goes Wrong

### Logs
- Click app → "Logs" tab
- See real-time errors
- Usually tells you exactly what's wrong

### Redeploy
- Click "Deployments"
- Click "Deploy" on the latest commit
- Or push new code to `main` (auto-redeploys)

### Reset
- Delete the project, start over (takes 2 minutes)

## GitHub Auto-Deploy

Once deployed:
- Every push to `main` automatically redeploys
- See deployments in Railway dashboard
- Rollback to previous version if needed

## Custom Domain (Optional)

To use `tradetrace.milesburton.com`:

1. Click project → "Settings"
2. Add custom domain
3. Update DNS at your domain registrar
4. Railway handles SSL automatically

## Troubleshooting

| Problem | Solution |
| --- | --- |
| "App won't start" | Check logs tab |
| "Database connection failed" | Add DATABASE_URL variable |
| "Port already in use" | Railway assigns PORT automatically |
| "Out of memory" | Upgrade to paid tier (rarely needed) |

## Cost Comparison

| Platform | Cost | Setup |
| --- | --- | --- |
| **Railway** | Free-$5/mo | 5 min (this guide) |
| Fly.io | Free (complex) | 15 min |
| Heroku | $7+/mo | 10 min |
| Replit | Free | 3 min |

Railway is the sweet spot: simple AND free.

## Next Steps

1. ✅ Deploy to Railway (this guide)
2. ✅ Test API endpoints
3. ⏭️ Add React frontend (Phase 2)
4. ⏭️ Scale if traffic increases (paid tier)

---

**Done!** Your tradetrace is now live and publicly accessible. 🚀

Share your Railway URL with anyone.
