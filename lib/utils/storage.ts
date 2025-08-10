export const isBrowser = typeof window !== 'undefined';

export const getLocalStorage = (key: string, defaultValue: string = '[]'): string => {
  if (!isBrowser) return defaultValue;
  try {
    return window.localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error('localStorage访问失败:', error);
    return defaultValue;
  }
};

export const setLocalStorage = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error('localStorage设置失败:', error);
  }
};


