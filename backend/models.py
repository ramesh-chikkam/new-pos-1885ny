# models.py — Pydantic request/response schemas
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ── Auth ─────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    store_id: str
    pin: str

class LoginResponse(BaseModel):
    success: bool
    employee: Optional[dict] = None
    store: Optional[dict] = None
    message: str = ""

# ── Store ─────────────────────────────────────────────────────
class StoreCreate(BaseModel):
    id: Optional[str] = None
    name: str
    address: str = ""
    gstin: str = ""
    active: bool = True

# ── Category ─────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    id: Optional[str] = None
    name: str

# ── Item ─────────────────────────────────────────────────────
class ItemCreate(BaseModel):
    id: Optional[str] = None
    category_id: str
    name: str
    price: float
    cgst: float = 2.5
    sgst: float = 2.5
    in_stock: bool = True
    img: str = ""
    description: str = ""

class ItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    price: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    in_stock: Optional[bool] = None
    img: Optional[str] = None
    description: Optional[str] = None

# ── Employee ──────────────────────────────────────────────────
class EmployeeCreate(BaseModel):
    id: Optional[str] = None
    name: str
    pin: str
    role: str
    store_ids: List[str] = []
    active: bool = True
    join_date: Optional[str] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    pin: Optional[str] = None
    role: Optional[str] = None
    store_ids: Optional[List[str]] = None
    active: Optional[bool] = None

# ── Order Item ────────────────────────────────────────────────
class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    qty: int
    cgst: float
    sgst: float
    base: float
    cgst_amt: float
    sgst_amt: float
    total: float

# ── Order ─────────────────────────────────────────────────────
class OrderCreate(BaseModel):
    store_id: str
    staff_id: str
    staff_name: str
    items: List[OrderItem]
    subtotal: float
    cgst_total: float
    sgst_total: float
    grand_total: float
    payment_method: str
    cash_given: Optional[float] = None
    order_type: str = "Dine In"
    status: str = "completed"

# ── Attendance ────────────────────────────────────────────────
class ClockInRequest(BaseModel):
    emp_id: str
    store_id: str

class ClockOutRequest(BaseModel):
    attendance_id: str

# ── Settings ─────────────────────────────────────────────────
class SettingsUpdate(BaseModel):
    printer_service_uuid: Optional[str] = None
    printer_char_uuid: Optional[str] = None
