import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import Badge from '../ui/Badge';
import StatCard from '../ui/StatCard';
import Alert from '../ui/Alert';
import RoleRestricted from '../ui/RoleRestricted';
import { useVhAccess } from '../../utils/roleAccess';

export default function Rooms() {
  const { state, dispatch } = useApp();
  const access = useVhAccess();
  const toast = useToast();
  const [typeFilter, setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [checkin, setCheckin]   = useState('');
  const [checkout, setCheckout] = useState('');
  const [selectedAvail, setSelectedAvail] = useState([]);
  const [availChecked, setAvailChecked]   = useState(false);

  const rooms = state.rooms.filter(r => {
    if (typeFilter   && r.type   !== typeFilter)   return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const floors = [...new Set(state.rooms.map(r => r.floor))].sort();

  const checkAvailability = () => {
    if (!checkin || !checkout) { toast.warn('Please select both dates'); return; }
    if (checkin >= checkout)   { toast.warn('Check-out must be after check-in'); return; }
    setAvailChecked(true);
    setSelectedAvail([]);
  };

  const availRooms = state.rooms.filter(r => r.status === 'Available' &&
    (!typeFilter || r.type === typeFilter));

  const toggleRoom = (id) =>
    setSelectedAvail(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const changeRoomStatus = (id, newStatus) => {
    if (!access.canManageRoomStatus) {
      return;
    }
    dispatch({ type: 'UPDATE_ROOM_STATUS', id, status: newStatus });
    toast.success(`Room status updated to ${newStatus}`);
  };

  if (!access.canViewRooms) {
    return (
      <RoleRestricted
        title="Rooms Access Restricted"
        message="This section is available only to VhIncharge and VhCaretaker roles."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-20">
        <div>
          <h1 className="page-title">Rooms</h1>
          <p className="page-sub">Manage room availability and status</p>
        </div>
        <div className="flex gap-8">
          <select className="inline-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option>Single</option><option>Double</option><option>Suite</option>
          </select>
          <select className="inline-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All status</option>
            <option>Available</option><option>Occupied</option><option>Maintenance</option>
          </select>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:24 }}>
        <StatCard label="Total Rooms"  value={state.rooms.length} />
        <StatCard label="Available"    value={state.rooms.filter(r=>r.status==='Available').length}   delta="Ready for booking" deltaType="success" />
        <StatCard label="Occupied"     value={state.rooms.filter(r=>r.status==='Occupied').length}    delta="Currently in use"  deltaType="warn"    />
        <StatCard label="Maintenance"  value={state.rooms.filter(r=>r.status==='Maintenance').length} delta="Under repair"      deltaType="danger"  />
      </div>

      {floors.map(floor => {
        const floorRooms = rooms.filter(r => r.floor === floor);
        if (floorRooms.length === 0) return null;
        const floorLabel = floor === 0 ? 'Ground Floor' : floor === 1 ? 'First Floor' : floor === 2 ? 'Second Floor' : `Floor ${floor}`;
        return (
          <div className="card mb-16" key={floor}>
            <div className="card-header">
              <div className="card-title">{floorLabel} — Block A</div>
              <span className="text-sm text-muted">{floorRooms.filter(r=>r.status==='Available').length} available</span>
            </div>
            <div className="room-grid">
              {floorRooms.map(r => (
                <div
                  key={r.id}
                  className={`room-tile ${r.status === 'Occupied' ? 'occupied' : r.status === 'Maintenance' ? 'maintenance' : ''}`}
                  title={`${r.type} · ₹${r.tariff}/night · ${r.status}`}
                >
                  <div className="room-num">{r.num}</div>
                  <div className="room-type-lbl">{r.type}</div>
                  <div style={{ margin:'5px 0' }}>
                    <Badge status={r.status}>{r.status}</Badge>
                  </div>
                  <div className="room-tariff-lbl">₹{r.tariff}/night</div>
                  {r.status !== 'Occupied' && access.canManageRoomStatus && (
                    <select
                      className="inline-select room-status-select"
                      value={r.status}
                      onChange={e => changeRoomStatus(r.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      <option>Available</option>
                      <option>Maintenance</option>
                      <option>Blocked</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Availability Checker */}
      <div className="card mt-16">
        <div className="card-header">
          <div>
            <div className="card-title">Availability Check</div>
            <div className="card-sub">Find available rooms for a date range</div>
          </div>
        </div>
        <div className="form-grid" style={{ alignItems:'end' }}>
          <div className="form-group">
            <label>Check-in Date</label>
            <input type="date" value={checkin} onChange={e => { setCheckin(e.target.value); setAvailChecked(false); }} />
          </div>
          <div className="form-group">
            <label>Check-out Date</label>
            <input type="date" value={checkout} onChange={e => { setCheckout(e.target.value); setAvailChecked(false); }} />
          </div>
          <div className="form-group">
            <label>Room Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Any type</option>
              <option>Single</option><option>Double</option><option>Suite</option>
            </select>
          </div>
          <div>
            <button className="btn btn-primary w-full" onClick={checkAvailability}>Check Availability</button>
          </div>
        </div>
        {availChecked && (
          <>
            <hr className="divider" />
            {availRooms.length === 0
              ? <Alert type="warn">No rooms available for the selected dates and type.</Alert>
              : (
                <>
                  <div style={{ fontSize:13, color:'var(--success)', marginBottom:10 }}>
                    ✓ {availRooms.length} rooms available for selected dates
                  </div>
                  <div className="room-grid">
                    {availRooms.map(r => (
                      <div
                        key={r.id}
                        className={`room-tile ${selectedAvail.includes(r.id) ? 'selected' : ''}`}
                        onClick={() => toggleRoom(r.id)}
                      >
                        <div className="room-num">{r.num}</div>
                        <div className="room-type-lbl">{r.type}</div>
                        <div className="room-tariff-lbl">₹{r.tariff}/night</div>
                      </div>
                    ))}
                  </div>
                  {selectedAvail.length > 0 && (
                    <div style={{ marginTop:12, fontSize:12, color:'var(--brand)' }}>
                      {selectedAvail.length} room(s) selected
                    </div>
                  )}
                </>
              )
            }
          </>
        )}
      </div>
    </div>
  );
}
  