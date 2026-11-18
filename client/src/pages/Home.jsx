import { Link } from 'react-router-dom';
import StudentCard from '../components/StudentCard.jsx';
import StatsBar from '../components/StatsBar.jsx';

const steps = [
  ['Share what you know', 'List the skills you can teach other students.'],
  ['Tell us what you want to learn', 'Add the skills you are looking to pick up.'],
  ['Connect and exchange skills', 'We find students who want what you know and know what you want.'],
];

export default function Home({ students, loading, error, onConnect, refreshKey }) {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Your Skills Have Value. Exchange Them.</h1>
          <p>
            SkillSwap pairs students who can teach each other. You know React and want to learn UI/UX?
            Someone out there is the reverse. Swap skills, skip the course fees.
          </p>
          <div className="hero-actions">
            <Link to="/matches" className="btn btn-primary btn-lg">Find Your Skill Partner</Link>
            <Link to="/add" className="btn btn-lg">Add your profile</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <StatsBar refreshKey={refreshKey} />
      </section>

      <section className="container section">
        <h2>How it works</h2>
        <div className="steps">
          {steps.map(([title, text], i) => (
            <div key={title} className="card step">
              <span className="step-n">{i + 1}</span>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="row-between">
          <h2>Students on SkillSwap</h2>
          <Link to="/explore" className="link">See all students</Link>
        </div>
        {loading && <p className="notice">Loading profiles…</p>}
        {error && <p className="notice error">{error}</p>}
        <div className="grid">
          {students.slice(0, 3).map((s) => <StudentCard key={s.id} student={s} onConnect={onConnect} />)}
        </div>
      </section>
    </>
  );
}
