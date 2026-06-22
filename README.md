# GFMS — Goat Farm Management System

Backend-first MVP for livestock farm management.

## Project Structure

```
Goat Farm/
├── backend/          # Express API (implemented)
├── frontend/         # React SPA (deferred — Phase 15)
├── PRD.md
├── TDD.md
└── Instructions.md
```

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Set MONGO_URI and JWT_SECRET in .env
npm run seed
npm run dev
```

API: http://localhost:5000  
Swagger: http://localhost:5000/api/docs

See [backend/README.md](backend/README.md) for full documentation.
