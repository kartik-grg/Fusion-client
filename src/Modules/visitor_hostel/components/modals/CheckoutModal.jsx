import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { generateInvoiceNo, todayISO, formatCurrency } from '../../utils/helpers';

export default function CheckoutModal({ isOpen, onClose, booking }) {
  const { state, dispatch } = useApp();
  const toast = useToast();

  const mealTotal = state.meals
    .filter(m => m.bookingId === booking?.id)
    .reduce((s, m) => s + m.total, 0);

  const [extra, setExtra]               = useState(0);
  const [overstayHours, setOverstayHours] = useState(0);
  const [overstayRate, setOverstayRate]   = useState(0);
  const [discount, setDiscount]         = useState(0);

  const roomTariff = 900;
  const roomCharges = roomTariff; // simplified — one night placeholder
  
  // Calculate overstay charges
  const overstayCharges = overstayHours > 0 ? (overstayHours * Number(overstayRate)) : 0;

  const total = Math.max(
    0, 
    roomCharges + mealTotal + Number(extra) + overstayCharges - Number(discount)
  );

  const checkout = () => {
    const bill = {
      id: Date.now(),
      invoiceNo: generateInvoiceNo(),
      bookingId: booking.id,
      visitor: booking.visitor,
      roomCharges, 
      mealCharges: mealTotal,
      extraCharges: Number(extra),
      overstayHours: Number(overstayHours),
      overstayCharges: overstayCharges,
      discount: Number(discount),
      total, 
      paid: 0, 
      balance: total,
      paymentMode: '', 
      paymentRef: '',
      status: 'Pending',
      date: todayISO(),
    };
    dispatch({ type: 'CHECKOUT_BOOKING', id: booking.id, bill });
    toast.success(
      `${booking.visitor} checked out — bill ₹${total} generated` + 
      (overstayHours > 0 ? ` (with ${overstayHours}h overstay)` : '')
    );
    setExtra(0);
    setOverstayHours(0);
    setOverstayRate(0);
    setDiscount(0);
    onClose();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen} 
      onClose={onClose}
      title="Process Check-out" 
      size="md"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={checkout}>
            Generate Bill & Check Out
          </button>
        </>
      }
    >
      <div style={{ background:'var(--surface-bg)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:16, fontSize:13 }}>
        {booking.id} — {booking.visitor}
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Room Charges</label>
          <input type="number" value={roomCharges} readOnly />
        </div>
        <div className="form-group">
          <label>Meal Charges</label>
          <input type="number" value={mealTotal} readOnly />
        </div>
        <div className="form-group">
          <label>Extra Charges (₹)</label>
          <input 
            type="number" 
            min="0" 
            step="0.01"
            value={extra} 
            onChange={e => setExtra(e.target.value)} 
            placeholder="0.00"
          />
        </div>
        <div className="form-group">
          <label>Discount (₹)</label>
          <input 
            type="number" 
            min="0" 
            step="0.01"
            value={discount} 
            onChange={e => setDiscount(e.target.value)} 
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Overstay Section */}
      <div style={{ 
        borderTop: '1px solid var(--border-light)', 
        paddingTop: 16, 
        marginTop: 16, 
        marginBottom: 16 
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--ink-600)' }}>
          Overstay Management
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Overstay Hours</label>
            <input 
              type="number" 
              min="0" 
              step="1"
              value={overstayHours} 
              onChange={e => setOverstayHours(e.target.value)}
              placeholder="0"
            />
            <small style={{ color: 'var(--ink-400)', fontSize: 11, marginTop: 4 }}>
              Number of hours beyond checkout time
            </small>
          </div>
          <div className="form-group">
            <label>Overstay Rate (₹/hour)</label>
            <input 
              type="number" 
              min="0" 
              step="0.01"
              value={overstayRate} 
              onChange={e => setOverstayRate(e.target.value)}
              placeholder="0.00"
            />
            <small style={{ color: 'var(--ink-400)', fontSize: 11, marginTop: 4 }}>
              Rate per hour for overstay
            </small>
          </div>
        </div>
        {overstayHours > 0 && (
          <div style={{
            background: 'var(--warn-light)',
            color: 'var(--warn)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-xs)',
            fontSize: 12,
            marginTop: 8
          }}>
            <strong>Overstay Charges:</strong> {formatCurrency(overstayCharges)} 
            ({overstayHours}h × ₹{Number(overstayRate).toFixed(2)}/h)
          </div>
        )}
      </div>

      {/* Bill Summary */}
      <div className="bill-summary">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span>Room Charges</span>
          <span>{formatCurrency(roomCharges)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span>Meal Charges</span>
          <span>{formatCurrency(mealTotal)}</span>
        </div>
        {Number(extra) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
            <span>Extra Charges</span>
            <span>{formatCurrency(extra)}</span>
          </div>
        )}
        {overstayCharges > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'var(--warn)' }}>
            <span>Overstay Charges</span>
            <span>{formatCurrency(overstayCharges)}</span>
          </div>
        )}
        {Number(discount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'var(--success)' }}>
            <span>Discount</span>
            <span>- {formatCurrency(discount)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 8, marginTop: 8 }}>
          <span className="bill-total-label">Total Amount</span>
          <span className="bill-total-value">{formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  );
}
