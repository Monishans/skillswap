const fs = require('fs');
const path = require('path');

// If MONGODB_URI is set -> MongoDB. Otherwise -> local JSON file (handy for quick local dev).
const URI = process.env.MONGODB_URI;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'students.json');
const SEED_FILE = path.join(__dirname, '..', 'data', 'students.json');

const duplicateError = () =>
  Object.assign(new Error('A profile with this email already exists.'), {
    status: 409,
    details: { email: 'This email is already registered.' },
  });

/* ---------- MongoDB ---------- */
let colPromise = null;
function getCollection() {
  if (!colPromise) {
    colPromise = (async () => {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
      await client.connect();
      const col = client.db(process.env.MONGODB_DB || 'skillswap').collection('students');
      await col.createIndex({ email: 1 }, { unique: true });
      if ((await col.countDocuments()) === 0) {
        const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
        await col.insertMany(seed.map((s) => ({ ...s })));
        console.log('Seeded MongoDB with sample students');
      }
      return col;
    })();
    colPromise.catch(() => { colPromise = null; }); // allow retry on next request
  }
  return colPromise;
}

/* ---------- JSON file fallback ---------- */
function readFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.copyFileSync(SEED_FILE, FILE);
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function writeFile(students) {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(students, null, 2));
  fs.renameSync(tmp, FILE);
}

/* ---------- Public API (always async) ---------- */
async function init() {
  if (URI) { await getCollection(); console.log('Storage: MongoDB'); }
  else { readFile(); console.log('Storage: local JSON file (set MONGODB_URI to use MongoDB)'); }
}

async function listStudents() {
  if (!URI) return readFile();
  const col = await getCollection();
  return col.find({}, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray();
}

async function findById(id) {
  if (!URI) return readFile().find((s) => s.id === id) || null;
  const col = await getCollection();
  return col.findOne({ id }, { projection: { _id: 0 } });
}

async function insertStudent(student) {
  if (!URI) {
    const all = readFile();
    if (all.some((s) => s.email.toLowerCase() === student.email)) throw duplicateError();
    all.push(student);
    writeFile(all);
    return student;
  }
  const col = await getCollection();
  try {
    await col.insertOne({ ...student });
  } catch (e) {
    if (e.code === 11000) throw duplicateError();
    throw e;
  }
  return student;
}

module.exports = { init, listStudents, findById, insertStudent };
