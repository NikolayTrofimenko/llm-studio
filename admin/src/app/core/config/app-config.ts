interface RuntimeImportMeta {
  env?: Record<string, string>;
}

const env = (() => {
  try {
    const meta = (0, eval)('import.meta') as RuntimeImportMeta;
    return meta?.env ?? {};
  } catch {
    return {};
  }
})();

const DEFAULT_API = 'http://localhost:3000/api';

export const appConfig = {
  apiUrl:
    env['NG_APP_API_URL'] ??
    env['VITE_API_URL'] ??
    DEFAULT_API,
};

