export {};

declare global {
  interface Window {
    __TENANT__?: string;
    __BASE_PATH__?: string;
    APP_CONFIG_BASE?: string;
    __SKIN__?: unknown;
    __loadSkin__?: () => Promise<unknown>;
  }
}
