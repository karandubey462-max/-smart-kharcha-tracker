// Reusable empty state component
export default function EmptyState({ icon = '📭', title, subtitle, action, actionLabel }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" style={{ animation: 'bounce 2s ease-in-out infinite' }}>{icon}</div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {action && (
        <button className="btn btn-primary btn-sm" onClick={action} style={{ marginTop: 8 }}>
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}
