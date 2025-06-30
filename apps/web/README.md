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
- [Storybook](https://storybook.js.org/) – UI component explorer

---

## 📁 Project Structure

```
.
├── .storybook/            # Storybook main files
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
