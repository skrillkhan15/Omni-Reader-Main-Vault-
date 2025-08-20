
import { Manga } from '@/types/manga';
import { localStorageInstance } from './storage';

interface AniListItem {
  id: string;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    large?: string;
  };
  genres?: string[];
  status?: string;
  format?: string;
  chapters?: number;
  volumes?: number;
  averageScore?: number;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  description?: string;
  staff?: {
    edges: Array<{
      node: {
        name: {
          full: string;
        };
      };
    }>;
  };
}

const ANILIST_API_URL = 'https://graphql.anilist.co';

// Helper functions to map AniList data to our types
const mapAniListStatus = (status?: string): 'ongoing' | 'completed' | 'hold' | 'hiatus' => {
  switch (status?.toLowerCase()) {
    case 'finished':
    case 'complete':
      return 'completed';
    case 'releasing':
    case 'ongoing':
      return 'ongoing';
    case 'hiatus':
      return 'hiatus';
    case 'cancelled':
      return 'hold';
    default:
      return 'ongoing';
  }
};

const mapAniListType = (format?: string): 'manga' | 'manhwa' | 'manhua' => {
  switch (format?.toLowerCase()) {
    case 'manhwa':
      return 'manhwa';
    case 'manhua':
      return 'manhua';
    default:
      return 'manga';
  }
};

export const searchManga = async (query: string): Promise<Manga[]> => {
  const cacheKey = `anilist-search-${query}`;
  const cachedData = storage.getCache(cacheKey);
  if (cachedData) {
    console.log('Returning cached AniList data for:', query);
    return cachedData;
  }

  const queryStr = `
    query ($search: String) {
      Page(perPage: 10) {
        media(search: $search, type: MANGA) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          genres
          status
          format
          chapters
          volumes
          averageScore
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          description(asHtml: false)
          staff(type: AUTHOR, sort: RELEVANCE) {
            edges {
              node {
                name {
                  full
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    search: query,
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: queryStr,
        variables: variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.statusText}`);
    }

    const data = await response.json();
    const media = data.data.Page.media;

    const mappedData = media.map((item: AniListItem): Manga => ({
      id: `anilist-${item.id}`,
      title: item.title.english || item.title.romaji || item.title.native || 'Unknown Title',
      genres: item.genres || [],
      coverImage: item.coverImage?.large || '/placeholder.png',
      status: mapAniListStatus(item.status),
      type: mapAniListType(item.format),
      totalChapters: item.chapters || undefined,
      totalVolumes: item.volumes || undefined,
      rating: item.averageScore ? Math.round(item.averageScore / 20) : 0, // AniList score is out of 100
      url: `https://anilist.co/manga/${item.id}`,
      notes: item.description || '',
      // Default values for fields not provided by AniList
      currentChapter: 0,
      currentVolume: 0,
      dateAdded: new Date(),
      lastUpdated: new Date(),
      favorite: false,
    }));

    storage.setCache(cacheKey, mappedData);
    return mappedData;
  } catch (error) {
    console.error("Failed to search manga on AniList:", error);
    return [];
  }
};
