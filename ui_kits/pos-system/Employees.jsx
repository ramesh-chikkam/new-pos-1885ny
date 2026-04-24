// Employees.jsx — Staff Management

function Employees() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({});

  const ROLES = ['admin','manager','cashier','kitchen','delivery'];
  const ROLE_LABELS = { admin:'Admin', manager:'Manager', cashier:'Cashier', kitchen:'Kitchen', delivery:'Delivery' };
  const ROLE_COLORS = { admin:'#ff6347', manager:'#c9921a', cashier:'#22a06b', kitchen:'#0ea5e9', delivery:'#8b5cf6' };

  function openNew() {
    setForm({ id: genId('e'), name: '', pin: '', role: 'cashier', storeIds: [state.stores[0]?.id || ''], active: true, joinDate: today() });
    setEditing('new');
  }
    function openEdit(emp) { setForm({ ...emp, storeIds: [...(emp.store_ids || emp.storeIds || [])] }); setEditing(emp.id); }
  function toggleStore(sid) {
    setForm(f => {
      const has = f.storeIds.includes(sid);
      return { ...f, storeIds: has ? f.storeIds.filter(s=>s!==sid) : [...f.storeIds, sid] };
    });
  }
  function save() {
    if (!form.name || !form.pin || form.pin.length < 4) { alert('Name and 4+ digit PIN required.'); return; }
    dispatch({ type: 'SAVE_EMPLOYEE', emp: form });
    setEditing(null);
  }

  return (
    <div style={empStyles.root}>
      <div style={empStyles.listPanel}>
        <div style={empStyles.header}>
          <div style={empStyles.title}>Staff Members</div>
          <button style={empStyles.addBtn} onClick={openNew}>+ Add Employee</button>
        </div>
        <div style={empStyles.list}>
          {state.employees.map(emp => {
              const storeNames = (emp.store_ids || emp.storeIds || []).map(sid => state.stores.find(s=>s.id===sid)?.name?.split('—')[0]?.trim() || sid).join(', ');
            return (
              <div key={emp.id} style={{ ...empStyles.row, opacity: emp.active ? 1 : 0.5 }}>
                <div style={empStyles.avatar}>{emp.name[0]}</div>
                <div style={empStyles.info}>
                  <div style={empStyles.name}>{emp.name}</div>
                  <div style={empStyles.meta}>{storeNames}</div>
                </div>
                <div style={{...empStyles.roleBadge, background: ROLE_COLORS[emp.role]+'22', color: ROLE_COLORS[emp.role]}}>{ROLE_LABELS[emp.role]}</div>
                <div style={empStyles.actions}>
                  <button style={empStyles.editBtn} onClick={() => openEdit(emp)}>Edit</button>
                  <button style={{...empStyles.toggleBtn, background: emp.active ? '#fee2e2' : '#dcfce7', color: emp.active ? '#dc2626' : '#16a34a'}}
                    onClick={() => dispatch({ type: 'TOGGLE_EMPLOYEE', id: emp.id })}>
                    {emp.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editing && (
        <div style={empStyles.formPanel}>
          <div style={empStyles.formTitle}>{editing === 'new' ? 'New Employee' : 'Edit Employee'}</div>

          <div style={empStyles.fieldGroup}>
            <label style={empStyles.label}>Full Name</label>
            <input style={empStyles.input} value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="Employee name" />
          </div>
          <div style={empStyles.fieldGroup}>
            <label style={empStyles.label}>PIN (4–6 digits)</label>
            <input style={empStyles.input} type="password" value={form.pin} onChange={e => setForm(f=>({...f, pin:e.target.value}))} placeholder="••••" maxLength={6} />
          </div>
          <div style={empStyles.fieldGroup}>
            <label style={empStyles.label}>Role</label>
            <div style={empStyles.roleGrid}>
              {ROLES.map(r => (
                <button key={r} style={{ ...empStyles.roleBtn, ...(form.role===r ? { background: ROLE_COLORS[r], color:'#fff', border:`2px solid ${ROLE_COLORS[r]}` } : {}) }}
                  onClick={() => setForm(f=>({...f, role:r}))}>{ROLE_LABELS[r]}</button>
              ))}
            </div>
          </div>
          <div style={empStyles.fieldGroup}>
            <label style={empStyles.label}>Assigned Stores</label>
            {state.stores.map(s => (
              <label key={s.id} style={empStyles.checkRow}>
                <input type="checkbox" checked={form.storeIds.includes(s.id)} onChange={() => toggleStore(s.id)} style={{accentColor:'#ff6347'}} />
                <span style={empStyles.checkLabel}>{s.name}</span>
              </label>
            ))}
          </div>
          <div style={empStyles.fieldGroup}>
            <label style={empStyles.label}>Join Date</label>
            <input style={empStyles.input} type="date" value={form.joinDate} onChange={e => setForm(f=>({...f, joinDate:e.target.value}))} />
          </div>
          <div style={empStyles.fieldGroup}>
            <label style={empStyles.checkRow}>
              <input type="checkbox" checked={form.active} onChange={e => setForm(f=>({...f, active:e.target.checked}))} style={{accentColor:'#ff6347'}} />
              <span style={empStyles.checkLabel}>Active (can log in)</span>
            </label>
          </div>

          <div style={empStyles.btns}>
            <button style={empStyles.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
            <button style={empStyles.saveBtn} onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

const empStyles = {
  root: { display:'flex', height:'100%' },
  listPanel: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'#fff', borderBottom:'1px solid #e8e8e8' },
  title: { fontFamily:'Anton, sans-serif', fontSize:22, color:'#1a1a1a' },
  addBtn: { background:'#ff6347', border:'none', borderRadius:6, padding:'9px 18px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:13, color:'#fff', cursor:'pointer' },
  list: { flex:1, overflowY:'auto' },
  row: { display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:'1px solid #f0f0f0', background:'#fff', transition:'opacity 0.2s' },
  avatar: { width:40, height:40, borderRadius:'50%', background:'#1a1a1a', color:'#ff6347', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Anton, sans-serif', fontSize:18, flexShrink:0 },
  info: { flex:1, minWidth:0 },
  name: { fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:14, color:'#1a1a1a' },
  meta: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888', marginTop:2 },
  roleBadge: { padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, fontFamily:'DM Sans, Arial, sans-serif', flexShrink:0 },
  actions: { display:'flex', gap:8, flexShrink:0 },
  editBtn: { background:'#f4f4f4', border:'none', borderRadius:5, padding:'7px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:600, color:'#333', cursor:'pointer' },
  toggleBtn: { border:'none', borderRadius:5, padding:'7px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:700, cursor:'pointer' },
  formPanel: { width:300, background:'#fff', borderLeft:'1px solid #e8e8e8', padding:'20px', overflowY:'auto', flexShrink:0 },
  formTitle: { fontFamily:'Anton, sans-serif', fontSize:20, color:'#1a1a1a', marginBottom:18 },
  fieldGroup: { marginBottom:16 },
  label: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', display:'block', marginBottom:6 },
  input: { width:'100%', padding:'8px 10px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', boxSizing:'border-box' },
  roleGrid: { display:'flex', flexWrap:'wrap', gap:6 },
  roleBtn: { background:'#f4f4f4', border:'2px solid transparent', borderRadius:6, padding:'6px 12px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:600, color:'#555', cursor:'pointer' },
  checkRow: { display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer' },
  checkLabel: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#333' },
  btns: { display:'flex', gap:8, marginTop:20 },
  cancelBtn: { background:'#f4f4f4', border:'none', borderRadius:6, padding:'10px 16px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:13, color:'#555', cursor:'pointer' },
  saveBtn: { flex:1, background:'#ff6347', border:'none', borderRadius:6, padding:'10px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:14, color:'#fff', cursor:'pointer' },
};

Object.assign(window, { Employees });
