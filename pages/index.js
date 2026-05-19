import { useState, useEffect, useRef } from 'react';

const MODULE_URLS = {
  'Define It':  'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157603658',
  'Restore It': 'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157730875',
  'Nourish It': 'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157730882',
  'Align It':   'https://www.fertilitycoachsophie.com/products/the-heal-to-conceive-system/categories/2157730885',
};

const welcomeMessage = (name) =>
  `Hi ${name}, I'm so glad you're here.\n\nI'm going to help you find the exact module inside the Heal to Conceive System that's made for where you are right now.\n\nAll I need is a little window into your cycle. Share whatever feels relevant: how long your cycles usually are, whether you track, what feels off, or what's been confusing you.\n\nTell me about your cycle.`;

function extractRecommendation(text) {
  const storyMatch = text.match(/Sounds like you're a ([^*\n.]+)\./);
  const moduleMatch = text.match(/Start with the ([^*\n.]+) module\./i);
  return {
    cycleStory: storyMatch ? storyMatch[1].replace(/\*/g, '').trim() : null,
    recommendedModule: moduleMatch ? moduleMatch[1].replace(/\*/g, '').trim() : null,
  };
}

function parseMessageParts(text) {
  const parts = [];
  const regex = /\[Start the (.+?) Module\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    parts.push({ type: 'cta', moduleName: match[1], url: MODULE_URLS[match[1]] || '#' });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', content: text.slice(lastIndex) });
  return parts;
}

function renderFormatted(text) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BotMessage({ content }) {
  const parts = parseMessageParts(content);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
      <div style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#FAE7EB', border: '1.5px solid #AD0068', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
        <span style={{ fontSize: '14px' }}>✦</span>
      </div>
      <div style={{ maxWidth: 'calc(100% - 50px)', backgroundColor: '#FFFFFF', borderRadius: '4px 18px 18px 18px', padding: '16px 20px', color: '#2A2828', fontSize: '15px', lineHeight: '1.75', boxShadow: '0 1px 6px rgba(42,40,40,0.07)' }}>
        {parts.map((part, i) =>
          part.type === 'cta' ? (
            <div key={i} style={{ marginTop: '22px' }}>
              <a href={part.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', backgroundColor: '#AD0068', color: '#FFFFFF', padding: '15px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
                Start the {part.moduleName} Module →
              </a>
            </div>
          ) : (
            <span key={i}>{renderFormatted(part.content)}</span>
          )
        )}
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <div style={{ maxWidth: '78%', backgroundColor: '#AD0068', color: '#FFFFFF', borderRadius: '18px 4px 18px 18px', padding: '13px 18px', fontSize: '15px', lineHeight: '1.65' }}>
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
      <div style={{ flexShrink: 0, width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#FAE7EB', border: '1.5px solid #AD0068', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '14px' }}>✦</span>
      </div>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px 18px 18px 18px', padding: '16px 20px', boxShadow: '0 1px 6px rgba(42,40,40,0.07)', display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#AD0068', opacity: 0.7, animation: `pulse 1.3s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function NameInputScreen({ onSubmit }) {
  const [name, setName] = useState('');
  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '720px', margin: '0 auto', backgroundColor: '#F6F7F7', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FAE7EB', border: '2px solid #AD0068', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '20px' }}>✦</span>
      </div>
      <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '10px' }}>
        Heal to Conceive System
      </p>
      <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#2A2828', marginBottom: '10px', textAlign: 'center' }}>
        Discover Your Cycle Story
      </h1>
      <p style={{ fontSize: '14px', color: '#9E8088', marginBottom: '36px', textAlign: 'center', lineHeight: '1.6', maxWidth: '340px' }}>
        Before we begin, what's your name?
      </p>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px' }}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your first name"
          autoFocus
          style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #E8D0D8', backgroundColor: '#FFFFFF', fontSize: '15px', color: '#2A2828', fontFamily: 'Poppins, sans-serif', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          disabled={!name.trim()}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: name.trim() ? '#AD0068' : '#E8C0D0', color: '#FFFFFF', fontSize: '15px', fontWeight: '600', cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'Poppins, sans-serif', transition: 'background-color 0.15s' }}
        >
          Let's begin
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState('loading');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name') || '';
    const urlEmail = params.get('email') || '';

    let sid = localStorage.getItem('htc_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('htc_session_id', sid);
    }
    setSessionId(sid);

    if (urlEmail) localStorage.setItem('htc_user_email', urlEmail);
    if (urlName) localStorage.setItem('htc_user_name', urlName);

    const storedName = localStorage.getItem('htc_user_name') || '';
    const storedEmail = localStorage.getItem('htc_user_email') || '';
    const name = urlName || storedName;
    const email = urlEmail || storedEmail;

    if (name) {
      initChat(name, email);
    } else {
      setPhase('name-input');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function initChat(name, email) {
    setUserName(name);
    setUserEmail(email);
    setMessages([{ role: 'assistant', content: welcomeMessage(name) }]);
    setPhase('chat');
  }

  function handleNameSubmit(name) {
    localStorage.setItem('htc_user_name', name);
    initChat(name, '');
  }

  async function saveSession(cycleStory, recommendedModule, allMessages) {
    try {
      await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name: userName, email: userEmail, cycleStory, recommendedModule, messages: allMessages }),
      });
    } catch (e) {
      console.error('Save session failed:', e);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const apiMessages = updatedMessages
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newMessages = [...updatedMessages, { role: 'assistant', content: data.content }];
      setMessages(newMessages);

      const rec = extractRecommendation(data.content);
      if (rec.cycleStory && rec.recommendedModule) {
        setRecommendation(rec);
        saveSession(rec.cycleStory, rec.recommendedModule, newMessages);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, something went wrong. Please refresh the page and try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleTextareaChange(e) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px';
  }

  if (phase === 'loading') return null;
  if (phase === 'name-input') return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Poppins', sans-serif; background: #F6F7F7; }`}</style>
      <NameInputScreen onSubmit={handleNameSubmit} />
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { font-family: 'Poppins', sans-serif; background: #F6F7F7; -webkit-font-smoothing: antialiased; }
        textarea { font-family: 'Poppins', sans-serif; }
        textarea:focus { outline: none; border-color: #AD0068 !important; box-shadow: 0 0 0 3px rgba(173,0,104,0.08); }
        textarea::placeholder { color: #C4A8B0; }
        input:focus { outline: none; border-color: #AD0068 !important; }
        @keyframes pulse { 0%, 60%, 100% { transform: translateY(0); opacity: 0.7; } 30% { transform: translateY(-5px); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E8C8D4; border-radius: 10px; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '720px', margin: '0 auto', backgroundColor: '#F6F7F7' }}>

        {/* Header */}
        <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0D8E0', padding: '16px 28px' }}>
          <p style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#AD0068', marginBottom: '4px' }}>Heal to Conceive System</p>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#2A2828', letterSpacing: '-0.01em' }}>Discover Your Cycle Story</h1>
          <p style={{ fontSize: '12.5px', color: '#9E8088', marginTop: '3px', fontWeight: '300' }}>Your Cycle Story reveals the missing piece and points you to your module.</p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 16px' }}>
          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserMessage key={i} content={msg.content} />
              : <BotMessage key={i} content={msg.content} />
          )}
          {loading && <TypingIndicator />}

          {/* Results button — appears after recommendation */}
          {recommendation && (
            <div style={{ textAlign: 'center', margin: '8px 0 24px' }}>
              <a
                href={`/my-results`}
                style={{ display: 'inline-block', backgroundColor: '#FAE7EB', color: '#AD0068', border: '1.5px solid #AD0068', padding: '11px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', letterSpacing: '0.01em' }}
              >
                View and save your results →
              </a>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderTop: '1px solid #F0D8E0', padding: '14px 20px 20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your cycle…"
              disabled={loading}
              rows={1}
              style={{ flex: 1, padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #E8D0D8', backgroundColor: '#FDF5F7', fontSize: '14.5px', color: '#2A2828', resize: 'none', lineHeight: '1.55', overflow: 'hidden', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{ flexShrink: 0, width: '46px', height: '46px', borderRadius: '12px', border: 'none', backgroundColor: input.trim() && !loading ? '#AD0068' : '#E8C0D0', color: '#FFFFFF', cursor: input.trim() && !loading ? 'pointer' : 'default', transition: 'background-color 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#C4A8B0', marginTop: '9px', textAlign: 'center', fontWeight: '300' }}>
            Enter to send · Shift + Enter for a new line
          </p>
        </div>

      </div>
    </>
  );
}
