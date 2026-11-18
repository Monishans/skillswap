import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentCard from '../components/StudentCard.jsx';

const norm = (s) => s.trim().toLowerCase();

export default function Explore({ students, loading, error, onConnect, reload }) {
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');

  const allSkills = useMemo(() => {
    const map = new Map();
    students.forEach((s) => [...s.teach, ...s.learn].forEach((k) => map.set(norm(k), k)));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [students]);

  const filtered = useMemo(() => {
    const q = norm(query);
    return students.filter((s) => {
      const skills = [...s.teach, ...s.learn].map(norm);
      const matchesQuery = !q || norm(s.name).includes(q) || norm(s.college || '').includes(q) || skills.some((k) => k.includes(q));
      const matchesSkill = !skill || skills.includes(skill);
      return matchesQuery && matchesSkill;
    });
  }, [students, query, skill]);

  return (
    <section className="container section">
      <h1 className="page-title">Explore Skills</h1>
      <div className="filters">
        <input type="search" placeholder="Search by name, college or skill" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search students" />
        <select value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="Filter by skill">
          <option value="">All skills</option>
          {allSkills.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        {(query || skill) && <button className="btn" onClick={() => { setQuery(''); setSkill(''); }}>Clear</button>}
      </div>

      {loading && <p className="notice">Loading profiles…</p>}
      {error && (
        <p className="notice error">{error} <button className="link-btn" onClick={reload}>Try again</button></p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty">
          <h3>No students found</h3>
          <p className="muted">Try a different search, or be the first to list this skill.</p>
          <Link to="/add" className="btn btn-primary">Add your profile</Link>
        </div>
      )}
      <div className="grid">
        {filtered.map((s) => <StudentCard key={s.id} student={s} onConnect={onConnect} />)}
      </div>
    </section>
  );
}
