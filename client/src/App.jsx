import { useCallback, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import ConnectModal from './components/ConnectModal.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import AddProfile from './pages/AddProfile.jsx';
import Matches from './pages/Matches.jsx';
import { getStudents } from './services/api.js';

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [currentId, setCurrentIdState] = useState(() => {
    try { return localStorage.getItem('skillswap_current') || ''; } catch { return ''; }
  });

  const setCurrentId = (id) => {
    setCurrentIdState(id);
    try { localStorage.setItem('skillswap_current', id); } catch { /* ignore */ }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getStudents();
      setStudents(list);
      setCurrentIdState((id) => (id && !list.some((s) => s.id === id) ? '' : id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCreated = async (student) => {
    setCurrentId(student.id);
    await load();
    setRefreshKey((k) => k + 1);
  };

  const me = students.find((s) => s.id === currentId) || null;
  const closeToast = useCallback(() => setToast(null), []);
  const closeModal = useCallback(() => setConnecting(null), []);
  const common = { students, loading, error, onConnect: setConnecting, refreshKey };

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home {...common} />} />
          <Route path="/explore" element={<Explore {...common} reload={load} />} />
          <Route path="/add" element={<AddProfile onCreated={onCreated} onToast={setToast} />} />
          <Route path="/matches" element={<Matches {...common} currentId={currentId} setCurrentId={setCurrentId} />} />
          <Route path="*" element={<section className="container section"><div className="empty"><h3>Page not found</h3></div></section>} />
        </Routes>
      </main>
      <footer className="footer"><div className="container">SkillSwap. Learn from each other, for free.</div></footer>
      <ConnectModal student={connecting} me={me} onClose={closeModal} onToast={setToast} />
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
