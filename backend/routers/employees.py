# routers/employees.py — Employee CRUD
from fastapi import APIRouter, HTTPException
from database import get_db, hash_pin
from models import EmployeeCreate, EmployeeUpdate
import uuid, json
from datetime import date

router = APIRouter(prefix="/api/employees", tags=["employees"])

def _row_to_dict(row):
    d = dict(row)
    d["store_ids"] = json.loads(d.get("store_ids", "[]"))
    d.pop("pin_hash", None)
    return d

@router.get("")
def get_employees(store_id: str = None):
    conn = get_db()
    if store_id:
        # Filter by store_id in JSON array
        rows = conn.execute("SELECT * FROM employees WHERE store_ids LIKE ?", (f'%{store_id}%',)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM employees").fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

@router.post("")
def create_employee(emp: EmployeeCreate):
    conn = get_db()
    eid = emp.id or str(uuid.uuid4())
    join = emp.join_date or date.today().isoformat()
    conn.execute(
        "INSERT INTO employees VALUES (?,?,?,?,?,?,?)",
        (eid, emp.name, hash_pin(emp.pin), emp.role,
         json.dumps(emp.store_ids), int(emp.active), join)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM employees WHERE id=?", (eid,)).fetchone()
    conn.close()
    return _row_to_dict(row)

@router.put("/{emp_id}")
def update_employee(emp_id: str, emp: EmployeeUpdate):
    conn = get_db()
    existing = conn.execute("SELECT * FROM employees WHERE id=?", (emp_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")

    ex = dict(existing)
    name      = emp.name      if emp.name      is not None else ex["name"]
    role      = emp.role      if emp.role      is not None else ex["role"]
    active    = int(emp.active) if emp.active  is not None else ex["active"]
    store_ids = json.dumps(emp.store_ids) if emp.store_ids is not None else ex["store_ids"]
    pin_hash  = hash_pin(emp.pin) if emp.pin  is not None else ex["pin_hash"]

    conn.execute(
        "UPDATE employees SET name=?,pin_hash=?,role=?,store_ids=?,active=? WHERE id=?",
        (name, pin_hash, role, store_ids, active, emp_id)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM employees WHERE id=?", (emp_id,)).fetchone()
    conn.close()
    return _row_to_dict(row)

@router.patch("/{emp_id}/toggle")
def toggle_employee(emp_id: str):
    conn = get_db()
    conn.execute("UPDATE employees SET active = NOT active WHERE id=?", (emp_id,))
    conn.commit()
    row = conn.execute("SELECT * FROM employees WHERE id=?", (emp_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _row_to_dict(row)
