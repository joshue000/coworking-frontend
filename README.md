# Coworking Frontend

Workspace Reservation Management — React + TypeScript frontend.

## Stack

| Layer | Technology |
|---|---|
| Build | Vite + React 18 + TypeScript 5 |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| UI state | Zustand (API key persistence) |
| HTTP | Axios |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |
| Containers | Docker + Nginx |

## Features

- **Spaces** — paginated grid with place filter, detail view
- **Reservations** — paginated list with filters (space, email, date), create and delete
- **IoT Dashboard** — real-time telemetry per space, auto-refresh every 30s, alert highlighting
- **API Key auth** — stored in localStorage, injected on every request, configurable from UI

---

## Setup

### Prerequisites

- Node.js 20+
- A running instance of the [Coworking API](../coworking-api) on port `3000`

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit VITE_API_BASE_URL if the API runs on a different port

# 3. Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker compose up --build -d
```

> `VITE_API_BASE_URL` is baked into the bundle at build time. Override it before building:

```bash
VITE_API_BASE_URL=http://api.example.com docker compose up --build -d
```

The frontend will be available at `http://localhost:80`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the Coworking API |

---

## Authentication

On first load the app shows an **API Key** prompt. Enter the key configured in the backend (`API_KEY` env var). The key is saved to `localStorage` and sent as `x-api-key` on every request.

To change the key, click **API Key** in the top-right corner of the navbar.

---

## Project Structure

```
src/
├── api/              # Axios client + per-resource API functions
├── components/
│   ├── layout/       # Layout, Navbar
│   └── ui/           # Badge, ErrorMessage, LoadingSpinner, Modal, Pagination
├── features/
│   ├── spaces/       # SpaceCard
│   ├── reservations/ # ReservationCard, ReservationFilters, CreateReservationForm
│   └── iot/          # SpaceStatusCard, TelemetryMetric
├── pages/            # SpacesPage, SpaceDetailPage, ReservationsPage, AdminPage
├── router/           # React Router config
├── store/            # Zustand auth store
└── types/            # TypeScript interfaces
```
