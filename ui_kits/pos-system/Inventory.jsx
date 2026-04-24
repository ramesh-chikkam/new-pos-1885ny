// Inventory.jsx — Item Stock Management

function Inventory() {
  const { state, dispatch } = useApp();
  const [catFilter, setCatFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const filtered = state.items.filter(i => {
    const matchCat = catFilter === 'all' || i.categoryId === catFilter;
    const matchSearch = i.name.toLowerCase().includes((search||'').toLowerCase());
    return matchCat && matchSearch;
  });

  const inStockCount = state.items.filter(i => i.inStock).length;
  const outCount = state.items.length - inStockCount;

  return (
    <div style={invStyles.root}>
      {/* Summary row */}
      <div style={invStyles.summaryRow}>
        <div style={invStyles.summaryCard}>
          <div style={invStyles.summaryNum}>{state.items.length}</div>
          <div style={invStyles.summaryLabel}>Total Items</div>
        </div>
        <div style={{...invStyles.summaryCard, borderLeft:'3px solid #22a06b'}}>
          <div style={{...invStyles.summaryNum, color:'#22a06b'}}>{inStockCount}</div>
          <div style={invStyles.summaryLabel}>In Stock</div>
        </div>
        <div style={{...invStyles.summaryCard, borderLeft:'3px solid #ef4444'}}>
          <div style={{...invStyles.summaryNum, color:'#ef4444'}}>{outCount}</div>
          <div style={invStyles.summaryLabel}>Out of Stock</div>
        </div>
      </div>

      {/* Filters */}
      <div style={invStyles.filterRow}>
        <input style={invStyles.searchInput} placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={invStyles.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Item table */}
      <div style={invStyles.tableWrap}>
        <table style={invStyles.table}>
          <thead>
            <tr style={invStyles.thead}>
              <th style={invStyles.th}>Item</th>
              <th style={invStyles.th}>Category</th>
              <th style={invStyles.th}>Price</th>
              <th style={invStyles.th}>GST</th>
              <th style={{...invStyles.th, textAlign:'center'}}>Status</th>
              <th style={{...invStyles.th, textAlign:'center'}}>Toggle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const cat = state.categories.find(c => c.id === item.categoryId);
              return (
                <tr key={item.id} style={{ ...invStyles.row, background: item.inStock ? '#fff' : '#fff8f8' }}>
                  <td style={invStyles.td}>
                    <div style={invStyles.itemName}>{item.name}</div>
                    <div style={invStyles.itemDesc}>{item.desc}</div>
                  </td>
                  <td style={invStyles.td}><span style={invStyles.catChip}>{cat?.name || '—'}</span></td>
                  <td style={invStyles.tdMono}>{fmt(item.price)}</td>
                  <td style={invStyles.tdMono}>CGST {item.cgst}% + SGST {item.sgst}%</td>
                  <td style={{...invStyles.td, textAlign:'center'}}>
                    <span style={{...invStyles.badge, background: item.inStock ? '#dcfce7' : '#fee2e2', color: item.inStock ? '#16a34a' : '#dc2626'}}>
                      {item.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </span>
                  </td>
                  <td style={{...invStyles.td, textAlign:'center'}}>
                    <button
                      style={{...invStyles.toggleBtn, background: item.inStock ? '#fee2e2' : '#dcfce7', color: item.inStock ? '#dc2626' : '#16a34a'}}
                      onClick={() => dispatch({ type: 'TOGGLE_STOCK', id: item.id })}>
                      {item.inStock ? 'Mark Out' : 'Mark In'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const invStyles = {
  root: { display:'flex', flexDirection:'column', height:'100%', background:'#f8f8f8', overflowY:'auto' },
  summaryRow: { display:'flex', gap:16, padding:'20px 20px 0' },
  summaryCard: { background:'#fff', borderRadius:8, padding:'14px 20px', flex:1, border:'1px solid #e8e8e8', borderLeft:'3px solid #e8e8e8' },
  summaryNum: { fontFamily:'Anton, sans-serif', fontSize:28, color:'#1a1a1a' },
  summaryLabel: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888', marginTop:2 },
  filterRow: { display:'flex', gap:10, padding:'16px 20px' },
  searchInput: { flex:1, padding:'9px 12px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', background:'#fff' },
  select: { padding:'9px 12px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', background:'#fff', minWidth:160 },
  tableWrap: { flex:1, overflow:'auto', margin:'0 20px 20px', background:'#fff', borderRadius:10, border:'1px solid #e8e8e8' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#f4f4f4' },
  th: { padding:'11px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', textAlign:'left', borderBottom:'1px solid #e8e8e8' },
  row: { borderBottom:'1px solid #f0f0f0', transition:'background 0.15s' },
  td: { padding:'12px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#1a1a1a' },
  tdMono: { padding:'12px 14px', fontFamily:'DM Mono, monospace', fontSize:12, color:'#555' },
  itemName: { fontWeight:700, color:'#1a1a1a', marginBottom:2 },
  itemDesc: { fontSize:12, color:'#aaa' },
  catChip: { background:'#f4f4f4', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600, color:'#555', fontFamily:'DM Sans, Arial, sans-serif' },
  badge: { padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, fontFamily:'DM Sans, Arial, sans-serif' },
  toggleBtn: { border:'none', borderRadius:6, padding:'6px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' },
};

Object.assign(window, { Inventory });
