import { Manga, NotificationSettings } from '@/types/manga';
import { AppSettings } from '@/types/settings';

const STORAGE_KEYS = {
  MANGA_LIBRARY: 'omni-reader-manga-library',
  NOTIFICATION_SETTINGS: 'omni-reader-notifications',
  APP_SETTINGS: 'omni-reader-settings',
  API_CACHE: 'omni-reader-api-cache',
} as const;

const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on port 3001

export class LocalStorage {
  // Manga Library Management
  getMangaLibrary(): Manga[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MANGA_LIBRARY);
      console.log('Raw data from localStorage:', data);
      if (!data) return [];
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed manga library:', parsed);
        return parsed.map((manga: Manga) => ({
          ...manga,
          dateAdded: new Date(manga.dateAdded),
          lastUpdated: new Date(manga.lastUpdated),
        }));
      } catch (error) {
        console.error('Error parsing manga library:', error);
        return [];
      }
    } catch (error) {
      console.error('Error loading manga library:', error);
      return [];
    }
  }

  saveMangaLibrary(library: Manga[]): void {
    try {
      console.log('Saving manga library:', library);
      localStorage.setItem(STORAGE_KEYS.MANGA_LIBRARY, JSON.stringify(library));
    } catch (error) {
      console.error('Error saving manga library:', error);
    }
  }

  addManga(manga: Omit<Manga, 'id' | 'dateAdded' | 'lastUpdated'>): Manga {
    const newManga: Manga = {
      ...manga,
      id: crypto.randomUUID(),
      dateAdded: new Date(),
      lastUpdated: new Date(),
    };

    const library = this.getMangaLibrary();
    library.push(newManga);
    this.saveMangaLibrary(library);
    console.log('New manga added:', newManga);
    return newManga;
  }

  updateManga(id: string, updates: Partial<Manga>): boolean {
    try {
      const library = this.getMangaLibrary();
      const index = library.findIndex(manga => manga.id === id);
      if (index === -1) return false;

      library[index] = {
        ...library[index],
        ...updates,
        lastUpdated: new Date(),
      };
      this.saveMangaLibrary(library);
      return true;
    } catch (error) {
      console.error('Error updating manga:', error);
      return false;
    }
  }

  deleteManga(id: string): boolean {
    try {
      const library = this.getMangaLibrary();
      const filtered = library.filter(manga => manga.id !== id);
      this.saveMangaLibrary(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting manga:', error);
      return false;
    }
  }

  // Notification Settings
  getNotificationSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (!data) {
        return {
          enabled: false,
          frequency: 'weekly',
          time: '18:00',
          types: ['manga', 'manhwa', 'manhua'],
          onlyFavorites: false,
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return {
        enabled: false,
        frequency: 'weekly',
        time: '18:00',
        types: ['manga', 'manhwa', 'manhua'],
        onlyFavorites: false,
      };
    }
  }

  saveNotificationSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // App Settings
  getAppSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (!data) {
        return {
          theme: 'system',
          defaultView: 'grid',
          itemsPerPage: 20,
          autoBackup: false,
          customTheme: 'default',
          autoUpdateStatus: false,
          autoUpdateFrequency: 24,
          apiProvider: 'jikan',
          aiProvider: 'openai',
          aiModel: 'gpt-3.5-turbo',
        };
      }
      const parsed = JSON.parse(data);
      // Ensure all required fields have defaults
      return {
        theme: parsed.theme || 'system',
        defaultView: parsed.defaultView || 'grid',
        itemsPerPage: parsed.itemsPerPage || 20,
        autoBackup: parsed.autoBackup || false,
        customTheme: parsed.customTheme || 'default',
        autoUpdateStatus: parsed.autoUpdateStatus || false,
        autoUpdateFrequency: parsed.autoUpdateFrequency || 24,
        apiProvider: parsed.apiProvider || 'jikan',
        aiApiKey: parsed.aiApiKey,
        aiProvider: parsed.aiProvider || 'openai',
        aiModel: parsed.aiModel || 'gpt-3.5-turbo',
        customApiUrl: parsed.customApiUrl,
        customApiKey: parsed.customApiKey,
      };
    } catch (error) {
      console.error('Error loading app settings:', error);
      return {
        theme: 'system',
        defaultView: 'grid',
        itemsPerPage: 20,
        autoBackup: false,
        customTheme: 'default',
        autoUpdateStatus: false,
        autoUpdateFrequency: 24,
        apiProvider: 'jikan',
        aiProvider: 'openai',
        aiModel: 'gpt-3.5-turbo',
      };
    }
  }

  saveAppSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  // Utility methods
  exportData() {
    return {
      library: this.getMangaLibrary(),
      notifications: this.getNotificationSettings(),
      settings: this.getAppSettings(),
      exportDate: new Date().toISOString(),
    };
  }

  importData(data: { library: Manga[], notifications: NotificationSettings, settings: AppSettings }) {
    try {
      if (data.library) {
        const importedLibrary = data.library.map(manga => ({
          ...manga,
          dateAdded: new Date(manga.dateAdded),
          lastUpdated: new Date(manga.lastUpdated),
        }));
        this.saveMangaLibrary(importedLibrary);
      }
      if (data.notifications) this.saveNotificationSettings(data.notifications);
      if (data.settings) this.saveAppSettings(data.settings as AppSettings);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // API Cache Management
  getCache(key: string, maxAgeMinutes: number = 1440): unknown | null {
    try {
      const cachedData = localStorage.getItem(`${STORAGE_KEYS.API_CACHE}-${key}`);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const ageMinutes = (Date.now() - timestamp) / (1000 * 60);

      if (ageMinutes < maxAgeMinutes) {
        return data;
      } else {
        localStorage.removeItem(`${STORAGE_KEYS.API_CACHE}-${key}`); // Cache expired
        return null;
      }
    } catch (error) {
      console.error(`Error getting cache for ${key}:`, error);
      return null;
    }
  }

  setCache(key: string, data: unknown): void {
    try {
      const cacheEntry = { data, timestamp: Date.now() };
      localStorage.setItem(`${STORAGE_KEYS.API_CACHE}-${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error);
    }
  }
}

export class ApiStorage {
  async getMangaLibrary(): Promise<Manga[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/manga`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Manga[] = await response.json();
      return data.map(manga => ({
        ...manga,
        dateAdded: new Date(manga.dateAdded),
        lastUpdated: new Date(manga.lastUpdated),
      }));
    } catch (error) {
      console.error('Error fetching manga library from API:', error);
      return [];
    }
  }

  async addManga(manga: Omit<Manga, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<Manga | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/manga/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manga),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newManga: Manga = await response.json();
      return {
        ...newManga,
        dateAdded: new Date(newManga.dateAdded),
        lastUpdated: new Date(newManga.lastUpdated),
      };
    } catch (error) {
      console.error('Error adding manga via API:', error);
      return null;
    }
  }

  async updateManga(id: string, updates: Partial<Manga>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/manga/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error updating manga via API:', error);
      return false;
    }
  }

  async deleteManga(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/manga/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting manga via API:', error);
      return false;
    }
  }

  // Keep other methods using localStorage for now
  getNotificationSettings(): NotificationSettings { return new LocalStorage().getNotificationSettings(); }
  saveNotificationSettings(settings: NotificationSettings): void { new LocalStorage().saveNotificationSettings(settings); }
  getAppSettings(): AppSettings { return new LocalStorage().getAppSettings(); }
  saveAppSettings(settings: AppSettings): void { new LocalStorage().saveAppSettings(settings); }
  exportData() { return new LocalStorage().exportData(); }
  importData(data: { library: Manga[], notifications: NotificationSettings, settings: AppSettings }) { return new LocalStorage().importData(data); }
  clearAllData() { return new LocalStorage().clearAllData(); }
  getCache(key: string, maxAgeMinutes?: number): unknown | null { return new LocalStorage().getCache(key, maxAgeMinutes); }
  setCache(key: string, data: unknown): void { new LocalStorage().setCache(key, data); }
}

export const localStorageInstance = new LocalStorage();
export const apiStorageInstance = new ApiStorage();
export const storage = localStorageInstance;
