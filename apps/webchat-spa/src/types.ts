import type { ReactNode } from 'react';
import { z } from 'zod';
import { skinSchema } from '../shared/skin-schema.mjs';

export { skinSchema };

export type Skin = z.infer<typeof skinSchema>;

export interface WebChatStore {
  dispatch: (action: unknown) => unknown;
  getState: () => unknown;
  subscribe: (listener: () => void) => () => void;
}

export type StoreMiddleware = (store: WebChatStore) => (next: (action: unknown) => unknown) => (action: unknown) => unknown;

export interface WebChatConfig {
  directLine: unknown;
  locale: string;
  styleOptions: Record<string, unknown>;
  adaptiveCardsHostConfig: Record<string, unknown>;
  store?: WebChatStore;
  attachmentMiddleware?: AttachmentMiddleware;
}

/** The subset of a Web Chat transcript activity the SPA reads. */
export interface WebChatActivity {
  id?: string;
  type?: string;
  from?: { role?: string };
  channelData?: Record<string, unknown>;
  attachments?: Array<{ contentType?: string; content?: unknown }>;
}

/** What Web Chat hands an attachment middleware for each attachment it renders. */
export interface AttachmentMiddlewareCard {
  activity: WebChatActivity;
  attachment?: { contentType?: string; content?: unknown };
}

export type AttachmentRenderer = (card: AttachmentMiddlewareCard) => ReactNode;

export type AttachmentMiddleware = () => (next: AttachmentRenderer) => AttachmentRenderer;

/**
 * Web Chat's own hooks. They run on Web Chat's bundled React, so a component
 * Web Chat renders may call these and must never call the SPA's React hooks.
 */
export interface WebChatHooks {
  useActivities: () => [WebChatActivity[]];
}

export interface WebChatConnectionStatusEnum {
  Uninitialized: number;
  Connecting: number;
  Online: number;
  ExpiredToken: number;
  FailedToConnect: number;
  Reconnecting?: number;
  Ended?: number;
}

export interface DirectLineOptions {
  token: string;
  domain?: string;
  webSocket?: boolean;
}

export interface DirectLineConnection {
  connectionStatus$?: {
    subscribe: (listener: (status: unknown) => void) => { unsubscribe?: () => void };
  };
}

export interface WebChatExports {
  ConnectionStatus?: WebChatConnectionStatusEnum;
  createDirectLine: (options: DirectLineOptions) => DirectLineConnection;
  createStore?: (initialState?: Record<string, unknown>, ...middleware: StoreMiddleware[]) => WebChatStore;
  renderWebChat: (config: WebChatConfig, element: HTMLElement) => void;
  hooks?: WebChatHooks;
}

export interface SkinHookContext {
  tenant: string;
  skin: Skin;
  webchatConfig: WebChatConfig;
}

export interface SkinHooksModule {
  createStoreMiddleware?: () => StoreMiddleware;
  onBeforeRender?: (context: SkinHookContext) => void | Promise<void>;
}

declare global {
  interface Window {
    WebChat?: WebChatExports;
  }
}
