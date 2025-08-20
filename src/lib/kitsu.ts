
import { Manga } from '@/types/manga';
import { localStorageInstance } from './storage';

interface KitsuCategory {
  attributes: {
    title: string;
  };
}

interface KitsuItem {
  id: string;
  attributes: {
    canonicalTitle: string;
    authors?: string[];
    categories?: KitsuCategory[];
    posterImage?: {
      large?: string;
    };
    status?: string;
    mangaType?: string;
    chapterCount?: number;
    volumeCount?: number;
    averageRating?: number;
    startDate?: string;
    endDate?: string;
    synopsis?: string;
  };
}

const KITSU_API_URL = 'https://kitsu.io/api/edge';

// Helper functions to map Kitsu data to our types
const mapKitsuStatus = (status?: string): 'ongoing' | 'completed' | 'hold' | 'hiatus' => {
  switch (status?.toLowerCase()) {
    case 'finished':
    case 'complete':
      return 'completed';
    case 'current':
    case 'publishing':
    case 'ongoing':
      return 'ongoing';
    case 'hiatus':
      return 'hiatus';
    default:
      return 'ongoing';
  }
};

const mapKitsuType = (type?: string): 'manga' | 'manhwa' | 'manhua' => {
  switch (type?.toLowerCase()) {
    case 'manhwa':
      return 'manhwa';
    case 'manhua':
      return 'manhua';
    default:
      return 'manga';
  }
};

export const searchManga = async (query: string): Promise<Manga[]> => {
  const cacheKey = `kitsu-search-${query}`;
  const cachedData = storage.getCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached Kitsu data for:', query);
    return cachedData;
  }

  try {
    const response = await fetch(`${KITSU_API_URL}/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=10`);
    if (!response.ok) {
      throw new Error(`Kitsu API error: ${response.statusText}`);
    }
    const data = await response.json();

    const mappedData = data.data.map((item: KitsuItem): Manga => ({
      id: `kitsu-${item.id}`,
      title: item.attributes.canonicalTitle,
      genres: item.attributes.categories ? item.attributes.categories.map((cat: KitsuCategory) => cat.attributes.title) : [],
      coverImage: item.attributes.posterImage?.large || '/placeholder.png',
      status: mapKitsuStatus(item.attributes.status),
      type: mapKitsuType(item.attributes.mangaType),
      totalChapters: item.attributes.chapterCount || undefined,
      totalVolumes: item.attributes.volumeCount || undefined,
      rating: item.attributes.averageRating ? Math.round(item.attributes.averageRating / 20) : 0, // Kitsu rating is out of 100
      url: `https://kitsu.io/manga/${item.id}`,
      notes: item.attributes.synopsis || '',
      // Default values for fields not provided by Kitsu
      currentChapter: 0,
      currentVolume: 0,
      dateAdded: new Date(),
      lastUpdated: new Date(),
      favorite: false,
    }));

    storage.setCache(cacheKey, mappedData);
    return mappedData;
  } catch (error) {
    console.error("Failed to search manga on Kitsu:", error);
    return [];
  }
};
