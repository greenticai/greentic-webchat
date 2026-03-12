import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'webchat_auth_session';

export interface AuthSession {
  isAuthenticated: boolean;
  providerId?: string;
  username?: string;
}

let currentSession = readSession();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readSession(): AuthSession {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { isAuthenticated: false };
    }
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed?.isAuthenticated ? parsed : { isAuthenticated: false };
  } catch {
    return { isAuthenticated: false };
  }
}

function writeSession(session: AuthSession) {
  currentSession = session;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore storage failures
  }
  emit();
}

export function signInDemo(providerId = 'dummy') {
  writeSession({
    isAuthenticated: true,
    providerId,
    username: 'demo-user'
  });
}

export function signOut() {
  writeSession({ isAuthenticated: false });
}

export function getAuthSession() {
  return currentSession;
}

export function useAuthSession() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentSession,
    () => currentSession
  );
}
