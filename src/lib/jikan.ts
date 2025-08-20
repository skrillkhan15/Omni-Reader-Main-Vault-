
import { Manga } from '@/types/manga';
import { localStorageInstance } from './storage';

interface JikanAuthor {
  name: string;
}

interface JikanGenre {
  name: string;
}

interface JikanItem {
  mal_id: number;
  title: string;
  authors: JikanAuthor[];
  genres: JikanGenre[];
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  status: string;
  type: string;
  chapters: number;
  volumes: number;
  score: number;
  published: {
    from: string;
    to: string | null;
  };
  synopsis: string;
}

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

// Helper functions to map Jikan data to our types
const mapJikanStatus = (status: string): 'ongoing' | 'completed' | 'hold' | 'hiatus' => {
  switch (status.toLowerCase()) {
    case 'finished':
    case 'complete':
      return 'completed';
    case 'publishing':
    case 'ongoing':
      return 'ongoing';
    case 'on hiatus':
    case 'hiatus':
      return 'hiatus';
    default:
      return 'ongoing';
  }
};

const mapJikanType = (type: string): 'manga' | 'manhwa' | 'manhua' => {
  switch (type.toLowerCase()) {
    case 'manhwa':
      return 'manhwa';
    case 'manhua':
      return 'manhua';
    default:
      return 'manga';
  }
};

export const searchManga = async (query: string): Promise<Manga[]> => {
  const cacheKey = `jikan-search-${query}`;
  const cachedData = storage.getCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached Jikan data for:', query);
    return cachedData;
  }

  try {
    const response = await fetch(`${JIKAN_API_URL}/manga?q=${encodeURIComponent(query)}&sfw`);
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    const mappedData = data.data.map((item: JikanItem): Manga => ({
      id: `jikan-${item.mal_id}`,
      malId: item.mal_id,
      title: item.title,
      genres: item.genres.map((g: JikanGenre) => g.name),
      coverImage: item.images.jpg.large_image_url,
      status: mapJikanStatus(item.status),
      type: mapJikanType(item.type),
      totalChapters: item.chapters || undefined,
      totalVolumes: item.volumes || undefined,
      rating: item.score ? Math.round(item.score / 2) : 0, // Convert 10-point to 5-point scale
      url: `https://myanimelist.net/manga/${item.mal_id}`,
      notes: item.synopsis || '',
      // Default values for fields not provided by Jikan
      currentChapter: 0,
      currentVolume: 0,
      dateAdded: new Date(),
      lastUpdated: new Date(),
      favorite: false,
    }));

    storage.setCache(cacheKey, mappedData);
    return mappedData;
  } catch (error) {
    console.error("Failed to search manga on Jikan:", error);
    return [];
  }
};
