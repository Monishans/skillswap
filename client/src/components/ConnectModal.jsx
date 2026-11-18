import { useEffect } from 'react';
import Tags from './Tags.jsx';

const norm = (s) => s.trim().toLowerCase();
const overlap = (a, b) => { const set = new Set(b.map(norm)); return a.filter((s) => set.has(norm(s))); };

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export default function ConnectModal({ student, me, onClose, onToast }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!student) return null;
  const hasMe = me && me.id !== student.id;
  const youTeach = hasMe ? overlap(me.teach, student.learn) : [];
  const theyTeach = hasMe ? overlap(student.teach, me.learn) : [];

  const copy = async () => {
    const ok = await copyText(student.email);
    onToast(ok ? { type: 'success', message: 'Email copied to clipboard.' } : { type: 'error', message: 'Could not copy. Select the email manually.' });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Connect with ${student.name}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2>Connect with {student.name}</h2>
        <p className="muted">{student.college || 'College not listed'}</p>

        <div className="email-box">
          <span>{student.email}</span>
          <button className="btn btn-small" onClick={copy}>Copy email</button>
        </div>

        {hasMe ? (
          <>
            <p className="label">You can teach them</p>
            <Tags items={youTeach} variant="teach" />
            <p className="label">They can teach you</p>
            <Tags items={theyTeach} variant="learn" />
            {(!youTeach.length || !theyTeach.length) && <p className="muted small">This is not a full mutual match yet, but you can still reach out.</p>}
          </>
        ) : (
          <>
            <p className="label">They can teach</p>
            <Tags items={student.teach} variant="teach" />
            <p className="label">They want to learn</p>
            <Tags items={student.learn} variant="learn" />
            <p className="muted small">Select your profile on the My Matches page to see which skills you can swap.</p>
          </>
        )}

        <div className="modal-actions">
          <a className="btn btn-primary" href={`mailto:${student.email}?subject=${encodeURIComponent('SkillSwap: let us swap skills')}`}>Send email</a>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
