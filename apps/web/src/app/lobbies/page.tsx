'use client';

import React from 'react';
import { LobbyList } from '../../components/lobby/LobbyList';

export default function LobbiesPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <LobbyList />
    </main>
  );
}
