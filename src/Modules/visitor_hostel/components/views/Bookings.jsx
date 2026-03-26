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
import BookingDetailsModal from '../modals/BookingDetailsModal';
import CancelBookingModal from '../modals/CancelBookingModal';
import RoleRestricted from '../ui/RoleRestricted';
import { formatDate, formatDateShort } from '../../utils/helpers';
import { useVhAccess } from '../../utils/roleAccess';

const TABS = [
  { key:'all',       label:'All' },
  { key:'Pending',   label:'Pending',    badgeType:'warn' },
  { key:'Forwarded', label:'Forwarded',  badgeType:'warn' },
  { key:'Confirmed', label:'Confirmed' },
  { key:'CancellationRequested', label:'Cancellation Requested', badgeType:'warn' },
  { key:'CheckedIn', label:'Checked In' },
  { key:'CheckedOut',label:'Checked Out' },
  { key:'NoShow',    label:'No Show',    badgeType:'danger' },
  { key:'Cancelled', label:'Cancelled' },
];

export default function Bookings() {
  const { state, dispatch, stats } = useApp();
  const access = useVhAccess();
  const toast  = useToast();
  const loc    = useLocation();
  const confirmModal = useModal();
  const checkinModal = useModal();
  const checkoutModal= useModal();
  const newModal     = useModal();
  const editModal    = useModal();
  const detailsModal = useModal();
  const cancelModal  = useModal();

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

  if (!access.canViewBookings) {
    return (
      <RoleRestricted
        title="Bookings Access Restricted"
        message="This section is available only to VhIncharge and VhCaretaker roles."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-20">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Bookings</h1>
          <p className="page-sub">Manage all booking requests and status transitions</p>
        </div>
        {access.canCreateBooking && (
          <button className="btn btn-primary" onClick={newModal.open}>+ New Booking</button>
        )}
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
                      onEdit={() => editModal.open(b)}
                      onView={() => detailsModal.open(b)}
                      onRequestCancel={() => cancelModal.open(b)}
                      canForward={access.canForwardBooking}
                      canRejectPending={access.canRejectPendingBooking}
                      canCancel={access.canCancelBooking}
                      canApproveCancellation={access.canApproveCancellation}
                      canApprove={access.canApproveBooking}
                      canReject={access.canRejectBooking}
                      canCheckinCheckout={access.canCheckinCheckout}
                      canEditPendingOwn={access.canModifyOwnPendingBooking}
                      onForward={() => {
                        if (!access.canForwardBooking) return;
                        dispatch({ type:'FORWARD_BOOKING', id:b.id });
                        toast.success(`${b.id} forwarded to VH In-Charge`);
                      }}
                      onReject={() => {
                        if (!access.canRejectBooking && !access.canRejectPendingBooking) return;
                        dispatch({ type:'REJECT_BOOKING', id:b.id });
                        toast.info(`${b.id} rejected`);
                      }}
                      onApproveCancellation={() => {
                        if (!access.canApproveCancellation) return;
                        dispatch({ type:'APPROVE_CANCELLATION', id:b.id });
                        toast.success(`${b.id} cancellation approved`);
                      }}
                      onMarkNoShow={() => {
                        if (!access.canCheckinCheckout) return;
                        const confirmed = window.confirm(
                          `Mark ${b.id} as no-show? Applicable booking charges will still be billed.`
                        );
                        if (!confirmed) return;
                        dispatch({ type:'MARK_NO_SHOW', id:b.id });
                        toast.info(`${b.id} marked as no-show`);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {access.canCreateBooking && (
        <BookingFormModal isOpen={newModal.isOpen} onClose={newModal.close} />
      )}
      {access.canModifyOwnPendingBooking && (
        <BookingFormModal
          isOpen={editModal.isOpen}
          onClose={editModal.close}
          mode="edit"
          initialData={editModal.data}
        />
      )}
      {access.canViewBookings && (
        <BookingDetailsModal
          isOpen={detailsModal.isOpen}
          onClose={detailsModal.close}
          booking={detailsModal.data}
        />
      )}
      {access.canCancelBooking && (
        <CancelBookingModal
          isOpen={cancelModal.isOpen}
          onClose={cancelModal.close}
          booking={cancelModal.data}
        />
      )}
      {access.canApproveBooking && (
        <ConfirmBookingModal isOpen={confirmModal.isOpen} onClose={confirmModal.close} booking={confirmModal.data} />
      )}
      {access.canCheckinCheckout && (
        <>
          <CheckinModal isOpen={checkinModal.isOpen} onClose={checkinModal.close} booking={checkinModal.data} />
          <CheckoutModal isOpen={checkoutModal.isOpen} onClose={checkoutModal.close} booking={checkoutModal.data} />
        </>
      )}
    </div>
  );
}

function BookingRow({
  booking: b,
  onConfirm,
  onCheckin,
  onCheckout,
  onEdit,
  onView,
  onRequestCancel,
  onApproveCancellation,
  onMarkNoShow,
  onForward,
  onReject,
  canForward,
  canCancel,
  canRejectPending,
  canApproveCancellation,
  canApprove,
  canReject,
  canCheckinCheckout,
  canEditPendingOwn,
}) {
  return (
    <tr>
      <td><div className="td-mono">{b.id}</div></td>
      <td>
        <div className="td-main">
          {b.visitor}
          {b.isOffline && (
            <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 6px', borderRadius: 4, background: '#ffd700', color: '#000', fontWeight: 500, whiteSpace: 'nowrap' }}>
              OFFLINE
            </span>
          )}
        </div>
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
          <button className="btn btn-sm" onClick={onView}>View</button>
          {b.status === 'Pending' && (
            <>
              {canEditPendingOwn && <button className="btn btn-sm" onClick={onEdit}>Edit</button>}
              {canCancel && <button className="btn btn-sm btn-danger" onClick={onRequestCancel}>Request Cancel</button>}
              {canForward && <button className="btn btn-sm" onClick={onForward}>Forward</button>}
              {canRejectPending && <button className="btn btn-sm btn-danger" onClick={onReject}>Reject</button>}
              {!canEditPendingOwn && !canForward && !canRejectPending && !canCancel && <span style={{ fontSize:11, color:'var(--ink-300)' }}>—</span>}
            </>
          )}
          {b.status === 'Forwarded' && (
            <>
              {canCancel && <button className="btn btn-sm btn-danger" onClick={onRequestCancel}>Request Cancel</button>}
              {canApprove && <button className="btn btn-sm btn-success" onClick={onConfirm}>Confirm</button>}
              {canReject && <button className="btn btn-sm btn-danger" onClick={onReject}>Reject</button>}
              {!canApprove && !canReject && <span style={{ fontSize:11, color:'var(--ink-300)' }}>—</span>}
            </>
          )}
          {b.status === 'Confirmed' && (
            <>
              {canCancel && <button className="btn btn-sm btn-danger" onClick={onRequestCancel}>Request Cancel</button>}
              {canCheckinCheckout ? (
                <>
                  <button className="btn btn-sm btn-success" onClick={onCheckin}>Check In</button>
                  <button className="btn btn-sm btn-danger" onClick={onMarkNoShow}>No Show</button>
                </>
              ) : <span style={{ fontSize:11, color:'var(--ink-300)' }}>—</span>}
            </>
          )}
          {b.status === 'CancellationRequested' && (
            canApproveCancellation
              ? <button className="btn btn-sm btn-danger" onClick={onApproveCancellation}>Approve Cancellation</button>
              : <span style={{ fontSize:11, color:'var(--ink-300)' }}>Awaiting caretaker approval</span>
          )}
          {b.status === 'CheckedIn' && (
            canCheckinCheckout
              ? <button className="btn btn-sm" onClick={onCheckout}>Check Out</button>
              : <span style={{ fontSize:11, color:'var(--ink-300)' }}>—</span>
          )}
          {(b.status === 'CheckedOut' || b.status === 'NoShow' || b.status === 'Cancelled' || b.status === 'Rejected') && (
            <span style={{ fontSize:11, color:'var(--ink-300)' }}>—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
