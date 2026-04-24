# routers/auth.py — PIN login
from fastapi import APIRouter, HTTPException
from database import get_db, hash_pin
import json

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
def login(store_id: str, pin: str):
    conn = get_db()
    pin_hash = hash_pin(pin)

    emp = conn.execute(
        "SELECT * FROM employees WHERE pin_hash=? AND active=1", (pin_hash,)
    ).fetchone()

    if not emp:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid PIN")

    emp_dict = dict(emp)
    emp_dict["store_ids"] = json.loads(emp_dict["store_ids"])

    if store_id not in emp_dict["store_ids"] and emp_dict["role"] != "admin":
        conn.close()
        raise HTTPException(status_code=403, detail="Not assigned to this store")

    store = conn.execute("SELECT * FROM stores WHERE id=?", (store_id,)).fetchone()
    conn.close()

    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    # Don't expose pin_hash
    emp_dict.pop("pin_hash", None)

    return {"success": True, "employee": emp_dict, "store": dict(store)}
