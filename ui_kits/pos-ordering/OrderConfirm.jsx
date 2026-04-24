// OrderConfirm.jsx — Checkout + Confirmation Modal
function OrderConfirm({ items, onClose }) {
  const [step, setStep] = React.useState('checkout'); // 'checkout' | 'confirmed'
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const orderNum = React.useRef('ORD-' + Math.floor(1000 + Math.random() * 9000));

  function handlePlace(e) {
    e.preventDefault();
    setStep('confirmed');
  }

  const inputStyle = { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 14, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 5, width: '100%', boxSizing: 'border-box', outline: 'none', marginTop: 4 };
  const labelStyle = { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', display: 'block' };

  return (
    <>
      <div style={ocStyles.overlay} onClick={step === 'confirmed' ? onClose : undefined} />
      <div style={ocStyles.modal}>
        {step === 'checkout' ? (
          <>
            <div style={ocStyles.modalHeader}>
              <span style={ocStyles.modalTitle}>Checkout</span>
              <button style={ocStyles.closeBtn} onClick={onClose}>✕</button>
            </div>
            <div style={ocStyles.body}>
              <div style={ocStyles.leftCol}>
                <div style={ocStyles.sectionLabel}>Your Details</div>
                <form onSubmit={handlePlace} style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input style={inputStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Special Instructions</label>
                    <textarea style={{...inputStyle, height:70, resize:'none'}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Allergies, extras, etc." />
                  </div>
                  <div style={ocStyles.orderType}>
                    <div style={ocStyles.orderTypeActive}>Dine In</div>
                    <div style={ocStyles.orderTypeInactive}>Takeaway</div>
                  </div>
                  <button type="submit" style={ocStyles.placeBtn}>Place Order · ₹{Math.round(total * 1.05)}</button>
                </form>
              </div>
              <div style={ocStyles.rightCol}>
                <div style={ocStyles.sectionLabel}>Order Summary</div>
                {items.map(item => (
                  <div key={item.id} style={ocStyles.summaryRow}>
                    <span style={ocStyles.summaryName}>{item.qty}× {item.name}</span>
                    <span style={ocStyles.summaryPrice}>₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div style={ocStyles.divider} />
                <div style={ocStyles.summaryRow}><span>GST (5%)</span><span>₹{Math.round(total*0.05)}</span></div>
                <div style={{...ocStyles.summaryRow, fontWeight:700, fontSize:17, marginTop:4}}>
                  <span>Total</span><span>₹{Math.round(total*1.05)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={ocStyles.confirmed}>
            <div style={{fontSize:56, marginBottom:16}}>🎉</div>
            <div style={ocStyles.confirmedNum}>{orderNum.current}</div>
            <div style={ocStyles.confirmedTitle}>Order Placed!</div>
            <div style={ocStyles.confirmedSub}>We're smashing your burgers right now. Estimated: <strong>15–20 min</strong>.</div>
            <button style={ocStyles.doneBtn} onClick={onClose}>Back to Menu</button>
          </div>
        )}
      </div>
    </>
  );
}

const ocStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 },
  modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 12, zIndex: 301, width: 720, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.25)' },
  modalHeader: { background: '#1a1a1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: 'Anton, Arial Black, sans-serif', fontSize: 24, color: '#fff', letterSpacing: '0.02em' },
  closeBtn: { background: 'transparent', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' },
  body: { display: 'flex', flex: 1, overflow: 'auto' },
  leftCol: { flex: 1, padding: 28, borderRight: '1px solid #f0f0f0' },
  rightCol: { width: 240, padding: 28, background: '#fafafa', fontFamily: 'DM Sans, Arial, sans-serif' },
  sectionLabel: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 16 },
  orderType: { display: 'flex', gap: 8 },
  orderTypeActive: { flex: 1, textAlign: 'center', padding: '10px', border: '2px solid #ff6347', borderRadius: 6, color: '#ff6347', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, Arial, sans-serif', cursor: 'pointer' },
  orderTypeInactive: { flex: 1, textAlign: 'center', padding: '10px', border: '2px solid #e0e0e0', borderRadius: 6, color: '#888', fontSize: 14, fontFamily: 'DM Sans, Arial, sans-serif', cursor: 'pointer' },
  placeBtn: { background: '#ff6347', color: '#fff', border: 'none', padding: '14px', borderRadius: 6, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', marginBottom: 8, fontFamily: 'DM Sans, Arial, sans-serif' },
  summaryName: { flex: 1, marginRight: 8, fontSize: 13 },
  summaryPrice: { fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#1a1a1a' },
  divider: { borderTop: '1px solid #e0e0e0', margin: '12px 0' },
  confirmed: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' },
  confirmedNum: { fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#ff6347', fontWeight: 500, marginBottom: 8, letterSpacing: '0.1em' },
  confirmedTitle: { fontFamily: 'Anton, Arial Black, sans-serif', fontSize: 36, color: '#1a1a1a', marginBottom: 12 },
  confirmedSub: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 15, color: '#555', maxWidth: 340, lineHeight: 1.6, marginBottom: 28 },
  doneBtn: { background: '#ff6347', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 6, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};

Object.assign(window, { OrderConfirm });
