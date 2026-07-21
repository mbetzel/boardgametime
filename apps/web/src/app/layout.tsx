import './globals.css';
import React from 'react';

export const metadata = {
  title: 'BoardGameTime — Multiplayer Board Game Platform',
  description: 'Real-time and async multiplayer board game platform starting with Kingdoms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
