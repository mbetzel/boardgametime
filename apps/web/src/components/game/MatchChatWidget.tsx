'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MatchChatMessageDTO, MatchPlayerDTO } from '@boardgametime/types';
import { getMatchChatMessages, sendMatchChatMessage } from '../../lib/api';
import { getMatchSocket } from '../../lib/socket';

interface MatchChatWidgetProps {
  matchId: string;
  players: MatchPlayerDTO[];
  currentUserId?: string;
}

export function MatchChatWidget({ matchId, players, currentUserId }: MatchChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<MatchChatMessageDTO[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // Authorization check: Only match players can send or receive messages
  const isPlayerInMatch = Boolean(currentUserId && players.some((p) => p.userId === currentUserId));

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load chat history
  useEffect(() => {
    if (!matchId || !isPlayerInMatch) return;

    let isMounted = true;
    getMatchChatMessages(matchId)
      .then((data) => {
        if (isMounted) {
          setMessages(data);
        }
      })
      .catch((err) => {
        console.error('[MatchChatWidget] Failed to load messages:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [matchId, isPlayerInMatch]);

  // Socket listener for incoming chat messages
  useEffect(() => {
    if (!matchId || !isPlayerInMatch) return;

    const socket = getMatchSocket();

    const handleChatMessage = (newMsg: MatchChatMessageDTO) => {
      if (newMsg.matchId !== matchId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isOpenRef.current && newMsg.senderId !== currentUserId) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on('chat_message', handleChatMessage);

    return () => {
      socket.off('chat_message', handleChatMessage);
    };
  }, [matchId, isPlayerInMatch, currentUserId]);

  // Auto-scroll on new messages if drawer is open
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  const handleToggle = () => {
    if (!isOpen) {
      setUnreadCount(0);
    }
    setIsOpen((prev) => !prev);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending || !isPlayerInMatch) return;

    setSending(true);
    setError(null);

    try {
      // Try socket emission first, fallback to REST
      const socket = getMatchSocket();
      if (socket.connected) {
        socket.emit('send_chat_message', { matchId, text: trimmed });
      } else {
        const sent = await sendMatchChatMessage(matchId, trimmed);
        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
      }
      setInputText('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isPlayerInMatch) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div
          style={{
            width: 'min(360px, calc(100vw - 32px))',
            height: '460px',
            marginBottom: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '0.03em' }}>
                Match Chat
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  fontWeight: 700,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                {players.length} players
              </span>
            </div>
            <button
              onClick={handleToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
              }}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '2rem', opacity: 0.5 }}>🗣️</span>
                <span>No messages yet in this match.</span>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>Say hi to your opponents!</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const senderPlayer = players.find((p) => p.userId === msg.senderId);

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        marginBottom: '3px',
                        padding: '0 4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isMe ? '#f59e0b' : '#38bdf8',
                        }}
                      >
                        {isMe ? 'You' : msg.senderUsername || senderPlayer?.username || 'Player'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        backgroundColor: isMe ? '#2563eb' : 'rgba(30, 41, 59, 0.95)',
                        color: isMe ? '#ffffff' : '#e2e8f0',
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                        boxShadow: isMe
                          ? '0 2px 8px rgba(37, 99, 235, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                        border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div
              style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: '0.75rem',
                borderTop: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Footer Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send match message..."
              maxLength={500}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              style={{
                padding: '0.6rem 1rem',
                backgroundColor: !inputText.trim() || sending ? '#334155' : '#f59e0b',
                color: !inputText.trim() || sending ? '#94a3b8' : '#0f172a',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={handleToggle}
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#0f172a',
          color: '#f59e0b',
          border: '2px solid rgba(245, 158, 11, 0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(245, 158, 11, 0.25)',
          position: 'relative',
        }}
        title={isOpen ? 'Close Chat' : 'Open Match Chat'}
      >
        💬
        {/* Unread Visual Notification Badge */}
        {unreadCount > 0 && !isOpen && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 900,
              minWidth: '22px',
              height: '22px',
              padding: '0 6px',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
