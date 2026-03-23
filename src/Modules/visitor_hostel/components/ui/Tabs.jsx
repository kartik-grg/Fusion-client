export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <div
          key={tab.key}
          className={`tab ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.count != null && (
            <span className={`tab-badge ${tab.badgeType || ''}`}>{tab.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
