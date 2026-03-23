export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null;

  // Scoped class names avoid collisions with global Bootstrap modal styles.
  const sizeClass = { sm: 'vh-modal-sm', md: 'vh-modal-md', lg: 'vh-modal-lg' }[size] || 'vh-modal-md';

  return (
    <div className="vh-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`vh-modal ${sizeClass}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="vh-modal-header">
          <div className="vh-modal-title">{title}</div>
          <button className="vh-modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <div className="vh-modal-body">{children}</div>
        {footer && <div className="vh-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
