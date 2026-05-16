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
    __GREENTIC_WEBCHAT_FORCE_EMBED__?: boolean;
    __GREENTIC_WEBCHAT_TEXT_INPUT_ENABLED__?: boolean;
    WebChat?: WebChatExports;
    GreenticWebChatApp?: {
      mount: (target: HTMLElement) => { unmount: () => void };
    };
  }
}
