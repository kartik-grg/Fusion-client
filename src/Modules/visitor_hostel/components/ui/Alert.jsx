const icons = {
  warn: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l7 14H1L8 1zM8 6v4M8 12v.5"/></svg>,
  danger: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7"/><path d="M8 5v3M8 11v.5"/></svg>,
  success: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7"/><path d="M5 8l2 2 4-4"/></svg>,
  info: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5v.5"/></svg>,
};
export default function Alert({ type = 'info', children }) {
  return (
    <div className={`alert alert-${type}`}>
      {icons[type]}
      <span>{children}</span>
    </div>
  );
}
