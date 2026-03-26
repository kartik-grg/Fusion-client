import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import RoleRestricted from '../ui/RoleRestricted';
import { formatDate, formatCurrency, formatCurrencyShort } from '../../utils/helpers';
import { useVhAccess } from '../../utils/roleAccess';

const CHART_COLORS = ['#3d3991','#0d6b50','#b87213','#1558a0','#d85a30','#73726c'];

const monthKey = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

const getRecentMonths = (count = 6) => {
  const now = new Date();
  return Array.from({ length: count }).map((_, idx) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - idx - 1), 1);
    return {
      key: `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`,
      label: date.toLocaleString('en-US', { month: 'short' }),
    };
  });
};

export default function Reports() {
  const { state } = useApp();
  const access = useVhAccess();
  const [from, setFrom] = useState('2024-03-01');
  const [to,   setTo]   = useState('2024-03-31');
  const [statusFilter, setStatus] = useState('');

  const filtered = state.bookings.filter(b => {
    const afterFrom  = !from || b.checkin  >= from;
    const beforeTo   = !to   || b.checkout <= to;
    const matchStatus= !statusFilter || b.status === statusFilter;
    return afterFrom && beforeTo && matchStatus;
  });

  const checkedOut = filtered.filter(b => b.status === 'CheckedOut');
  const totalRevenue = state.bills
    .filter(b => b.status === 'Paid' || b.status === 'Locked')
    .reduce((s, b) => s + b.total, 0);

  const recentMonths = getRecentMonths(6);

  const monthlyBookings = recentMonths.map(({ key, label }) => {
    const monthBookings = state.bookings.filter((booking) => monthKey(booking.checkin) === key);
    return {
      month: label,
      confirmed: monthBookings.filter((booking) =>
        ['Confirmed', 'CheckedIn', 'CheckedOut'].includes(booking.status)
      ).length,
      cancelled: monthBookings.filter((booking) => ['Cancelled', 'Rejected', 'Expired', 'NoShow'].includes(booking.status)).length,
    };
  });

  const categoryCounts = filtered.reduce((acc, booking) => {
    const category = booking.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryDistribution = Object.entries(categoryCounts)
    .map(([name, count], idx) => ({
      name,
      count,
      value: filtered.length ? Math.round((count / filtered.length) * 100) : 0,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);

  const revenueData = recentMonths.map(({ key, label }) => ({
    month: label,
    revenue: state.bills
      .filter((bill) => ['Paid', 'Locked'].includes(bill.status) && monthKey(bill.date) === key)
      .reduce((sum, bill) => sum + bill.total, 0),
  }));

  if (!access.canViewReports) {
    return (
      <RoleRestricted
        title="Reports Access Restricted"
        message="Only VhIncharge can access visitor hostel reports and analytics."
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-sub">Operational insights and booking statistics</p>
      </div>

      {/* Filters */}
      <div className="card mb-20">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div className="card-title">Report Filters</div>
        </div>
        <div className="form-grid-3" style={{ marginTop: 16, alignItems:'end' }}>
          <div className="form-group">
            <label>From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Booking Status</label>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option>Confirmed</option><option>CheckedOut</option><option>NoShow</option><option>Cancelled</option><option>Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(5,1fr)', marginBottom:24 }}>
        <StatCard label="Total Bookings"  value={filtered.length} />
        <StatCard label="Confirmed"       value={filtered.filter(b=>b.status==='Confirmed'||b.status==='CheckedIn'||b.status==='CheckedOut').length} delta="Rate" deltaType="success" />
        <StatCard label="Checked Out"     value={checkedOut.length} />
        <StatCard label="Cancelled"       value={filtered.filter(b=>b.status==='Cancelled').length} deltaType="danger" />
        <StatCard label="Revenue"         value={formatCurrencyShort(totalRevenue)} delta="Settled" deltaType="success" />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ gap:20, marginBottom:20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Bookings (Oct–Mar)</div></div>
          <div style={{ fontSize:12, display:'flex', gap:16, marginBottom:12 }}>
            <span style={{ display:'flex', alignItems:'center', gap:5, color:'var(--ink-500)' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:'#3d3991', display:'inline-block' }} /> Confirmed
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5, color:'var(--ink-500)' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:'#e24b4a', display:'inline-block' }} /> Cancelled
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyBookings} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e1db" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#6b6b8e' }} />
              <YAxis tick={{ fontSize:11, fill:'#6b6b8e' }} />
              <Tooltip contentStyle={{ fontSize:12, borderRadius:6, border:'1px solid #e2e1db' }} />
              <Bar dataKey="confirmed" fill="#3d3991" radius={[3,3,0,0]} />
              <Bar dataKey="cancelled" fill="#e24b4a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Visitor Category Breakdown</div></div>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {categoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize:12, borderRadius:6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
              {categoryDistribution.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:11 }}>
                  <span style={{ width:9, height:9, borderRadius:2, background:c.color, flexShrink:0 }} />
                  <span style={{ flex:1, color:'var(--ink-500)' }}>{c.name}</span>
                  <span style={{ fontWeight:500, color:'var(--ink-700)' }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue trend */}
      <div className="card mb-20">
        <div className="card-header"><div className="card-title">Revenue Trend (₹)</div></div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={revenueData} margin={{ top:0, right:16, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e1db" />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#6b6b8e' }} />
            <YAxis tick={{ fontSize:11, fill:'#6b6b8e' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} contentStyle={{ fontSize:12, borderRadius:6, border:'1px solid #e2e1db' }} />
            <Line type="monotone" dataKey="revenue" stroke="#3d3991" strokeWidth={2} dot={{ r:4, fill:'#3d3991' }} activeDot={{ r:6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Booking Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Booking Summary</div>
          <span className="text-sm text-muted">{filtered.length} records</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking #</th><th>Visitor</th><th>Category</th>
                <th>Check-in</th><th>Check-out</th><th>Billed To</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td><div className="td-mono">{b.id}</div></td>
                  <td>
                    <div className="td-main">{b.visitor}</div>
                    <div className="td-sub">{b.org}</div>
                  </td>
                  <td><span style={{ fontSize:11, padding:'2px 7px', borderRadius:10, background:'var(--surface-bg)', border:'1px solid var(--border)', color:'var(--ink-500)' }}>{b.category}</span></td>
                  <td>{formatDate(b.checkin)}</td>
                  <td>{formatDate(b.checkout)}</td>
                  <td className="text-sm text-muted">{b.billedTo || '—'}</td>
                  <td><Badge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
