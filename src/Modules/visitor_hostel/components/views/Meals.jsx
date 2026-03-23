import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import Alert from '../ui/Alert';
import { todayISO, formatDate, formatCurrency } from '../../utils/helpers';
import { MEAL_TYPES } from '../../data/constants';

export default function Meals() {
  const { state, dispatch } = useApp();
  const toast = useToast();

  const checkedIn = state.bookings.filter(b => b.status === 'CheckedIn');

  const [form, setForm] = useState({
    bookingId: checkedIn[0]?.id || '',
    date: todayISO(), type: 'Breakfast',
    persons: 1, rate: 120, veg: true,
  });
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(todayISO());

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const total = Number(form.persons) * Number(form.rate);

  const submit = () => {
    if (!form.bookingId) { setError('Select a booking'); return; }
    if (Number(form.persons) < 1) { setError('At least 1 person required'); return; }
    if (Number(form.rate) < 0)    { setError('Rate cannot be negative'); return; }

    // VH-BR-011: cut-off time check
    const now = new Date();
    const hour = now.getHours();
    const isToday = form.date === todayISO();
    if (isToday && form.type === 'Lunch'  && hour >= 9)  { setError('Lunch orders must be placed before 09:00 AM'); return; }
    if (isToday && form.type === 'Dinner' && hour >= 14) { setError('Dinner orders must be placed before 02:00 PM'); return; }

    const booking = state.bookings.find(b => b.id === form.bookingId);
    const meal = {
      id: Date.now(),
      bookingId: form.bookingId,
      visitor: booking?.visitor || '',
      date: form.date,
      type: form.type,
      persons: Number(form.persons),
      rate: Number(form.rate),
      total,
      veg: form.veg,
    };
    dispatch({ type: 'ADD_MEAL', payload: meal });
    toast.success(`${form.type} recorded for ${booking?.visitor}`);
    setError('');
    set('persons', 1);
  };

  const filteredMeals = state.meals.filter(m => !dateFilter || m.date === dateFilter);
  const dayTotal = filteredMeals.reduce((s, m) => s + m.total, 0);

  const mealTypeColor = { Breakfast:'var(--warn-light)', Lunch:'var(--success-light)', Dinner:'var(--info-light)', 'High Tea':'var(--brand-light)' };
  const mealTypeText  = { Breakfast:'var(--warn)', Lunch:'var(--success)', Dinner:'var(--info)', 'High Tea':'var(--brand)' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mess & Meals</h1>
        <p className="page-sub">Record and manage guest meal consumption</p>
      </div>

      <Alert type="info">
        Meal cut-off times: <strong>Lunch</strong> orders before 09:00 AM · <strong>Dinner</strong> orders before 02:00 PM
      </Alert>

      <div className="grid-2" style={{ gap:20, alignItems:'start' }}>
        {/* Record Meal Form */}
        <div className="card">
          <div className="card-header"><div className="card-title">Record Meal</div></div>
          {error && <div style={{ color:'var(--danger)', fontSize:12, marginBottom:10 }}>{error}</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="form-group">
              <label>Booking (Checked-in guests)</label>
              {checkedIn.length === 0
                ? <select disabled><option>No checked-in guests</option></select>
                : (
                  <select value={form.bookingId} onChange={e => set('bookingId', e.target.value)}>
                    {checkedIn.map(b => (
                      <option key={b.id} value={b.id}>{b.id} — {b.visitor}</option>
                    ))}
                  </select>
                )
              }
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Meal Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Meal Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>No. of Persons</label>
                <input type="number" min="1" value={form.persons} onChange={e => set('persons', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Rate / Person (₹)</label>
                <input type="number" min="0" value={form.rate} onChange={e => set('rate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Diet Preference</label>
              <select value={form.veg ? 'veg' : 'nonveg'} onChange={e => set('veg', e.target.value === 'veg')}>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>
            <div style={{ background:'var(--surface-bg)', padding:'10px 12px', borderRadius:'var(--radius-sm)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="text-sm text-muted">Total Amount</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:18 }}>{formatCurrency(total)}</span>
            </div>
            <button className="btn btn-primary" onClick={submit} disabled={checkedIn.length === 0}>
              Record Meal
            </button>
          </div>
        </div>

        {/* Meal Log */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Meal Log</div>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ fontSize:12, padding:'4px 8px', width:'auto' }} />
          </div>
          {filteredMeals.length === 0
            ? <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink-300)', fontSize:13 }}>No meals recorded for this date</div>
            : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Visitor</th><th>Meal</th><th>Persons</th><th>Amount</th></tr></thead>
                    <tbody>
                      {filteredMeals.map(m => (
                        <tr key={m.id}>
                          <td>
                            <div className="td-main">{m.visitor}</div>
                            <div className="td-sub">{m.bookingId}</div>
                          </td>
                          <td>
                            <span style={{
                              fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:10,
                              background: mealTypeColor[m.type] || 'var(--surface-bg)',
                              color:      mealTypeText[m.type]  || 'var(--ink-500)',
                            }}>{m.type}</span>
                          </td>
                          <td>{m.persons}</td>
                          <td>{formatCurrency(m.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr className="divider" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Day's meal revenue</span>
                  <span className="font-medium">{formatCurrency(dayTotal)}</span>
                </div>
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}
