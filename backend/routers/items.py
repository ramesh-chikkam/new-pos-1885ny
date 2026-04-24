# routers/items.py — Menu Item CRUD + stock toggle
from fastapi import APIRouter, HTTPException
from database import get_db
from models import ItemCreate, ItemUpdate
import uuid

router = APIRouter(prefix="/api/items", tags=["items"])

@router.get("")
def get_items(category_id: str = None, in_stock: bool = None):
    conn = get_db()
    query = "SELECT * FROM items WHERE 1=1"
    params = []
    if category_id:
        query += " AND category_id=?"; params.append(category_id)
    if in_stock is not None:
        query += " AND in_stock=?"; params.append(int(in_stock))
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("")
def create_item(item: ItemCreate):
    conn = get_db()
    iid = item.id or str(uuid.uuid4())
    conn.execute(
        "INSERT INTO items VALUES (?,?,?,?,?,?,?,?,?)",
        (iid, item.category_id, item.name, item.price,
         item.cgst, item.sgst, int(item.in_stock), item.img, item.description)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM items WHERE id=?", (iid,)).fetchone()
    conn.close()
    return dict(row)

@router.put("/{item_id}")
def update_item(item_id: str, item: ItemCreate):
    conn = get_db()
    conn.execute(
        "UPDATE items SET category_id=?,name=?,price=?,cgst=?,sgst=?,in_stock=?,img=?,description=? WHERE id=?",
        (item.category_id, item.name, item.price, item.cgst, item.sgst,
         int(item.in_stock), item.img, item.description, item_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return dict(row)

@router.patch("/{item_id}/toggle-stock")
def toggle_stock(item_id: str):
    conn = get_db()
    conn.execute("UPDATE items SET in_stock = NOT in_stock WHERE id=?", (item_id,))
    conn.commit()
    row = conn.execute("SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return dict(row)

@router.delete("/{item_id}")
def delete_item(item_id: str):
    conn = get_db()
    conn.execute("DELETE FROM items WHERE id=?", (item_id,))
    conn.commit()
    conn.close()
    return {"success": True}
