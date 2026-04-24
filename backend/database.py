# database.py — SQLite setup, connection, seed data
import sqlite3, json, hashlib, os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "pos.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def hash_pin(pin: str) -> str:
    return hashlib.sha256(pin.encode()).hexdigest()

def init_db():
    conn = get_db()
    c = conn.cursor()

    # ── Stores ──────────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        gstin TEXT,
        active INTEGER DEFAULT 1
    )""")

    # ── Categories ───────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    )""")

    # ── Menu Items ───────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        cgst REAL DEFAULT 2.5,
        sgst REAL DEFAULT 2.5,
        in_stock INTEGER DEFAULT 1,
        img TEXT DEFAULT '',
        description TEXT DEFAULT '',
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )""")

    # ── Employees ────────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        pin_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        store_ids TEXT DEFAULT '[]',
        active INTEGER DEFAULT 1,
        join_date TEXT
    )""")

    # ── Orders ───────────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        store_id TEXT,
        staff_id TEXT,
        staff_name TEXT,
        items TEXT DEFAULT '[]',
        subtotal REAL DEFAULT 0,
        cgst_total REAL DEFAULT 0,
        sgst_total REAL DEFAULT 0,
        grand_total REAL DEFAULT 0,
        payment_method TEXT,
        cash_given REAL,
        order_type TEXT DEFAULT 'Dine In',
        status TEXT DEFAULT 'completed',
        created_at TEXT
    )""")

    # ── Attendance ───────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        emp_id TEXT,
        store_id TEXT,
        clock_in TEXT,
        clock_out TEXT,
        date TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees(id)
    )""")

    # ── Settings ─────────────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )""")

    conn.commit()
    _seed(conn)
    conn.close()

def _seed(conn):
    """Insert default data if tables are empty."""
    c = conn.cursor()

    # Stores
    if not c.execute("SELECT 1 FROM stores").fetchone():
        stores = [
            ("s1", "Gachibowli — UNOS Food Market", "UNOS Food Market, Gachibowli, Hyderabad", "36XXXXX1234Z5", 1),
            ("s2", "Banjara Hills", "Road No. 12, Banjara Hills, Hyderabad", "36XXXXX5678Z2", 1),
            ("s3", "Madhapur", "Cyber Towers Road, Madhapur, Hyderabad", "36XXXXX9012Z8", 0),
        ]
        c.executemany("INSERT INTO stores VALUES (?,?,?,?,?)", stores)

    # Categories
    if not c.execute("SELECT 1 FROM categories").fetchone():
        cats = [("c1","Burgers"),("c2","Chicken"),("c3","Sides"),("c4","Drinks"),("c5","Extras")]
        c.executemany("INSERT INTO categories VALUES (?,?)", cats)

    # Items
    if not c.execute("SELECT 1 FROM items").fetchone():
        items = [
            ("i1","c1","Classic Smash Burger",499,2.5,2.5,1,"assets/burger1.jpg","Juicy beef patty, melted cheese, secret sauce"),
            ("i2","c1","Cheesy Lamb Smash",399,2.5,2.5,1,"assets/burger2.jpg","Crispy lamb, cheddar cheese"),
            ("i3","c1","Spicy Smash",299,2.5,2.5,1,"assets/burger3.jpg","Jalapeños, pepper jack cheese"),
            ("i4","c1","Double Smash Stack",699,2.5,2.5,1,"assets/hero-burger.jpg","Two patties, double cheese, caramelized onions"),
            ("i5","c1","Mushroom Swiss Smash",449,2.5,2.5,1,"assets/burger2.jpg","Sautéed mushrooms, Swiss cheese, garlic aioli"),
            ("i6","c2","NY Crispy Chicken",349,2.5,2.5,1,"assets/burger3.jpg","Crispy chicken fillet, sriracha mayo, pickles"),
            ("i7","c2","Chicken Smash",379,2.5,2.5,1,"assets/burger1.jpg","Smashed chicken patty, chipotle sauce"),
            ("i8","c3","Smash Fries",149,2.5,2.5,1,"","Crispy fries with smash seasoning"),
            ("i9","c3","Loaded Cheese Fries",199,2.5,2.5,1,"","Fries, cheese sauce, jalapeños"),
            ("i10","c4","Cold Drink (Can)",60,14,14,1,"","Pepsi / 7Up / Mirinda"),
            ("i11","c4","Fresh Lime Soda",79,2.5,2.5,1,"","Sweet / Salted"),
            ("i12","c5","Extra Patty",120,2.5,2.5,1,"","Add an extra smash patty"),
            ("i13","c5","Extra Cheese Slice",40,2.5,2.5,1,"","American / Cheddar"),
        ]
        c.executemany("INSERT INTO items VALUES (?,?,?,?,?,?,?,?,?)", items)

    # Employees
    if not c.execute("SELECT 1 FROM employees").fetchone():
        emps = [
            ("e1","Admin User",hash_pin("1234"),"admin",json.dumps(["s1","s2","s3"]),1,"2024-01-01"),
            ("e2","Ravi Kumar",hash_pin("5678"),"manager",json.dumps(["s1"]),1,"2024-02-01"),
            ("e3","Priya S.",hash_pin("2222"),"cashier",json.dumps(["s1"]),1,"2024-03-01"),
            ("e4","Arun M.",hash_pin("3333"),"cashier",json.dumps(["s2"]),1,"2024-03-15"),
            ("e5","Sneha R.",hash_pin("4444"),"kitchen",json.dumps(["s1"]),1,"2024-04-01"),
        ]
        c.executemany("INSERT INTO employees VALUES (?,?,?,?,?,?,?)", emps)

    # Settings
    if not c.execute("SELECT 1 FROM settings").fetchone():
        c.executemany("INSERT INTO settings VALUES (?,?)", [
            ("printer_service_uuid", "000018f0-0000-1000-8000-00805f9b34fb"),
            ("printer_char_uuid",    "00002af1-0000-1000-8000-00805f9b34fb"),
        ])

    conn.commit()
