# Boulot Monorepo

Boulot is an automated zero-friction talent marketplace designed to connect students with real-world projects from SMEs.

## Architecture

This is a monolithic repository using **npm workspaces**.

- `apps/web`: Next.js frontend (App Router, Tailwind CSS, PWA ready)
- `apps/server`: Express.js backend (REST API, MongoDB, clean layered architecture)
- `packages/types`: Shared domain interfaces and enums
- `packages/utils`: Shared Zod validation schemas and constants
- `packages/ui`: Shared React UI components
- `config/`: Shared ESLint and TypeScript configuration

## Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Shared Packages**
   ```bash
   npm run build
   ```

3. **Start the Development Servers**
   ```bash
   npm run dev
   ```
   *Frontend will run on http://localhost:3000*  
   *Backend will run on http://localhost:3001*

## Database Seeding

You can populate the database with demo users (Student, SME, Mentor) and demo projects using the seed script:

```bash
npm run seed
```

## Mocked Services

For the MVPs, third-party integrations are cleanly mocked using a service pattern:
- **GitHubService**: Mocks repository provisioning and webhooks.
- **MoMoService**: Mocks Mobile Money escrow deposits and releases.
- **IremboService**: Mocks National ID background verification.

## Technology Stack

- **TypeScript** across the entire stack.
- **Backend**: Express, Mongoose, Zod.
- **Frontend**: Next.js, React, Tailwind CSS.

## Monorepo Rules

- Do not add business logic to UI components.
- Put shared utilities in `packages/utils`.
- Only `apps/web` and `apps/server` should be deployed as independent services.
