# 🌍 Currency Converter — Backend & Frontend

This repository contains a full-stack currency converter: a .NET 8 Web API backend and a React + TypeScript frontend. It demonstrates exchange-rate integration, historical data endpoints, JWT-based authentication, and a compact React UI.

---

## Table of Contents

- [Requirements](#requirements)
- [Quick Start](#quick-start)
   - [Backend](#backend)
   - [Frontend](#frontend)
- [Project Structure](#project-structure)
- [Environment & Configuration](#environment--configuration)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Usage Tips](#usage-tips)

---

## Requirements

- .NET 8 SDK
- Node.js (16+) and npm

## Quick Start

### Backend

1. Open a terminal and navigate to the API project:

```bash
cd backend/CurrencyConverter.Api
```

2. Restore and build:

```bash
dotnet restore
dotnet build
```

3. Run the API locally:

```bash
dotnet run
```

4. Swagger UI will be available at:

```
http://localhost:12046/swagger
```

Tip: Use the `/api/v1/auth/login` endpoint to obtain a JWT and then use the Swagger "Authorize" button to call protected endpoints.

### Frontend

1. Open a terminal and go to the frontend folder:

```bash
cd frontend/currency-converter-ui
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open the app in your browser:

```
http://localhost:5173
```

By default the frontend expects the backend at `http://localhost:12046`.

## Project Structure (high level)

- backend/
   - CurrencyConverter.Api/ — .NET Web API project (Controllers, Middleware, Services)
- frontend/
   - currency-converter-ui/ — React + TypeScript app (components, pages, api client)

Key frontend files:

- `src/api/client.ts` — Axios client and interceptors
- `src/auth` — Auth context and protected route
- `src/components` — UI components (CurrencyForm, LatestRates, Loader, etc.)

## Environment & Configuration

- Backend: configuration (ports, external provider URLs) lives in `appsettings.json` inside the API project.
- Frontend: `src/api/client.ts` sets the `baseURL` to `http://localhost:12046/api/v1` — update if your API runs elsewhere.

## Testing

Frontend tests use Vitest + Testing Library. To run the frontend tests (if tests are present):

```bash
cd frontend/currency-converter-ui
npm run test
```

If `npm run test` is not defined, run directly with Vitest:

```bash
npx vitest
```

Backend tests (if added) use xUnit and can be run via:

```bash
dotnet test
```

## Future Improvements

- Add database-backed user management (EF Core)
- Add caching (Redis) for latest rates
- Implement rate limiting and API key protection
- Expand test coverage (unit + integration)
- CI/CD + container images for production deployment
- Improve frontend UX (charts, currency flags, better responsiveness)

## Usage Tips

- Authenticate: POST to `/api/v1/auth/login` to receive a token.
- Swagger: click "Authorize" and paste `Bearer <token>` to access protected endpoints.
- Health check: `/api/v1/health` returns API status.

---

If you want, I can:

- Add a `README.md` inside the frontend folder with focused instructions.
- Add `npm` test scripts to `frontend/currency-converter-ui/package.json`.
- Run the test suite and report coverage results.

Which of these should I do next?
