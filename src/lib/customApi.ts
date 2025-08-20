
import { Manga } from '@/types/manga';
import { localStorageInstance } from './storage';

interface CustomApiItem {
  id?: string;
  title?: string;
  author?: string;
  genres?: string[];
  coverImage?: string;
  coverImageUrl?: string;
  status?: string;
  type?: string;
  currentChapter?: number;
  totalChapters?: number;
  currentVolume?: number;
  totalVolumes?: number;
  rating?: number;
  url?: string;
  dateAdded?: string;
  lastUpdated?: string;
  favorite?: boolean;
  notes?: string;
}

// Helper functions to map Custom API data to our types
const mapCustomStatus = (status?: string): 'ongoing' | 'completed' | 'hold' | 'hiatus' => {
  switch (status?.toLowerCase()) {
    case 'finished':
    case 'complete':
    case 'completed':
      return 'completed';
    case 'publishing':
    case 'ongoing':
    case 'current':
      return 'ongoing';
    case 'hiatus':
    case 'on hiatus':
      return 'hiatus';
    case 'hold':
    case 'on hold':
    case 'cancelled':
      return 'hold';
    default:
      return 'ongoing';
  }
};

const mapCustomType = (type?: string): 'manga' | 'manhwa' | 'manhua' => {
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
  const cacheKey = `custom-search-${query}`;
  const cachedData = storage.getCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached Custom API data for:', query);
    return cachedData;
  }

  try {
    // Get custom API URL from local storage instead of backend
    const settings = storage.getAppSettings();
    const baseUrl = settings.customApiUrl;

    if (!baseUrl) {
      console.error("Custom API Base URL is not configured in settings.");
      return [];
    }

    // Assuming the custom API accepts a 'q' query parameter for search
    const url = `${baseUrl}?q=${encodeURIComponent(query)}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (settings.customApiKey) {
      headers['Authorization'] = `Bearer ${settings.customApiKey}`;
    }

    const apiResponse = await fetch(url, { headers });

    if (!apiResponse.ok) {
      throw new Error(`Custom API error: ${apiResponse.statusText}`);
    }

    const apiData = await apiResponse.json();

    // This mapping is a generic assumption. Users might need to adjust this
    // based on their specific custom API's response structure.
    const mappedData = apiData.map((item: CustomApiItem): Manga => ({
      id: `custom-${item.id || Math.random().toString(36).substring(7)}`,
      title: item.title || 'Unknown Title',
      genres: item.genres || [],
      coverImage: item.coverImage || item.coverImageUrl || '/placeholder.png',
      status: mapCustomStatus(item.status),
      type: mapCustomType(item.type),
      currentChapter: item.currentChapter || 0,
      totalChapters: item.totalChapters || undefined,
      currentVolume: item.currentVolume || 0,
      totalVolumes: item.totalVolumes || undefined,
      rating: Math.min(Math.max(item.rating || 0, 0), 5), // Ensure rating is between 0-5
      url: item.url || '',
      dateAdded: item.dateAdded ? new Date(item.dateAdded) : new Date(),
      lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
      favorite: item.favorite || false,
      notes: item.notes || '',
    }));

    storage.setCache(cacheKey, mappedData);
    return mappedData;
  } catch (error) {
    console.error("Failed to search manga on Custom API:", error);
    return [];
  }
};
