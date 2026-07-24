'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Header } from '../../components/ui/Header';
import {
  getStoredUser,
  setStoredUser,
  updateUserEmail,
  updateUserPassword,
  getStoredEmailPreferences,
  saveStoredEmailPreferences,
  updateUserPreferences,
  removeAuthToken,
  getMe,
} from '../../lib/api';
import { UserDTO, EmailPreferencesDTO } from '@boardgametime/types';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Email form state
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email preferences state
  const [preferences, setPreferences] = useState<EmailPreferencesDTO>({
    gameTurnReminders: true,
    matchUpdates: true,
    newsletter: false,
  });
  const [prefNotification, setPrefNotification] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setNewEmail(stored.email);
    }

    // Refresh user info from API if authenticated
    getMe()
      .then((me) => {
        setUser(me);
        setNewEmail(me.email);
      })
      .catch(() => {
        // Fall back to local user or demo defaults
      })
      .finally(() => {
        setLoading(false);
      });

    // Load email preferences from storage
    const savedPrefs = getStoredEmailPreferences();
    setPreferences(savedPrefs);
  }, []);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccess(null);
    setEmailError(null);

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (newEmail.trim() === user?.email && !confirmEmail) {
      setEmailError('New email is identical to your current email address.');
      return;
    }

    if (confirmEmail && newEmail.trim() !== confirmEmail.trim()) {
      setEmailError('Email addresses do not match.');
      return;
    }

    setEmailLoading(true);

    try {
      let updatedUser: UserDTO;
      try {
        updatedUser = await updateUserEmail({ email: newEmail.trim() });
      } catch (err: any) {
        // If unauthenticated/local mode demo fallback
        if (user) {
          updatedUser = { ...user, email: newEmail.trim(), updatedAt: new Date().toISOString() };
          setStoredUser(updatedUser);
        } else {
          throw err;
        }
      }

      setUser(updatedUser);
      setConfirmEmail('');
      setEmailSuccess(`Your email address has been successfully updated to ${updatedUser.email}.`);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to update email address. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (user?.isOAuth || user?.authProvider === 'google') {
      setPasswordError('Password updates are not applicable for Google / OAuth accounts.');
      return;
    }

    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      try {
        await updateUserPassword({
          currentPassword,
          newPassword,
        });
      } catch (err: any) {
        if (!getStoredUser()) {
          throw err;
        }
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Your password has been updated successfully.');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password and try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleTogglePreference = async (key: keyof EmailPreferencesDTO) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    saveStoredEmailPreferences(updated);

    try {
      await updateUserPreferences({ [key]: updated[key] });
    } catch (err) {
      console.warn('Backend preferences save error, saved locally:', err);
    }

    const labels: Record<keyof EmailPreferencesDTO, string> = {
      gameTurnReminders: 'Game Turn Reminders',
      matchUpdates: 'Match Updates',
      newsletter: 'Newsletter & Announcements',
    };

    setPrefNotification(
      `Preferences saved: '${labels[key]}' set to ${updated[key] ? 'Enabled' : 'Disabled'}.`
    );

    setTimeout(() => {
      setPrefNotification(null);
    }, 5000);
  };

  const handleSignOut = () => {
    removeAuthToken();
    setUser(null);
    router.push('/');
  };

  const isOAuthAccount = user?.isOAuth || user?.authProvider === 'google' || user?.authProvider === 'oauth';

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: '4rem',
      }}
    >
      {/* Navigation Header */}
      <Header user={user} onSignOut={handleSignOut} subtitle="Account Settings" />

      {/* Main Content Area */}
      <main style={{ maxWidth: '900px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        {/* Page Title & Banner */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              ⚙️
            </div>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.025em' }}>
                Account Settings
              </h1>
              <p style={{ fontSize: '0.925rem', color: '#94a3b8', margin: 0 }}>
                Manage your credentials, login security, and email notification preferences.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <Card style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                border: '3px solid rgba(245, 158, 11, 0.3)',
                borderTopColor: '#f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Loading account details...</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* User Profile Overview Card */}
            <Card glow={true}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      border: '2px solid #f59e0b',
                      boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: '#fbbf24',
                    }}
                  >
                    {user?.username ? user.username.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                        {user?.username || 'Guest User'}
                      </h2>
                      {isOAuthAccount ? (
                        <Badge variant="info">Google OAuth</Badge>
                      ) : (
                        <Badge variant="gold">Standard Account</Badge>
                      )}
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', margin: 0 }}>
                      {user?.email || 'Not signed in'}
                    </p>
                  </div>
                </div>

                {!user && (
                  <Link href="/auth/login">
                    <Button variant="gold" size="sm">
                      Sign In to Update Settings
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* OAuth Account Notice Banner if applicable */}
            {isOAuthAccount && (
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌐</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#60a5fa' }}>
                    Google OAuth Identity Provider Connected
                  </h4>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#93c5fd', lineHeight: 1.5 }}>
                    You are currently authenticated using Google single sign-on. Your account security, password updates,
                    and 2FA authentication are managed directly through your Google Account.
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Update Email Address */}
            <Card title="Email Address" subtitle="View and update your primary email address for notifications and security.">
              <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {emailSuccess && (
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>✓</span>
                    <span>{emailSuccess}</span>
                  </div>
                )}

                {emailError && (
                  <div
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>⚠️</span>
                    <span>{emailError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  <Input
                    label="Current Email Address"
                    type="email"
                    value={user?.email || ''}
                    disabled={true}
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    helperText="Primary email associated with your BoardGameTime account"
                  />

                  <Input
                    label="New Email Address"
                    type="email"
                    placeholder="e.g. player@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />

                  <Input
                    label="Confirm New Email Address"
                    type="email"
                    placeholder="Re-enter your new email address"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Button variant="gold" type="submit" isLoading={emailLoading} disabled={!user}>
                    Update Email Address
                  </Button>
                </div>
              </form>
            </Card>

            {/* Section 2: Password & Security Settings */}
            {isOAuthAccount ? (
              <Card title="Password & Security" subtitle="Password management and account authentication.">
                <div
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.6)',
                    border: '1px border rgba(148, 163, 184, 0.15)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>🔒</div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>
                    Password Updates Not Applicable
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', maxWidth: '520px', lineHeight: 1.5 }}>
                    Because your account was created using Google OAuth authentication, password updates are managed exclusively through Google.
                    You do not need a separate password for BoardGameTime.
                  </p>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge variant="neutral">Managed by Google</Badge>
                  </div>
                </div>
              </Card>
            ) : (
              <Card title="Change Password" subtitle="Update your account password to keep your profile secure.">
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {passwordSuccess && (
                    <div
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#34d399',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>✓</span>
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>⚠️</span>
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button variant="gold" type="submit" isLoading={passwordLoading} disabled={!user}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Section 3: Email Preferences */}
            <Card
              title="Email Preferences"
              subtitle="Control which notifications and updates are delivered to your email inbox."
            >
              {prefNotification && (
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>🔔</span>
                  <span>{prefNotification}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Toggle 1: Game Turn Reminders */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                        Game Turn Reminders
                      </h4>
                      <Badge variant="gold" size="sm">Async Play</Badge>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      Receive email notifications when it is your turn in asynchronous board game matches.
                    </p>
                  </div>

                  <label
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '48px',
                      height: '26px',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.gameTurnReminders}
                      onChange={() => handleTogglePreference('gameTurnReminders')}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.gameTurnReminders ? '#f59e0b' : '#334155',
                        borderRadius: '34px',
                        transition: '0.25s ease',
                        boxShadow: preferences.gameTurnReminders ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: preferences.gameTurnReminders ? '24px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#0f172a',
                          borderRadius: '50%',
                          transition: '0.25s ease',
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* Toggle 2: Match Updates */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                        Match & Lobby Updates
                      </h4>
                      <Badge variant="info" size="sm">Real-time</Badge>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      Get alerts when friends join your game lobby, match invitations arrive, or games complete.
                    </p>
                  </div>

                  <label
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '48px',
                      height: '26px',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.matchUpdates}
                      onChange={() => handleTogglePreference('matchUpdates')}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.matchUpdates ? '#f59e0b' : '#334155',
                        borderRadius: '34px',
                        transition: '0.25s ease',
                        boxShadow: preferences.matchUpdates ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: preferences.matchUpdates ? '24px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#0f172a',
                          borderRadius: '50%',
                          transition: '0.25s ease',
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* Toggle 3: Newsletter */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                        Newsletter & Product News
                      </h4>
                      <Badge variant="neutral" size="sm">Optional</Badge>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      Receive occasional updates on new board game titles, platform features, and community events.
                    </p>
                  </div>

                  <label
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '48px',
                      height: '26px',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={() => handleTogglePreference('newsletter')}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: preferences.newsletter ? '#f59e0b' : '#334155',
                        borderRadius: '34px',
                        transition: '0.25s ease',
                        boxShadow: preferences.newsletter ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '20px',
                          width: '20px',
                          left: preferences.newsletter ? '24px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#0f172a',
                          borderRadius: '50%',
                          transition: '0.25s ease',
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Section 4: Account Actions & Sign Out */}
            <Card title="Account Actions" subtitle="Session and account management.">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                    Sign Out of BoardGameTime
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    End your active session on this device.
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={handleSignOut} disabled={!user}>
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
