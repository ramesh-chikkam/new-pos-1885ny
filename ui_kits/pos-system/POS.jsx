// POS.jsx — Main Order Taking Screen

function POS() {
  const { state, dispatch } = useApp();
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [cart, setCart] = React.useState([]);
  const [orderType, setOrderType] = React.useState('Dine In');
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  const [cashGiven, setCashGiven] = React.useState('');
  const [showPayment, setShowPayment] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [lastOrder, setLastOrder] = React.useState(null);
  const [printerStatus, setPrinterStatus] = React.useState('disconnected'); // disconnected|connecting|connected
  const [search, setSearch] = React.useState('');

  const storeItems = state.items.filter(i => i.inStock);
  const filtered = storeItems.filter(i => {
    const matchCat = activeCategory === 'all' || i.categoryId === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Cart helpers
  function addItem(item) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }
  function updateQty(id, qty) {
    if (qty <= 0) setCart(prev => prev.filter(c => c.id !== id));
    else setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  }
  function clearCart() { setCart([]); setShowPayment(false); setCashGiven(''); }

  // Totals
  const orderData = React.useMemo(() => {
    let subtotal = 0, cgstTotal = 0, sgstTotal = 0;
    const items = cart.map(c => {
      const t = calcTax(c.price, c.qty, c.cgst, c.sgst);
      subtotal += t.base;
      cgstTotal += t.cgstAmt;
      sgstTotal += t.sgstAmt;
      return { ...c, base: t.base, cgstAmt: t.cgstAmt, sgstAmt: t.sgstAmt, total: t.total };
    });
    const grandTotal = parseFloat((subtotal + cgstTotal + sgstTotal).toFixed(2));
    const cgstPct = cart.length > 0 ? cart[0].cgst : 2.5;
    const sgstPct = cart.length > 0 ? cart[0].sgst : 2.5;
    return { items, subtotal, cgstTotal, sgstTotal, grandTotal, cgstPct, sgstPct };
  }, [cart]);

  // Place order
  function placeOrder() {
    if (cart.length === 0) return;
    const order = {
      id: genId('ORD'),
      storeId: state.currentStore.id,
      staffId: state.currentUser.id,
      staffName: state.currentUser.name,
      ...orderData,
      paymentMethod,
      cashGiven: paymentMethod === 'Cash' ? parseFloat(cashGiven) || orderData.grandTotal : null,
      orderType,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ORDER', order });
    setLastOrder(order);
    setShowConfirm(true);
    setShowPayment(false);
    setCart([]);
    setCashGiven('');
  }

  // Bluetooth connect
  async function connectPrinter() {
    setPrinterStatus('connecting');
    const res = await PrinterUtil.connect(state.settings.printerServiceUUID, state.settings.printerCharUUID);
    setPrinterStatus(res.ok ? 'connected' : 'disconnected');
  }

  async function printOrder(order) {
    if (printerStatus === 'connected') {
      await PrinterUtil.printReceipt(order, state.currentStore);
    } else {
      PrinterUtil.printBrowser(order, state.currentStore);
    }
  }

  const PAYMENT_METHODS = ['Cash','UPI / QR','Card','Online (Dotpe)','Complimentary'];
  const ORDER_TYPES = ['Dine In','Takeaway','Delivery'];
  const changeAmt = paymentMethod === 'Cash' && cashGiven ? parseFloat(cashGiven) - orderData.grandTotal : 0;

  const printerColors = { disconnected: '#888', connecting: '#c9921a', connected: '#22a06b' };
  const printerLabel = { disconnected: 'Printer: Off', connecting: 'Connecting…', connected: 'Printer: On' };

  return (
    <div style={posStyles.root}>
      {/* LEFT: Menu */}
      <div style={posStyles.menuPanel}>
        {/* Search */}
        <div style={posStyles.searchRow}>
          <input style={posStyles.searchInput} placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Categories */}
        <div style={posStyles.catBar}>
          <button style={activeCategory==='all' ? posStyles.catActive : posStyles.cat} onClick={() => setActiveCategory('all')}>All</button>
          {state.categories.map(cat => (
            <button key={cat.id} style={activeCategory===cat.id ? posStyles.catActive : posStyles.cat} onClick={() => setActiveCategory(cat.id)}>{cat.name}</button>
          ))}
        </div>
        {/* Items Grid */}
        <div style={posStyles.itemGrid}>
          {filtered.map(item => (
            <button key={item.id} style={posStyles.itemBtn} onClick={() => addItem(item)}>
              {item.img ? <img src={item.img} alt={item.name} style={posStyles.itemImg} /> : <div style={posStyles.itemImgPlaceholder}>{item.name[0]}</div>}
              <div style={posStyles.itemName}>{item.name}</div>
              <div style={posStyles.itemPrice}>{fmt(item.price)}</div>
            </button>
          ))}
          {filtered.length === 0 && <div style={posStyles.empty}>No items found</div>}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div style={posStyles.cartPanel}>
        {/* Order Type */}
        <div style={posStyles.orderTypeRow}>
          {ORDER_TYPES.map(t => (
            <button key={t} style={t===orderType ? posStyles.typeActive : posStyles.typeBtn} onClick={() => setOrderType(t)}>{t}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{ ...posStyles.printerBtn, color: printerColors[printerStatus] }} onClick={connectPrinter}>
            🖨 {printerLabel[printerStatus]}
          </button>
        </div>

        {/* Cart Items */}
        <div style={posStyles.cartList}>
          {cart.length === 0 && (
            <div style={posStyles.cartEmpty}><div style={{fontSize:40,marginBottom:8}}>🍔</div><div>Add items to start an order</div></div>
          )}
          {cart.map(item => (
            <div key={item.id} style={posStyles.cartRow}>
              <div style={posStyles.cartName}>{item.name}</div>
              <div style={posStyles.cartQtyCtrl}>
                <button style={posStyles.qtyBtn} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span style={posStyles.qtyNum}>{item.qty}</span>
                <button style={posStyles.qtyBtn} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div style={posStyles.cartItemTotal}>{fmt(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={posStyles.totalsBox}>
          <div style={posStyles.totalRow}><span>Subtotal</span><span>{fmt(orderData.subtotal)}</span></div>
          <div style={posStyles.totalRow}><span>CGST ({orderData.cgstPct}%)</span><span>{fmt(orderData.cgstTotal)}</span></div>
          <div style={posStyles.totalRow}><span>SGST ({orderData.sgstPct}%)</span><span>{fmt(orderData.sgstTotal)}</span></div>
          <div style={posStyles.grandTotalRow}><span>GRAND TOTAL</span><span>{fmt(orderData.grandTotal)}</span></div>
        </div>

        {/* Payment */}
        {!showPayment ? (
          <div style={posStyles.bottomBtns}>
            <button style={posStyles.clearBtn} onClick={clearCart}>Clear</button>
            <button style={posStyles.chargeBtn} disabled={cart.length===0} onClick={() => setShowPayment(true)}>
              Charge {fmt(orderData.grandTotal)} →
            </button>
          </div>
        ) : (
          <div style={posStyles.paymentBox}>
            <div style={posStyles.payLabel}>Payment Method</div>
            <div style={posStyles.payMethods}>
              {PAYMENT_METHODS.map(m => (
                <button key={m} style={m===paymentMethod ? posStyles.payActive : posStyles.payBtn} onClick={() => setPaymentMethod(m)}>{m}</button>
              ))}
            </div>
            {paymentMethod === 'Cash' && (
              <div style={posStyles.cashRow}>
                <input style={posStyles.cashInput} type="number" placeholder="Cash given" value={cashGiven} onChange={e => setCashGiven(e.target.value)} />
                {changeAmt > 0 && <div style={posStyles.change}>Change: {fmt(changeAmt)}</div>}
              </div>
            )}
            <div style={posStyles.bottomBtns}>
              <button style={posStyles.clearBtn} onClick={() => setShowPayment(false)}>Back</button>
              <button style={posStyles.chargeBtn} onClick={placeOrder}>✓ Place Order</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Confirm Modal */}
      {showConfirm && lastOrder && (
        <div style={posStyles.modalOverlay}>
          <div style={posStyles.modal}>
            <div style={{fontSize:48,marginBottom:8}}>✅</div>
            <div style={posStyles.modalTitle}>Order Placed!</div>
            <div style={posStyles.modalOrderId}>#{lastOrder.id.slice(-8).toUpperCase()}</div>
            <div style={posStyles.modalAmt}>{fmt(lastOrder.grandTotal)}</div>
            <div style={posStyles.modalSub}>{lastOrder.paymentMethod} · {lastOrder.orderType}</div>
            {lastOrder.paymentMethod === 'Cash' && lastOrder.cashGiven > lastOrder.grandTotal && (
              <div style={posStyles.modalChange}>Change: {fmt(lastOrder.cashGiven - lastOrder.grandTotal)}</div>
            )}
            <div style={posStyles.modalBtns}>
              <button style={posStyles.printBtn} onClick={() => printOrder(lastOrder)}>🖨 Print Receipt</button>
              <button style={posStyles.doneBtn} onClick={() => setShowConfirm(false)}>New Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const posStyles = {
  root: { display: 'flex', height: '100%', gap: 0 },
  menuPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f4f4f4', borderRight: '1px solid #e0e0e0' },
  searchRow: { padding: '10px 12px', background: '#fff', borderBottom: '1px solid #e8e8e8' },
  searchInput: { width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  catBar: { display: 'flex', gap: 6, padding: '10px 12px', background: '#fff', borderBottom: '1px solid #e8e8e8', overflowX: 'auto', flexShrink: 0 },
  cat: { background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 20, padding: '6px 14px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  catActive: { background: '#ff6347', border: '1px solid #ff6347', borderRadius: 20, padding: '6px 14px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  itemGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, padding: 12, overflowY: 'auto', flex: 1 },
  itemBtn: { background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: 0, cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', transition: 'box-shadow 0.15s', boxShadow: '0 2px 4px rgba(0,0,0,.06)' },
  itemImg: { width: '100%', height: 80, objectFit: 'cover', display: 'block' },
  itemImgPlaceholder: { width: '100%', height: 80, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton, sans-serif', fontSize: 32, color: '#ff6347' },
  itemName: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, fontWeight: 700, color: '#1a1a1a', padding: '6px 8px 2px', lineHeight: 1.3 },
  itemPrice: { fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#ff6347', fontWeight: 500, padding: '0 8px 8px' },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#aaa', fontFamily: 'DM Sans, Arial, sans-serif' },

  cartPanel: { width: 340, display: 'flex', flexDirection: 'column', background: '#fff', flexShrink: 0 },
  orderTypeRow: { display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid #e8e8e8', alignItems: 'center', flexWrap: 'wrap' },
  typeBtn: { background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer' },
  typeActive: { background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' },
  printerBtn: { background: 'transparent', border: 'none', fontSize: 11, fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 600, cursor: 'pointer', padding: '4px 0' },
  cartList: { flex: 1, overflowY: 'auto', padding: '8px 12px' },
  cartEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13 },
  cartRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #f0f0f0' },
  cartName: { flex: 1, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 },
  cartQtyCtrl: { display: 'flex', alignItems: 'center', gap: 4 },
  qtyBtn: { background: '#f4f4f4', border: 'none', borderRadius: 4, width: 22, height: 22, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: 'center' },
  cartItemTotal: { fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#1a1a1a', minWidth: 52, textAlign: 'right' },
  totalsBox: { padding: '10px 14px', borderTop: '2px solid #f0f0f0', background: '#fafafa' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: '#555', marginBottom: 4 },
  grandTotalRow: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Anton, sans-serif', fontSize: 20, color: '#1a1a1a', marginTop: 6, paddingTop: 6, borderTop: '1px solid #e0e0e0' },
  bottomBtns: { display: 'flex', gap: 8, padding: '10px 12px' },
  clearBtn: { background: '#f4f4f4', border: 'none', borderRadius: 8, padding: '12px 16px', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 14, color: '#555', cursor: 'pointer' },
  chargeBtn: { flex: 1, background: '#ff6347', border: 'none', borderRadius: 8, padding: '12px', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', cursor: 'pointer' },
  paymentBox: { padding: '10px 12px', borderTop: '1px solid #e8e8e8' },
  payLabel: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 },
  payMethods: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  payBtn: { background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer' },
  payActive: { background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' },
  cashRow: { marginBottom: 8 },
  cashInput: { width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontFamily: 'DM Mono, monospace', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  change: { marginTop: 4, fontFamily: 'DM Mono, monospace', fontSize: 14, color: '#22a06b', fontWeight: 600 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 16, padding: '40px 48px', textAlign: 'center', boxShadow: '0 32px 64px rgba(0,0,0,.25)', minWidth: 340 },
  modalTitle: { fontFamily: 'Anton, sans-serif', fontSize: 28, color: '#1a1a1a', marginBottom: 4 },
  modalOrderId: { fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#888', marginBottom: 8, letterSpacing: '0.08em' },
  modalAmt: { fontFamily: 'Anton, sans-serif', fontSize: 36, color: '#ff6347', marginBottom: 4 },
  modalSub: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, color: '#888', marginBottom: 4 },
  modalChange: { fontFamily: 'DM Mono, monospace', fontSize: 15, color: '#22a06b', fontWeight: 600, marginBottom: 8 },
  modalBtns: { display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' },
  printBtn: { background: '#1a1a1a', border: 'none', borderRadius: 8, padding: '12px 20px', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' },
  doneBtn: { background: '#ff6347', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' },
};

Object.assign(window, { POS });
