
import { LocalStorage } from './storage';
import { Manga } from '@/types/manga';

let autoUpdateInterval: number | undefined;

const updateMangaStatuses = (storage: LocalStorage) => {
  console.log('Running auto manga status update...');
  const library = storage.getMangaLibrary();
  let updatedCount = 0;

  const newLibrary = library.map(manga => {
    if (manga.totalChapters && manga.totalChapters > 0 && manga.currentChapter >= manga.totalChapters && manga.status !== 'completed') {
      updatedCount++;
      return { ...manga, status: 'completed' };
    }
    return manga;
  });

  if (updatedCount > 0) {
    storage.saveMangaLibrary(newLibrary);
    console.log(`Auto updated ${updatedCount} manga status(es) to 'completed'.`);
  } else {
    console.log('No manga status updates needed.');
  }
};

export const startAutoUpdater = (frequencyHours: number, storage: LocalStorage) => {
  // Clear any existing interval to prevent duplicates
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
  }

  // Convert hours to milliseconds
  const intervalMs = frequencyHours * 60 * 60 * 1000;

  // Run immediately on start
  updateMangaStatuses(storage);

  // Set up interval
  autoUpdateInterval = setInterval(() => updateMangaStatuses(storage), intervalMs);
  console.log(`Auto updater started, running every ${frequencyHours} hour(s).`);
};

export const stopAutoUpdater = () => {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = undefined;
    console.log('Auto updater stopped.');
  }
};
