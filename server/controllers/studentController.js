const crypto = require('crypto');
const store = require('./store');
const { norm, findMatches } = require('./matching');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const httpError = (status, message, details) => Object.assign(new Error(message), { status, details });

function parseSkills(v) {
  const list = Array.isArray(v) ? v : String(v || '').split(',');
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const s = String(item).trim().replace(/\s+/g, ' ');
    if (s && !seen.has(norm(s))) { seen.add(norm(s)); out.push(s); }
  }
  return out;
}

exports.list = wrap(async (req, res) => res.json(await store.listStudents()));

exports.create = wrap(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const college = String(b.college || '').trim();
  const bio = String(b.bio || '').trim();
  const teach = parseSkills(b.teach);
  const learn = parseSkills(b.learn);

  const errors = {};
  if (name.length < 2) errors.name = 'Full name is required (min 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (college.length > 100) errors.college = 'College name must be under 100 characters.';
  if (!teach.length) errors.teach = 'Add at least one skill you can teach.';
  if (!learn.length) errors.learn = 'Add at least one skill you want to learn.';
  if (bio.length > 300) errors.bio = 'Bio must be 300 characters or fewer.';
  if (Object.keys(errors).length) throw httpError(400, 'Validation failed', errors);

  const student = { id: crypto.randomUUID(), name, email, college, teach, learn, bio, createdAt: new Date().toISOString() };
  await store.insertStudent(student);
  res.status(201).json(student);
});

exports.getOne = wrap(async (req, res) => {
  const s = await store.findById(req.params.id);
  if (!s) throw httpError(404, 'Student not found.');
  res.json(s);
});

exports.matches = wrap(async (req, res) => {
  const all = await store.listStudents();
  const me = all.find((x) => x.id === req.params.id);
  if (!me) throw httpError(404, 'Student not found.');
  const matches = findMatches(me, all);
  res.json({ studentId: me.id, count: matches.length, matches });
});

exports.stats = wrap(async (req, res) => {
  const all = await store.listStudents();
  const skills = new Set(all.flatMap((s) => s.teach.map(norm)));
  res.json({ totalStudents: all.length, totalSkillsOffered: skills.size, totalProfiles: all.length });
});
