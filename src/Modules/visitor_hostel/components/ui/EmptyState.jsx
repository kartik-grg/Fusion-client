export default function EmptyState({ title = 'No records found', message = 'Try adjusting your filters.' }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◻</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
