import { useState, useEffect } from 'react';

const MODULE_URLS = {
  'Define It':  'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157603658',
  'Restore It': 'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157730875',
  'Nourish It': 'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157730882',
  'Align It':   'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157730885',
};

const CYCLE_STORY_DESCRIPTIONS = {
  'Wild Card': 'Your cycles are unpredictable and ovulation is inconsistent. Your body is ready to find its rhythm.',
  'Perfect Paradox': 'Your cycle looks normal on paper, but pregnancy still hasn\'t happened. There is a deeper layer to explore.',
  'Latecomer': 'Your cycles are long and ovulation comes late, or may not be happening consistently. Your body needs support to find its natural pace.',
  'Spotter': 'Your cycle may feel disconnected or unclear. Your body is ready to come back online.',
};

const MODULE_DESCRIPTIONS = {
  'Define It': 'Learn to read the signs your body is already giving you. Build clarity and confidence in your cycle data.',
  'Restore It': 'Restore rhythm to your cycle and bring ovulation back online. Create the conditions where your body can find its natural pace.',
  'Nourish It': 'Support your body on a deeper level through nourishment, repair, and addressing hidden stressors like inflammation or nutrient gaps.',
  'Align It': 'Help your body feel safe enough to function fully. Reconnect your mind, body, and hormones so your system can finally work together.',
};

function renderFormatted(text) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[Start the .+? Module\]/g, '')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function MyResults() {
  const [status, setStatus] = useState('loading');
  const [session, setSession] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('htc_user_email');
    const sessionId = localStorage.getItem('htc_session_id');

    const query = email
      ? `email=${encodeURIComponent(email)}`
      : sessionId
      ? `sessionId=${sessionId}`
      : null;

    if (!query) { setStatus('not-found'); return; }

    fetch(`/api/get-session?${query}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('not-found'); return; }
        setSession(data);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return (
    <div style={centeredStyle}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#AD0068', animation: 'pulse 1.3s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }`}</style>
    </div>
  );

  if (status === 'not-found' || status === 'error') return (
    <div style={centeredStyle}>
      <p style={{ color: '#9E8088', fontSize: '14px', textAlign: 'center' }}>No results found. Complete the quiz to see your Cycle Story.</p>
      <a href="/" style={linkButtonStyle}>Take the quiz</a>
    </div>
  );

  const moduleUrl = MODULE_URLS[session.recommended_module] || '#';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #F6F7F7; -webkit-font-smoothing: antialiased; }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 60px', backgroundColor: '#F6F7F7', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '6px' }}>Heal to Conceive System</p>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#2A2828' }}>Your Results, {session.name}</h1>
          <p style={{ fontSize: '12.5px', color: '#9E8088', marginTop: '4px', fontWeight: '300' }}>
            Completed on {new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Cycle Story card */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 6px rgba(42,40,40,0.07)', borderLeft: '4px solid #AD0068' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '8px' }}>Your Cycle Story</p>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2A2828', marginBottom: '10px' }}>{session.cycle_story}</h2>
          <p style={{ fontSize: '14px', color: '#6B5B5E', lineHeight: '1.65' }}>
            {CYCLE_STORY_DESCRIPTIONS[session.cycle_story] || ''}
          </p>
        </div>

        {/* Module card */}
        <div style={{ backgroundColor: '#FAE7EB', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 1px 6px rgba(42,40,40,0.07)' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '8px' }}>Your Starting Module</p>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#2A2828', marginBottom: '10px' }}>{session.recommended_module}</h2>
          <p style={{ fontSize: '14px', color: '#6B5B5E', lineHeight: '1.65', marginBottom: '20px' }}>
            {MODULE_DESCRIPTIONS[session.recommended_module] || ''}
          </p>
          <a href={moduleUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', backgroundColor: '#AD0068', color: '#FFFFFF', padding: '14px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
            Start the {session.recommended_module} Module →
          </a>
        </div>

        {/* Conversation */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9E8088', marginBottom: '16px' }}>Your Conversation</h3>
          {(session.messages || []).map((msg, i) => {
            if (i === 0 && msg.role === 'assistant') return null;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  backgroundColor: msg.role === 'user' ? '#AD0068' : '#FFFFFF',
                  color: msg.role === 'user' ? '#FFFFFF' : '#2A2828',
                  fontSize: '14px',
                  lineHeight: '1.65',
                  boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(42,40,40,0.07)' : 'none',
                }}>
                  {msg.role === 'user' ? msg.content : renderFormatted(msg.content)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Retake */}
        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ fontSize: '13px', color: '#AD0068', textDecoration: 'none', fontWeight: '500', borderBottom: '1px solid #AD0068', paddingBottom: '1px' }}>
            Retake the quiz
          </a>
        </div>
      </div>
    </>
  );
}

const centeredStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', fontFamily: 'Poppins, sans-serif' };
const linkButtonStyle = { backgroundColor: '#AD0068', color: '#FFFFFF', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', fontFamily: 'Poppins, sans-serif' };
