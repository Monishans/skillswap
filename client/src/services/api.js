const BASE = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running and VITE_API_URL is correct.');
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Request failed');
    err.details = data && data.details;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getStudents = () => request('/api/students');
export const getStats = () => request('/api/stats');
export const getMatches = (id) => request(`/api/matches/${id}`);
export const createStudent = (body) => request('/api/students', { method: 'POST', body: JSON.stringify(body) });
