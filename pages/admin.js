import { useState, useEffect } from 'react';

const STORY_COLORS = {
  'Wild Card':       { bg: '#F3EEFF', text: '#6B35D9' },
  'Perfect Paradox': { bg: '#E6F7EF', text: '#1A7F4B' },
  'Latecomer':       { bg: '#FFF4E6', text: '#B85C00' },
  'Spotter':         { bg: '#FAE7EB', text: '#AD0068' },
};

const MODULE_COLORS = {
  'Define It':  { bg: '#E8F4FD', text: '#1565C0' },
  'Restore It': { bg: '#F3EEFF', text: '#6B35D9' },
  'Nourish It': { bg: '#E6F7EF', text: '#1A7F4B' },
  'Align It':   { bg: '#FFF4E6', text: '#B85C00' },
};

function Badge({ label, colors }) {
  if (!label) return <span style={{ color: '#C4A8B0', fontSize: '13px' }}>Unknown</span>;
  const c = colors[label] || { bg: '#F0F0F0', text: '#666' };
  return (
    <span style={{ backgroundColor: c.bg, color: c.text, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function renderFormatted(text) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[Start the .+? Module\]/g, '[Module CTA]')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('htc_admin_authed') === 'true') {
      setAuthed(true);
      fetchSessions(sessionStorage.getItem('htc_admin_key'));
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/admin-sessions', {
      headers: { 'x-admin-key': password },
    });
    if (res.status === 401) { setAuthError('Incorrect password.'); return; }
    if (!res.ok) { setAuthError('Something went wrong. Try again.'); return; }

    const data = await res.json();
    sessionStorage.setItem('htc_admin_authed', 'true');
    sessionStorage.setItem('htc_admin_key', password);
    setSessions(data);
    setAuthed(true);
  }

  async function fetchSessions(key) {
    try {
      const res = await fetch('/api/admin-sessions', {
        headers: { 'x-admin-key': key || sessionStorage.getItem('htc_admin_key') },
      });
      if (!res.ok) throw new Error();
      setSessions(await res.json());
    } catch {
      setFetchError('Could not load sessions.');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('htc_admin_authed');
    sessionStorage.removeItem('htc_admin_key');
    setAuthed(false);
    setSessions([]);
    setPassword('');
  }

  // Stats
  const storyCounts = sessions.reduce((acc, s) => {
    if (s.cycle_story) acc[s.cycle_story] = (acc[s.cycle_story] || 0) + 1;
    return acc;
  }, {});
  const moduleCounts = sessions.reduce((acc, s) => {
    if (s.recommended_module) acc[s.recommended_module] = (acc[s.recommended_module] || 0) + 1;
    return acc;
  }, {});

  const filtered = sessions.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.cycle_story?.toLowerCase().includes(search.toLowerCase()) ||
    s.recommended_module?.toLowerCase().includes(search.toLowerCase())
  );

  if (!authed) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Poppins', sans-serif; background: #F6F7F7; }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '380px', boxShadow: '0 4px 20px rgba(42,40,40,0.1)' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '8px' }}>Heal to Conceive System</p>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#2A2828', marginBottom: '28px' }}>Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(''); }}
              placeholder="Admin password"
              style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1.5px solid #E8D0D8', fontSize: '14px', color: '#2A2828', fontFamily: 'Poppins, sans-serif', marginBottom: '12px' }}
            />
            {authError && <p style={{ color: '#AD0068', fontSize: '13px', marginBottom: '12px' }}>{authError}</p>}
            <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: '10px', border: 'none', backgroundColor: '#AD0068', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #F6F7F7; -webkit-font-smoothing: antialiased; }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #9E8088; padding: 10px 16px; border-bottom: 1px solid #F0D8E0; }
        td { padding: 14px 16px; border-bottom: 1px solid #F6F0F2; vertical-align: middle; }
        tr:hover td { background: #FDF5F7; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '4px' }}>Heal to Conceive System</p>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#2A2828' }}>Admin Dashboard</h1>
            <p style={{ fontSize: '13px', color: '#9E8088', marginTop: '3px' }}>{sessions.length} total {sessions.length === 1 ? 'result' : 'results'}</p>
          </div>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: '#9E8088', background: 'none', border: '1px solid #E8D0D8', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Sign out
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {Object.entries(storyCounts).map(([story, count]) => (
            <div key={story} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 1px 4px rgba(42,40,40,0.07)' }}>
              <p style={{ fontSize: '11px', color: '#9E8088', marginBottom: '4px' }}>Cycle Story</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#2A2828' }}>{count}</p>
              <Badge label={story} colors={STORY_COLORS} />
            </div>
          ))}
          {Object.entries(moduleCounts).map(([mod, count]) => (
            <div key={mod} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 1px 4px rgba(42,40,40,0.07)' }}>
              <p style={{ fontSize: '11px', color: '#9E8088', marginBottom: '4px' }}>Module</p>
              <p style={{ fontSize: '20px', fontWeight: '600', color: '#2A2828' }}>{count}</p>
              <Badge label={mod} colors={MODULE_COLORS} />
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, cycle story, or module..."
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #E8D0D8', backgroundColor: '#FFFFFF', fontSize: '14px', color: '#2A2828', fontFamily: 'Poppins, sans-serif', marginBottom: '16px' }}
        />

        {fetchError && <p style={{ color: '#AD0068', marginBottom: '16px', fontSize: '13px' }}>{fetchError}</p>}

        {/* Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', boxShadow: '0 1px 6px rgba(42,40,40,0.07)', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#9E8088', fontSize: '14px' }}>No results found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Cycle Story</th>
                  <th>Module</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <>
                    <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                      <td style={{ fontWeight: '500', color: '#2A2828', fontSize: '14px' }}>{s.name}</td>
                      <td style={{ color: '#9E8088', fontSize: '13px' }}>{s.email || 'Not provided'}</td>
                      <td><Badge label={s.cycle_story} colors={STORY_COLORS} /></td>
                      <td><Badge label={s.recommended_module} colors={MODULE_COLORS} /></td>
                      <td style={{ color: '#9E8088', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <br />
                        <span style={{ fontSize: '11px' }}>{new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ color: '#AD0068', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        {expanded === s.id ? 'Hide ▲' : 'View ▼'}
                      </td>
                    </tr>
                    {expanded === s.id && (
                      <tr key={`${s.id}-expanded`}>
                        <td colSpan={6} style={{ backgroundColor: '#FDF5F7', padding: '20px 24px' }}>
                          <p style={{ fontSize: '13px', color: '#6B5B5E', marginBottom: '14px', lineHeight: '1.6' }}>
                            The full conversation is saved in your Notion database. Open the page to read it.
                          </p>
                          <a
                            href={s.notion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-block', backgroundColor: '#2A2828', color: '#FFFFFF', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}
                          >
                            Open in Notion →
                          </a>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
