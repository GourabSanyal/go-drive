import { MMKV } from 'react-native-mmkv';

let mmkvInstance: MMKV | null = null;

try {
  mmkvInstance = new MMKV({
    id: 'go-drive-storage', 
    encryptionKey: 'go-drive-secure-key' 
  });
  console.log('✅ MMKV storage initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize MMKV storage:', error);
  try {
    mmkvInstance = new MMKV({ id: 'go-drive-storage-fallback' });
    console.log('⚠️ Using fallback MMKV storage without encryption');
  } catch (fallbackError) {
    console.error('❌ Critical: Failed to initialize fallback MMKV storage:', fallbackError);
    mmkvInstance = new MMKV();
  }
}

export const storage = {
  set: (key: string, value: string | number | boolean): boolean => {
    try {
      if (typeof value === 'string') {
        mmkvInstance?.set(key, value);
      } else if (typeof value === 'number') {
        mmkvInstance?.set(key, value);
      } else if (typeof value === 'boolean') {
        mmkvInstance?.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`❌ Failed to set value for key "${key}":`, error);
      return false;
    }
  },
  
  getString: (key: string): string | undefined => {
    try {
      return mmkvInstance?.getString(key);
    } catch (error) {
      console.error(`❌ Failed to get string for key "${key}":`, error);
      return undefined;
    }
  },
  
  getNumber: (key: string): number | undefined => {
    try {
      return mmkvInstance?.getNumber(key);
    } catch (error) {
      console.error(`❌ Failed to get number for key "${key}":`, error);
      return undefined;
    }
  },
  
  getBoolean: (key: string): boolean | undefined => {
    try {
      return mmkvInstance?.getBoolean(key);
    } catch (error) {
      console.error(`❌ Failed to get boolean for key "${key}":`, error);
      return undefined;
    }
  },
  
  delete: (key: string): boolean => {
    try {
      mmkvInstance?.delete(key);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete key "${key}":`, error);
      return false;
    }
  },
  
  clearAll: (): boolean => {
    try {
      mmkvInstance?.clearAll();
      return true;
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
      return false;
    }
  },
  
  getAllKeys: (): string[] => {
    try {
      return mmkvInstance?.getAllKeys() || [];
    } catch (error) {
      console.error('❌ Failed to get all keys:', error);
      return [];
    }
  }
};