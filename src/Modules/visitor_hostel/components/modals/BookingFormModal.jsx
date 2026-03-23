import { useState } from 'react';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { generateBookingId, todayISO, validateBookingDates } from '../../utils/helpers';
import { VISITOR_CATEGORIES, PURPOSES, BILLING_OPTIONS, ID_PROOF_TYPES } from '../../data/constants';

const STEPS = ['Visitor Info', 'Stay Details', 'Billing', 'Review'];

const blank = {
  visitor:'', org:'', category:'Official Visitor', phone:'', email:'',
  idType:'Aadhar Card', idNo:'', purpose:'Official Work',
  checkin:'', checkout:'', guests:1, rooms:1, roomType:'', meals:'None', remark:'',
  billedTo:'Intender', projectNo:'', billingAddress:'',
};

export default function BookingFormModal({ isOpen, onClose }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState(blank);
  const [error, setError]   = useState('');

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const validate = () => {
    if (step === 0) {
      if (!form.visitor.trim()) return 'Visitor name is required';
      if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) return 'Valid 10-digit phone number required';
    }
    if (step === 1) {
      const err = validateBookingDates(form.checkin, form.checkout);
      if (err) return err;
      if (form.guests < 1) return 'At least 1 guest required';
      if (form.rooms < 1)  return 'At least 1 room required';
      if (form.remark.length > 500) return 'Remark must be under 500 characters';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (step < 3) setStep(s => s + 1);
    else submit();
  };

  const submit = () => {
    const booking = {
      ...form, id: generateBookingId(), status: 'Pending',
      guests: Number(form.guests), rooms: Number(form.rooms),
      createdAt: todayISO(),
    };
    dispatch({ type: 'ADD_BOOKING', payload: booking });
    toast.success(`Booking ${booking.id} submitted — awaiting Caretaker review`);
    onClose();
    setStep(0);
    setForm(blank);
    setError('');
  };

  const close = () => { onClose(); setStep(0); setForm(blank); setError(''); };

  const footer = (
    <>
      <button className="btn" onClick={close}>Cancel</button>
      {step > 0 && <button className="btn" onClick={() => { setStep(s => s - 1); setError(''); }}>← Back</button>}
      <button className="btn btn-primary" onClick={next}>
        {step === 3 ? 'Submit Booking' : 'Continue →'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={close} title="New Booking Request" size="lg" footer={footer}>
      <Stepper steps={STEPS} current={step} />
      {error && <Alert type="danger">{error}</Alert>}

      {step === 0 && (
        <div className="form-grid">
          <div className="form-group">
            <label>Visitor Name *</label>
            <input placeholder="Full name" value={form.visitor} onChange={e => set('visitor', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Visitor Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {VISITOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Organization</label>
            <input placeholder="Institution / company" value={form.org} onChange={e => set('org', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input placeholder="10-digit mobile" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="visitor@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>ID Proof Type</label>
            <select value={form.idType} onChange={e => set('idType', e.target.value)}>
              {ID_PROOF_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>ID Proof Number</label>
            <input placeholder="Document number" value={form.idNo} onChange={e => set('idNo', e.target.value)} />
          </div>
          <div className="form-group form-full">
            <label>Visit Purpose *</label>
            <select value={form.purpose} onChange={e => set('purpose', e.target.value)}>
              {PURPOSES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="form-grid">
          <div className="form-group">
            <label>Check-in Date *</label>
            <input type="date" value={form.checkin} min={todayISO()} onChange={e => set('checkin', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Check-out Date *</label>
            <input type="date" value={form.checkout} min={form.checkin || todayISO()} onChange={e => set('checkout', e.target.value)} />
          </div>
          <div className="form-group">
            <label>No. of Guests *</label>
            <input type="number" min="1" max="20" value={form.guests} onChange={e => set('guests', e.target.value)} />
          </div>
          <div className="form-group">
            <label>No. of Rooms *</label>
            <input type="number" min="1" max="10" value={form.rooms} onChange={e => set('rooms', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Preferred Room Type</label>
            <select value={form.roomType} onChange={e => set('roomType', e.target.value)}>
              <option value="">No preference</option>
              <option>Single</option><option>Double</option><option>Suite</option>
            </select>
          </div>
          <div className="form-group">
            <label>Meal Requirement</label>
            <select value={form.meals} onChange={e => set('meals', e.target.value)}>
              <option>None</option><option>Breakfast</option><option>All meals</option><option>Lunch & Dinner</option>
            </select>
          </div>
          <div className="form-group form-full">
            <label>Remarks (max 500 chars)</label>
            <textarea
              placeholder="Any special requirements..."
              value={form.remark}
              onChange={e => set('remark', e.target.value)}
              maxLength={500}
            />
            <span className="text-xs text-hint">{form.remark.length}/500</span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-grid">
          <div className="form-group">
            <label>Bill Settled By *</label>
            <select value={form.billedTo} onChange={e => set('billedTo', e.target.value)}>
              {BILLING_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Project Number (if applicable)</label>
            <input placeholder="RSPC project number" value={form.projectNo} onChange={e => set('projectNo', e.target.value)} />
          </div>
          <div className="form-group form-full">
            <label>Billing Address</label>
            <textarea placeholder="Address for invoice..." value={form.billingAddress} onChange={e => set('billingAddress', e.target.value)} />
          </div>
          <div className="form-group form-full">
            <Alert type="info">
              Booking will be submitted as <strong>Pending</strong> — the Caretaker will review and forward to VH In-Charge for final confirmation.
            </Alert>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="review-box">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 14 }}>Review Details</div>
          <div className="info-grid">
            <ReviewRow label="Visitor" value={form.visitor || '—'} />
            <ReviewRow label="Category" value={form.category} />
            <ReviewRow label="Organization" value={form.org || '—'} />
            <ReviewRow label="Phone" value={form.phone || '—'} />
            <ReviewRow label="Purpose" value={form.purpose} />
            <ReviewRow label="Check-in" value={form.checkin || '—'} />
            <ReviewRow label="Check-out" value={form.checkout || '—'} />
            <ReviewRow label="Guests" value={form.guests} />
            <ReviewRow label="Rooms" value={form.rooms} />
            <ReviewRow label="Billed To" value={form.billedTo} />
            <ReviewRow label="Meal Plan" value={form.meals} />
          </div>
          {form.remark && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-500)' }}>
              <span style={{ fontWeight: 500 }}>Remark:</span> {form.remark}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Stepper({ steps, current }) {
  return (
    <div className="stepper">
      {steps.map((label, i) => (
        <div key={i} className="stepper-step">
          <div className={`stepper-dot ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            {i < current ? '✓' : i + 1}
          </div>
          <div className={`stepper-label ${i < current ? 'done' : i === current ? 'active' : ''}`}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="info-row">
      <div className="info-key">{label}</div>
      <div className="info-val">{value}</div>
    </div>
  );
}
