// ── DATE ───────────────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const nightsBetween = (checkin, checkout) => {
  if (!checkin || !checkout) return 0;
  const ms = new Date(checkout) - new Date(checkin);
  return Math.max(0, Math.round(ms / 86400000));
};

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
};

export const isPast = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

export const todayISO = () => new Date().toISOString().split('T')[0];

// ── CURRENCY ──────────────────────────────────────────────────────────────
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const formatCurrencyShort = (amount) => {
  if (!amount && amount !== 0) return '—';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount}`;
};

// ── BOOKING IDs ───────────────────────────────────────────────────────────
export const generateBookingId = () => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `VH${ymd}${rand}`;
};

export const generateInvoiceNo = () => {
  const now = new Date();
  return `INV${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(Math.floor(Math.random()*900)+100)}`;
};

// ── BADGE ─────────────────────────────────────────────────────────────────
export const statusBadgeClass = (status) => {
  const map = {
    Pending:    'badge-pending',
    Forwarded:  'badge-forwarded',
    Confirmed:  'badge-confirmed',
    CancellationRequested: 'badge-forwarded',
    CheckedIn:  'badge-checkedin',
    CheckedOut: 'badge-checkedout',
    NoShow:     'badge-rejected',
    Cancelled:  'badge-cancelled',
    Rejected:   'badge-rejected',
    Expired:    'badge-expired',
    Available:  'badge-available',
    Occupied:   'badge-occupied',
    Maintenance:'badge-maintenance',
    Consumable: 'badge-consumable',
    Asset:      'badge-asset',
    Paid:       'badge-paid',
    Locked:     'badge-locked',
    Generated:  'badge-generated',
    Pending_bill:'badge-pending',
  };
  return map[status] || 'badge-pending';
};

// ── VALIDATION ─────────────────────────────────────────────────────────────
export const validateBookingDates = (checkin, checkout) => {
  if (!checkin || !checkout) return 'Check-in and check-out dates are required';
  if (new Date(checkin) < new Date(todayISO())) return 'Check-in date cannot be in the past';
  if (new Date(checkout) <= new Date(checkin)) return 'Check-out must be after check-in';
  return null;
};

// ── MISC ──────────────────────────────────────────────────────────────────
export const clsx = (...classes) => classes.filter(Boolean).join(' ');
