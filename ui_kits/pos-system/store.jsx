// store.jsx — Global App State (API-first, localStorage fallback)

const { createContext, useContext, useReducer, useEffect, useState } = React;

// ── API base (set window.POS_API_BASE before loading to override) ──
const STORE_API_BASE = window.POS_API_BASE || 'http://localhost:8000';

// ── Offline localStorage fallback seed ─────────────────────────────
const SEED = {
  stores: [
    { id: 's1', name: 'Gachibowli — UNOS Food Market', address: 'UNOS Food Market, Gachibowli, Hyderabad', gstin: '36XXXXX1234Z5', active: true },
    { id: 's2', name: 'Banjara Hills', address: 'Road No. 12, Banjara Hills, Hyderabad', gstin: '36XXXXX5678Z2', active: true },
    { id: 's3', name: 'Madhapur', address: 'Cyber Towers Road, Madhapur, Hyderabad', gstin: '36XXXXX9012Z8', active: false },
  ],
  categories: [
    { id: 'c1', name: 'Burgers' }, { id: 'c2', name: 'Chicken' },
    { id: 'c3', name: 'Sides' },   { id: 'c4', name: 'Drinks' }, { id: 'c5', name: 'Extras' },
  ],
  items: [
    { id:'i1', category_id:'c1', name:'Classic Smash Burger', price:499, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/burger1.jpg', description:'Juicy beef patty, melted cheese' },
    { id:'i2', category_id:'c1', name:'Cheesy Lamb Smash',    price:399, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/burger2.jpg', description:'Crispy lamb, cheddar cheese' },
    { id:'i3', category_id:'c1', name:'Spicy Smash',          price:299, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/burger3.jpg', description:'Jalapeños, pepper jack cheese' },
    { id:'i4', category_id:'c1', name:'Double Smash Stack',   price:699, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/hero-burger.jpg', description:'Two patties, double cheese' },
    { id:'i5', category_id:'c1', name:'Mushroom Swiss Smash', price:449, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/burger2.jpg', description:'Mushrooms, Swiss cheese' },
    { id:'i6', category_id:'c2', name:'NY Crispy Chicken',    price:349, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/burger3.jpg', description:'Crispy chicken, sriracha mayo' },
    { id:'i7', category_id:'c2', name:'Chicken Smash',        price:379, cgst:2.5, sgst:2.5, in_stock:true, img:'/assets/burger1.jpg', description:'Smashed chicken, chipotle sauce' },
    { id:'i8', category_id:'c3', name:'Smash Fries',          price:149, cgst:2.5, sgst:2.5, in_stock:true, img:'', description:'Crispy fries with smash seasoning' },
    { id:'i9', category_id:'c3', name:'Loaded Cheese Fries',  price:199, cgst:2.5, sgst:2.5, in_stock:true, img:'', description:'Fries, cheese sauce, jalapeños' },
    { id:'i10',category_id:'c4', name:'Cold Drink (Can)',      price:60,  cgst:14,  sgst:14,  in_stock:true, img:'', description:'Pepsi / 7Up / Mirinda' },
    { id:'i11',category_id:'c4', name:'Fresh Lime Soda',       price:79,  cgst:2.5, sgst:2.5, in_stock:true, img:'', description:'Sweet / Salted' },
    { id:'i12',category_id:'c5', name:'Extra Patty',           price:120, cgst:2.5, sgst:2.5, in_stock:true, img:'', description:'Add an extra smash patty' },
    { id:'i13',category_id:'c5', name:'Extra Cheese Slice',    price:40,  cgst:2.5, sgst:2.5, in_stock:true, img:'', description:'American / Cheddar' },
  ],
  employees: [
    { id:'e1', name:'Admin User', pin:'1234', role:'admin',   store_ids:['s1','s2','s3'], active:true, join_date:'2024-01-01' },
    { id:'e2', name:'Ravi Kumar', pin:'5678', role:'manager', store_ids:['s1'],          active:true, join_date:'2024-02-01' },
    { id:'e3', name:'Priya S.',   pin:'2222', role:'cashier', store_ids:['s1'],          active:true, join_date:'2024-03-01' },
    { id:'e4', name:'Arun M.',    pin:'3333', role:'cashier', store_ids:['s2'],          active:true, join_date:'2024-03-15' },
    { id:'e5', name:'Sneha R.',   pin:'4444', role:'kitchen', store_ids:['s1'],          active:true, join_date:'2024-04-01' },
  ],
  orders: [], 
  attendance: [],
  settings: { printerServiceUUID:'000018f0-0000-1000-8000-00805f9b34fb', printerCharUUID:'00002af1-0000-1000-8000-00805f9b34fb' },
};

// ── Normalise API item (snake_case → camelCase in_stock field) ──────
function normaliseItem(i) {
  return { ...i, categoryId: i.category_id || i.categoryId, inStock: i.in_stock !== undefined ? !!i.in_stock : i.inStock };
}

// ── Context ──────────────────────────────────────────────────────────
const AppContext = createContext(null);

function AppProvider({ children }) {
  const [apiOnline, setApiOnline] = useState(null); // null=checking, true, false
  const [state, setState] = useState({
    ...SEED,
    currentUser: null,
    currentStore: null,
    _mode: 'loading',
  });

  // ── Check if backend is reachable ──────────────────────────────
  useEffect(() => {
      fetch(STORE_API_BASE + '/health', { signal: AbortSignal.timeout(2000) })
      .then(r => r.ok ? setApiOnline(true) : setApiOnline(false))
      .catch(() => setApiOnline(false));
  }, []);

  // ── Load initial data once we know the mode ────────────────────
  useEffect(() => {
    if (apiOnline === null) return;
    if (apiOnline) {
      loadFromAPI();
    } else {
      loadFromLocalStorage();
    }
  }, [apiOnline]);

  async function loadFromAPI() {
    try {
        const [stores, categories, items, employees, settings, orders] = await Promise.all([
        fetch(STORE_API_BASE+'/api/stores').then(r=>r.json()),
        fetch(STORE_API_BASE+'/api/categories').then(r=>r.json()),
        fetch(STORE_API_BASE+'/api/items').then(r=>r.json()),
        fetch(STORE_API_BASE+'/api/employees').then(r=>r.json()),
          fetch(STORE_API_BASE + '/api/settings').then(r => r.json()),
          fetch(STORE_API_BASE + '/api/orders').then(r => r.json()), 
      ]);
      setState(s => ({
        ...s,
        stores, categories,
        items: items.map(normaliseItem),
        employees,
        settings: {
          printerServiceUUID: settings.printer_service_uuid || s.settings.printerServiceUUID,
          printerCharUUID:    settings.printer_char_uuid    || s.settings.printerCharUUID,
        },
        orders: [],
        attendance: [],
        _mode: 'api',
      }));
    } catch(e) {
      console.warn('API load failed, falling back to localStorage', e);
      setApiOnline(false);
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('1885ny_pos_v2');
      const saved = raw ? JSON.parse(raw) : SEED;
      setState(s => ({ ...s, ...saved, _mode: 'offline' }));
    } catch(e) {
      setState(s => ({ ...s, ...SEED, _mode: 'offline' }));
    }
  }

  function saveLocal(next) {
    try { localStorage.setItem('1885ny_pos_v2', JSON.stringify(next)); } catch(e) {}
  }

  // ── Dispatch ────────────────────────────────────────────────────
  async function dispatch(action) {
    const isApi = state._mode === 'api';

    switch(action.type) {

      case 'LOGIN': {
        if (isApi) {
          try {
            const res = await fetch(STORE_API_BASE+`/api/auth/login?store_id=${action.storeId}&pin=${action.pin}`, { method:'POST' });
            if (!res.ok) return { error: 'Invalid PIN or not assigned to this store.' };
            const data = await res.json();
            setState(s => ({ ...s, currentUser: data.employee, currentStore: data.store }));
            return { ok: true };
          } catch(e) { return { error: 'Cannot reach server.' }; }
        } else {
          const emp = state.employees.find(e => e.pin === action.pin && e.active && e.store_ids?.includes(action.storeId));
          if (!emp) return { error: 'Invalid PIN or not assigned to this store.' };
          const store = state.stores.find(s => s.id === action.storeId);
          setState(s => ({ ...s, currentUser: emp, currentStore: store }));
          return { ok: true };
        }
      }

      case 'LOGOUT':
        setState(s => ({ ...s, currentUser: null, currentStore: null }));
        break;

      case 'ADD_ORDER': {
        if (isApi) {
          try {
            const created = await fetch(STORE_API_BASE+'/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(action.order) }).then(r=>r.json());
            setState(s => ({ ...s, orders: [created, ...s.orders] }));
            return created;
          } catch(e) { console.error('Order save failed', e); }
        } else {
          const next = { ...state, orders: [...state.orders, action.order] };
          saveLocal(next); setState(() => next);
        }
        return action.order;
      }

      case 'RELOAD_ITEMS': {
        if (isApi) {
          const items = await fetch(STORE_API_BASE+'/api/items').then(r=>r.json());
          setState(s => ({ ...s, items: items.map(normaliseItem) }));
        }
        break;
      }

      case 'SAVE_ITEM': {
        if (isApi) {
          const method = action.isNew ? 'POST' : 'PUT';
          const url    = action.isNew ? STORE_API_BASE+'/api/items' : STORE_API_BASE+`/api/items/${action.item.id}`;
          const body   = { ...action.item, category_id: action.item.categoryId, in_stock: action.item.inStock };
          await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
          await dispatch({ type:'RELOAD_ITEMS' });
        } else {
          const exists = state.items.find(i => i.id === action.item.id);
          const items  = exists ? state.items.map(i => i.id===action.item.id ? action.item : i) : [...state.items, action.item];
          const next   = { ...state, items };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'DELETE_ITEM': {
        if (isApi) {
          await fetch(STORE_API_BASE+`/api/items/${action.id}`, { method:'DELETE' });
          await dispatch({ type:'RELOAD_ITEMS' });
        } else {
          const next = { ...state, items: state.items.filter(i => i.id !== action.id) };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'TOGGLE_STOCK': {
        if (isApi) {
          await fetch(STORE_API_BASE+`/api/items/${action.id}/toggle-stock`, { method:'PATCH' });
          await dispatch({ type:'RELOAD_ITEMS' });
        } else {
          const items = state.items.map(i => i.id===action.id ? {...i, inStock:!i.inStock, in_stock:!i.inStock} : i);
          const next  = { ...state, items };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'SAVE_CATEGORY': {
        if (isApi) {
          const method = action.isNew ? 'POST' : 'PUT';
          await fetch(STORE_API_BASE+(action.isNew ? '/api/categories' : `/api/categories/${action.cat.id}`),
            { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(action.cat) });
          const cats = await fetch(STORE_API_BASE+'/api/categories').then(r=>r.json());
          setState(s => ({ ...s, categories: cats }));
        } else {
          const exists = state.categories.find(c => c.id===action.cat.id);
          const categories = exists ? state.categories.map(c=>c.id===action.cat.id?action.cat:c) : [...state.categories, action.cat];
          const next = { ...state, categories };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'DELETE_CATEGORY': {
        if (isApi) {
          await fetch(STORE_API_BASE+`/api/categories/${action.id}`, { method:'DELETE' });
          const cats = await fetch(STORE_API_BASE+'/api/categories').then(r=>r.json());
          setState(s => ({ ...s, categories: cats }));
        } else {
          const next = { ...state, categories: state.categories.filter(c=>c.id!==action.id) };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'SAVE_EMPLOYEE': {
        if (isApi) {
          const isNew = !state.employees.find(e => e.id===action.emp.id);
          const method = isNew ? 'POST' : 'PUT';
          const url    = isNew ? STORE_API_BASE+'/api/employees' : STORE_API_BASE+`/api/employees/${action.emp.id}`;
          await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(action.emp) });
          const employees = await fetch(STORE_API_BASE+'/api/employees').then(r=>r.json());
          setState(s => ({ ...s, employees }));
        } else {
          const exists    = state.employees.find(e=>e.id===action.emp.id);
          const employees = exists ? state.employees.map(e=>e.id===action.emp.id?action.emp:e) : [...state.employees, action.emp];
          const next = { ...state, employees };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'TOGGLE_EMPLOYEE': {
        if (isApi) {
          await fetch(STORE_API_BASE+`/api/employees/${action.id}/toggle`, { method:'PATCH' });
          const employees = await fetch(STORE_API_BASE+'/api/employees').then(r=>r.json());
          setState(s => ({ ...s, employees }));
        } else {
          const employees = state.employees.map(e=>e.id===action.id?{...e,active:!e.active}:e);
          const next = { ...state, employees };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'CLOCK_IN': {
        if (isApi) {
          const rec = await fetch(STORE_API_BASE+'/api/attendance/clock-in', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ emp_id:action.empId, store_id:action.storeId }) }).then(r=>r.json());
          setState(s => ({ ...s, attendance: [...s.attendance, rec] }));
        } else {
          const rec  = { id:'att_'+Date.now(), emp_id:action.empId, empId:action.empId, store_id:action.storeId, storeId:action.storeId, clock_in:new Date().toISOString(), clock_out:null, date:new Date().toISOString().slice(0,10) };
          const next = { ...state, attendance: [...state.attendance, rec] };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'CLOCK_OUT': {
        if (isApi) {
          await fetch(STORE_API_BASE+`/api/attendance/clock-out/${action.id}`, { method:'PATCH' });
          const att = state.attendance.map(a => a.id===action.id ? {...a, clock_out:new Date().toISOString()} : a);
          setState(s => ({ ...s, attendance: att }));
        } else {
          const attendance = state.attendance.map(a => a.id===action.id ? {...a, clock_out:new Date().toISOString()} : a);
          const next = { ...state, attendance };
          saveLocal(next); setState(() => next);
        }
        break;
      }

      case 'RELOAD_ORDERS': {
        if (isApi) {
          const orders = await fetch(STORE_API_BASE+`/api/orders?store_id=${action.storeId||''}`).then(r=>r.json());
          setState(s => ({ ...s, orders }));
        }
        break;
      }

      case 'RELOAD_ATTENDANCE': {
        if (isApi) {
          const att = await fetch(STORE_API_BASE+`/api/attendance?store_id=${action.storeId||''}&date_from=${action.dateFrom||''}&date_to=${action.dateTo||''}`).then(r=>r.json());
          setState(s => ({ ...s, attendance: att }));
        }
        break;
      }

      case 'SAVE_SETTINGS': {
        if (isApi) {
          await fetch(STORE_API_BASE+'/api/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ printer_service_uuid: action.settings.printerServiceUUID, printer_char_uuid: action.settings.printerCharUUID }) });
        }
        setState(s => ({ ...s, settings: { ...s.settings, ...action.settings } }));
        break;
      }

      default: break;
    }
  }

  // ── Shared helpers ──────────────────────────────────────────────
  const value = { state, dispatch, apiOnline };

  if (state._mode === 'loading') {
    return React.createElement('div', { style:{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#1a1a1a',color:'#ff6347',fontFamily:'Anton,sans-serif',fontSize:28,letterSpacing:'0.04em'} }, '1885NY POS…');
  }

  return React.createElement(AppContext.Provider, { value }, children);
}

function useApp() { return useContext(AppContext); }

// ── Shared utilities ─────────────────────────────────────────────
function genId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }

function calcTax(price, qty, cgst, sgst) {
  const base    = price * qty;
  const cgstAmt = parseFloat(((base * cgst) / 100).toFixed(2));
  const sgstAmt = parseFloat(((base * sgst) / 100).toFixed(2));
  return { base, cgstAmt, sgstAmt, total: parseFloat((base + cgstAmt + sgstAmt).toFixed(2)) };
}

function fmt(n) { return '₹' + parseFloat(n || 0).toFixed(2); }
function today() { return new Date().toISOString().slice(0, 10); }

Object.assign(window, { AppProvider, useApp, genId, calcTax, fmt, today, SEED });
