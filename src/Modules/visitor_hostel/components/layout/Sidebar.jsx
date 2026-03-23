import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NavItem = ({ to, icon, children, badgeCount, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
  >
    {icon}
    <span style={{ flex: 1 }}>{children}</span>
    {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
  </NavLink>
);

export default function Sidebar() {
  const { stats } = useApp();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>VHMS</h1>
        <p>Visitor Hostel · IIITDMJ</p>
      </div>

      <div className="nav-section-label">Main</div>
      <NavItem to="." end icon={<IcoDashboard />}>Dashboard</NavItem>
      <NavItem to="bookings" icon={<IcoBookings />} badgeCount={stats.pendingCount + stats.forwardedCount}>
        Bookings
      </NavItem>
      <NavItem to="rooms" icon={<IcoRooms />}>Rooms</NavItem>

      <div className="nav-section-label">Operations</div>
      <NavItem to="checkin" icon={<IcoCheckin />}>Check-in / Out</NavItem>
      <NavItem to="billing" icon={<IcoBilling />} badgeCount={stats.pendingBills}>Billing</NavItem>
      <NavItem to="meals" icon={<IcoMeals />}>Mess & Meals</NavItem>
      <NavItem to="inventory" icon={<IcoInventory />} badgeCount={stats.lowStockCount > 0 ? stats.lowStockCount : 0}>
        Inventory
      </NavItem>

      <div className="nav-section-label">Reports</div>
      <NavItem to="reports" icon={<IcoReports />}>Reports</NavItem>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">VH</div>
          <div>
            <div className="user-name">VH In-Charge</div>
            <div className="user-role">IIITDMJ Portal</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const IcoDashboard  = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>;
const IcoBookings   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="1.5"/><path d="M5 2V1M11 2V1M1 6h14"/></svg>;
const IcoRooms      = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="14" height="14" rx="1.5"/><path d="M1 8h14M8 8v7"/></svg>;
const IcoCheckin    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2h4v12h-4M6 5l4 3-4 3M1 8h9"/></svg>;
const IcoBilling    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="1.5"/><path d="M5 8h6M5 11h4M5 5h3"/></svg>;
const IcoMeals      = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2v12M3 8h4a3 3 0 0 0 0-6H3M11 2l2 5-2 2v5"/></svg>;
const IcoInventory  = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4l7-3 7 3v8l-7 3-7-3zM8 1v14M1 4l7 3 7-3"/></svg>;
const IcoReports    = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12V4l4 3 3-5 3 3 2-3v10z"/></svg>;
