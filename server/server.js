require('dotenv').config();
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const matchRoutes = require('./routes/matchRoutes');
const { stats } = require('./controllers/studentController');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const store = require('./controllers/store');

const app = express();
const PORT = process.env.PORT || 5000;

// CLIENT_URL may hold several comma-separated origins. If unset (local dev), allow all.
const origins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() }));
app.get('/api/stats', stats);
app.use('/api/students', studentRoutes);
app.use('/api/matches', matchRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`SkillSwap API listening on port ${PORT}`));
// Connect/seed storage at startup; failures are logged and retried on the next request.
store.init().catch((e) => console.error('Storage init failed:', e.message));
