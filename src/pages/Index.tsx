import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { AddMangaForm } from '@/components/AddMangaForm';
import { MangaCard } from '@/components/MangaCard';
import { GenreView } from '@/components/GenreView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAppContext } from '@/hooks/useAppContext';
import { Manga, MangaFilter, MangaStatus, MangaType, MangaTypes, MangaStatuses } from '@/types/manga';
import { MangaReader } from '@/components/MangaReader';
import { Discover } from '@/components/Discover';
import { AIChatbot } from './AIChatbot';
import { Settings } from '@/components/Settings';
import { Statistics } from '@/components/Statistics';
import { Notifications } from '@/components/Notifications';
import { useI18n } from '@/hooks/useI18n';
import { errorLogger } from '@/lib/errorLogger';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  Bell,
  Download,
  Upload,
  Heart,
  TrendingUp,
  BookOpen,
  Star,
  Compass
} from 'lucide-react';

const Index = () => {
  const { storage, notificationManager, appSettings } = useAppContext();
  const { t } = useI18n();
  const location = useLocation();
  const [library, setLibrary] = useState<Manga[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<Manga[]>([]);
  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<MangaFilter>({});
  const [sortBy, setSortBy] = useState<string>('dateAdded'); // 'dateAdded', 'title', 'rating'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 'asc' or 'desc'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [readingManga, setReadingManga] = useState<Manga | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  useSyncSectionWithURL(setActiveSection);

  const loadLibrary = useCallback(() => {
    const mangaLibrary = storage.getMangaLibrary();
    setLibrary(mangaLibrary);
  }, [storage]);

  const initializeNotifications = useCallback(async () => {
    await notificationManager.requestPermission();
    notificationManager.scheduleReminders();
  }, [notificationManager]);

  useEffect(() => {
    loadLibrary();
    initializeNotifications();
  }, [loadLibrary, initializeNotifications]);

  const applyFilters = useCallback(() => {
    let filtered = [...library];

    // Search filter
    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(lowerCaseSearchQuery) ||
        manga.genres.some(genre => genre.toLowerCase().includes(lowerCaseSearchQuery))
      );
    }

    // Type filter
    if (filter.type && filter.type.length > 0) {
      filtered = filtered.filter(manga => filter.type!.includes(manga.type));
    }

    // Status filter
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(manga => filter.status!.includes(manga.status));
    }

    // Genre filter
    if (filter.genres && filter.genres.length > 0) {
      filtered = filtered.filter(manga =>
        filter.genres!.some(genre => manga.genres.includes(genre))
      );
    }

    // Rating filter
    if (filter.rating) {
      filtered = filtered.filter(manga => manga.rating >= filter.rating!);
    }

    setFilteredLibrary(filtered);

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else if (sortBy === 'rating') {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      } else if (sortBy === 'dateAdded') {
        return sortOrder === 'asc' ? a.dateAdded.getTime() - b.dateAdded.getTime() : b.dateAdded.getTime() - a.dateAdded.getTime();
      }
      return 0;
    });
  }, [library, searchQuery, filter, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [library, searchQuery, filter, applyFilters]);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    if (section !== 'add') {
      setEditingManga(null);
    }
  }, [setActiveSection, setEditingManga]);

  const handleAddManga = useCallback((manga?: Manga) => {
    setActiveSection('add');
    setEditingManga(manga || null);
  }, [setActiveSection, setEditingManga]);

  const handleEditManga = useCallback((manga: Manga) => {
    setEditingManga(manga);
    setActiveSection('add');
  }, [setActiveSection, setEditingManga]);

  const handleDeleteManga = useCallback((id: string) => {
    if (confirm(t('confirm_delete_manga'))) {
      storage.deleteManga(id);
      loadLibrary();
      toast({
        title: t('deleted'),
        description: t('manga_removed'),
        variant: "destructive",
      });
    } else {
      errorLogger.log('Manga deletion cancelled or failed confirmation', 'handleDeleteManga');
    }
  }, [loadLibrary, storage, t]);

  const handleToggleFavorite = useCallback((id: string) => {
    const manga = library.find(m => m.id === id);
    if (manga) {
      storage.updateManga(id, { favorite: !manga.favorite });
      loadLibrary();
      toast({
        title: manga.favorite ? t('remove_from_favorites', { title: manga.title }) : t('add_to_favorites', { title: manga.title }),
        description: manga.title,
      });
    } else {
      errorLogger.log('Manga not found for toggling favorite', 'handleToggleFavorite', id);
    }
  }, [library, loadLibrary, storage, t]);

  const handleReadManga = useCallback((manga: Manga) => {
    setReadingManga(manga);
    setActiveSection('read');
  }, [setReadingManga, setActiveSection]);

  const handleUpdateProgress = useCallback((chapter: number, volume?: number) => {
    if (readingManga) {
      storage.updateManga(readingManga.id, { currentChapter: chapter, currentVolume: volume });
      loadLibrary();
      toast({
        title: t('progress_updated'),
        description: `${readingManga.title} - ${t('chapter')} ${chapter}`,
      });

      if (readingManga.totalChapters && chapter >= readingManga.totalChapters) {
        notificationManager.showCompletionNotification(readingManga.title);
      }
    } else {
      errorLogger.log('No manga selected for progress update', 'handleUpdateProgress');
    }
  }, [readingManga, storage, loadLibrary, notificationManager, t]);

  const handleFormSave = useCallback(() => {
    errorLogger.log('handleFormSave called', 'Index.tsx');
    loadLibrary();
    setActiveSection('library');
    setEditingManga(null);
  }, [loadLibrary, setActiveSection, setEditingManga]);

  const handleFormCancel = useCallback(() => {
    setActiveSection(library.length > 0 ? 'library' : 'home');
    setEditingManga(null);
  }, [library, setActiveSection, setEditingManga]);

  const exportData = () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omni-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    errorLogger.showUserFacingError(t('export_complete'), t('library_exported'), "default");
  };

  const importData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          storage.importData(data);
          loadLibrary();
          errorLogger.showUserFacingError(t('import_complete'), t('library_imported'), "default");
        } catch (error) {
          errorLogger.log(error, 'importData');
          errorLogger.showUserFacingError(t('import_error'), t('import_failed_message'));
        }
      };
      reader.readAsText(file);
    } else {
      errorLogger.log('No file selected for import', 'importData');
    }
  }, [loadLibrary, storage, t]);

  const renderLibrary = useCallback(() => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gradient-text-primary flex items-center">
            <BookOpen className="h-6 w-6 mr-2" />
            {t('your_library')}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label={t('switch_to_grid_view')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label={t('switch_to_list_view')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Label htmlFor="search-manga" className="sr-only">{t('search_manga')}</Label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-manga"
              placeholder={t('search_manga')}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4">
            <Label htmlFor="filter-type" className="sr-only">{t('filter_by_type')}</Label>
            <Select
              onValueChange={(value) => setFilter(prev => ({ ...prev, type: value === 'all' ? [] : [value as MangaType] }))}
              value={filter.type && filter.type.length > 0 ? filter.type[0] : 'all'}
            >
              <SelectTrigger id="filter-type" className="w-[180px]">
                <SelectValue placeholder={t('filter_by_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_types')}</SelectItem>
                {MangaTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="filter-status" className="sr-only">{t('filter_by_status')}</Label>
            <Select
              onValueChange={(value) => setFilter(prev => ({ ...prev, status: value === 'all' ? [] : [value as MangaStatus] }))}
              value={filter.status && filter.status.length > 0 ? filter.status[0] : 'all'}
            >
              <SelectTrigger id="filter-status" className="w-[180px]">
                <SelectValue placeholder={t('filter_by_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_statuses')}</SelectItem>
                {MangaStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="sort-by" className="sr-only">{t('sort_by')}</Label>
            <Select
              onValueChange={(value) => setSortBy(value)}
              value={sortBy}
            >
              <SelectTrigger id="sort-by" className="w-[180px]">
                <SelectValue placeholder={t('sort_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">{t('date_added')}</SelectItem>
                <SelectItem value="title">{t('title')}</SelectItem>
                <SelectItem value="rating">{t('rating')}</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="sort-order" className="sr-only">{t('order')}</Label>
            <Select
              onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
              value={sortOrder}
            >
              <SelectTrigger id="sort-order" className="w-[100px]">
                <SelectValue placeholder={t('order')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{t('descending')}</SelectItem>
                <SelectItem value="asc">{t('ascending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredLibrary.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-5 gap-6">
              {filteredLibrary.map((manga) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  onEdit={handleEditManga}
                  onDelete={handleDeleteManga}
                  onToggleFavorite={handleToggleFavorite}
                  onRead={handleReadManga}
                  className="manga-card"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLibrary.map((manga) => (
                <Card key={manga.id} className="flex items-center p-4">
                  <img src={manga.coverImage || '/placeholder.png'} alt={manga.title} className="w-16 h-16 object-cover rounded-md mr-4" />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold">{manga.title}</h3>
                    <p className="text-muted-foreground text-sm">{manga.type} - {manga.status}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {manga.genres.map(genre => (
                        <Badge key={genre} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditManga(manga)} aria-label={t('edit', { title: manga.title })}>{t('edit')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteManga(manga.id)} aria-label={t('delete', { title: manga.title })}>{t('delete')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(manga.id)} aria-label={manga.favorite ? t('remove_from_favorites', { title: manga.title }) : t('add_to_favorites', { title: manga.title })}>
                      {manga.favorite ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <Star className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" onClick={() => handleReadManga(manga)} aria-label={t('read_now', { title: manga.title })}>{t('read_now')}</Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">{t('no_manga_found')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('library_empty_message')}
              </p>
              <Button onClick={handleAddManga}>{t('add_new_manga')}</Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }, [filteredLibrary, viewMode, searchQuery, filter, sortBy, sortOrder, handleAddManga, handleEditManga, handleDeleteManga, handleToggleFavorite, handleReadManga, t]);

  const renderFavorites = useCallback(() => {
    const favorites = library.filter(manga => manga.favorite);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold gradient-text-primary flex items-center">
              <Heart className="h-6 w-6 mr-2 fill-red-500 text-red-500" />
              {t('favorites')}
            </h2>
            <p className="text-muted-foreground">{favorites.length} {t('favorite_manga_count', { count: favorites.length })}</p>
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 poco:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((manga) => (
              <MangaCard
                key={manga.id}
                manga={manga}
                onEdit={handleEditManga}
                onDelete={handleDeleteManga}
                onToggleFavorite={handleToggleFavorite}
                onRead={handleReadManga}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('no_favorites_yet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('mark_favorites_message')}
              </p>
              <Button variant="hero" onClick={() => setActiveSection('library')}>
                {t('browse_library')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }, [library, handleEditManga, handleDeleteManga, handleToggleFavorite, handleReadManga, t]);

  const renderContent = useCallback(() => {
    switch (activeSection) {
      case 'home':
        return <Dashboard onNavigate={handleSectionChange} />;
      case 'library':
      case 'search':
        return renderLibrary();
      case 'genres':
        return (
          <GenreView
            library={library}
            onEdit={handleEditManga}
            onDelete={handleDeleteManga}
            onToggleFavorite={handleToggleFavorite}
            onRead={handleReadManga}
          />
        );
      case 'add':
        return (
          <AddMangaForm
            editingManga={editingManga}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        );
      case 'discover':
        return <Discover onAddManga={handleAddManga} />;
      case 'favorites':
        return renderFavorites();
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      case 'stats':
        return <Statistics library={library} />;
      case 'read':
        return readingManga ? (
          <MangaReader
            manga={readingManga}
            onClose={() => setActiveSection('library')}
            onUpdateProgress={handleUpdateProgress}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">{t('no_manga_selected')}</h3>
              <p className="text-muted-foreground">
                {t('select_manga_to_read')}
              </p>
              <Button onClick={() => setActiveSection('library')}>{t('browse_library')}</Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">{t('page_not_found')}</h3>
              <p className="text-muted-foreground">
                {t('requested_page_not_exist')}
              </p>
            </CardContent>
          </Card>
        );
    }
  }, [activeSection, renderLibrary, renderFavorites, handleSectionChange, handleAddManga, handleEditManga, handleDeleteManga, handleToggleFavorite, handleReadManga, editingManga, handleFormSave, handleFormCancel, library, readingManga, handleUpdateProgress, t, appSettings.apiProvider]);

  return (
    <div className="min-h-screen bg-background mobile-safe-area">
      <h1 className="sr-only">{t('app_title')}</h1>
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      
      <main className="pt-20 pb-8 px-2 sm:px-4 lg:px-6 max-w-7xl mx-auto smooth-scroll" style={{ paddingBottom: 'calc(2rem + var(--safe-bottom))' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;


// Helper function to get current section from URL
const getSectionFromPath = (path: string) => {
  if (path === '/') return 'home';
  const section = path.substring(1);
  if (['library', 'genres', 'add', 'search', 'favorites', 'stats', 'notifications', 'ai-chatbot', 'settings', 'read', 'discover'].includes(section)) {
    return section;
  }
  return 'home'; // Default to home for unknown paths
};

// Custom hook to sync active section with URL
const useSyncSectionWithURL = (setActiveSection: (section: string) => void) => {
  const location = useLocation();

  useEffect(() => {
    const section = getSectionFromPath(location.pathname);
    setActiveSection(section);
  }, [location.pathname, setActiveSection]);
};

