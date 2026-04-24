# routers/settings.py — Printer & app settings
from fastapi import APIRouter
from database import get_db
from models import SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("")
def get_settings():
    conn = get_db()
    rows = conn.execute("SELECT * FROM settings").fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}

@router.put("")
def update_settings(s: SettingsUpdate):
    conn = get_db()
    updates = s.model_dump(exclude_none=True)
    for key, value in updates.items():
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=?",
            (key, value, value)
        )
    conn.commit()
    rows = conn.execute("SELECT * FROM settings").fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}
