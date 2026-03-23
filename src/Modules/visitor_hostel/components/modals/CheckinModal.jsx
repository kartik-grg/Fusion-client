import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';

export default function CheckinModal({ isOpen, onClose, booking }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [form, setForm] = useState({ name:'', phone:'', idType:'Aadhar Card', idNo:'', relation:'' });
  const [error, setError] = useState('');

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const checkin = () => {
    if (!form.name.trim()) { setError('Visitor name is required'); return; }
    if (!form.phone.trim()) { setError('Phone number is required'); return; }
    if (!form.idNo.trim()) { setError('ID proof number is required'); return; }
    dispatch({ type: 'CHECKIN_BOOKING', id: booking.id, visitorDetails: form });
    toast.success(`${booking.visitor} checked in successfully`);
    setForm({ name:'', phone:'', idType:'Aadhar Card', idNo:'', relation:'' });
    setError(''); onClose();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title="Check-in Guest" size="md"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={checkin}>Confirm Check-in</button>
        </>
      }
    >
      <div style={{ background:'var(--success-light)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:16, fontSize:13, color:'var(--success)' }}>
        Booking {booking.id} — {booking.visitor}
      </div>
      {error && <div style={{ color:'var(--danger)', fontSize:12, marginBottom:12 }}>{error}</div>}
      <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>Actual Visitor Details (as per ID)</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input placeholder="As per ID" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input placeholder="Mobile number" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <label>ID Proof Type</label>
          <select value={form.idType} onChange={e => set('idType', e.target.value)}>
            <option>Aadhar Card</option><option>Passport</option><option>PAN Card</option><option>Driving License</option>
          </select>
        </div>
        <div className="form-group">
          <label>ID Proof Number *</label>
          <input placeholder="Document number" value={form.idNo} onChange={e => set('idNo', e.target.value)} />
        </div>
        <div className="form-group form-full">
          <label>Relationship to Intender</label>
          <input placeholder="Self / Colleague / Guest Speaker…" value={form.relation} onChange={e => set('relation', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
