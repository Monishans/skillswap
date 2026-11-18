import Tags from './Tags.jsx';

export default function StudentCard({ student, onConnect }) {
  const initials = student.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <article className="card student">
      <div className="student-head">
        <div className="avatar">{initials}</div>
        <div>
          <h3>{student.name}</h3>
          <p className="muted">{student.college || 'College not listed'}</p>
        </div>
      </div>
      <div>
        <p className="label">Can teach</p>
        <Tags items={student.teach} variant="teach" />
      </div>
      <div>
        <p className="label">Wants to learn</p>
        <Tags items={student.learn} variant="learn" />
      </div>
      {student.bio && <p className="bio">{student.bio}</p>}
      <button className="btn btn-primary" onClick={() => onConnect(student)}>Connect</button>
    </article>
  );
}
