// یک wrapper ساده برای کار با localStorage

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error("storage.get error", err);
      return null;
    }
  },

  set<T>(key: string, value: T) {
    try {
      const raw = JSON.stringify(value);
      localStorage.setItem(key, raw);
    } catch (err) {
      console.error("storage.set error", err);
    }
  },

  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("storage.remove error", err);
    }
  }
};