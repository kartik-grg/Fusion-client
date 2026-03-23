import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import Badge from '../ui/Badge';
import SearchBar from '../ui/SearchBar';
import Tabs from '../ui/Tabs';
import EmptyState from '../ui/EmptyState';
import Alert from '../ui/Alert';
import ConfirmBookingModal from '../modals/ConfirmBookingModal';
import CheckinModal from '../modals/CheckinModal';
import CheckoutModal from '../modals/CheckoutModal';
import BookingFormModal from '../modals/BookingFormModal';
import { formatDate, formatDateShort } from '../../utils/helpers';

const TABS = [
  { key:'all',       label:'All' },
  { key:'Pending',   label:'Pending',    badgeType:'warn' },
  { key:'Forwarded', label:'Forwarded',  badgeType:'warn' },
  { key:'Confirmed', label:'Confirmed' },
  { key:'CheckedIn', label:'Checked In' },
  { key:'CheckedOut',label:'Checked Out' },
  { key:'Cancelled', label:'Cancelled' },
];

export default function Bookings() {
  const { state, dispatch, stats } = useApp();
  const toast  = useToast();
  const loc    = useLocation();
  const confirmModal = useModal();
  const checkinModal = useModal();
  const checkoutModal= useModal();
  const newModal     = useModal();

  const [tab,    setTab]    = useState('all');
  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('');

  useEffect(() => {
    if (loc.state?.search) setSearch(loc.state.search);
  }, [loc.state]);

  const tabsWithCount = TABS.map(t => ({
    ...t,
    count: t.key === 'all'
      ? state.bookings.length
      : state.bookings.filter(b => b.status === t.key).length || undefined,
  }));

  const visible = state.bookings.filter(b => {
    if (tab !== 'all' && b.status !== tab) return false;
    if (catFilter && b.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.visitor.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || (b.org||'').toLowerCase().includes(q);
    }
    return true;
  });

  const categories = [...new Set(state.bookings.map(b => b.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Bookings</h1>
          <p className="page-sub">Manage all booking requests and status transitions</p>
        </div>
        <button className="btn btn-primary" onClick={newModal.open}>+ New Booking</button>
      </div>

      <Tabs tabs={tabsWithCount} active={tab} onChange={setTab} />

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID, org…" />
          <div className="flex gap-8">
            <select className="inline-select" value={catFilter} onChange={e => setCat(e.target.value)}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {visible.length === 0
          ? <EmptyState title="No bookings found" message="Try adjusting filters or search query." />
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Visitor</th>
                    <th>Category</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Rooms</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(b => (
                    <BookingRow
                      key={b.id} booking={b}
                      onConfirm={() => confirmModal.open(b)}
                      onCheckin={() => checkinModal.open(b)}
                      onCheckout={() => checkoutModal.open(b)}
                      onForward={() => { dispatch({ type:'FORWARD_BOOKING', id:b.id }); toast.success(`${b.id} forwarded to VH In-Charge`); }}
                      onReject={() => { dispatch({ type:'REJECT_BOOKING', id:b.id }); toast.info(`${b.id} rejected`); }}
                      onCancel={() => { dispatch({ type:'CANCEL_BOOKING', id:b.id }); toast.warn(`${b.id} cancelled`); }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      <BookingFormModal  isOpen={newModal.isOpen}      onClose={newModal.close} />
      <ConfirmBookingModal isOpen={confirmModal.isOpen} onClose={confirmModal.close} booking={confirmModal.data} />
      <CheckinModal       isOpen={checkinModal.isOpen}  onClose={checkinModal.close}  booking={checkinModal.data} />
      <CheckoutModal      isOpen={checkoutModal.isOpen} onClose={checkoutModal.close} booking={checkoutModal.data} />
    </div>
  );
}

function BookingRow({ booking: b, onConfirm, onCheckin, onCheckout, onForward, onReject, onCancel }) {
  return (
    <tr>
      <td><div className="td-mono">{b.id}</div></td>
      <td>
        <div className="td-main">{b.visitor}</div>
        <div className="td-sub">{b.org}</div>
      </td>
      <td>
        <span style={{ fontSize:11, padding:'2px 7px', borderRadius:10, background:'var(--surface-bg)', border:'1px solid var(--border)', color:'var(--ink-500)', whiteSpace:'nowrap' }}>
          {b.category}
        </span>
      </td>
      <td>{formatDateShort(b.checkin)}</td>
      <td>{formatDateShort(b.checkout)}</td>
      <td style={{ textAlign:'center' }}>{b.rooms}</td>
      <td><Badge status={b.status} /></td>
      <td>
        <div className="flex gap-4">
          {b.status === 'Pending' && (
            <>
              <button className="btn btn-sm" onClick={onForward}>Forward</button>
              <button className="btn btn-sm btn-danger" onClick={onCancel}>Cancel</button>
            </>
          )}
          {b.status === 'Forwarded' && (
            <>
              <button className="btn btn-sm btn-success" onClick={onConfirm}>Confirm</button>
              <button className="btn btn-sm btn-danger" onClick={onReject}>Reject</button>
            </>
          )}
          {b.status === 'Confirmed' && (
            <button className="btn btn-sm btn-success" onClick={onCheckin}>Check In</button>
          )}
          {b.status === 'CheckedIn' && (
            <button className="btn btn-sm" onClick={onCheckout}>Check Out</button>
          )}
          {(b.status === 'CheckedOut' || b.status === 'Cancelled' || b.status === 'Rejected') && (
            <span style={{ fontSize:11, color:'var(--ink-300)' }}>—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
