import { createContext } from 'react';
import { LocalStorage } from '@/lib/storage';
import { NotificationManager } from '@/lib/notifications';
import { AppSettings } from '@/types/settings';

export interface AppContextType {
  storage: LocalStorage;
  notificationManager: NotificationManager;
  appSettings: AppSettings;
  setAppSettings: (settings: AppSettings) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);