# Campus Bites

Smart canteen ordering for Amrita Vishwa Vidyapeetham. Students browse live menus from the **Sopanam**, **MBA** and **Samudra** canteens, order from any (or all) of them in one checkout, pay online, and pick up with a token number instead of queueing. Kitchen crews get a live order board, and managers get revenue analytics.

**Live demo:** https://radha-krishna-19.github.io/Campus-Bites/

## Features

- **Three canteens, one cart** — mixed carts are split into one order and pickup token per canteen
- **Live order tracking** — Paid → Preparing → Ready, pushed to the student in real time
- **Crew dashboard** — each kitchen sees only its own orders and marks them ready / collected
- **Management analytics** — revenue, order count, average order value, per-canteen breakdown and top sellers
- **Menu management** — add dishes, update stock, toggle availability
- **Nutrition assistant** — meal suggestions for how you feel (stressed, tired, cold…) and a 7-day plan for protein / carb / calorie goals
- **Spending tracker** — daily, weekly and monthly totals with bill history
- **Filters** — search, category, veg-only, dairy / gluten / nut free, sort by price, calories or protein
- Interactive UI: custom cursor, magnetic buttons, 3D tilt cards, scroll animations

## Demo accounts

| Portal | Login |
| --- | --- |
| Student | `CB.SC.U4CSE23001` / `demo123` (or register a new roll number) |
| Crew | `crew.sopanam@amrita.edu`, `crew.mba@amrita.edu`, `crew.samudra@amrita.edu` / `crew123` |
| Management | `canteenmanager@amrita.edu` / `admin123` (per-canteen: `sopanam-admin@amrita.edu` / `sopanam123`, etc.) |

Each login page also has one-click demo buttons.

## Tech stack

- **Frontend:** React 19, React Router, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Socket.IO client
- **Backend:** FastAPI, MongoDB (Motor), Socket.IO, JWT auth, Razorpay

## How the demo runs without a server

GitHub Pages only serves static files, so when the frontend is built **without** `REACT_APP_BACKEND_URL` it runs in demo mode: an in-browser implementation of the API (`frontend/src/utils/demoBackend.js`) stores data in `localStorage`, simulates the kitchen, and emits the same live order updates as the real Socket.IO server. Set `REACT_APP_BACKEND_URL` to use the FastAPI backend instead.

## Running locally

### Frontend only (demo mode)

```bash
cd frontend
yarn install
yarn start
```

Open http://localhost:3000/Campus-Bites/

### Full stack

Requires Python 3.11+ and a MongoDB instance (local, Docker, or MongoDB Atlas).

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # then edit the values
python seed_data.py
uvicorn server:socket_app --reload --port 8001
```

In another terminal:

```bash
cd frontend
echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env
yarn start
```

Payments run in test mode until `RAZORPAY_ENABLED` is switched on in `backend/server.py` with real Razorpay keys.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the frontend and publishes it to GitHub Pages.

## Project structure

```
backend/
  server.py        FastAPI app, REST endpoints, Socket.IO events
  models.py        Pydantic models
  ai_service.py    Nutrition assistant (rule-based, no external API)
  seed_data.py     Seeds canteens, menus and staff accounts from seed_menu.json
frontend/src/
  pages/           Landing, student, crew and management screens
  components/      Custom cursor, tilt cards, magnetic buttons, shadcn/ui
  utils/           API client, demo backend, auth, cart, socket
```
