# routers/orders.py — Create & list orders
from fastapi import APIRouter, HTTPException
from database import get_db
from models import OrderCreate
import uuid, json
from datetime import datetime, date

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("")
def get_orders(
    store_id: str = None,
    date_from: str = None,
    date_to: str = None,
    limit: int = 200
):
    conn = get_db()
    query = "SELECT * FROM orders WHERE 1=1"
    params = []
    if store_id:
        query += " AND store_id=?"; params.append(store_id)
    if date_from:
        query += " AND date(created_at)>=?"; params.append(date_from)
    if date_to:
        query += " AND date(created_at)<=?"; params.append(date_to)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    rows = conn.execute(query, params).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["items"] = json.loads(d.get("items", "[]"))
        result.append(d)
    return result

@router.post("")
def create_order(order: OrderCreate):
    conn = get_db()
    oid = "ORD_" + str(uuid.uuid4()).replace("-","")[:10].upper()
    now = datetime.now().isoformat()
    items_json = json.dumps([i.model_dump() for i in order.items])

    conn.execute("""
        INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        oid, order.store_id, order.staff_id, order.staff_name,
        items_json, order.subtotal, order.cgst_total, order.sgst_total,
        order.grand_total, order.payment_method, order.cash_given,
        order.order_type, order.status, now
    ))
    conn.commit()
    row = conn.execute("SELECT * FROM orders WHERE id=?", (oid,)).fetchone()
    conn.close()
    d = dict(row)
    d["items"] = json.loads(d["items"])
    return d

@router.get("/summary")
def order_summary(store_id: str = None, date_from: str = None, date_to: str = None):
    """Daily/range summary — total revenue, order count, tax, payment breakdown."""
    conn = get_db()
    query = "SELECT * FROM orders WHERE 1=1"
    params = []
    if store_id:
        query += " AND store_id=?"; params.append(store_id)
    if date_from:
        query += " AND date(created_at)>=?"; params.append(date_from)
    if date_to:
        query += " AND date(created_at)<=?"; params.append(date_to)
    rows = conn.execute(query, params).fetchall()
    conn.close()

    total_revenue = sum(r["grand_total"] for r in rows)
    total_tax     = sum(r["cgst_total"] + r["sgst_total"] for r in rows)
    order_count   = len(rows)
    avg_order     = total_revenue / order_count if order_count else 0

    # Payment breakdown
    pay_breakdown = {}
    for r in rows:
        m = r["payment_method"] or "Unknown"
        if m not in pay_breakdown:
            pay_breakdown[m] = {"count": 0, "total": 0}
        pay_breakdown[m]["count"] += 1
        pay_breakdown[m]["total"] += r["grand_total"]

    # Item breakdown
    item_sales = {}
    for r in rows:
        items = json.loads(r["items"] or "[]")
        for it in items:
            n = it.get("name","?")
            if n not in item_sales:
                item_sales[n] = {"qty": 0, "revenue": 0}
            item_sales[n]["qty"]     += it.get("qty", 1)
            item_sales[n]["revenue"] += it.get("total", 0)

    return {
        "total_revenue": round(total_revenue, 2),
        "total_tax":     round(total_tax, 2),
        "order_count":   order_count,
        "avg_order":     round(avg_order, 2),
        "payment_breakdown": pay_breakdown,
        "item_breakdown": dict(sorted(item_sales.items(), key=lambda x: -x[1]["revenue"])),
    }
