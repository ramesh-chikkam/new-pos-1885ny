# routers/stores.py — Store CRUD
from fastapi import APIRouter, HTTPException
from database import get_db
from models import StoreCreate
import uuid

router = APIRouter(prefix="/api/stores", tags=["stores"])

@router.get("")
def get_stores():
    conn = get_db()
    rows = conn.execute("SELECT * FROM stores").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("")
def create_store(store: StoreCreate):
    conn = get_db()
    sid = store.id or str(uuid.uuid4())
    conn.execute(
        "INSERT INTO stores VALUES (?,?,?,?,?)",
        (sid, store.name, store.address, store.gstin, int(store.active))
    )
    conn.commit()
    row = conn.execute("SELECT * FROM stores WHERE id=?", (sid,)).fetchone()
    conn.close()
    return dict(row)

@router.put("/{store_id}")
def update_store(store_id: str, store: StoreCreate):
    conn = get_db()
    conn.execute(
        "UPDATE stores SET name=?, address=?, gstin=?, active=? WHERE id=?",
        (store.name, store.address, store.gstin, int(store.active), store_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM stores WHERE id=?", (store_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Store not found")
    return dict(row)
