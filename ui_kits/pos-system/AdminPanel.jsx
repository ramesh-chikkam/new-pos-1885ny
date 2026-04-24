// AdminPanel.jsx — Menu Items, Categories, Tax & Store Settings

function AdminPanel() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = React.useState('items');

  return (
    <div style={adStyles.root}>
      <div style={adStyles.tabBar}>
        {[['items','Menu Items'],['categories','Categories'],['stores','Stores'],['settings','Printer Settings']].map(([k,l]) => (
          <button key={k} style={tab===k ? adStyles.tabActive : adStyles.tab} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div style={adStyles.body}>
        {tab === 'items' && <ItemsTab />}
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'stores' && <StoresTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function ItemsTab() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [filter, setFilter] = React.useState('');

  function openNew() {
    setForm({ id: genId('i'), name: '', price: '', cgst: 2.5, sgst: 2.5, categoryId: state.categories[0]?.id || '', desc: '', inStock: true, img: '' });
    setEditing('new');
  }
  function openEdit(item) { setForm({...item}); setEditing(item.id); }
  function save() {
    if (!form.name || !form.price) return;
    dispatch({ type: 'SAVE_ITEM', item: { ...form, price: parseFloat(form.price), cgst: parseFloat(form.cgst), sgst: parseFloat(form.sgst) } });
    setEditing(null);
  }
  function del(id) { if (window.confirm('Delete this item?')) dispatch({ type: 'DELETE_ITEM', id }); }

  const filtered = state.items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={adStyles.panelRoot}>
      <div style={adStyles.listPanel}>
        <div style={adStyles.listHeader}>
          <input style={adStyles.filterInput} placeholder="Filter items…" value={filter} onChange={e => setFilter(e.target.value)} />
          <button style={adStyles.addBtn} onClick={openNew}>+ New Item</button>
        </div>
        <div style={adStyles.list}>
          {filtered.map(item => (
            <div key={item.id} style={adStyles.listRow}>
              <div style={adStyles.listRowLeft}>
                <div style={adStyles.listRowName}>{item.name}</div>
                <div style={adStyles.listRowMeta}>{fmt(item.price)} · {state.categories.find(c=>c.id===item.categoryId)?.name || '—'} · GST {item.cgst+item.sgst}%</div>
              </div>
              <div style={adStyles.listRowRight}>
                <div style={{...adStyles.stockBadge, background: item.inStock ? '#dcfce7' : '#fee2e2', color: item.inStock ? '#16a34a' : '#dc2626'}}
                  onClick={() => dispatch({type:'TOGGLE_STOCK', id: item.id})}>{item.inStock ? 'In Stock' : 'Out of Stock'}</div>
                <button style={adStyles.editBtn} onClick={() => openEdit(item)}>Edit</button>
                <button style={adStyles.delBtn} onClick={() => del(item.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div style={adStyles.formPanel}>
          <div style={adStyles.formTitle}>{editing === 'new' ? 'New Item' : 'Edit Item'}</div>
          <div style={adStyles.formGrid}>
            <Field label="Item Name" value={form.name} onChange={v => setForm(f=>({...f, name: v}))} full />
            <Field label="Description" value={form.desc} onChange={v => setForm(f=>({...f, desc: v}))} full />
            <Field label="Price (₹)" value={form.price} onChange={v => setForm(f=>({...f, price: v}))} type="number" />
            <div style={adStyles.fieldWrap}>
              <label style={adStyles.fieldLabel}>Category</label>
              <select style={adStyles.select} value={form.categoryId} onChange={e => setForm(f=>({...f, categoryId: e.target.value}))}>
                {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Field label="CGST (%)" value={form.cgst} onChange={v => setForm(f=>({...f, cgst: v}))} type="number" />
            <Field label="SGST (%)" value={form.sgst} onChange={v => setForm(f=>({...f, sgst: v}))} type="number" />
            <div style={{...adStyles.fieldWrap, gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10}}>
              <label style={adStyles.fieldLabel}>In Stock</label>
              <input type="checkbox" checked={form.inStock} onChange={e => setForm(f=>({...f, inStock: e.target.checked}))} style={{width:18, height:18, accentColor:'#ff6347'}} />
            </div>
          </div>
          <div style={adStyles.formBtns}>
            <button style={adStyles.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
            <button style={adStyles.saveBtn} onClick={save}>Save Item</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { state, dispatch } = useApp();
  const [name, setName] = React.useState('');
  function add() {
    if (!name.trim()) return;
    dispatch({ type: 'SAVE_CATEGORY', cat: { id: genId('c'), name: name.trim() } });
    setName('');
  }
  return (
    <div style={{ padding: 24 }}>
      <div style={adStyles.sectionTitle}>Menu Categories</div>
      <div style={adStyles.chipGrid}>
        {state.categories.map(cat => (
          <div key={cat.id} style={adStyles.chip}>
            <span>{cat.name}</span>
            <button style={adStyles.chipDel} onClick={() => { if(window.confirm('Delete category?')) dispatch({type:'DELETE_CATEGORY', id:cat.id}); }}>✕</button>
          </div>
        ))}
      </div>
      <div style={adStyles.inlineAdd}>
        <input style={adStyles.filterInput} placeholder="New category name…" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key==='Enter' && add()} />
        <button style={adStyles.addBtn} onClick={add}>Add</button>
      </div>
    </div>
  );
}

function StoresTab() {
  const { state, dispatch } = useApp();
  return (
    <div style={{ padding: 24 }}>
      <div style={adStyles.sectionTitle}>Store Locations</div>
      {state.stores.map(s => (
        <div key={s.id} style={adStyles.storeCard}>
          <div style={adStyles.storeName}>{s.name}</div>
          <div style={adStyles.storeMeta}>{s.address}</div>
          <div style={adStyles.storeMeta}>GSTIN: {s.gstin}</div>
          <div style={{...adStyles.stockBadge, display:'inline-block', marginTop:6, background: s.active ? '#dcfce7' : '#fee2e2', color: s.active ? '#16a34a' : '#dc2626'}}>{s.active ? 'Active' : 'Inactive'}</div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  const { state, dispatch } = useApp();
  const [serviceUUID, setServiceUUID] = React.useState(state.settings.printerServiceUUID);
  const [charUUID, setCharUUID] = React.useState(state.settings.printerCharUUID);
  function save() { dispatch({ type: 'SAVE_SETTINGS', settings: { printerServiceUUID: serviceUUID, printerCharUUID: charUUID } }); alert('Settings saved!'); }
  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <div style={adStyles.sectionTitle}>Bluetooth Printer Settings</div>
      <div style={adStyles.infoBox}>Most common thermal printers use the default UUIDs below. Change only if your printer uses a custom profile.</div>
      <Field label="BLE Service UUID" value={serviceUUID} onChange={setServiceUUID} full />
      <div style={{marginTop:12}}></div>
      <Field label="BLE Characteristic UUID" value={charUUID} onChange={setCharUUID} full />
      <button style={{...adStyles.saveBtn, marginTop:20}} onClick={save}>Save Settings</button>
    </div>
  );
}

// Shared small form field
function Field({ label, value, onChange, type='text', full }) {
  return (
    <div style={{...adStyles.fieldWrap, ...(full ? {gridColumn:'1/-1'} : {})}}>
      <label style={adStyles.fieldLabel}>{label}</label>
      <input style={adStyles.input} type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

const adStyles = {
  root: { display:'flex', flexDirection:'column', height:'100%' },
  tabBar: { display:'flex', gap:2, padding:'10px 16px', borderBottom:'2px solid #e8e8e8', background:'#fff' },
  tab: { background:'transparent', border:'none', borderRadius:6, padding:'8px 18px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, fontWeight:600, color:'#555', cursor:'pointer' },
  tabActive: { background:'#1a1a1a', border:'none', borderRadius:6, padding:'8px 18px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer' },
  body: { flex:1, overflowY:'auto', background:'#f8f8f8' },
  panelRoot: { display:'flex', height:'100%', gap:0 },
  listPanel: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  listHeader: { display:'flex', gap:10, padding:'14px 16px', background:'#fff', borderBottom:'1px solid #e8e8e8' },
  filterInput: { flex:1, padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none' },
  addBtn: { background:'#ff6347', border:'none', borderRadius:6, padding:'8px 18px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:13, color:'#fff', cursor:'pointer', whiteSpace:'nowrap' },
  list: { flex:1, overflowY:'auto' },
  listRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #f0f0f0', background:'#fff', gap:12 },
  listRowLeft: { flex:1, minWidth:0 },
  listRowName: { fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:14, color:'#1a1a1a' },
  listRowMeta: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888', marginTop:2 },
  listRowRight: { display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  stockBadge: { fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, cursor:'pointer', fontFamily:'DM Sans, Arial, sans-serif' },
  editBtn: { background:'#f4f4f4', border:'none', borderRadius:5, padding:'6px 12px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:600, color:'#333', cursor:'pointer' },
  delBtn: { background:'#fee2e2', border:'none', borderRadius:5, padding:'6px 10px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:700, color:'#dc2626', cursor:'pointer' },
  formPanel: { width:320, background:'#fff', borderLeft:'1px solid #e8e8e8', padding:'20px 20px', overflowY:'auto', flexShrink:0 },
  formTitle: { fontFamily:'Anton, sans-serif', fontSize:20, color:'#1a1a1a', marginBottom:16 },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  fieldWrap: {},
  fieldLabel: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', display:'block', marginBottom:4 },
  input: { width:'100%', padding:'8px 10px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', boxSizing:'border-box' },
  select: { width:'100%', padding:'8px 10px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', boxSizing:'border-box' },
  formBtns: { display:'flex', gap:8, marginTop:20 },
  cancelBtn: { background:'#f4f4f4', border:'none', borderRadius:6, padding:'10px 18px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:13, color:'#555', cursor:'pointer' },
  saveBtn: { flex:1, background:'#ff6347', border:'none', borderRadius:6, padding:'10px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:14, color:'#fff', cursor:'pointer' },
  sectionTitle: { fontFamily:'Anton, sans-serif', fontSize:22, color:'#1a1a1a', marginBottom:16 },
  chipGrid: { display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 },
  chip: { background:'#1a1a1a', color:'#fff', borderRadius:20, padding:'6px 12px 6px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 },
  chipDel: { background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:18, height:18, color:'#fff', cursor:'pointer', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 },
  inlineAdd: { display:'flex', gap:10 },
  infoBox: { background:'#fff1ee', border:'1px solid #ffcfbf', borderRadius:8, padding:'10px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#555', marginBottom:16, lineHeight:1.5 },
  storeCard: { background:'#fff', borderRadius:8, padding:'14px 16px', marginBottom:12, border:'1px solid #e8e8e8' },
  storeName: { fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:15, color:'#1a1a1a', marginBottom:4 },
  storeMeta: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888' },
};

Object.assign(window, { AdminPanel });
