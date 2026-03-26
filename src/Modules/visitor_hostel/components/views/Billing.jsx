import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../hooks/useModal';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';
import SearchBar from '../ui/SearchBar';
import EmptyState from '../ui/EmptyState';
import SettleBillModal from '../modals/SettleBillModal';
import RoleRestricted from '../ui/RoleRestricted';
import { formatDate, formatCurrency, formatCurrencyShort } from '../../utils/helpers';
import { useVhAccess } from '../../utils/roleAccess';

export default function Billing() {
  const { state, stats } = useApp();
  const access = useVhAccess();
  const loc = useLocation();
  const settleModal = useModal();
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('');

  useEffect(() => {
    if (loc.state?.search) setSearch(loc.state.search);
  }, [loc.state]);

  const bills = state.bills.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.invoiceNo.toLowerCase().includes(q) || b.visitor.toLowerCase().includes(q) || b.bookingId.toLowerCase().includes(q);
    }
    return true;
  });

  const totalRevenue = state.bills.filter(b => b.status === 'Paid' || b.status === 'Locked').reduce((s, b) => s + b.total, 0);
  const paidCount    = state.bills.filter(b => b.status === 'Paid' || b.status === 'Locked').length;
  const pendingCount = state.bills.filter(b => b.status === 'Pending' || b.status === 'Generated').length;

  if (!access.canViewBilling) {
    return (
      <RoleRestricted
        title="Billing Access Restricted"
        message="Only VhCaretaker and VhIncharge can access billing operations."
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Billing</h1>
        <p className="page-sub">View and settle guest bills</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:24 }}>
        <StatCard label="Total Bills"   value={state.bills.length} />
        <StatCard label="Paid / Locked" value={paidCount}    delta="Settled" deltaType="success" />
        <StatCard label="Pending"       value={pendingCount} delta={pendingCount > 0 ? 'Awaiting payment' : 'All clear'} deltaType={pendingCount > 0 ? 'warn' : 'success'} />
        <StatCard label="Total Revenue" value={formatCurrencyShort(totalRevenue)} delta="From settled bills" deltaType="success" />
      </div>

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by invoice, visitor, booking…" />
          <select className="inline-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="">All status</option>
            <option>Generated</option><option>Pending</option><option>Paid</option><option>Locked</option><option>Cancelled</option>
          </select>
        </div>

        {bills.length === 0
          ? <EmptyState title="No bills found" message="Try adjusting your filters." />
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Booking</th>
                    <th>Visitor</th>
                    <th>Room</th>
                    <th>Meals</th>
                    <th>Extra</th>
                    <th>Total</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b.id}>
                      <td><div className="td-mono">{b.invoiceNo}</div></td>
                      <td><div className="td-mono" style={{ fontSize:12 }}>{b.bookingId}</div></td>
                      <td><div className="td-main">{b.visitor}</div></td>
                      <td>{formatCurrency(b.roomCharges)}</td>
                      <td>{formatCurrency(b.mealCharges)}</td>
                      <td>{formatCurrency(b.extraCharges)}</td>
                      <td><span className="font-medium">{formatCurrency(b.total)}</span></td>
                      <td>
                        <span style={{ color: b.balance > 0 ? 'var(--warn)' : 'var(--success)', fontWeight:500 }}>
                          {formatCurrency(b.balance)}
                        </span>
                      </td>
                      <td><Badge status={b.status}>{b.status}</Badge></td>
                      <td><span className="text-sm text-muted">{formatDate(b.date)}</span></td>
                      <td>
                        {access.canSettleBill && (b.status === 'Pending' || b.status === 'Generated') && (
                          <button className="btn btn-sm btn-primary" onClick={() => settleModal.open(b)}>
                            Settle
                          </button>
                        )}
                        {(b.status === 'Paid' || b.status === 'Locked' || b.status === 'Cancelled') && (
                          <span className="text-sm text-hint">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {access.canSettleBill && (
        <SettleBillModal isOpen={settleModal.isOpen} onClose={settleModal.close} bill={settleModal.data} />
      )}
    </div>
  );
}
