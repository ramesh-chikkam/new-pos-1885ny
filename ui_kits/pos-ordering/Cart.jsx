// Cart.jsx — Cart Sidebar
function Cart({ items, onClose, onUpdateQty, onRemove, onCheckout }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <>
      <div style={cartStyles.overlay} onClick={onClose} />
      <div style={cartStyles.panel}>
        <div style={cartStyles.header}>
          <span style={cartStyles.title}>Your Order</span>
          <button style={cartStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={cartStyles.empty}>
            <div style={{fontSize: 48, marginBottom: 12}}>🍔</div>
            <div style={cartStyles.emptyText}>Your cart is empty</div>
            <div style={cartStyles.emptySubtext}>Add something delicious!</div>
          </div>
        ) : (
          <>
            <div style={cartStyles.itemList}>
              {items.map(item => (
                <div key={item.id} style={cartStyles.item}>
                  <img src={item.img} alt={item.name} style={cartStyles.itemImg} />
                  <div style={cartStyles.itemInfo}>
                    <div style={cartStyles.itemName}>{item.name}</div>
                    <div style={cartStyles.itemPrice}>₹{item.price} each</div>
                  </div>
                  <div style={cartStyles.qtyControls}>
                    <button style={cartStyles.qtyBtn} onClick={() => onUpdateQty(item.id, item.qty - 1)}>−</button>
                    <span style={cartStyles.qty}>{item.qty}</span>
                    <button style={cartStyles.qtyBtn} onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <div style={cartStyles.itemTotal}>₹{item.price * item.qty}</div>
                  <button style={cartStyles.removeBtn} onClick={() => onRemove(item.id)}>✕</button>
                </div>
              ))}
            </div>
            <div style={cartStyles.footer}>
              <div style={cartStyles.subtotalRow}>
                <span>Subtotal</span>
                <span style={cartStyles.subtotalAmt}>₹{total}</span>
              </div>
              <div style={cartStyles.taxRow}>
                <span>GST (5%)</span>
                <span>₹{Math.round(total * 0.05)}</span>
              </div>
              <div style={cartStyles.totalRow}>
                <span>Total</span>
                <span>₹{Math.round(total * 1.05)}</span>
              </div>
              <button style={cartStyles.checkoutBtn} onClick={onCheckout}>
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const cartStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 },
  panel: { position: 'fixed', top: 0, right: 0, width: 380, height: '100vh', background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,.15)' },
  header: { background: '#333', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'Anton, Arial Black, sans-serif', fontSize: 22, color: '#fff', letterSpacing: '0.02em' },
  closeBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: '4px 8px', borderRadius: 4 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontFamily: 'Anton, Arial Black, sans-serif', fontSize: 22, color: '#1a1a1a', marginBottom: 6 },
  emptySubtext: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 14, color: '#888' },
  itemList: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  itemImg: { width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 13, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemPrice: { fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#888', marginTop: 2 },
  qtyControls: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: { background: '#f0f0f0', border: 'none', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  qty: { fontFamily: 'DM Mono, monospace', fontWeight: 500, fontSize: 14, minWidth: 16, textAlign: 'center' },
  itemTotal: { fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 500, color: '#1a1a1a', minWidth: 42, textAlign: 'right' },
  removeBtn: { background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 12, padding: '4px', borderRadius: 4 },
  footer: { padding: '16px 20px', borderTop: '2px solid #f0f0f0', background: '#fafafa' },
  subtotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', fontFamily: 'DM Sans, Arial, sans-serif', marginBottom: 6 },
  taxRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', fontFamily: 'DM Sans, Arial, sans-serif', marginBottom: 10 },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#1a1a1a', fontFamily: 'DM Sans, Arial, sans-serif', marginBottom: 14 },
  subtotalAmt: { fontFamily: 'DM Mono, monospace' },
  checkoutBtn: { width: '100%', background: '#ff6347', color: '#fff', border: 'none', padding: '14px', borderRadius: 6, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};

Object.assign(window, { Cart });
