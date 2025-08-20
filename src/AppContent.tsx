import { useEffect } from 'react';
import { useAppContext } from './hooks/useAppContext';
import { startAutoUpdater, stopAutoUpdater } from './lib/autoUpdater';
import { localStorageInstance } from './lib/storage';

export function AppContent({ children }: { children: React.ReactNode }) {
  const { appSettings } = useAppContext();

  useEffect(() => {
    // Theme application logic
    document.documentElement.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.documentElement.classList.remove(className);
      }
    });

    if (appSettings.customTheme && appSettings.customTheme !== 'default') {
      document.documentElement.classList.add(`theme-${appSettings.customTheme}`);
    }
  }, [appSettings.customTheme]);

  useEffect(() => {
    // Auto updater logic
    if (appSettings.autoUpdateStatus && appSettings.autoUpdateFrequency > 0) {
      startAutoUpdater(appSettings.autoUpdateFrequency, localStorageInstance);
    } else {
      stopAutoUpdater();
    };

    return () => {
      stopAutoUpdater();
    };
  }, [appSettings.autoUpdateStatus, appSettings.autoUpdateFrequency]);

  return <>{children}</>;
}
