export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  autoBackup: boolean;
  customTheme: string;
  autoUpdateStatus: boolean;
  autoUpdateFrequency: number;
  apiProvider: 'jikan' | 'kitsu' | 'anilist' | 'custom';
  // AI Settings
  aiApiKey?: string;
  aiProvider?: 'openai' | 'anthropic' | 'google' | 'custom';
  aiModel?: string;
  // Custom API Settings
  customApiUrl?: string;
  customApiKey?: string;
}
