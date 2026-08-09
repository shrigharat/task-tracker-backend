# Task Tracker Backend

A backend API for a task tracker application built with Hono.

## Tech Stack

- Hono (framework)
- Node.js (runtime)
- MongoDB (Mongoose)
- Redis
- RabbitMQ
- Zod for request validation

## Quick Start

1. Install dependencies

```sh
pnpm install
```

2. Create `.env` with required values (Mongo, Redis, JWT secrets, etc.). Set
   `CORS_ALLOWED_ORIGINS` to a comma-separated allowlist of frontend origins:

```sh
# Local development
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Multiple environments/domains
CORS_ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
```

Origins must match the browser's `Origin` header exactly (including scheme and port).

3. Run in development

```sh
pnpm dev
```

The server starts on the configured `PORT` (default: `4000`).

## API requests

Endpoints that accept a request body use JSON. For example, registration and login
requests must send `Content-Type: application/json`:

```json
{
  "email": "person@example.com",
  "password": "a-secure-password"
}
```

`GET /auth/me` requires the authenticated session cookie and returns the current
user's safe profile fields (`id` and `email`).

## Notes

- Deferred improvement items are tracked in `TODO.md`.
