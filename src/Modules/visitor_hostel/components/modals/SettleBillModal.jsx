import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/helpers';
import { PAYMENT_MODES } from '../../data/constants';

export default function SettleBillModal({ isOpen, onClose, bill }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [amount, setAmount]   = useState('');
  const [mode, setMode]       = useState('Cash');
  const [ref, setRef]         = useState('');
  const [remark, setRemark]   = useState('');
  const [error, setError]     = useState('');

  const settle = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setError('Enter a valid payment amount'); return; }
    if (amt > bill.balance)   { setError('Amount exceeds outstanding balance'); return; }
    dispatch({ type: 'SETTLE_BILL', id: bill.id, amount: amt, paymentMode: mode, paymentRef: ref });
    toast.success(`Payment of ${formatCurrency(amt)} recorded for ${bill.invoiceNo}`);
    setAmount(''); setMode('Cash'); setRef(''); setRemark(''); setError(''); onClose();
  };

  if (!bill) return null;

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title="Settle Bill" size="sm"
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={settle}>Mark as Paid</button>
        </>
      }
    >
      <div style={{ fontSize:12, color:'var(--ink-500)', marginBottom:4 }}>{bill.invoiceNo} · {bill.visitor}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:30, color:'var(--ink-900)', marginBottom:20 }}>
        {formatCurrency(bill.balance)}
        <span style={{ fontSize:13, color:'var(--ink-500)', marginLeft:8 }}>outstanding</span>
      </div>
      {error && <div style={{ color:'var(--danger)', fontSize:12, marginBottom:10 }}>{error}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div className="form-group">
          <label>Payment Amount (₹)</label>
          <input type="number" min="0" max={bill.balance} placeholder={bill.balance} value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Payment Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value)}>
            {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Reference / Cheque Number</label>
          <input placeholder="Transaction / cheque number" value={ref} onChange={e => setRef(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Remarks</label>
          <textarea placeholder="Optional notes…" style={{ minHeight:60 }} value={remark} onChange={e => setRemark(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
