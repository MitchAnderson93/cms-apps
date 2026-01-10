// Config injected at build time
declare const __APP_CONFIG__: any;

export function useAppConfig() {
  return __APP_CONFIG__ || {};
}
