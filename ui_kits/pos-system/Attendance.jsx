// Attendance.jsx — Staff Clock In / Out + Log

function Attendance() {
  const { state, dispatch } = useApp();
  const [dateFilter, setDateFilter] = React.useState(today());
  const [storeFilter, setStoreFilter] = React.useState(state.currentStore?.id || 'all');

  // Clock in/out for current user
  const currentEmp = state.currentUser;
  const todayRecs = state.attendance.filter(a => a.empId === currentEmp.id && a.date === today() && a.storeId === state.currentStore?.id);
  const activeSession = todayRecs.find(a => !a.clockOut);

  function clockIn() { dispatch({ type: 'CLOCK_IN', empId: currentEmp.id, storeId: state.currentStore?.id }); }
  function clockOut() { if (activeSession) dispatch({ type: 'CLOCK_OUT', id: activeSession.id }); }

  // Filtered log
  const log = state.attendance.filter(a => {
    const matchDate = a.date === dateFilter;
    const matchStore = storeFilter === 'all' || a.storeId === storeFilter;
    return matchDate && matchStore;
  });

  function duration(clockIn, clockOut) {
    if (!clockOut) return '—';
    const ms = new Date(clockOut) - new Date(clockIn);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }
  function timeStr(iso) { return iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'; }

  const ROLE_COLORS = { admin:'#ff6347', manager:'#c9921a', cashier:'#22a06b', kitchen:'#0ea5e9', delivery:'#8b5cf6' };

  return (
    <div style={attStyles.root}>
      {/* My Session Card */}
      <div style={attStyles.myCard}>
        <div style={attStyles.myCardLeft}>
          <div style={attStyles.myLabel}>Your Shift Today</div>
          <div style={attStyles.myName}>{currentEmp.name}</div>
          <div style={attStyles.myStore}>{state.currentStore?.name}</div>
          {activeSession && (
            <div style={attStyles.clockedSince}>Clocked in at {timeStr(activeSession.clockIn)}</div>
          )}
        </div>
        <div style={attStyles.myCardRight}>
          {activeSession ? (
            <button style={attStyles.clockOutBtn} onClick={clockOut}>⏹ Clock Out</button>
          ) : (
            <button style={attStyles.clockInBtn} onClick={clockIn}>▶ Clock In</button>
          )}
          <div style={attStyles.sessionStatus}>
            {activeSession ? '🟢 On shift' : todayRecs.length > 0 ? '✅ Shift complete' : '⬜ Not clocked in'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={attStyles.filterRow}>
        <div style={attStyles.filterLabel}>Attendance Log</div>
        <input type="date" style={attStyles.dateInput} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <select style={attStyles.storeSelect} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
          <option value="all">All Stores</option>
          {state.stores.map(s => <option key={s.id} value={s.id}>{s.name.split('—')[0].trim()}</option>)}
        </select>
      </div>

      {/* Log Table */}
      <div style={attStyles.tableWrap}>
        <table style={attStyles.table}>
          <thead>
            <tr style={attStyles.thead}>
              <th style={attStyles.th}>Employee</th>
              <th style={attStyles.th}>Role</th>
              <th style={attStyles.th}>Store</th>
              <th style={attStyles.th}>Clock In</th>
              <th style={attStyles.th}>Clock Out</th>
              <th style={attStyles.th}>Duration</th>
              <th style={attStyles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {log.length === 0 && (
              <tr><td colSpan={7} style={attStyles.emptyCell}>No attendance records for this date.</td></tr>
            )}
            {log.map(a => {
              const emp = state.employees.find(e => e.id === a.empId);
              const store = state.stores.find(s => s.id === a.storeId);
              return (
                <tr key={a.id} style={attStyles.row}>
                  <td style={attStyles.td}>
                    <div style={attStyles.empCell}>
                      <div style={{...attStyles.dot, background: ROLE_COLORS[emp?.role] || '#ccc'}} />
                      {emp?.name || a.empId}
                    </div>
                  </td>
                  <td style={attStyles.td}>{emp?.role ? emp.role.charAt(0).toUpperCase()+emp.role.slice(1) : '—'}</td>
                  <td style={attStyles.td}>{store?.name?.split('—')[0]?.trim() || a.storeId}</td>
                  <td style={attStyles.tdMono}>{timeStr(a.clockIn)}</td>
                  <td style={attStyles.tdMono}>{timeStr(a.clockOut)}</td>
                  <td style={attStyles.tdMono}>{duration(a.clockIn, a.clockOut)}</td>
                  <td style={attStyles.td}>
                    <span style={{...attStyles.badge, background: a.clockOut ? '#dcfce7' : '#fef9c3', color: a.clockOut ? '#16a34a' : '#b45309'}}>
                      {a.clockOut ? 'Complete' : 'On Shift'}
                    </span>
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

const attStyles = {
  root: { display:'flex', flexDirection:'column', height:'100%', overflowY:'auto', background:'#f8f8f8' },
  myCard: { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a1a1a', margin:20, borderRadius:12, padding:'20px 24px', color:'#fff' },
  myCardLeft: {},
  myLabel: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#888', marginBottom:4 },
  myName: { fontFamily:'Anton, sans-serif', fontSize:24, color:'#fff', marginBottom:2 },
  myStore: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#888' },
  clockedSince: { fontFamily:'DM Mono, monospace', fontSize:13, color:'#ff6347', marginTop:6 },
  myCardRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 },
  clockInBtn: { background:'#22a06b', border:'none', borderRadius:8, padding:'12px 24px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:15, color:'#fff', cursor:'pointer' },
  clockOutBtn: { background:'#ff6347', border:'none', borderRadius:8, padding:'12px 24px', fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:15, color:'#fff', cursor:'pointer' },
  sessionStatus: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#888' },
  filterRow: { display:'flex', alignItems:'center', gap:12, padding:'0 20px 12px', flexWrap:'wrap' },
  filterLabel: { fontFamily:'Anton, sans-serif', fontSize:20, color:'#1a1a1a', flex:1 },
  dateInput: { padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', background:'#fff' },
  storeSelect: { padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, outline:'none', background:'#fff' },
  tableWrap: { flex:1, overflowX:'auto', margin:'0 20px 20px', background:'#fff', borderRadius:10, border:'1px solid #e8e8e8' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#f4f4f4' },
  th: { padding:'12px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', textAlign:'left', borderBottom:'1px solid #e8e8e8' },
  row: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'12px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#1a1a1a' },
  tdMono: { padding:'12px 14px', fontFamily:'DM Mono, monospace', fontSize:13, color:'#1a1a1a' },
  emptyCell: { padding:'32px', textAlign:'center', color:'#aaa', fontFamily:'DM Sans, Arial, sans-serif' },
  empCell: { display:'flex', alignItems:'center', gap:8 },
  dot: { width:8, height:8, borderRadius:'50%', flexShrink:0 },
  badge: { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, fontFamily:'DM Sans, Arial, sans-serif' },
};

Object.assign(window, { Attendance });
