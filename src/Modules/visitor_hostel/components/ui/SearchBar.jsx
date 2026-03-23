export default function SearchBar({ value, onChange, placeholder = 'Search...', maxWidth = 300 }) {
  return (
    <div className="search-bar" style={{ maxWidth }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-300)', fontSize: 14, padding: 0, lineHeight: 1 }}
        >×</button>
      )}
    </div>
  );
}
