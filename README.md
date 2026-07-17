# Wayne — Gym Tracker

Offline-first PWA for Harsh's body-recomposition program.

## Setup

```bash
npm install
cp .env.example .env.local   # then set MONGODB_URI
npm run dev
```

## Test / build

```bash
npm test
npm run build
```

## Deploy (Vercel)

Set `MONGODB_URI` in Vercel project env vars, then deploy. The service worker
is generated at build time; installability works from the deployed URL.
