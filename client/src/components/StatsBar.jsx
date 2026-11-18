import { useEffect, useState } from 'react';
import { getStats } from '../services/api.js';

export default function StatsBar({ matchCount, refreshKey }) {
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    getStats().then((d) => live && setStats(d)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [refreshKey]);

  const items = [
    ['Registered students', stats?.totalStudents],
    ['Skills offered', stats?.totalSkillsOffered],
    ['Available profiles', stats?.totalProfiles],
  ];
  if (matchCount !== undefined) items.push(['Mutual matches', matchCount]);

  if (failed) return <p className="notice error">Could not load statistics.</p>;
  return (
    <div className="stats">
      {items.map(([label, value]) => (
        <div key={label} className="stat">
          <strong>{value ?? '…'}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
