# Restaurant Table Reservation System

Full-stack table booking app for customers and restaurant staff, built with React, Flask, JWT auth, and SQLite.

## Features

- Customer registration, login, booking, modification, and cancellation
- Admin dashboard with live refresh, filters, booking actions, history, and floor view
- Table inventory CRUD with soft deactivation
- Server-side availability checks to prevent overlapping pending or confirmed bookings
- Consistent API errors in `{ "error": "message" }` format
- Seeded development users, tables, and reservations

## Project Structure

```text
restaurant-reservation-app
├── backend
│   ├── app.py
│   ├── middleware
│   ├── models
│   ├── routes
│   └── requirements.txt
└── frontend
    ├── src
    │   ├── components
    │   ├── context
    │   ├── pages
    │   └── services
    └── package.json
```

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API runs at `http://localhost:5000/api`. The SQLite database is created automatically at `backend/restaurant.db` and seeded on first run.

Seed accounts:

- Admin: `admin@restaurant.com` / `admin123`
- Customer: `customer@test.com` / `test123`

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React SPA runs at `http://localhost:3000`.

## API Summary

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Tables:

- `GET /api/tables`
- `GET /api/tables/available?date=YYYY-MM-DD&time=HH:MM&guest_count=2`
- `POST /api/tables`
- `PUT /api/tables/<id>`
- `DELETE /api/tables/<id>`

Reservations:

- `POST /api/reservations`
- `GET /api/reservations/my`
- `PUT /api/reservations/<id>`
- `DELETE /api/reservations/<id>/cancel`

Admin:

- `GET /api/admin/reservations`
- `PUT /api/admin/reservations/<id>/confirm`
- `PUT /api/admin/reservations/<id>/reject`
- `GET /api/admin/reservations/history`
- `GET /api/admin/floor?date=YYYY-MM-DD`

## Notes

For production, set `DATABASE_URL` to PostgreSQL and replace `JWT_SECRET_KEY` with a strong secret value.
