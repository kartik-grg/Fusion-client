import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../hooks/useToast';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import SearchBar from '../ui/SearchBar';
import AddInventoryModal from '../modals/AddInventoryModal';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function Inventory() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const addModal = useModal();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const lowItems = state.inventory.filter(i => i.qty < i.threshold && i.threshold > 0);

  const tabs = [
    { key:'all',        label:'All Items', count: state.inventory.length },
    { key:'Consumable', label:'Consumables' },
    { key:'Asset',      label:'Assets' },
    { key:'low',        label:'Low Stock', count: lowItems.length, badgeType:'danger' },
  ];

  const visible = state.inventory.filter(i => {
    if (tab === 'Consumable' && i.category !== 'Consumable') return false;
    if (tab === 'Asset'      && i.category !== 'Asset')      return false;
    if (tab === 'low'        && (i.qty >= i.threshold || i.threshold === 0)) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.billNo.toLowerCase().includes(q);
    }
    return true;
  });

  const adjustQty = (item, delta) => {
    const newQty = item.qty + delta;
    if (newQty < 0) { toast.warn('Quantity cannot go below zero'); return; }
    dispatch({
      type: 'UPDATE_INVENTORY_ITEM', id: item.id,
      payload: { qty: newQty, usable: Math.min(item.usable + delta, newQty) },
    });
    toast.success(delta > 0 ? `Added ${Math.abs(delta)} unit(s) of ${item.name}` : `Used 1 unit of ${item.name}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-20">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">Track and manage hostel inventory stock</p>
        </div>
        <button className="btn btn-primary" onClick={addModal.open}>+ Add Item</button>
      </div>

      {lowItems.length > 0 && (
        <Alert type="warn">
          {lowItems.length} item(s) below threshold:{' '}
          {lowItems.map(i => `${i.name} (${i.qty} left)`).join(' · ')}
        </Alert>
      )}

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={setSearch} placeholder="Search items…" />
          <span className="text-sm text-muted">{visible.length} item(s)</span>
        </div>

        {visible.length === 0
          ? <EmptyState title="No items found" message="Try a different filter or add a new item." />
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>In Stock</th>
                    <th>Usable</th>
                    <th>Threshold</th>
                    <th>Stock Level</th>
                    <th>Unit Cost</th>
                    <th>Purchase Bill</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(item => {
                    const pct = item.threshold > 0
                      ? Math.min(100, Math.round((item.qty / item.threshold) * 100))
                      : 100;
                    const isLow = item.threshold > 0 && item.qty < item.threshold;
                    const barClass = isLow ? 'low' : pct < 150 ? '' : '';
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="td-main" style={{ color: isLow ? 'var(--danger)' : undefined }}>{item.name}</div>
                          <div className="td-sub">{item.purchaseDate ? formatDate(item.purchaseDate) : ''}</div>
                        </td>
                        <td><Badge status={item.category}>{item.category}</Badge></td>
                        <td>
                          <span style={{ fontWeight: 500, color: isLow ? 'var(--danger)' : 'var(--ink-700)' }}>
                            {item.qty}
                          </span>
                        </td>
                        <td>{item.usable}</td>
                        <td>{item.threshold || '—'}</td>
                        <td style={{ minWidth: 120 }}>
                          <div className="flex items-center gap-8">
                            <div style={{ flex: 1 }}>
                              <div className="progress-bar">
                                <div className={`progress-fill ${isLow ? 'low' : ''}`} style={{ width: `${Math.min(100, pct)}%` }} />
                              </div>
                            </div>
                            <span className="text-xs" style={{ color: isLow ? 'var(--danger)' : 'var(--ink-300)', minWidth: 28, textAlign:'right' }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td>{formatCurrency(item.unitCost)}</td>
                        <td><span className="text-sm text-muted">{item.billNo || '—'}</span></td>
                        <td>
                          <div className="flex gap-4">
                            <button className="btn btn-sm" onClick={() => adjustQty(item, 5)}>+5</button>
                            <button className="btn btn-sm btn-danger" onClick={() => adjustQty(item, -1)}>−1</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      <AddInventoryModal isOpen={addModal.isOpen} onClose={addModal.close} />
    </div>
  );
}
