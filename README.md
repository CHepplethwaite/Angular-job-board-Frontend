
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

# Job Board Frontend (Angular)

A production-ready **job board frontend** built with **Angular**.  
The application serves candidates, employers, and administrators through a modular, scalable architecture designed for long-term growth.

The frontend consumes a RESTful backend and focuses on performance, accessibility, and real-world usability.

---

## Overview

This application provides the user interface for a full-featured recruitment platform, including:

- Candidate registration and profile management
- Job discovery, search, and filtering
- Job applications and application tracking
- Employer dashboards and job posting management
- Secure authentication and role-based access control
- Administrative moderation and management

The project is structured to support **rapid feature development** while maintaining **clean separation of concerns**.

---

## Tech Stack

- Angular
- TypeScript
- RxJS
- Angular Router
- SCSS
- REST API integration
- JWT-based authentication
- Lazy-loaded feature modules

---

## Architecture Principles

- Modular feature-based structure
- Separation of UI, state, and API access
- Role-based access guards
- Reusable shared components
- Consistent API contracts
- Production-focused error handling

---

## Project Structure (Simplified)

```

src/
├── app/
│   ├── core/
│   │   ├── auth/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── features/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── candidates/
│   │   ├── employers/
│   │   └── admin/
│   ├── shared/
│   │   ├── components/
│   │   ├── models/
│   │   └── ui/
│   ├── app.routes.ts
│   └── app.component.ts
└── environments/

```

---

## Authentication & Security

- JWT-based authentication
- Refresh token handling
- Role and permission guards
- Secure route protection
- Centralised HTTP interceptors

---

## Environment Configuration

Configuration values are managed via Angular environments:

```

src/environments/
├── environment.ts
└── environment.prod.ts

````

Example:

```ts
export const environment = {
  apiBaseUrl: 'http://localhost:8080/api',
  production: false
};
````

---

## Development Server

Install dependencies:

```
npm install
```

Run the development server:

```
ng serve
```

The app will be available at:

```
http://localhost:4200
```

---

## Build

To create a production build:

```
ng build
```

Build artifacts are output to the `dist/` directory.

---

## Code Quality

* Strict TypeScript configuration
* Strong typing for API models
* Centralised error handling
* Feature isolation via lazy loading
* Consistent naming conventions

---

## Testing

The application supports:

* Unit tests for components and services
* Guard and interceptor testing
* Future expansion to E2E testing

Run unit tests:

```
ng test
```

---

## Target Use Case

This frontend is designed for **real-world recruitment platforms**, including:

* Public job boards
* Private hiring portals
* Recruitment agencies
* Corporate career portals

---

## Status

**In active development**

Core candidate and employer features are being implemented with production readiness as the primary goal.

---
