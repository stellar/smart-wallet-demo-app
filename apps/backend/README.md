# Backend · Stellar Smart Wallet Demo

This is the backend service for the Stellar Smart Wallet Demo. It provides REST APIs to support user operations and blockchain interactions via Stellar and Soroban.

---

## 🔍 Description

The backend is a modular, versioned Node.js application built with TypeScript. It handles routing, input validation, logging, and third-party integrations using clean, scalable architectural principles. Each API context (e.g., `/auth`, `/wallet`) is versioned and encapsulated for maintainability.

---

## 🧰 Stack

This project leverages the following core technologies:

- [Node.js](https://nodejs.org/) – Runtime environment
- [TypeScript](https://www.typescriptlang.org/) – Type-safe language
- [Express](https://expressjs.com/) – Fast, unopinionated web framework
- [Zod](https://zod.dev/) – Schema-based validation
- [Pino](https://getpino.io/) – High-performance JSON logger
- [Vitest](https://vitest.dev/) – Unit and integration testing framework

---

## 📁 Project Structure

```
.
├── src/                   # Main application folder
│  ├── app.ts              # Application entrypoint
│
│  ├── api/                # Main RestAPI folder
│  │  ├── core/            # Core components
│  │  │  ├── docs.ts
│  │  │  ├── routes.ts
│  │  │  ├── constants/       # Shared constants/variables
│  │  │  ├── entities/        # Shared entities
│  │  │  ├── framework/       # Core types/classes
│  │  │  ├── helpers/         # Shared business logic
│  │  │  ├── interfaces/      # Third-party integration interfaces
│  │  │  ├── middlewares/     # Express middlewares
│  │  │  └── utils/           # Generic utilities
│  │
│  │  ├── <context>/       # API context (e.g. auth, wallet)
│  │  │  ├── v1/           # Versioned implementation
│  │  │  │  ├── */use-cases   # Endpoint/use-case logic
│  │  │  │  └── */routes      # Endpoint registration
│  │  │  ├── v2/
│  │  │  ├── v*/            # Future versions
│  │  │  ├── docs.ts        # Swagger definition for the context
│  │  │  └── routes.ts      # Context route loader
│
├── interfaces/            # Technical interfaces (non-REST)
├── config/                # Application-wide configs
│  ├── axios-logger        # Axios logging setup
│  ├── logger              # Pino logger configuration
└── errors/                # Custom exceptions
```
