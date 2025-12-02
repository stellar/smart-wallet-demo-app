# Web · Stellar Smart Wallet Demo

This is the frontend web application for the Stellar Smart Wallet Demo. It offers a modern, responsive UI that interacts with the backend and Stellar ecosystem. The app is built with modular, scalable principles and leverages a clean architecture for context-based separation of logic.

---

## 🧰 Stack

This project leverages the following libraries and tools:

- [React 18](https://reactjs.org/) – UI library
- [TypeScript](https://www.typescriptlang.org/) – Type-safe language
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling framework
- [Stellar Design System](https://design-system.stellar.org/) – Stellar’s official design system
- [Yup](https://github.com/jquense/yup) – Schema validation
- [Zustand](https://zustand-demo.pmnd.rs/) – Global state management
- [TanStack Router](https://tanstack.com/router/latest) – App routing
- [TanStack Query](https://tanstack.com/query/latest) – Data fetching and caching
- [Vitest](https://vitest.dev/) – Unit and integration testing framework

---

## 📄 Additional Documentation

- [Assets and Content Configuration](./docs/ASSETS_AND_CONTENT.md):  
  Learn how to manage and load external assets (images, videos) and content (texts) in this project.  
  This guide covers how to configure these files for local development and CI/CD pipelines, and how to use the provided helper hooks (`a()`, `c()`) in your components.

- **FAQ:**
  `VITE_FAQ` is an environment variable that expects a stringified JSON array of FAQ objects. Each FAQ object should have the following structure:

  ```
  {
    "title": "string",
    "description": "string"
  }
  ```

  Example:

  ```
  {
    items: [
      {
        title: string
        description: string
      },
      {
        title: string
        description: string
      }
    ]
  }
  ```

  Note: The value of `VITE_FAQ` should be a base64 stringified version of the above JSON array. (E.g.: `btoa(JSON.stringify(json))`)

  **Important:** If `VITE_FAQ` is set, it will override the FAQ data retrieved from the get-wallet endpoint (database source). The environment variable takes precedence over the database source, allowing you to customize FAQ content via environment configuration.

- **Payment Variant:**
  `VITE_PAYMENT_VARIANT` is an environment variable that determines which payment UI variant to display in the wallet pages. It accepts one of the following values:

  - `'qr-code'` - Displays the QR code payment interface (default)
  - `'tap-to-pay'` - Displays the tap-to-pay payment interface

  Example:

  ```
  VITE_PAYMENT_VARIANT=qr-code
  ```

  or

  ```
  VITE_PAYMENT_VARIANT=tap-to-pay
  ```

  **Note:** This variable controls which payment method UI is rendered in the wallet home and NFT pages. The default value is show nothing if not specified.

## 📁 Project Structure

```
.
├── public/                # Public assets (favicon, manifest, etc.)
├── src/                   # Main application folder
│  ├── index.tsx           # App entry point
│  ├── interfaces/         # HTTP and external libraries interfaces
│  ├── helpers/            # Global helper functions
│  ├── constants/          # Global constants
│  ├── config/             # Application configuration
│  ├── components/         # UI components following atomic design
│  ├── assets/             # Static assets (e.g. images, icons)
│  ├── app/                # Application logic
│  │  ├── core/            # Shared foundation code
│  │  │  ├── services/
│  │  │  ├── router/       # Router setup
│  │  │  │  ├── index.ts
│  │  │  │  ├── routeTree.ts
│  │  │  ├── queries/      # Shared TanStack queries
│  │  │  ├── hooks/        # Shared hooks
│  │  │  ├── adapters/     # Shared adapters
│  │  │  ├── constants/    # Shared constants
│  │  │  ├── helpers/      # Shared business logic
│  │  │  ├── interfaces/   # Interfaces for 3rd-party services
│  │  │  └── utils/        # Utility functions
│  │
│  │  ├── <context>/       # App domain context (e.g. auth, wallet)
│  │  │  ├── services/
│  │  │  ├── routes/
│  │  │  ├── store/
│  │  │  ├── queries/
│  │  │  ├── hooks/
│  │  │  ├── adapters/
│  │  │  ├── components/
│  │  │  ├── pages/
│  │  │  ├── constants/
│  │  │  ├── helpers/
│  │  │  ├── utils/
│  │  │  └── domain/
│  │  │     ├── models/
│  │  │     ├── helpers/
│  │  │     └── use-cases/
```

---
