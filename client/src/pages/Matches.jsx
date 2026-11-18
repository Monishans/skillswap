import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMatches } from '../services/api.js';
import StatsBar from '../components/StatsBar.jsx';
import Tags from '../components/Tags.jsx';

export default function Matches({ students, currentId, setCurrentId, onConnect, refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentId) { setData(null); return undefined; }
    let live = true;
    setLoading(true);
    setError('');
    getMatches(currentId)
      .then((d) => live && setData(d))
      .catch((e) => live && (setData(null), setError(e.message)))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [currentId, refreshKey]);

  return (
    <section className="container section">
      <h1 className="page-title">My Matches</h1>
      <div className="card picker">
        <label htmlFor="me">Viewing matches for</label>
        <select id="me" value={currentId} onChange={(e) => setCurrentId(e.target.value)}>
          <option value="">Select your profile…</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
        </select>
        <Link to="/add" className="link">Not listed? Add your profile</Link>
      </div>

      <StatsBar matchCount={currentId && data ? data.count : currentId ? undefined : 0} refreshKey={refreshKey} />

      {!currentId && (
        <div className="empty">
          <h3>Select your profile to see matches</h3>
          <p className="muted">A mutual match means you can teach something they want to learn, and they can teach something you want to learn.</p>
        </div>
      )}
      {loading && <p className="notice">Finding your skill partners…</p>}
      {error && <p className="notice error">{error}</p>}
      {data && data.count === 0 && (
        <div className="empty">
          <h3>No mutual matches yet</h3>
          <p className="muted">Try adding more skills you can teach or want to learn, or check back as more students join.</p>
        </div>
      )}
      <div className="grid">
        {data && data.matches.map((m) => (
          <article key={m.student.id} className="card student">
            <div className="student-head">
              <div className="avatar">{m.student.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div>
                <h3>{m.student.name}</h3>
                <p className="muted">{m.student.college || 'College not listed'}</p>
              </div>
              <span className="badge">{m.matchPercent}% match</span>
            </div>
            <div><p className="label">You can teach them</p><Tags items={m.youCanTeach} variant="teach" /></div>
            <div><p className="label">They can teach you</p><Tags items={m.theyCanTeach} variant="learn" /></div>
            <button className="btn btn-primary" onClick={() => onConnect(m.student)}>Connect</button>
          </article>
        ))}
      </div>
    </section>
  );
}
