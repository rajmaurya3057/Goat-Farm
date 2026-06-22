import { TOKEN_KEY } from './constants';

let memoryToken = null;

export const tokenStorage = {
  get() {
    if (memoryToken) return memoryToken;
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored) {
        memoryToken = stored;
        return stored;
      }
    } catch {
      return null;
    }
    return null;
  },

  set(token) {
    memoryToken = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // sessionStorage unavailable — keep in memory only
    }
  },

  clear() {
    memoryToken = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
