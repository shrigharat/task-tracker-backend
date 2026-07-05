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

2. Create `.env` with required values (Mongo, Redis, JWT secrets, etc.)

3. Run in development

```sh
pnpm dev
```

The server starts on the configured `PORT` (default: `4000`).

## Notes

- Deferred improvement items are tracked in `TODO.md`.
