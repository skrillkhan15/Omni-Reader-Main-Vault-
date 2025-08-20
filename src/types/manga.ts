export const MangaTypes = ['manga', 'manhwa', 'manhua'] as const;
export type MangaType = typeof MangaTypes[number];

export const MangaStatuses = ['ongoing', 'completed', 'hold', 'hiatus'] as const;
export type MangaStatus = typeof MangaStatuses[number];

export interface Manga {
  id: string;
  malId?: number;
  title: string;
  coverImage?: string;
  rating: number;
  genres: string[];
  status: MangaStatus;
  type: MangaType;
  currentChapter: number;
  totalChapters?: number;
  currentVolume?: number;
  totalVolumes?: number;
  url?: string;
  dateAdded: Date;
  lastUpdated: Date;
  notes?: string;
  favorite: boolean;
}

export interface MangaFilter {
  type?: MangaType[];
  status?: MangaStatus[];
  genres?: string[];
  rating?: number;
  search?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  customDays?: number[];
  time: string;
  types: MangaType[];
  onlyFavorites: boolean;
}

// Removed duplicate AppSettings interface - now using the one from settings.ts

export interface JikanMangaResult {
  mal_id: number;
  title: string;
  images: {
    webp: {
      image_url: string;
    };
  };
  score: number;
  status: string;
  type: string;
  chapters: number;
  url: string;
  synopsis: string;
  genres: { name: string }[];
}