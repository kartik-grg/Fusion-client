import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import StatCard from '../ui/StatCard';
import Badge from '../ui/Badge';
import { formatDate, formatCurrencyShort } from '../../utils/helpers';
import ConfirmBookingModal from '../modals/ConfirmBookingModal';

export default function Dashboard() {
  const { state, stats, dispatch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const confirmModal = useModal();

  const pending   = state.bookings.filter(b => b.status === 'Pending').slice(0, 5);
  const forwarded = state.bookings.filter(b => b.status === 'Forwarded').slice(0, 5);
  const actionable = [...forwarded, ...pending].slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good morning, In-Charge</h1>
        <p className="page-sub">Here's what's happening at the Visitor Hostel today</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Bookings"  value={stats.totalBookings}  delta="All time" />
        <StatCard label="Pending Review"  value={stats.pendingCount + stats.forwardedCount}
          delta={stats.pendingCount + stats.forwardedCount > 0 ? 'Needs action' : 'All clear'}
          deltaType={stats.pendingCount + stats.forwardedCount > 0 ? 'warn' : 'success'}
        />
        <StatCard label="Checked In"      value={stats.checkedInCount} delta="Currently in-house" />
        <StatCard label="Available Rooms" value={stats.availableRooms} delta={`of ${state.rooms.length} total`} />
        <StatCard
          label="Revenue (Month)"
          value={formatCurrencyShort(stats.monthlyRevenue)}
          delta="Settled bills" deltaType="success"
        />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStockCount}
          delta={stats.lowStockCount > 0 ? 'Reorder needed' : 'All stocked'}
          deltaType={stats.lowStockCount > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Pending Approvals */}
        <div className="card" style={{ gridColumn: '1 / 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Pending Approvals</div>
              <div className="card-sub">Bookings awaiting your action</div>
            </div>
            <button className="btn btn-sm" onClick={() => navigate('bookings')}>View all</button>
          </div>
          {actionable.length === 0
            ? <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No pending approvals 🎉</p>
              </div>
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Booking</th><th>Visitor</th><th>Check-in</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {actionable.map(b => (
                      <tr key={b.id}>
                        <td><div className="td-mono">{b.id}</div></td>
                        <td>
                          <div className="td-main">{b.visitor}</div>
                          <div className="td-sub">{b.org} · {b.category}</div>
                        </td>
                        <td>
                          <div className="td-main">{formatDate(b.checkin)}</div>
                          <div className="td-sub">{b.rooms} room(s)</div>
                        </td>
                        <td><Badge status={b.status} /></td>
                        <td>
                          <div className="flex gap-4">
                            {b.status === 'Forwarded' && (
                              <>
                                <button className="btn btn-sm btn-success" onClick={() => confirmModal.open(b)}>Confirm</button>
                                <button className="btn btn-sm btn-danger" onClick={() => {
                                  dispatch({ type: 'REJECT_BOOKING', id: b.id }); toast.info(`${b.id} rejected`);
                                }}>Reject</button>
                              </>
                            )}
                            {b.status === 'Pending' && (
                              <button className="btn btn-sm" onClick={() => {
                                dispatch({ type: 'FORWARD_BOOKING', id: b.id }); toast.success(`${b.id} forwarded`);
                              }}>Forward</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-16">
          {/* Activity Feed */}
          <div className="card">
            <div className="card-header"><div className="card-title">Today's Activity</div></div>
            <div>
              {[
                { color: 'var(--success)', msg: 'Room 104 — Checked in', time: '09:32' },
                { color: 'var(--warn)',    msg: 'VH20240289 — Due check-out at noon', time: '12:00' },
                { color: 'var(--danger)',  msg: 'Bed Sheets below threshold (4 left)', time: 'Alert' },
                { color: 'var(--brand)',   msg: 'Bill INV20240125 settled ₹5,200', time: '08:15' },
              ].map((item, i) => (
                <div key={i} className="feed-item" style={{ background: 'var(--surface-bg)' }}>
                  <div className="feed-dot" style={{ background: item.color }} />
                  <span style={{ flex: 1, fontSize: 12 }}>{item.msg}</span>
                  <span className="feed-time">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy */}
          <div className="card">
            <div className="card-header"><div className="card-title">Occupancy by Room Type</div></div>
            {[
              { type:'Single', occ: state.rooms.filter(r=>r.type==='Single'&&r.status==='Occupied').length, total: state.rooms.filter(r=>r.type==='Single').length, color:'var(--brand-mid)' },
              { type:'Double', occ: state.rooms.filter(r=>r.type==='Double'&&r.status==='Occupied').length, total: state.rooms.filter(r=>r.type==='Double').length, color:'var(--success-mid)' },
              { type:'Suite',  occ: state.rooms.filter(r=>r.type==='Suite' &&r.status==='Occupied').length, total: state.rooms.filter(r=>r.type==='Suite').length,  color:'var(--warn)' },
            ].map(r => {
              const pct = r.total > 0 ? Math.round((r.occ / r.total) * 100) : 0;
              return (
                <div key={r.type} style={{ marginBottom: 12 }}>
                  <div className="flex justify-between text-sm" style={{ marginBottom: 3 }}>
                    <span className="text-muted">{r.type}</span>
                    <span>{r.occ}/{r.total} rooms</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${pct}%`, background: r.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmBookingModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        booking={confirmModal.data}
      />
    </div>
  );
}
