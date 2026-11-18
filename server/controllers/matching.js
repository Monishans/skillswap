const norm = (s) => String(s).trim().toLowerCase();

// Returns original-cased skills from `a` that also appear in `b` (case/space-insensitive).
function overlap(a, b) {
  const set = new Set(b.map(norm));
  return a.filter((s) => set.has(norm(s)));
}

// Mutual match = I can teach something they want AND they can teach something I want.
function computeMatch(me, other) {
  const youCanTeach = overlap(me.teach, other.learn);
  const theyCanTeach = overlap(other.teach, me.learn);
  if (!youCanTeach.length || !theyCanTeach.length) return null;
  const wanted = new Set([...me.learn.map(norm), ...other.learn.map(norm)]).size || 1;
  const covered = new Set([...theyCanTeach.map(norm), ...youCanTeach.map(norm)]).size;
  const matchPercent = Math.min(100, Math.round((covered / wanted) * 100));
  return { student: other, youCanTeach, theyCanTeach, matchPercent };
}

function findMatches(me, all) {
  return all
    .filter((s) => s.id !== me.id)
    .map((s) => computeMatch(me, s))
    .filter(Boolean)
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

module.exports = { norm, overlap, computeMatch, findMatches };
