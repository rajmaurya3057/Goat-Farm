# GFMS Deployment Guide

## Production Stack

| Component | Service |
|-----------|---------|
| Backend API | Render or Railway |
| Database | MongoDB Atlas |
| Images | Cloudinary |

## Environment Variables (Production)

Set these in your hosting dashboard:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/gfms
JWT_SECRET=<64+ char random hex>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your key>
CLOUDINARY_API_SECRET=<your secret>
CLIENT_URL=https://your-frontend-domain.com
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## MongoDB Atlas

1. Create a free/paid cluster
2. Create a database user with read/write access to `gfms`
3. Network Access: allow your server IP (or `0.0.0.0/0` for Render/Railway dynamic IPs)
4. Enable daily backups (30-day retention recommended)

## Render Deployment

1. Connect GitHub repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables
6. After deploy, run seed once via Render shell: `npm run seed`

## Railway Deployment

1. New project from repo, set root to `backend`
2. Add environment variables
3. Deploy triggers on push
4. Run `npm run seed` once via Railway CLI or shell

## Post-Deploy Verification

```bash
curl https://your-api.onrender.com/health
curl https://your-api.onrender.com/ready
```

MVP checklist:
- [ ] Authentication works (login returns JWT)
- [ ] RBAC enforced (Staff cannot delete goats)
- [ ] Goat CRUD + weight tracking
- [ ] Medicine CRUD + auto status
- [ ] Vaccination + Treatment CRUD
- [ ] Alerts generated (cron running)
- [ ] Swagger at `/api/docs`
- [ ] Cloudinary upload works

## Frontend (Phase 15)

Deploy React SPA to Vercel when ready. Set `VITE_API_BASE_URL` to production API URL and add the Vercel domain to `CLIENT_URL` CORS.
