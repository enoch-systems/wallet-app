# Walleo - NGN Wallet System

A production-ready wallet backend built with **NestJS**, featuring user authentication (JWT), wallet management (deposit, send, withdraw), and full transaction history. Designed with clean architecture, database transactions, and input validation.

## Features

- **JWT Authentication** - Register and login with bcrypt-hashed passwords
- **Wallet Operations** - Deposit, Send, and Withdraw NGN
- **Transaction History** - Full audit trail with unique UUID references
- **Input Validation** - Request data validated before reaching business logic
- **Database Transactions** - Atomic operations with rollback on failure
- **Lightweight Frontend** - Clean HTML/CSS/JS UI with Font Awesome icons
- **Modular Architecture** - Organized into auth, user, and wallet modules

## Architecture

```
5 Layers
+-------------------------------------------+
|         Frontend (HTML/CSS/JS)             |
+-------------------------------------------+
|         Controller (Routes)                |
+-------------------------------------------+
|         Service (Business Logic)           |
+-------------------------------------------+
|         Entity (Database Models)           |
+-------------------------------------------+
|         SQLite Database                    |
+-------------------------------------------+
```

## Tech Stack

| Package | Purpose |
|---|---|
| **NestJS** | Backend framework - modules, controllers, services |
| **TypeORM** | ORM - database abstraction layer |
| **better-sqlite3** | SQLite database driver |
| **class-validator / class-transformer** | Input validation |
| **@nestjs/jwt** | JWT token generation |
| **passport / @nestjs/passport** | Authentication guard |
| **passport-jwt** | JWT token extraction and verification |
| **bcrypt** | Password hashing |
| **uuid** | Unique transaction reference IDs |
| **@nestjs/serve-static** | Frontend file serving |

## Project Structure

```
wallet-app/
├── public/
│   └── index.html              - Frontend UI
├── src/
│   ├── main.ts                 - Entry point
│   ├── app.module.ts           - Root module
│   ├── auth/                   - Authentication module
│   │   ├── auth.controller.ts  - POST /auth/register, /auth/login
│   │   ├── auth.service.ts     - Auth logic
│   │   ├── jwt.strategy.ts     - JWT verification
│   │   └── dto/auth.dto.ts     - Validation rules
│   ├── user/                   - User module
│   │   ├── user.entity.ts      - User table
│   │   └── user.module.ts
│   └── wallet/                 - Wallet module
│       ├── wallet.controller.ts- GET /balance, POST /deposit, etc.
│       ├── wallet.service.ts   - Business logic
│       ├── wallet.entity.ts    - Wallet table
│       ├── transaction.entity.ts - Transaction table
│       └── dto/wallet.dto.ts   - Validation rules
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**

### Installation

```bash
git clone https://github.com/enoch-systems/wallet-app.git
cd wallet-app
npm install
npm run start:dev
```

The server starts at **http://localhost:3000**.

## API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new account | No |
| `POST` | `/auth/login` | Log in and receive JWT token | No |

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

**Response (both):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@email.com"
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

**Deposit Request:**
```json
{ "amount": 10000 }
```

**Send Request:**
```json
{ "amount": 3000, "recipient": "Chioma" }
```

**Withdraw Request:**
```json
{ "amount": 2000 }
```

## Authentication Flow

```
Register -> bcrypt scrambles password -> stored in database
Login -> bcrypt compares input -> match? -> JWT token issued
Every wallet request includes token in Authorization header
passport checks for token -> passport-jwt reads it -> valid? -> access granted
No token? -> 401 Unauthorized
```

## Testing with Postman

1. **Register** - `POST http://localhost:3000/auth/register`
2. **Login** - `POST http://localhost:3000/auth/login` (copy the token)
3. **Balance (no auth)** - `GET http://localhost:3000/wallet/balance` (expect 401)
4. **Balance (with auth)** - `GET http://localhost:3000/wallet/balance` with `Authorization: Bearer TOKEN`
5. **Deposit** - `POST http://localhost:3000/wallet/deposit` with token
6. **Send** - `POST http://localhost:3000/wallet/send` with token
7. **Withdraw** - `POST http://localhost:3000/wallet/withdraw` with token
8. **Transactions** - `GET http://localhost:3000/wallet/transactions` with token

## Roadmap

- [ ] PostgreSQL (production database with proper concurrency)
- [ ] Redis caching (instant balance reads)
- [ ] Rate limiting (brute force protection)
- [ ] Email notifications (transaction receipts)
- [ ] Bank integration (real money movement)
- [ ] Multi-currency support (USD, EUR, GBP)
- [ ] Admin dashboard

## Key Concepts

**Database Transactions:** All money-moving operations use database transactions. If any step fails (e.g., server crash), all changes are rolled back -- no lost funds.

**DTO Validation:** Data Transfer Objects define strict rules for incoming requests. NestJS validates these automatically before the request reaches the service layer.

**JWT Authentication:** Stateless authentication using JSON Web Tokens. No session storage needed -- the token itself contains the user's identity.

## License

This project is for educational and portfolio purposes.

## Author

Built by [Enoch](https://github.com/enoch-systems)

*If you found this project helpful, consider giving it a star on GitHub!*
