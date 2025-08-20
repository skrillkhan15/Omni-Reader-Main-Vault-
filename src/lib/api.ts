
import { Manga } from '@/types/manga';
import { storage } from './storage';
import * as anilist from './anilist';
import * as jikan from './jikan';
import * as kitsu from './kitsu';
import * as custom from './customApi';

type ApiProvider = 'anilist' | 'jikan' | 'kitsu' | 'custom';

const apiProviders = {
  anilist,
  jikan,
  kitsu,
  custom,
};

const getApiProvider = (): ApiProvider => {
  const settings = storage.getAppSettings();
  console.log('Current API provider:', settings.apiProvider);
  return settings.apiProvider;
};

export const searchManga = async (query: string): Promise<Manga[]> => {
  const provider = getApiProvider();
  return apiProviders[provider].searchManga(query);
};

export const getSearchManga = () => {
    const provider = getApiProvider();
    return apiProviders[provider].searchManga;
}
