# Walleo - NGN Wallet System

A full-stack fintech wallet application built with **NestJS** (backend) and **Next.js 16** (frontend), featuring user authentication with JWT tokens, 4-digit PIN transaction authorization, wallet operations (deposit, send, withdraw), and full transaction history. The UI is designed to match the OPay fintech experience.

**Important note:** This is a web application built with Next.js (not Flutter, not React Native). It runs entirely in a browser without requiring a mobile app installation.

## Problem Statement

Nigeria's fintech space is growing rapidly, but most digital wallet solutions are either closed platforms (like OPay and PalmPay) or complex mobile apps built with Flutter or React Native. There is a gap for a lightweight, web-based digital wallet that works instantly in a browser without requiring a mobile app installation. Many users need a simple way to register, set up a wallet, perform transactions (deposit, send, withdraw), and track their history across any device.

## Approach

**Phase 1 - Backend Architecture**
Built a RESTful API using NestJS, a progressive Node.js framework that provides a structured, modular architecture similar to Angular. The backend handles user authentication with JWT tokens, a 4-digit PIN system for transaction authorization, and CRUD operations for wallet balances and transaction records. TypeORM is used as the object-relational mapper to interact with a PostgreSQL database.

**Phase 2 - Frontend Migration**
The original application was a basic static HTML page. The entire frontend was migrated to Next.js 16, a React framework that enables client-side routing and component-based architecture. The UI was redesigned from scratch to match the OPay fintech aesthetic using Tailwind CSS for styling and Lucide React for icons.

**Phase 3 - Deployment**
The backend is deployed on Render with automatic deployments from GitHub. The frontend is served via Vercel, also auto-deploying from the same repository. The PostgreSQL database runs on Neon, a serverless Postgres provider that offers a free tier with no credit card required. CORS was configured to allow cross-origin requests between the frontend and backend.

## Key Decisions

- **Next.js over Flutter or React Native** — the goal is a web-based wallet accessible from any browser without installation
- **NestJS over Express** — for its structured module system, decorators, and built-in dependency injection
- **Tailwind CSS** — rapid UI development with utility classes
- **Neon PostgreSQL** — generous free tier suitable for development and small-scale production
- **Separate frontend/backend directories** — for independent scaling and deployment

## Features

- **JWT Authentication** — Register and login with bcrypt-hashed passwords
- **4-digit PIN** — Set a PIN after registration to authorize transactions
- **Wallet Operations** — Deposit, Send, and Withdraw NGN
- **Transaction History** — Full audit trail with unique UUID references
- **OPay-style UI** — Modern fintech interface with green gradient theme
- **Input Validation** — Request data validated before reaching business logic
- **Database Transactions** — Atomic operations with rollback on failure
- **Modular Architecture** — Organized into auth, user, wallet, and admin modules
- **Logout Confirmation** — Centered dialog with Yes/No before signing out
- **Transaction Filters** — Category and status filtering on transactions page

## Architecture

```
Backend (NestJS)                    Frontend (Next.js 16)
+-----------------------+           +-----------------------+
| Controller (Routes)   | <--CORS-->| Auth Screen           |
| Service (Logic)       |    API    | PIN Setup Screen      |
| JWT Strategy          |           | Dashboard             |
| TypeORM Entities      |           | Transactions Page     |
+----------+------------+           +-----------------------+
           |
    +------v------+
    | PostgreSQL   |
    | (Neon)       |
    +-------------+
```

## Tech Stack

### Backend

| Package | Purpose |
|---|---|
| **NestJS** | Backend framework - modules, controllers, services |
| **TypeORM** | ORM - database abstraction layer |
| **pg** | PostgreSQL database driver |
| **class-validator / class-transformer** | Input validation |
| **@nestjs/jwt** | JWT token generation |
| **passport / @nestjs/passport** | Authentication guard |
| **passport-jwt** | JWT token extraction and verification |
| **bcrypt** | Password hashing |
| **uuid** | Unique transaction reference IDs |

### Frontend

| Package | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **TypeScript** | Type safety throughout |

## Project Structure

```
wallet-app/
├── frontend/                  - Next.js frontend
│   └── src/app/
│       ├── globals.css        - Global styles
│       ├── layout.tsx         - Root layout
│       ├── page.tsx           - Main page (auth, PIN, dashboard)
│       └── transactions/
│           └── page.tsx       - Transactions history page
├── src/                       - NestJS backend
│   ├── main.ts                - Entry point with CORS
│   ├── app.module.ts          - Root module
│   ├── auth/                  - Authentication module
│   │   ├── auth.controller.ts - POST /auth/register, /auth/login, /auth/set-pin
│   │   ├── auth.service.ts    - Auth logic
│   │   ├── jwt.strategy.ts    - JWT verification
│   │   └── dto/auth.dto.ts    - Validation rules
│   ├── admin/                 - Admin module
│   ├── user/                  - User module
│   ├── wallet/                - Wallet module
│   └── notification/          - Email notification module
├── render.yaml                - Render Blueprint config
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**
- **PostgreSQL** (or a Neon account for cloud database)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/enoch-systems/wallet-app.git
cd wallet-app
```

