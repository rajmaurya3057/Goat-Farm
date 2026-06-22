# Goat Farm Management System (GFMS) — Backend API

Centralized digital platform for managing goat records, health history, medicine inventory, vaccinations, treatments, and automated alerts.

## Tech Stack

- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication + RBAC
- Cloudinary (image uploads)
- Winston (logging)
- node-cron (daily alert generation)
- Swagger UI at `/api/docs`

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and Cloudinary credentials
npm run seed   # Creates first admin user + default settings
npm run dev    # Development with nodemon
```

## Default Admin (after seed)

- Email: `admin@goatfarm.com`
- Password: `Password123` (change in production)

## API Endpoints

| Module | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` (Admin only) |
| Goats | `/api/goats` |
| Medicines | `/api/medicines` |
| Vaccinations | `/api/vaccinations` |
| Treatments | `/api/treatments` |
| Alerts | `/api/alerts` |
| Settings | `/api/settings` |
| Upload | `/api/upload` |

Health: `GET /health` | Readiness: `GET /ready`

## Roles

- **ADMIN** — Full access
- **STAFF** — View/edit goats, record weights & treatments
- **VETERINARIAN** — Vaccinations & treatments, view health history

## Testing

```bash
npm test
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Render/Railway + MongoDB Atlas instructions.

## Postman

Import `postman/collection.json` and `postman/environment.json`.
