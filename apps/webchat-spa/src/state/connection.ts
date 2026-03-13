import { useSyncExternalStore } from 'react';
import type { DirectLineConnection, WebChatStore } from '../types';

export type WebChatConnectionStatus =
  | 'uninitialized'
  | 'connecting'
  | 'connected'
  | 'expiredToken'
  | 'failedToConnect'
  | 'reconnecting';

let currentStatus: WebChatConnectionStatus = 'uninitialized';
const listeners = new Set<(status: WebChatConnectionStatus) => void>();

function emitStatus(status: WebChatConnectionStatus) {
  if (currentStatus === status) {
    return;
  }
  currentStatus = status;
  listeners.forEach((listener) => listener(currentStatus));
}

function normalizeConnectionStatus(value: unknown): WebChatConnectionStatus | undefined {
  if (typeof value !== 'number') {
    return undefined;
  }

  // Direct Line commonly emits numeric states 0..5 even when Web Chat does
  // not expose the enum object we expect on window.WebChat.
  switch (value) {
    case 0:
    case 1:
      return 'connecting';
    case 2:
      return 'connected';
    case 3:
      return 'expiredToken';
    case 4:
    case 5:
      return 'failedToConnect';
    default:
      break;
  }

  const conn = typeof window !== 'undefined' ? window.WebChat?.ConnectionStatus : undefined;
  if (!conn) {
    return undefined;
  }
  if (value === conn.Online) {
    return 'connected';
  }
  if (value === conn.Connecting || value === conn.Uninitialized) {
    return 'connecting';
  }
  if ('Reconnecting' in conn && value === conn.Reconnecting) {
    return 'reconnecting';
  }
  if (value === conn.FailedToConnect || value === conn.Ended) {
    return 'failedToConnect';
  }
  if (value === conn.ExpiredToken) {
    return 'expiredToken';
  }
  return undefined;
}

function syncFromStore(store?: WebChatStore) {
  if (!store) {
    return;
  }
  const state = store.getState?.();
  const raw = state && typeof state === 'object' ? (state as Record<string, unknown>).connectionStatus : undefined;
  const normalized = normalizeConnectionStatus(raw);
  if (normalized) {
    emitStatus(normalized);
  }
}

function subscribeToStore(store?: WebChatStore) {
  if (!store || typeof store.subscribe !== 'function') {
    return () => {};
  }
  syncFromStore(store);
  const unsubscribe = store.subscribe(() => syncFromStore(store));
  return () => unsubscribe?.();
}

function subscribeToDirectLine(directLine?: DirectLineConnection) {
  if (!directLine || !directLine.connectionStatus$ || typeof directLine.connectionStatus$.subscribe !== 'function') {
    return () => {};
  }
  const subscription = directLine.connectionStatus$.subscribe((value: unknown) => {
    const normalized = normalizeConnectionStatus(value);
    if (normalized) {
      emitStatus(normalized);
    }
  });
  return () => subscription?.unsubscribe?.();
}

export function watchWebChatConnection(store?: WebChatStore, directLine?: { connectionStatus$?: { subscribe: (listener: (status: unknown) => void) => { unsubscribe?: () => void } } }) {
  const disposables = [subscribeToStore(store), subscribeToDirectLine(directLine)];
  return () => {
    disposables.forEach((dispose) => dispose());
  };
}

export function useWebChatConnectionStatus(): WebChatConnectionStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentStatus,
    () => currentStatus
  );
}
