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

  const [extra, setExtra]       = useState(0);
  const [discount, setDiscount] = useState(0);

  const roomTariff = 900;
  const roomCharges = roomTariff; // simplified — one night placeholder

  const total = Math.max(0, roomCharges + mealTotal + Number(extra) - Number(discount));

  const checkout = () => {
    const bill = {
      id: Date.now(),
      invoiceNo: generateInvoiceNo(),
      bookingId: booking.id,
      visitor: booking.visitor,
      roomCharges, mealCharges: mealTotal,
      extraCharges: Number(extra),
      discount: Number(discount),
      total, paid: 0, balance: total,
      paymentMode: '', paymentRef: '',
      status: 'Pending',
      date: todayISO(),
    };
    dispatch({ type: 'CHECKOUT_BOOKING', id: booking.id, bill });
    toast.success(`${booking.visitor} checked out — bill ₹${total} generated`);
    setExtra(0); setDiscount(0); onClose();
  };

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title="Process Check-out" size="md"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={checkout}>Generate Bill & Check Out</button>
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
          <label>Extra Charges</label>
          <input type="number" min="0" value={extra} onChange={e => setExtra(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Discount (₹)</label>
          <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} />
        </div>
      </div>
      <div className="bill-summary">
        <span className="bill-total-label">Total Amount</span>
        <span className="bill-total-value">{formatCurrency(total)}</span>
      </div>
    </Modal>
  );
}
