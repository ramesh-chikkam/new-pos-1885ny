// Header.jsx — 1885NY Brand Header
function Header({ cartCount, onCartOpen }) {
  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.logo}>
        <img src="../../assets/logo.png" alt="1885NY" style={headerStyles.logoImg} />
      </div>
      <nav style={headerStyles.nav}>
        {['Menu', 'About', 'Locations'].map(item => (
          <a key={item} href="#" style={headerStyles.navLink}
            onMouseEnter={e => e.target.style.color = '#ff6347'}
            onMouseLeave={e => e.target.style.color = '#fff'}>{item}</a>
        ))}
      </nav>
      <button style={headerStyles.cartBtn} onClick={onCartOpen}>
        <span style={headerStyles.cartIcon}>🛒</span>
        <span style={headerStyles.cartLabel}>Cart</span>
        {cartCount > 0 && (
          <span style={headerStyles.badge}>{cartCount}</span>
        )}
      </button>
    </header>
  );
}

const headerStyles = {
  header: { background: '#333', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  logo: { display: 'flex', alignItems: 'center' },
  logoImg: { height: 44, width: 'auto' },
  nav: { display: 'flex', gap: 4 },
  navLink: { color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14, padding: '8px 14px', borderRadius: 4, transition: 'color 0.15s', fontFamily: 'DM Sans, Arial, sans-serif' },
  cartBtn: { background: '#ff6347', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, fontSize: 14, position: 'relative' },
  cartIcon: { fontSize: 16 },
  cartLabel: {},
  badge: { background: '#fff', color: '#ff6347', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginLeft: 2 },
};

Object.assign(window, { Header });
