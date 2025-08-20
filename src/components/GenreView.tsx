import { useState, useEffect, useMemo } from 'react';
import { MangaCard } from '@/components/MangaCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Manga } from '@/types/manga';
import { Search, Filter, Tag, BookOpen } from 'lucide-react';

interface GenreViewProps {
  library: Manga[];
  onEdit: (manga: Manga) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRead: (url: string) => void;
}

export function GenreView({ library, onEdit, onDelete, onToggleFavorite, onRead }: GenreViewProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredManga, setFilteredManga] = useState<Manga[]>([]);

  // Get all unique genres from the library
  const allGenres = Array.from(
    new Set(library.flatMap(manga => manga.genres))
  ).sort();

  // Get genre statistics
  const genreStats = useMemo(() => allGenres.map(genre => ({
    genre,
    count: library.filter(manga => manga.genres.includes(genre)).length,
    favoriteCount: library.filter(manga => manga.genres.includes(genre) && manga.favorite).length
  })), [allGenres, library]);

  useEffect(() => {
    let filtered = [...library];

    // Filter by selected genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(manga => manga.genres.includes(selectedGenre));
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manga.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredManga(filtered);
  }, [library, selectedGenre, searchQuery]);

  return (
    <div className="space-y-6 mobile-safe-area">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <Tag className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold gradient-text-primary">Browse by Genre</h2>
        </div>
        
        <p className="text-muted-foreground">
          Explore your collection organized by genres
        </p>
      </div>

      {/* Genre Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Genre Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button
              variant={selectedGenre === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedGenre('all')}
              className="h-auto flex flex-col items-center p-3"
            >
              <span className="font-medium">All Genres</span>
              <span className="text-xs text-muted-foreground">{library.length}</span>
            </Button>
            
            {genreStats.map(({ genre, count, favoriteCount }) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(genre)}
                className="h-auto flex flex-col items-center p-2 relative"
              >
                <span className="font-medium text-xs sm:text-sm">{genre}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
                {favoriteCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {favoriteCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search in ${selectedGenre === 'all' ? 'all' : selectedGenre}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Genre Display */}
      {selectedGenre !== 'all' && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Viewing:</span>
          <Badge variant="default" className="text-sm">
            {selectedGenre} ({filteredManga.length})
          </Badge>
        </div>
      )}

      {/* Manga Grid */}
      {filteredManga.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredManga.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onRead={onRead}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedGenre === 'all' ? 'No manga found' : `No manga in ${selectedGenre}`}
            </h3>
            <p className="text-muted-foreground mb-4">
              {library.length === 0 
                ? "Your library is empty. Add your first manga to get started!"
                : searchQuery
                  ? "No manga match your search criteria. Try a different search term."
                  : `You don't have any manga in the ${selectedGenre} genre yet.`
              }
            </p>
            {selectedGenre !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedGenre('all')}>
                View All Genres
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}