2. Install backend dependencies:
```bash
npm install
```

3. Set up environment variables (create .env file):
```
DATABASE_URL=postgresql://your-db-connection-string
JWT_SECRET=your-secret-key
PORT=3000
```

4. Start the backend:
```bash
npm run start:dev
```

5. In a separate terminal, start the frontend:
```bash
cd frontend
npm install
npm run dev
```

6. Open **http://localhost:3001** in your browser.

## Live Demo

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://wallet-app-khaki-two.vercel.app |
| **Backend API (Render)** | https://wallet-app-xqtq.onrender.com |

> Note: Free instances spin down after inactivity. The first request may take up to 30 seconds to wake up.

## API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new account | No |
| `POST` | `/auth/login` | Log in and receive JWT token | No |
| `POST` | `/auth/set-pin` | Set 4-digit transaction PIN | Yes |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "secret123"
}
```

**Login Request:**
```json
{
  "email": "john@email.com",
  "password": "secret123"
}
```

**Set PIN Request:**
```json
{
  "pin": "1234"
}
```

**Response (register/login):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@email.com",
    "isAdmin": false
  }
}
```

### Wallet Operations

All wallet endpoints require the JWT token in the request header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/wallet/balance` | Get current balance |
| `POST` | `/wallet/deposit` | Add funds |
| `POST` | `/wallet/send` | Send money to a recipient |
| `POST` | `/wallet/withdraw` | Withdraw funds |
| `GET` | `/wallet/transactions` | View transaction history |

### Admin Operations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/stats` | Platform statistics |
| `GET` | `/admin/users` | List all users |
| `GET` | `/admin/wallets` | List all wallets |
| `GET` | `/admin/transactions` | List all transactions |

## Authentication Flow

```
Register -> bcrypt scrambles password -> stored in database
Login -> bcrypt compares input -> match? -> JWT token issued
Set PIN -> 4-digit PIN stored for transaction authorization
Every wallet request includes token in Authorization header
passport checks for token -> passport-jwt reads it -> valid? -> access granted
No token? -> 401 Unauthorized
```

## Testing with Postman

1. **Register** - `POST http://localhost:3000/auth/register`
2. **Login** - `POST http://localhost:3000/auth/login` (copy the token)
3. **Set PIN** - `POST http://localhost:3000/auth/set-pin` with token
4. **Balance (no auth)** - `GET http://localhost:3000/wallet/balance` (expect 401)
5. **Balance (with auth)** - `GET http://localhost:3000/wallet/balance` with `Authorization: Bearer TOKEN`
6. **Deposit** - `POST http://localhost:3000/wallet/deposit` with token
7. **Send** - `POST http://localhost:3000/wallet/send` with token
8. **Withdraw** - `POST http://localhost:3000/wallet/withdraw` with token
9. **Transactions** - `GET http://localhost:3000/wallet/transactions` with token

## Deployment

### Backend (Render)
- Auto-deploys from the main branch on GitHub
- Deployment configuration in `render.yaml`
- Environment variables set in Render dashboard

### Frontend (Vercel)
- Auto-deploys from the main branch on GitHub
- Root directory set to `frontend/`
- Build command: `npm run build`
- Output directory: `.next`

### Database (Neon)
- Serverless PostgreSQL
- Free tier with no credit card required
- Connection string set as `DATABASE_URL` environment variable

## Upcoming Features

- Paystack integration for real bank funding and withdrawals
- Email notifications for every transaction via SendGrid
- Profile management with avatar upload and password change
- Rate limiting, Redis caching, and transaction PDF receipts
- Forgot/reset password flow
- Dark mode toggle
- Push notifications for transaction alerts

## Key Concepts

**Database Transactions:** All money-moving operations use database transactions. If any step fails (e.g., server crash), all changes are rolled back -- no lost funds.

**DTO Validation:** Data Transfer Objects define strict rules for incoming requests. NestJS validates these automatically before the request reaches the service layer.

**JWT Authentication:** Stateless authentication using JSON Web Tokens. No session storage needed -- the token itself contains the user's identity.

**Client-side Routing:** The Next.js frontend handles all navigation client-side without page reloads, providing a mobile-app-like experience.

## License

This project is for educational and portfolio purposes.

## Author

Built by [Enoch](https://github.com/enoch-systems)

*If you found this project helpful, consider giving it a star on GitHub!*