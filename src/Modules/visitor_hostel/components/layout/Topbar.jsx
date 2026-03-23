import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../hooks/useModal';
import BookingFormModal from '../modals/BookingFormModal';

export default function Topbar({ title, subtitle }) {
  const { stats, state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const bookingModal = useModal();
  const [showNotifs, setShowNotifs] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length > 2) navigate('bookings', { state: { search: val } });
  };

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-sub">{subtitle}</div>
        </div>
        <div className="topbar-actions">
          <div className="search-bar" style={{ maxWidth: 300 }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search bookings..."
            />
          </div>

          <div style={{ position: 'relative' }}>
            <button className="btn-icon" onClick={() => setShowNotifs(v => !v)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}>
                <path d="M8 1a5 5 0 0 1 5 5v3l1 2H2l1-2V6a5 5 0 0 1 5-5zM6 13a2 2 0 0 0 4 0"/>
              </svg>
              {stats.unreadNotifs > 0 && <span className="notif-dot" />}
            </button>
            {showNotifs && (
              <NotifDropdown
                notifications={state.notifications}
                dispatch={dispatch}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>

          <button className="btn btn-primary btn-sm" onClick={bookingModal.open}>
            + New Booking
          </button>
        </div>
      </header>
      <BookingFormModal isOpen={bookingModal.isOpen} onClose={bookingModal.close} />
    </>
  );
}

function NotifDropdown({ notifications, dispatch, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 6,
      width: 340, background: 'var(--surface-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', zIndex: 200,
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notifications</span>
        <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'MARK_ALL_READ' })}>
          Mark all read
        </button>
      </div>
      {notifications.slice(0, 6).map(n => (
        <div
          key={n.id}
          onClick={() => { dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id }); onClose(); }}
          style={{
            padding: '10px 16px', borderBottom: '1px solid var(--border)',
            cursor: 'pointer', background: n.read ? 'transparent' : 'var(--brand-light)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: '50', marginTop: 4, flexShrink: 0,
            background: { warn: 'var(--warn)', danger: 'var(--danger)', success: 'var(--success)', info: 'var(--brand)' }[n.type],
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>{n.message}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-300)', marginTop: 2 }}>{n.time}</div>
          </div>
        </div>
      ))}
      <div style={{ padding: '8px 16px', textAlign: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
