import { NotificationSettings } from '@/types/manga';
import { localStorageInstance } from './storage';

export class NotificationManager {
  private permission: NotificationPermission = 'default';
  private reminderTimeoutId: number | null = null;

  constructor() {
    this.permission = Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  scheduleReminders() {
    const settings = localStorageInstance.getNotificationSettings();
    
    if (!settings.enabled) {
      this.clearScheduledNotifications();
      return;
    }

    // Clear existing scheduled notifications
    this.clearScheduledNotifications();

    // Schedule new notifications based on settings
    this.setupPeriodicNotifications(settings);
  }

  private setupPeriodicNotifications(settings: NotificationSettings) {
    const library = localStorageInstance.getMangaLibrary();
    const relevantManga = library.filter(manga => 
      settings.types.includes(manga.type) && 
      (!settings.onlyFavorites || manga.favorite) &&
      manga.status === 'ongoing'
    );

    if (relevantManga.length === 0) return;

    // Calculate next notification time
    const now = new Date();
    const [hours, minutes] = settings.time.split(':').map(Number);
    const nextNotification = new Date();
    nextNotification.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    // Adjust based on frequency
    switch (settings.frequency) {
      case 'weekly': {
        const currentDay = now.getDay();
        let earliestNextNotification: Date | null = null;

        if (settings.customDays && settings.customDays.length > 0) {
          for (const targetDay of settings.customDays) {
            const daysUntilTarget = (targetDay - currentDay + 7) % 7;
            const potentialNextNotification = new Date(nextNotification);
            potentialNextNotification.setDate(nextNotification.getDate() + daysUntilTarget);

            if (!earliestNextNotification || potentialNextNotification < earliestNextNotification) {
              earliestNextNotification = potentialNextNotification;
            }
          }
        } else {
          // Default to Sunday if no custom days are set
          const targetDay = 0; 
          const daysUntilTarget = (targetDay - currentDay + 7) % 7;
          earliestNextNotification = new Date(nextNotification);
          earliestNextNotification.setDate(nextNotification.getDate() + daysUntilTarget);
        }

        if (earliestNextNotification) {
          nextNotification.setTime(earliestNextNotification.getTime());
        }
        break;
      }
      case 'monthly': {
        // Schedule for next month on the same date
        nextNotification.setMonth(nextNotification.getMonth() + 1);
        break;
      }
    }

    const timeUntilNotification = nextNotification.getTime() - now.getTime();

    // Schedule the notification
    this.reminderTimeoutId = window.setTimeout(() => {
      this.showReminder(relevantManga.length);
      // Reschedule for the next period
      this.scheduleReminders();
    }, timeUntilNotification);

    // Store scheduled time for debugging
    localStorage.setItem('omni-reader-next-notification', nextNotification.toISOString());
  }

  private showReminder(mangaCount: number) {
    this.showNotification(
      'OmniReader Reminder 📚',
      {
        body: `You have ${mangaCount} ongoing manga waiting for updates! Time to catch up on your reading.`,
        tag: 'omni-reader-reminder',
        requireInteraction: true,
      }
    );
  }

  private clearScheduledNotifications() {
    if (this.reminderTimeoutId) {
      clearTimeout(this.reminderTimeoutId);
      this.reminderTimeoutId = null;
    }
    localStorage.removeItem('omni-reader-next-notification');
  }

  async showUpdateNotification(mangaTitle: string) {
    return this.showNotification(
      'New Chapter Available! 🎉',
      {
        body: `${mangaTitle} has a new chapter ready to read!`,
        tag: 'manga-update',
        requireInteraction: true,
      }
    );
  }

  async showCompletionNotification(mangaTitle: string) {
    return this.showNotification(
      'Manga Completed! ✅',
      {
        body: `Congratulations! You've finished reading ${mangaTitle}`,
        tag: 'manga-completion',
      }
    );
  }

  getNextNotificationTime(): Date | null {
    const stored = localStorage.getItem('omni-reader-next-notification');
    return stored ? new Date(stored) : null;
  }
}

export const notificationManager = new NotificationManager();

