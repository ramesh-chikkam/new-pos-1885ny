# 1885NY POS — Python Backend

FastAPI + SQLite backend for the 1885NY Smash Burgers POS system.
No external database needed — everything stored in `pos.db` (auto-created on first run).

---

## Quick Start

### 1. Install Python
Download from https://python.org (3.10 or newer). Check the "Add to PATH" box during install.

### 2. Install dependencies
Open a terminal in this `backend/` folder and run:
```bash
pip install -r requirements.txt
```

### 3. Start the server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server starts at **http://localhost:8000**

### 4. Open the POS
Open `ui_kits/pos-system/index.html` in Chrome.
It will automatically talk to the backend.

---

## Access from other devices (tablets, iPads)

1. Find your computer's local IP:
   - Windows: run `ipconfig` → look for IPv4 Address (e.g. `192.168.1.10`)
   - Mac: run `ifconfig` → look for `inet` under `en0`

2. On any tablet on the same WiFi, open:
   ```
   http://192.168.1.10:8000/app/index.html
   ```
   The backend serves the frontend too — no separate file server needed.

---

## API Reference

Interactive docs available at: **http://localhost:8000/docs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Staff PIN login |
| GET | `/api/stores` | List stores |
| GET/POST | `/api/items` | Menu items |
| PUT | `/api/items/{id}` | Update item |
| PATCH | `/api/items/{id}/toggle-stock` | Toggle in/out of stock |
| DELETE | `/api/items/{id}` | Delete item |
| GET/POST | `/api/categories` | Categories |
| GET/POST | `/api/employees` | Staff management |
| PUT | `/api/employees/{id}` | Update employee |
| PATCH | `/api/employees/{id}/toggle` | Activate/deactivate |
| GET/POST | `/api/orders` | Orders |
| GET | `/api/orders/summary` | Sales report summary |
| POST | `/api/attendance/clock-in` | Clock in |
| PATCH | `/api/attendance/clock-out/{id}` | Clock out |
| GET | `/api/attendance/active/{emp_id}` | Active session |
| GET/PUT | `/api/settings` | Printer settings |

---

## Default Staff PINs
| Name | PIN | Role |
|------|-----|------|
| Admin User | 1234 | admin |
| Ravi Kumar | 5678 | manager |
| Priya S. | 2222 | cashier |
| Arun M. | 3333 | cashier |
| Sneha R. | 4444 | kitchen |

---

## File Structure
```
backend/
  main.py          ← FastAPI app, CORS, static file serving
  database.py      ← SQLite setup, seed data
  models.py        ← Pydantic request/response schemas
  requirements.txt ← pip dependencies
  pos.db           ← SQLite database (auto-created)
  routers/
    auth.py        ← PIN login
    stores.py      ← Store CRUD
    items.py       ← Menu item CRUD + stock toggle
    categories.py  ← Category CRUD
    employees.py   ← Staff management
    orders.py      ← Order create + reports
    attendance.py  ← Clock in/out
    settings.py    ← Printer settings
```

---

## Production Deployment
For a live server, replace `allow_origins=["*"]` in `main.py` with your actual domain,
and run with: `uvicorn main:app --host 0.0.0.0 --port 8000`
