# routers/attendance.py — Clock in / out + log
from fastapi import APIRouter, HTTPException
from database import get_db
from models import ClockInRequest, ClockOutRequest
import uuid
from datetime import datetime, date

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.get("")
def get_attendance(emp_id: str = None, store_id: str = None,
                   date_from: str = None, date_to: str = None):
    conn = get_db()
    query = "SELECT * FROM attendance WHERE 1=1"
    params = []
    if emp_id:
        query += " AND emp_id=?"; params.append(emp_id)
    if store_id:
        query += " AND store_id=?"; params.append(store_id)
    if date_from:
        query += " AND date>=?"; params.append(date_from)
    if date_to:
        query += " AND date<=?"; params.append(date_to)
    query += " ORDER BY clock_in DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/clock-in")
def clock_in(req: ClockInRequest):
    conn = get_db()
    # Check if already clocked in today (no clock_out)
    existing = conn.execute(
        "SELECT * FROM attendance WHERE emp_id=? AND date=? AND clock_out IS NULL",
        (req.emp_id, date.today().isoformat())
    ).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Already clocked in. Clock out first.")

    aid = "ATT_" + str(uuid.uuid4()).replace("-","")[:8].upper()
    now = datetime.now().isoformat()
    today = date.today().isoformat()
    conn.execute(
        "INSERT INTO attendance VALUES (?,?,?,?,?,?)",
        (aid, req.emp_id, req.store_id, now, None, today)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM attendance WHERE id=?", (aid,)).fetchone()
    conn.close()
    return dict(row)

@router.patch("/clock-out/{att_id}")
def clock_out(att_id: str):
    conn = get_db()
    existing = conn.execute("SELECT * FROM attendance WHERE id=?", (att_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if existing["clock_out"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Already clocked out")

    now = datetime.now().isoformat()
    conn.execute("UPDATE attendance SET clock_out=? WHERE id=?", (now, att_id))
    conn.commit()
    row = conn.execute("SELECT * FROM attendance WHERE id=?", (att_id,)).fetchone()
    conn.close()
    return dict(row)

@router.get("/active/{emp_id}")
def get_active_session(emp_id: str):
    """Get today's active (not clocked out) session for an employee."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM attendance WHERE emp_id=? AND date=? AND clock_out IS NULL",
        (emp_id, date.today().isoformat())
    ).fetchone()
    conn.close()
    return dict(row) if row else None
