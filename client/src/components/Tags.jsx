export default function Tags({ items, variant = 'teach' }) {
  if (!items || !items.length) return <span className="muted">None listed</span>;
  return (
    <div className="tags">
      {items.map((s) => <span key={s} className={`tag ${variant}`}>{s}</span>)}
    </div>
  );
}
