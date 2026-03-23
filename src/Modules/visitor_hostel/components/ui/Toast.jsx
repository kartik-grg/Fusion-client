import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { state, dispatch } = useApp();
  return (
    <div className="toast-container">
      {state.toasts.map(t => (
        <div key={t.id} className={`toast ${t.toastType || ''}`}>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => dispatch({ type: 'REMOVE_TOAST', id: t.id })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, marginLeft: 8 }}
          >×</button>
        </div>
      ))}
    </div>
  );
}
