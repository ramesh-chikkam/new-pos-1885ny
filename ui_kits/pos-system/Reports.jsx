// Reports.jsx — Sales, Attendance & Inventory Reports

function Reports() {
  const { state, dispatch } = useApp();
    React.useEffect(() => {
        dispatch({ type: 'RELOAD_ORDERS', storeId: state.currentStore?.id });
    }, []);
  const [tab, setTab] = React.useState('sales');
  const [period, setPeriod] = React.useState('today');
  const [customDate, setCustomDate] = React.useState(today());
  const [storeFilter, setStoreFilter] = React.useState(state.currentStore?.id || 'all');

  // Date range helpers
  function getDateRange() {
    const now = new Date();
    if (period === 'today') return [today(), today()];
    if (period === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - 6);
      return [d.toISOString().slice(0,10), today()];
    }
    if (period === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return [d.toISOString().slice(0,10), today()];
    }
    if (period === 'custom') return [customDate, customDate];
    return [today(), today()];
  }
  const [from, to] = getDateRange();

  const filteredOrders = state.orders.filter(o => {
    const d = o.createdAt.slice(0,10);
    const matchDate = d >= from && d <= to;
    const matchStore = storeFilter === 'all' || o.storeId === storeFilter;
    return matchDate && matchStore;
  });

  // Summary stats
  const totalRevenue = filteredOrders.reduce((s, o) => s + o.grandTotal, 0);
  const totalOrders = filteredOrders.length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
  const totalTax = filteredOrders.reduce((s, o) => s + o.cgstTotal + o.sgstTotal, 0);

  // Item-wise breakdown
  const itemSales = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(item => {
      if (!itemSales[item.name]) itemSales[item.name] = { qty: 0, revenue: 0 };
      itemSales[item.name].qty += item.qty;
      itemSales[item.name].revenue += item.total;
    });
  });
  const itemRows = Object.entries(itemSales).sort((a,b) => b[1].revenue - a[1].revenue);

  // Payment breakdown
  const payBreakdown = {};
  filteredOrders.forEach(o => {
    const m = o.paymentMethod || 'Unknown';
    if (!payBreakdown[m]) payBreakdown[m] = { count: 0, total: 0 };
    payBreakdown[m].count++;
    payBreakdown[m].total += o.grandTotal;
  });

  // Attendance summary
  const [attFrom, attTo] = getDateRange();
  const attLog = state.attendance.filter(a => {
    const matchDate = a.date >= attFrom && a.date <= attTo;
    const matchStore = storeFilter === 'all' || a.storeId === storeFilter;
    return matchDate && matchStore;
  });

  const PAY_COLORS = ['#ff6347','#c9921a','#22a06b','#0ea5e9','#8b5cf6'];

  function timeStr(iso) { return iso ? new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '—'; }
  function duration(ci, co) {
    if (!co) return 'Active';
    const ms = new Date(co) - new Date(ci);
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  const maxRev = itemRows.length ? itemRows[0][1].revenue : 1;

  return (
    <div style={repStyles.root}>
      {/* Top toolbar */}
      <div style={repStyles.toolbar}>
        <div style={repStyles.tabs}>
          {[['sales','Sales'],['items','Item Breakdown'],['payments','Payments'],['attendance','Attendance']].map(([k,l]) => (
            <button key={k} style={tab===k ? repStyles.tabActive : repStyles.tab} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div style={repStyles.filters}>
          {['today','week','month','custom'].map(p => (
            <button key={p} style={period===p ? repStyles.periodActive : repStyles.period} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
          {period === 'custom' && (
            <input type="date" style={repStyles.dateInput} value={customDate} onChange={e => setCustomDate(e.target.value)} />
          )}
          <select style={repStyles.storeSelect} value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
            <option value="all">All Stores</option>
            {state.stores.map(s => <option key={s.id} value={s.id}>{s.name.split('—')[0].trim()}</option>)}
          </select>
        </div>
      </div>

      <div style={repStyles.body}>
        {/* Sales Tab */}
        {tab === 'sales' && (
          <div>
            <div style={repStyles.kpiRow}>
              {[
                { label: 'Total Revenue', value: fmt(totalRevenue), color: '#ff6347' },
                { label: 'Orders', value: totalOrders, color: '#1a1a1a' },
                { label: 'Avg Order Value', value: fmt(avgOrder), color: '#c9921a' },
                { label: 'Tax Collected', value: fmt(totalTax), color: '#22a06b' },
              ].map(k => (
                <div key={k.label} style={repStyles.kpi}>
                  <div style={{...repStyles.kpiValue, color: k.color}}>{k.value}</div>
                  <div style={repStyles.kpiLabel}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders table */}
            <div style={repStyles.section}>
              <div style={repStyles.sectionTitle}>Recent Orders</div>
              <div style={repStyles.tableWrap}>
                <table style={repStyles.table}>
                  <thead><tr style={repStyles.thead}>
                    <th style={repStyles.th}>Order ID</th>
                    <th style={repStyles.th}>Time</th>
                    <th style={repStyles.th}>Staff</th>
                    <th style={repStyles.th}>Type</th>
                    <th style={repStyles.th}>Payment</th>
                    <th style={repStyles.th}>Items</th>
                    <th style={{...repStyles.th, textAlign:'right'}}>Total</th>
                  </tr></thead>
                  <tbody>
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={7} style={repStyles.emptyCell}>No orders in this period.</td></tr>
                    )}
                    {[...filteredOrders].reverse().map(o => (
                      <tr key={o.id} style={repStyles.row}>
                        <td style={repStyles.tdMono}>#{o.id.slice(-8).toUpperCase()}</td>
                        <td style={repStyles.td}>{new Date(o.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td>
                        <td style={repStyles.td}>{o.staffName}</td>
                        <td style={repStyles.td}>{o.orderType || 'Dine In'}</td>
                        <td style={repStyles.td}>{o.paymentMethod}</td>
                        <td style={repStyles.td}>{(o.items||[]).length} items</td>
                        <td style={{...repStyles.tdMono, textAlign:'right', fontWeight:700, color:'#1a1a1a'}}>{fmt(o.grandTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Item Breakdown */}
        {tab === 'items' && (
          <div style={repStyles.section}>
            <div style={repStyles.sectionTitle}>Item-wise Sales</div>
            {itemRows.length === 0 && <div style={repStyles.empty}>No data for this period.</div>}
            {itemRows.map(([name, d], i) => (
              <div key={name} style={repStyles.itemRow}>
                <div style={repStyles.itemRank}>{i+1}</div>
                <div style={repStyles.itemInfo}>
                  <div style={repStyles.itemName}>{name}</div>
                  <div style={repStyles.barWrap}>
                    <div style={{...repStyles.bar, width: Math.round((d.revenue/maxRev)*100)+'%'}} />
                  </div>
                </div>
                <div style={repStyles.itemStats}>
                  <div style={repStyles.itemQty}>{d.qty} sold</div>
                  <div style={repStyles.itemRev}>{fmt(d.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Breakdown */}
        {tab === 'payments' && (
          <div style={repStyles.section}>
            <div style={repStyles.sectionTitle}>Payment Method Breakdown</div>
            {Object.keys(payBreakdown).length === 0 && <div style={repStyles.empty}>No data for this period.</div>}
            <div style={repStyles.payGrid}>
              {Object.entries(payBreakdown).map(([method, d], i) => (
                <div key={method} style={{...repStyles.payCard, borderTop: `4px solid ${PAY_COLORS[i % PAY_COLORS.length]}`}}>
                  <div style={repStyles.payMethod}>{method}</div>
                  <div style={{...repStyles.payAmt, color: PAY_COLORS[i % PAY_COLORS.length]}}>{fmt(d.total)}</div>
                  <div style={repStyles.payCount}>{d.count} order{d.count!==1?'s':''}</div>
                  <div style={repStyles.payShare}>{totalRevenue ? Math.round(d.total/totalRevenue*100) : 0}% of revenue</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance */}
        {tab === 'attendance' && (
          <div style={repStyles.section}>
            <div style={repStyles.sectionTitle}>Attendance Summary</div>
            {attLog.length === 0 && <div style={repStyles.empty}>No attendance records for this period.</div>}
            <div style={repStyles.tableWrap}>
              <table style={repStyles.table}>
                <thead><tr style={repStyles.thead}>
                  <th style={repStyles.th}>Employee</th>
                  <th style={repStyles.th}>Date</th>
                  <th style={repStyles.th}>Store</th>
                  <th style={repStyles.th}>Clock In</th>
                  <th style={repStyles.th}>Clock Out</th>
                  <th style={repStyles.th}>Duration</th>
                </tr></thead>
                <tbody>
                  {attLog.map(a => {
                    const emp = state.employees.find(e => e.id === a.empId);
                    const store = state.stores.find(s => s.id === a.storeId);
                    return (
                      <tr key={a.id} style={repStyles.row}>
                        <td style={repStyles.td}>{emp?.name || a.empId}</td>
                        <td style={repStyles.tdMono}>{a.date}</td>
                        <td style={repStyles.td}>{store?.name?.split('—')[0]?.trim() || a.storeId}</td>
                        <td style={repStyles.tdMono}>{timeStr(a.clockIn)}</td>
                        <td style={repStyles.tdMono}>{timeStr(a.clockOut)}</td>
                        <td style={repStyles.tdMono}>{duration(a.clockIn, a.clockOut)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const repStyles = {
  root: { display:'flex', flexDirection:'column', height:'100%', background:'#f8f8f8', overflow:'hidden' },
  toolbar: { background:'#fff', borderBottom:'2px solid #e8e8e8', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 },
  tabs: { display:'flex', gap:4 },
  tab: { background:'transparent', border:'none', borderRadius:6, padding:'8px 16px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, fontWeight:600, color:'#555', cursor:'pointer' },
  tabActive: { background:'#1a1a1a', border:'none', borderRadius:6, padding:'8px 16px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer' },
  filters: { display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' },
  period: { background:'#f4f4f4', border:'1px solid #e0e0e0', borderRadius:20, padding:'5px 12px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:600, color:'#555', cursor:'pointer' },
  periodActive: { background:'#ff6347', border:'1px solid #ff6347', borderRadius:20, padding:'5px 12px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer' },
  dateInput: { padding:'6px 10px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Mono, monospace', fontSize:12, outline:'none', background:'#fff' },
  storeSelect: { padding:'6px 10px', border:'1px solid #e0e0e0', borderRadius:6, fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, outline:'none', background:'#fff' },
  body: { flex:1, overflowY:'auto', padding:'20px' },
  kpiRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  kpi: { background:'#fff', borderRadius:10, padding:'18px 20px', border:'1px solid #e8e8e8' },
  kpiValue: { fontFamily:'Anton, sans-serif', fontSize:28, marginBottom:4 },
  kpiLabel: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888' },
  section: {},
  sectionTitle: { fontFamily:'Anton, sans-serif', fontSize:20, color:'#1a1a1a', marginBottom:14 },
  tableWrap: { background:'#fff', borderRadius:10, border:'1px solid #e8e8e8', overflow:'auto' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#f4f4f4' },
  th: { padding:'11px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', textAlign:'left', borderBottom:'1px solid #e8e8e8' },
  row: { borderBottom:'1px solid #f0f0f0' },
  td: { padding:'11px 14px', fontFamily:'DM Sans, Arial, sans-serif', fontSize:13, color:'#1a1a1a' },
  tdMono: { padding:'11px 14px', fontFamily:'DM Mono, monospace', fontSize:12, color:'#555' },
  emptyCell: { padding:32, textAlign:'center', color:'#aaa', fontFamily:'DM Sans, Arial, sans-serif' },
  empty: { textAlign:'center', padding:40, color:'#aaa', fontFamily:'DM Sans, Arial, sans-serif', background:'#fff', borderRadius:10 },
  itemRow: { display:'flex', alignItems:'center', gap:16, background:'#fff', borderRadius:8, padding:'14px 16px', marginBottom:8, border:'1px solid #e8e8e8' },
  itemRank: { fontFamily:'Anton, sans-serif', fontSize:20, color:'#e0e0e0', minWidth:28, textAlign:'center' },
  itemInfo: { flex:1, minWidth:0 },
  itemName: { fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:14, color:'#1a1a1a', marginBottom:6 },
  barWrap: { background:'#f4f4f4', borderRadius:4, height:6, overflow:'hidden' },
  bar: { background:'#ff6347', height:'100%', borderRadius:4, transition:'width 0.4s' },
  itemStats: { textAlign:'right', flexShrink:0 },
  itemQty: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888', marginBottom:2 },
  itemRev: { fontFamily:'DM Mono, monospace', fontSize:16, fontWeight:600, color:'#1a1a1a' },
  payGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:16 },
  payCard: { background:'#fff', borderRadius:10, padding:'18px 20px', border:'1px solid #e8e8e8' },
  payMethod: { fontFamily:'DM Sans, Arial, sans-serif', fontWeight:700, fontSize:14, color:'#1a1a1a', marginBottom:8 },
  payAmt: { fontFamily:'Anton, sans-serif', fontSize:26, marginBottom:4 },
  payCount: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#888', marginBottom:2 },
  payShare: { fontFamily:'DM Sans, Arial, sans-serif', fontSize:12, color:'#aaa' },
};

Object.assign(window, { Reports });
