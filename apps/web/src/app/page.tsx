import React from 'react';

export default function HomePage() {
  return (
    <main style={{ padding: '3rem', textAlign: 'center' }}>
      <h1 style={{ color: '#f59e0b', fontSize: '2.5rem' }}>BoardGameTime</h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
        Multiplayer Board Game Platform — Real-Time & Async Play
      </p>
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1e293b', borderRadius: '8px', display: 'inline-block' }}>
        <h2>Featured Title: Kingdoms</h2>
        <p>By Reiner Knizia (Fantasy Flight Games 2002 Edition)</p>
      </div>
    </main>
  );
}
