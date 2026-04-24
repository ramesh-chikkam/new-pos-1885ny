# routers/categories.py — Category CRUD
from fastapi import APIRouter, HTTPException
from database import get_db
from models import CategoryCreate
import uuid

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("")
def get_categories():
    conn = get_db()
    rows = conn.execute("SELECT * FROM categories").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("")
def create_category(cat: CategoryCreate):
    conn = get_db()
    cid = cat.id or str(uuid.uuid4())
    conn.execute("INSERT INTO categories VALUES (?,?)", (cid, cat.name))
    conn.commit()
    row = conn.execute("SELECT * FROM categories WHERE id=?", (cid,)).fetchone()
    conn.close()
    return dict(row)

@router.delete("/{cat_id}")
def delete_category(cat_id: str):
    conn = get_db()
    conn.execute("DELETE FROM categories WHERE id=?", (cat_id,))
    conn.commit()
    conn.close()
    return {"success": True}
