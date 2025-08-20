import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageInstance } from './storage';
import { Manga } from '@/types/manga';

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add a new manga to the library', () => {
    const newManga: Omit<Manga, 'id' | 'dateAdded' | 'lastUpdated'> = {
      title: 'Test Manga',
      coverImage: 'test.jpg',
      rating: 5,
      genres: ['Action', 'Adventure'],
      status: 'ongoing',
      type: 'manga',
      currentChapter: 1,
      totalChapters: 10,
      currentVolume: 1,
      totalVolumes: 2,
      url: 'http://test.com',
      notes: 'Some notes',
      favorite: false,
    };

    const addedManga = localStorageInstance.addManga(newManga);
    const library = localStorageInstance.getMangaLibrary();

    expect(library.length).toBe(1);
    expect(library[0].title).toBe('Test Manga');
    expect(addedManga).toHaveProperty('id');
    expect(addedManga).toHaveProperty('dateAdded');
    expect(addedManga).toHaveProperty('lastUpdated');
  });

  it('should retrieve the manga library', () => {
    const manga1: Manga = {
      id: '1', title: 'Manga 1', coverImage: '', rating: 0, genres: [], status: 'ongoing', type: 'manga', currentChapter: 0, dateAdded: new Date(), lastUpdated: new Date(), favorite: false
    };
    const manga2: Manga = {
      id: '2', title: 'Manga 2', coverImage: '', rating: 0, genres: [], status: 'ongoing', type: 'manga', currentChapter: 0, dateAdded: new Date(), lastUpdated: new Date(), favorite: false
    };
    localStorage.setItem('omni-reader-manga-library', JSON.stringify([manga1, manga2]));

    const library = localStorageInstance.getMangaLibrary();
    expect(library.length).toBe(2);
    expect(library[0].title).toBe('Manga 1');
  });

  it('should update an existing manga', () => {
    const manga: Manga = {
      id: '1', title: 'Manga 1', coverImage: '', rating: 0, genres: [], status: 'ongoing', type: 'manga', currentChapter: 0, dateAdded: new Date(), lastUpdated: new Date(), favorite: false
    };
    localStorage.setItem('omni-reader-manga-library', JSON.stringify([manga]));

    localStorageInstance.updateManga('1', { title: 'Updated Manga 1', currentChapter: 5 });
    const library = localStorageInstance.getMangaLibrary();

    expect(library[0].title).toBe('Updated Manga 1');
    expect(library[0].currentChapter).toBe(5);
  });

  it('should delete a manga', () => {
    const manga: Manga = {
      id: '1', title: 'Manga 1', coverImage: '', rating: 0, genres: [], status: 'ongoing', type: 'manga', currentChapter: 0, dateAdded: new Date(), lastUpdated: new Date(), favorite: false
    };
    localStorage.setItem('omni-reader-manga-library', JSON.stringify([manga]));

    localStorageInstance.deleteManga('1');
    const library = localStorageInstance.getMangaLibrary();

    expect(library.length).toBe(0);
  });

  it('should export and import data', () => {
    const manga: Manga = {
      id: '1', title: 'Manga 1', coverImage: '', rating: 0, genres: [], status: 'ongoing', type: 'manga', currentChapter: 0, dateAdded: new Date(), lastUpdated: new Date(), favorite: false
    };
    localStorage.setItem('omni-reader-manga-library', JSON.stringify([manga]));

    const exportedData = localStorageInstance.exportData();
    localStorage.clear(); // Clear storage before import
    localStorageInstance.importData(exportedData);

    const library = localStorageInstance.getMangaLibrary();
    expect(library.length).toBe(1);
    expect(library[0].title).toBe('Manga 1');
  });
});