// MenuCard.jsx — Menu Item Card
function MenuCard({ item, onAdd }) {
  const [added, setAdded] = React.useState(false);

  function handleAdd() {
    onAdd(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  return (
    <div style={mcStyles.card}>
      <div style={mcStyles.imgWrap}>
        <img src={item.img} alt={item.name} style={mcStyles.img} />
        {item.popular && <span style={mcStyles.badge}>Popular</span>}
      </div>
      <div style={mcStyles.body}>
        <div style={mcStyles.name}>{item.name}</div>
        <div style={mcStyles.desc}>{item.desc}</div>
        <div style={mcStyles.footer}>
          <span style={mcStyles.price}>₹{item.price}</span>
          <button
            style={{...mcStyles.addBtn, background: added ? '#22a06b' : '#ff6347'}}
            onClick={handleAdd}
          >
            {added ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

const mcStyles = {
  card: { background: '#fafafa', borderRadius: 10, boxShadow: '0 4px 6px rgba(0,0,0,.10)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s, box-shadow 0.15s' },
  imgWrap: { position: 'relative', height: 160, overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  badge: { position: 'absolute', top: 10, left: 10, background: '#ff6347', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, fontFamily: 'DM Sans, Arial, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' },
  body: { padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 },
  name: { fontFamily: 'Anton, Arial Black, sans-serif', fontSize: 20, color: '#1a1a1a', marginBottom: 4 },
  desc: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: '#888', lineHeight: 1.5, marginBottom: 12, flex: 1 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: 'DM Mono, Courier New, monospace', fontSize: 18, fontWeight: 500, color: '#1a1a1a' },
  addBtn: { color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 5, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' },
};

Object.assign(window, { MenuCard });
