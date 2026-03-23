import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';

const blank = { name:'', category:'Consumable', qty:0, threshold:5, unitCost:0, billNo:'', description:'' };

export default function AddInventoryModal({ isOpen, onClose }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const add = () => {
    if (!form.name.trim()) { setError('Item name is required'); return; }
    if (Number(form.qty) < 0)  { setError('Quantity cannot be negative'); return; }
    const item = {
      ...form, id: Date.now(),
      qty: Number(form.qty), usable: Number(form.qty),
      threshold: Number(form.threshold), unitCost: Number(form.unitCost),
      purchaseDate: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item });
    toast.success(`${form.name} added to inventory`);
    setForm(blank); setError(''); onClose();
  };

  return (
    <Modal
      isOpen={isOpen} onClose={() => { onClose(); setForm(blank); setError(''); }}
      title="Add Inventory Item" size="md"
      footer={
        <>
          <button className="btn" onClick={() => { onClose(); setForm(blank); setError(''); }}>Cancel</button>
          <button className="btn btn-primary" onClick={add}>Add Item</button>
        </>
      }
    >
      {error && <div style={{ color:'var(--danger)', fontSize:12, marginBottom:10 }}>{error}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div className="form-group">
          <label>Item Name *</label>
          <input placeholder="e.g. Bed Sheets, Towels…" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              <option>Consumable</option><option>Asset</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input type="number" min="0" value={form.qty} onChange={e => set('qty', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Threshold Qty</label>
            <input type="number" min="0" value={form.threshold} onChange={e => set('threshold', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Unit Cost (₹)</label>
            <input type="number" min="0" value={form.unitCost} onChange={e => set('unitCost', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Purchase Bill Number</label>
          <input placeholder="Bill number" value={form.billNo} onChange={e => set('billNo', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Optional notes…" style={{ minHeight:60 }} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
