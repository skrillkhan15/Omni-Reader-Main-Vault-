import React, { useMemo, useState, useEffect } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { storage } from '@/lib/storage';
import { NotificationManager } from '@/lib/notifications';
import { AppSettings } from '@/types/settings';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appSettings, setAppSettings] = useState<AppSettings>(storage.getAppSettings());
  const notificationManager = useMemo(() => new NotificationManager(), []);

  useEffect(() => {
    const handleStorageChange = () => {
      setAppSettings(storage.getAppSettings());
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events when settings are updated in the same tab
    const handleSettingsUpdate = () => {
      setAppSettings(storage.getAppSettings());
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const contextValue = useMemo(() => ({
    storage,
    notificationManager,
    appSettings,
    setAppSettings,
  }), [appSettings, notificationManager, setAppSettings]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};


