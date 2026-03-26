import { useApp } from '../../context/AppContext';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import Alert from '../ui/Alert';
import CheckinModal from '../modals/CheckinModal';
import CheckoutModal from '../modals/CheckoutModal';
import RoleRestricted from '../ui/RoleRestricted';
import { formatDate } from '../../utils/helpers';
import { useVhAccess } from '../../utils/roleAccess';

export default function CheckInOut() {
  const { state, dispatch } = useApp();
  const access = useVhAccess();
  const toast = useToast();
  const checkinModal  = useModal();
  const checkoutModal = useModal();

  const confirmed  = state.bookings.filter(b => b.status === 'Confirmed');
  const checkedIn  = state.bookings.filter(b => b.status === 'CheckedIn');

  if (!access.canViewCheckInOut) {
    return (
      <RoleRestricted
        title="Check-in / Check-out Access Restricted"
        message="Only VhCaretaker can process guest arrivals and departures."
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Check-in / Check-out</h1>
        <p className="page-sub">Process guest arrivals and departures</p>
      </div>

      <Alert type="warn">
        Guests are expected to vacate rooms by 12:00 noon on their check-out date. Late departures incur additional charges.
      </Alert>

      <div className="grid-2" style={{ gap:20 }}>
        {/* CHECK IN */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Check-in Guests</div>
              <div className="card-sub">Confirmed bookings ready for check-in</div>
            </div>
            <span style={{ background:'var(--success-light)', color:'var(--success)', fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:20 }}>
              {confirmed.length} confirmed
            </span>
          </div>
          {confirmed.length === 0
            ? <div style={{ padding:'24px 0', textAlign:'center', color:'var(--ink-300)', fontSize:13 }}>
                No confirmed bookings awaiting check-in
              </div>
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Booking</th><th>Visitor</th><th>Date</th><th></th></tr></thead>
                  <tbody>
                    {confirmed.map(b => (
                      <tr key={b.id}>
                        <td>
                          <div className="td-mono">{b.id}</div>
                          <div className="td-sub">{b.rooms} room(s)</div>
                        </td>
                        <td>
                          <div className="td-main">{b.visitor}</div>
                          <div className="td-sub">{b.category}</div>
                        </td>
                        <td>
                          <div className="td-main">{formatDate(b.checkin)}</div>
                          <div className="td-sub">to {formatDate(b.checkout)}</div>
                        </td>
                        <td>
                          <div className="flex gap-4">
                            <button className="btn btn-sm btn-success" onClick={() => checkinModal.open(b)}>
                              Check In
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                const confirmedAction = window.confirm(
                                  `Mark ${b.id} as no-show? Applicable booking charges will still be billed.`
                                );
                                if (!confirmedAction) return;
                                dispatch({ type: 'MARK_NO_SHOW', id: b.id });
                                toast.info(`${b.id} marked as no-show`);
                              }}
                            >
                              No Show
                            </button>
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

        {/* CHECK OUT */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Check-out Guests</div>
              <div className="card-sub">In-house guests ready for departure</div>
            </div>
            <span style={{ background:'var(--warn-light)', color:'var(--warn)', fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:20 }}>
              {checkedIn.length} in-house
            </span>
          </div>
          {checkedIn.length === 0
            ? <div style={{ padding:'24px 0', textAlign:'center', color:'var(--ink-300)', fontSize:13 }}>
                No guests currently checked in
              </div>
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Booking</th><th>Visitor</th><th>Checked In</th><th></th></tr></thead>
                  <tbody>
                    {checkedIn.map(b => (
                      <tr key={b.id}>
                        <td>
                          <div className="td-mono">{b.id}</div>
                          <div className="td-sub">{b.rooms} room(s)</div>
                        </td>
                        <td>
                          <div className="td-main">{b.visitor}</div>
                          <div className="td-sub">{b.category}</div>
                        </td>
                        <td>
                          <div className="td-main">{formatDate(b.checkin)}</div>
                          <div className="td-sub" style={{ color:'var(--warn)' }}>Due: {formatDate(b.checkout)}</div>
                        </td>
                        <td>
                          <button className="btn btn-sm" onClick={() => checkoutModal.open(b)}>
                            Check Out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>

      {access.canCheckinCheckout && (
        <>
          <CheckinModal isOpen={checkinModal.isOpen} onClose={checkinModal.close} booking={checkinModal.data} />
          <CheckoutModal isOpen={checkoutModal.isOpen} onClose={checkoutModal.close} booking={checkoutModal.data} />
        </>
      )}
    </div>
  );
}
