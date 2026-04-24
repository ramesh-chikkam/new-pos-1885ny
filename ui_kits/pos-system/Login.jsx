// Login.jsx — Store Selector + PIN Pad

function Login() {
  const { state, dispatch } = useApp();
  const [selectedStore, setSelectedStore] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [shake, setShake] = React.useState(false);

  const activeStores = state.stores.filter(s => s.active);

  function handleKey(digit) {
    if (pin.length >= 6) return;
    setPin(p => p + digit);
    setError('');
  }

  function handleBackspace() { setPin(p => p.slice(0, -1)); setError(''); }

  async function handleLogin() {
    if (!selectedStore) { setError('Please select a store first.'); return; }
    const result = await dispatch({ type: 'LOGIN', storeId: selectedStore, pin });
    if (result && result.error) {
      setError(result.error);
      setShake(true);
      setTimeout(() => { setShake(false); setPin(''); }, 600);
    }
  }

  React.useEffect(() => { if (pin.length === 4) handleLogin(); }, [pin]);

  const ROLE_COLORS = { admin: '#ff6347', manager: '#c9921a', cashier: '#22a06b', kitchen: '#0ea5e9', delivery: '#8b5cf6' };

  return (
    <div style={loginStyles.page}>
      <div style={loginStyles.bg} />
      <div style={loginStyles.card}>
        {/* Logo */}
        <div style={loginStyles.logoWrap}>
          <img src="/assets/logo.png" alt="1885NY" style={loginStyles.logo} />
        </div>
        <div style={loginStyles.subtitle}>Point of Sale System</div>

        {/* Store Selector */}
        <div style={loginStyles.section}>
          <div style={loginStyles.label}>Select Store</div>
          <div style={loginStyles.storeGrid}>
            {activeStores.map(s => (
              <button key={s.id}
                style={{ ...loginStyles.storeBtn, ...(selectedStore === s.id ? loginStyles.storeBtnActive : {}) }}
                onClick={() => { setSelectedStore(s.id); setPin(''); setError(''); }}>
                <div style={loginStyles.storeBtnName}>{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* PIN Pad */}
        <div style={loginStyles.section}>
          <div style={loginStyles.label}>Enter PIN</div>
          <div style={{ ...loginStyles.pinDisplay, ...(shake ? loginStyles.shake : {}) }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ ...loginStyles.pinDot, ...(i < pin.length ? loginStyles.pinDotFilled : {}) }} />
            ))}
          </div>
          {error && <div style={loginStyles.error}>{error}</div>}
          <div style={loginStyles.numpad}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, idx) => (
              <button key={idx}
                style={{ ...loginStyles.numKey, ...(k === '' ? loginStyles.numKeyBlank : {}), ...(k === '⌫' ? loginStyles.numKeyBack : {}) }}
                onClick={() => { if (k === '⌫') handleBackspace(); else if (k !== '') handleKey(k); }}
                disabled={k === ''}
              >{k}</button>
            ))}
          </div>
        </div>

        <div style={loginStyles.hint}>💡 Demo PINs — Admin: 1234 · Manager: 5678 · Cashier: 2222</div>
      </div>
    </div>
  );
}

const loginStyles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#1a1a1a' },
  bg: { position: 'absolute', inset: 0, backgroundImage: 'url(/assets/hero-burger.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 },
  card: { position: 'relative', background: '#fff', borderRadius: 16, padding: '36px 40px', width: 480, boxShadow: '0 32px 80px rgba(0,0,0,.5)' },
  logoWrap: { textAlign: 'center', marginBottom: 6 },
  logo: { height: 64, width: 'auto' },
  subtitle: { textAlign: 'center', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 28 },
  section: { marginBottom: 22 },
  label: { fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 },
  storeGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  storeBtn: { background: '#f4f4f4', border: '2px solid transparent', borderRadius: 8, padding: '10px 14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s' },
  storeBtnActive: { background: '#fff1ee', border: '2px solid #ff6347' },
  storeBtnName: { fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 13, color: '#1a1a1a' },
  pinDisplay: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 },
  pinDot: { width: 16, height: 16, borderRadius: '50%', border: '2px solid #ddd', background: 'transparent', transition: 'all 0.15s' },
  pinDotFilled: { background: '#ff6347', border: '2px solid #ff6347' },
  shake: { animation: 'shake 0.4s ease' },
  error: { textAlign: 'center', color: '#e33', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, marginBottom: 8 },
  numpad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  numKey: { background: '#f4f4f4', border: 'none', borderRadius: 10, padding: '16px', fontSize: 20, fontWeight: 700, fontFamily: 'DM Sans, Arial, sans-serif', color: '#1a1a1a', cursor: 'pointer', transition: 'background 0.1s' },
  numKeyBlank: { background: 'transparent', cursor: 'default' },
  numKeyBack: { background: '#fff1ee', color: '#ff6347' },
  hint: { textAlign: 'center', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, color: '#aaa', marginTop: 8 },
};

Object.assign(window, { Login });
