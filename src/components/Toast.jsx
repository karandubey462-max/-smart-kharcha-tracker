import useStore from '../store/useStore';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container" style={{ pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} style={{ pointerEvents: 'auto' }}>
          <span style={{ fontSize: 20 }}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️'}
          </span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
