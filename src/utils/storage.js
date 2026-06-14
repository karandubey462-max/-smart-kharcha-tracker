import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Cross-platform storage adapter
 * Uses Capacitor Preferences on native platforms (iOS/Android)
 * Falls back to localStorage on web
 */
const isNative = Capacitor.isNativePlatform();

export const storage = {
  async getItem(key) {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key });
        return value;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      if (isNative) {
        await Preferences.set({ key, value });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key) {
    try {
      if (isNative) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  async clear() {
    try {
      if (isNative) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

/**
 * Zustand persist storage adapter
 * Provides sync-like interface for Zustand persist middleware
 */
export const createCapacitorStorage = () => ({
  getItem: async (name) => {
    const value = await storage.getItem(name);
    return value ?? null;
  },
  setItem: async (name, value) => {
    await storage.setItem(name, value);
  },
  removeItem: async (name) => {
    await storage.removeItem(name);
  },
});
