import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Lock, LogIn, LogOut, Palette, User, X } from 'lucide-react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { deleteAccountAction, deleteUserDataAction } from '../services/authService';
import {
  listenForForegroundMessages,
  registerPushToken,
  updateUserProfile,
} from '../services/habitService';
import type { AuthState } from '../types/auth';

const TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
];

interface ConnectedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isAuthenticated: boolean;
  onAuthAction: () => void;
  authState: AuthState;
  refreshAuthState: (forceRefresh?: boolean) => Promise<void>;
  signOut: () => Promise<{ ok: boolean; error?: string }>;
}

export function ConnectedSettingsModal({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
  isAuthenticated,
  onAuthAction,
  authState,
  refreshAuthState,
  signOut,
}: ConnectedSettingsModalProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(
    null,
  );
  const [securityFeedback, setSecurityFeedback] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [enablingNotifications, setEnablingNotifications] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (
      authState.status === 'authenticated_ready' ||
      authState.status === 'authenticated_pending'
    ) {
      setDisplayName(authState.user.displayName?.trim() || '');
      setEmail(authState.user.email || authState.profile?.email || '');
      setTimezone(authState.profile?.timezone || 'UTC');
    } else {
      setDisplayName('');
      setEmail('');
      setTimezone('UTC');
    }
  }, [authState, isOpen]);

  useEffect(() => {
    const unsubscribe = listenForForegroundMessages((payload) => {
      setNotificationFeedback(
        payload.notification?.title
          ? `Foreground notification received: ${payload.notification.title}`
          : 'Foreground notification received.',
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileFeedback(null);

    const result = await updateUserProfile({
      displayName: displayName.trim(),
      timezone,
    });

    if (!result.ok) {
      setProfileFeedback(result.error || 'Failed to update your profile.');
      setSavingProfile(false);
      return;
    }

    await refreshAuthState(true);
    setProfileFeedback('Profile updated.');
    setSavingProfile(false);
  }

  async function handleEnableNotifications() {
    setEnablingNotifications(true);
    setNotificationFeedback(null);

    if (typeof Notification === 'undefined') {
      setNotificationFeedback('Notifications are not supported in this browser.');
      setEnablingNotifications(false);
      return;
    }

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      setNotificationFeedback(
        permission === 'denied'
          ? 'Notifications are blocked for this browser session.'
          : 'Notification permission was dismissed.',
      );
      setEnablingNotifications(false);
      return;
    }

    if (!messaging) {
      setNotificationFeedback(
        'Firebase Messaging is not available in this browser.',
      );
      setEnablingNotifications(false);
      return;
    }

    const vapidKey = (import.meta as { env?: Record<string, string | undefined> })
      .env?.VITE_FIREBASE_VAPID_KEY;

    try {
      const token = await getToken(messaging, { vapidKey });
      if (!token) {
        setNotificationFeedback('No push token was returned.');
        setEnablingNotifications(false);
        return;
      }

      const result = await registerPushToken(token);
      setNotificationFeedback(
        result.ok ? 'Notifications enabled.' : result.error || 'Failed to store push token.',
      );
    } catch (error) {
      setNotificationFeedback(
        error instanceof Error
          ? error.message
          : 'Failed to enable notifications.',
      );
    } finally {
      setEnablingNotifications(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Delete your account and all associated PureHabit data?',
    );
    if (!confirmed) {
      return;
    }

    setDeletingAccount(true);
    setSecurityFeedback(null);

    const result = await deleteAccountAction();
    if (!result.ok) {
      setSecurityFeedback(result.error || 'Failed to delete your account.');
      setDeletingAccount(false);
      return;
    }

    await signOut();
    setDeletingAccount(false);
    onClose();
  }

  async function handleDeleteData() {
    const confirmed = window.confirm(
      'Delete all habits, archived habits, completion logs, and streak data while keeping your account?',
    );
    if (!confirmed) {
      return;
    }

    setDeletingData(true);
    setSecurityFeedback(null);

    const result = await deleteUserDataAction();
    if (!result.ok) {
      setSecurityFeedback(result.error || 'Failed to delete your habit data.');
      setDeletingData(false);
      return;
    }

    const deletedDocs = result.data?.deletedDocs ?? 0;
    setSecurityFeedback(
      deletedDocs > 0
        ? `Deleted ${deletedDocs} habit data record${deletedDocs === 1 ? '' : 's'}.`
        : 'No habit data was found to delete.',
    );
    setDeletingData(false);
  }

  const authenticated =
    authState.status === 'authenticated_ready' ||
    authState.status === 'authenticated_pending';
  const securityFeedbackIsError =
    securityFeedback !== null &&
    !securityFeedback.startsWith('Deleted') &&
    securityFeedback !== 'No habit data was found to delete.';

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            className={`fixed left-0 top-0 h-full w-full max-w-4xl z-50 shadow-2xl ${
              isDarkMode ? 'bg-[#1E1816]' : 'bg-[#FFF9F4]'
            }`}
          >
            <div className="flex h-full">
              <aside
                className={`w-64 border-r p-6 ${
                  isDarkMode
                    ? 'border-[#4A2C24]/40 bg-[#221B18]'
                    : 'border-[#E8DCD1] bg-[#FAF1E8]'
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2
                    className={
                      isDarkMode
                        ? 'font-serif text-2xl text-[#FDF8F3]'
                        : 'font-serif text-2xl text-[#2A2421]'
                    }
                  >
                    Settings
                  </h2>
                  <button type="button" onClick={onClose}>
                    <X
                      className={
                        isDarkMode ? 'w-5 h-5 text-[#FDF8F3]' : 'w-5 h-5 text-[#2A2421]'
                      }
                    />
                  </button>
                </div>

                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'security', label: 'Security', icon: Lock },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 text-left ${
                        activeTab === tab.id
                          ? 'bg-[#D0705B] text-white'
                          : isDarkMode
                            ? 'text-[#A58876] hover:bg-[#4A2C24]/40'
                            : 'text-[#4A3E37] hover:bg-[#E8DCD1]/60'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </aside>

              <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'profile' ? (
                  <div className="max-w-xl space-y-5">
                    <div>
                      <h3
                        className={
                          isDarkMode
                            ? 'font-serif text-3xl text-[#FDF8F3]'
                            : 'font-serif text-3xl text-[#2A2421]'
                        }
                      >
                        Profile
                      </h3>
                      <p className={isDarkMode ? 'mt-2 text-[#A58876]' : 'mt-2 text-[#8A7E7A]'}>
                        Keep your display name and timezone in sync with Firebase.
                      </p>
                    </div>

                    {profileFeedback ? (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          profileFeedback === 'Profile updated.'
                            ? isDarkMode
                              ? 'bg-[#D0705B]/20 text-[#FDF8F3]'
                              : 'bg-[#D0705B]/10 text-[#8C3B2B]'
                            : isDarkMode
                              ? 'bg-[#EF5350]/15 text-[#F5C5BA]'
                              : 'bg-[#EF5350]/10 text-[#8C3B2B]'
                        }`}
                      >
                        {profileFeedback}
                      </div>
                    ) : null}

                    <label className="block">
                      <span className={isDarkMode ? 'text-sm text-[#A58876]' : 'text-sm text-[#8A7E7A]'}>
                        Display Name
                      </span>
                      <input
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        className={`mt-2 w-full rounded-2xl px-4 py-3 border ${
                          isDarkMode
                            ? 'border-[#4A2C24] bg-[#2A2421] text-[#FDF8F3]'
                            : 'border-[#E8DCD1] bg-white text-[#2A2421]'
                        }`}
                      />
                    </label>

                    <label className="block">
                      <span className={isDarkMode ? 'text-sm text-[#A58876]' : 'text-sm text-[#8A7E7A]'}>
                        Email
                      </span>
                      <input
                        value={email}
                        readOnly
                        className={`mt-2 w-full rounded-2xl px-4 py-3 border ${
                          isDarkMode
                            ? 'border-[#4A2C24] bg-[#221B18] text-[#A58876]'
                            : 'border-[#E8DCD1] bg-[#F5EEE7] text-[#8A7E7A]'
                        }`}
                      />
                    </label>

                    <label className="block">
                      <span className={isDarkMode ? 'text-sm text-[#A58876]' : 'text-sm text-[#8A7E7A]'}>
                        Timezone
                      </span>
                      <select
                        value={timezone}
                        onChange={(event) => setTimezone(event.target.value)}
                        className={`mt-2 w-full rounded-2xl px-4 py-3 border ${
                          isDarkMode
                            ? 'border-[#4A2C24] bg-[#2A2421] text-[#FDF8F3]'
                            : 'border-[#E8DCD1] bg-white text-[#2A2421]'
                        }`}
                      >
                        {TIMEZONES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => void handleSaveProfile()}
                      disabled={!authenticated || savingProfile}
                      className="rounded-2xl bg-[#D0705B] px-5 py-3 text-white font-semibold disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                ) : null}

                {activeTab === 'notifications' ? (
                  <div className="max-w-xl space-y-5">
                    <div>
                      <h3
                        className={
                          isDarkMode
                            ? 'font-serif text-3xl text-[#FDF8F3]'
                            : 'font-serif text-3xl text-[#2A2421]'
                        }
                      >
                        Notifications
                      </h3>
                      <p className={isDarkMode ? 'mt-2 text-[#A58876]' : 'mt-2 text-[#8A7E7A]'}>
                        Register this browser for habit reminders.
                      </p>
                    </div>

                    {notificationFeedback ? (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          isDarkMode
                            ? 'bg-[#D0705B]/20 text-[#FDF8F3]'
                            : 'bg-[#D0705B]/10 text-[#8C3B2B]'
                        }`}
                      >
                        {notificationFeedback}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => void handleEnableNotifications()}
                      disabled={!authenticated || enablingNotifications}
                      className="rounded-2xl bg-[#D0705B] px-5 py-3 text-white font-semibold disabled:opacity-50"
                    >
                      {typeof Notification !== 'undefined' &&
                      Notification.permission === 'granted'
                        ? 'Notifications enabled'
                        : enablingNotifications
                          ? 'Enabling...'
                          : 'Enable Notifications'}
                    </button>
                  </div>
                ) : null}

                {activeTab === 'appearance' ? (
                  <div className="max-w-xl space-y-5">
                    <div>
                      <h3
                        className={
                          isDarkMode
                            ? 'font-serif text-3xl text-[#FDF8F3]'
                            : 'font-serif text-3xl text-[#2A2421]'
                        }
                      >
                        Appearance
                      </h3>
                      <p className={isDarkMode ? 'mt-2 text-[#A58876]' : 'mt-2 text-[#8A7E7A]'}>
                        Toggle the visual theme used across the app shell.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`rounded-2xl px-5 py-3 font-semibold ${
                        isDarkMode
                          ? 'bg-[#FDF8F3] text-[#2A2421]'
                          : 'bg-[#2A2421] text-[#FDF8F3]'
                      }`}
                    >
                      Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                    </button>
                  </div>
                ) : null}

                {activeTab === 'security' ? (
                  <div className="max-w-xl space-y-5">
                    <div>
                      <h3
                        className={
                          isDarkMode
                            ? 'font-serif text-3xl text-[#FDF8F3]'
                            : 'font-serif text-3xl text-[#2A2421]'
                        }
                      >
                        Security
                      </h3>
                      <p className={isDarkMode ? 'mt-2 text-[#A58876]' : 'mt-2 text-[#8A7E7A]'}>
                        Manage your current session and irreversible account actions.
                      </p>
                    </div>

                    {securityFeedback ? (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          securityFeedbackIsError
                            ? isDarkMode
                              ? 'bg-[#EF5350]/15 text-[#F5C5BA]'
                              : 'bg-[#EF5350]/10 text-[#8C3B2B]'
                            : isDarkMode
                              ? 'bg-[#D0705B]/20 text-[#FDF8F3]'
                              : 'bg-[#D0705B]/10 text-[#8C3B2B]'
                        }`}
                      >
                        {securityFeedback}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={onAuthAction}
                      className={`w-full rounded-2xl px-5 py-3 font-semibold flex items-center justify-center gap-2 ${
                        isDarkMode
                          ? 'bg-[#2A2421] text-[#FDF8F3]'
                          : 'bg-[#2A2421] text-[#FDF8F3]'
                      }`}
                    >
                      {isAuthenticated ? (
                        <>
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteData()}
                      disabled={!authenticated || deletingData || deletingAccount}
                      className="w-full rounded-2xl px-5 py-3 font-semibold bg-[#B85F4C] text-white disabled:opacity-50"
                    >
                      {deletingData ? 'Deleting Data...' : 'Delete Habit Data'}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteAccount()}
                      disabled={!authenticated || deletingAccount || deletingData}
                      className="w-full rounded-2xl px-5 py-3 font-semibold bg-[#EF5350] text-white disabled:opacity-50"
                    >
                      {deletingAccount ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
