import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';

export default function ConfirmBookingModal({ isOpen, onClose, booking }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [selected, setSelected] = useState([]);
  const [remark, setRemark] = useState('');

  const availableRooms = state.rooms.filter(r => r.status === 'Available');

  const toggle = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const confirm = () => {
    if (selected.length === 0) { toast.warn('Please select at least one room'); return; }
    dispatch({ type: 'CONFIRM_BOOKING', id: booking.id, roomIds: selected });
    toast.success(`Booking ${booking.id} confirmed — rooms assigned`);
    setSelected([]); setRemark(''); onClose();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title="Confirm Booking & Assign Rooms"
      size="md"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={confirm}>Confirm Booking</button>
        </>
      }
    >
      <div style={{ background:'var(--success-light)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--success)' }}>
        {booking.id} — {booking.visitor} · {booking.rooms} room(s) requested
      </div>
      <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Select rooms to assign</div>
      {availableRooms.length === 0
        ? <div style={{ color:'var(--ink-500)', fontSize:13 }}>No available rooms at the moment.</div>
        : (
          <div className="room-grid">
            {availableRooms.map(r => (
              <div
                key={r.id}
                className={`room-tile ${selected.includes(r.id) ? 'selected' : ''}`}
                onClick={() => toggle(r.id)}
              >
                <div className="room-num">{r.num}</div>
                <div className="room-type-lbl">{r.type}</div>
                <div className="room-tariff-lbl">₹{r.tariff}/night</div>
              </div>
            ))}
          </div>
        )
      }
      {selected.length > 0 && (
        <div style={{ marginTop:12, fontSize:12, color:'var(--success)' }}>
          {selected.length} room(s) selected
        </div>
      )}
      <div style={{ marginTop:16 }}>
        <div className="form-group">
          <label>Remarks for Indenter</label>
          <input placeholder="Optional note" value={remark} onChange={e => setRemark(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
