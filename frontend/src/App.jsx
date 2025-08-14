import React, { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Editor from './components/Editor.jsx';

function Home() {
  const navigate = useNavigate();
  const createNew = useCallback(() => {
    const id = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    navigate(`/documents/${id}`);
  }, [navigate]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: 16
    }}>
      <h1>Real-Time Collaborative Editor</h1>
      <button onClick={createNew} style={{ padding: '10px 16px', fontSize: 16 }}>Create New Document</button>
      <p>Share the URL with your friends to collaborate live.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/documents/:id" element={<Editor />} />
    </Routes>
  );
}
