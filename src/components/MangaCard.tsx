import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Heart,
  Play,
  Clock,
  CheckCircle,
  Pause,
  Plus
} from 'lucide-react';
import { Manga, MangaType } from '@/types/manga';

interface MangaCardProps {
  manga: Manga;
  onEdit?: (manga: Manga) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRead?: (manga: Manga) => void;
  onAdd?: (manga: Manga) => void;
  showAddButton?: boolean;
}

export function MangaCard({ manga, onEdit, onDelete, onToggleFavorite, onRead, onAdd, showAddButton }: MangaCardProps) {
  const [imageError, setImageError] = useState(false);

  const getTypeColor = (type: MangaType) => {
    switch (type) {
      case 'manga': return 'manga';
      case 'manhwa': return 'manhwa';
      case 'manhua': return 'manhua';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing': return <Play className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'hold': return <Pause className="h-3 w-3" />;
      case 'hiatus': return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'success';
      case 'completed': return 'secondary';
      case 'hold': return 'warning';
      case 'hiatus': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderRating = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const progress = manga.totalChapters 
    ? (manga.currentChapter / manga.totalChapters) * 100 
    : 0;

  return (
    <Card className="group transition-all duration-300 overflow-hidden mobile-touch-target">
      <div className="relative aspect-[3/4] overflow-hidden">
        {!imageError && manga.coverImage ? (
          <img
            src={manga.coverImage}
            alt={`Cover image for ${manga.title}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center text-primary/50">
              <div className="text-4xl mb-2" role="img" aria-label="Book icon">📚</div>
              <div className="text-sm font-medium">{manga.type.toUpperCase()}</div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button - Always visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-all duration-300 bg-black/50 hover:bg-black/70 mobile-touch-target"
          onClick={() => onToggleFavorite(manga.id)}
          aria-label={manga.favorite ? `Remove ${manga.title} from favorites` : `Add ${manga.title} to favorites`}
        >
          <Heart className={`h-4 w-4 ${manga.favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>

        {/* Progress Bar */}
        {manga.totalChapters && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Reading progress for ${manga.title}`}
            />
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <Badge variant={getTypeColor(manga.type)} className="text-xs">
              {manga.type.toUpperCase()}
            </Badge>
            <Badge variant={getStatusColor(manga.status)} className="text-xs flex items-center gap-1">
              {getStatusIcon(manga.status)}
              {manga.status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center space-x-1" role="img" aria-label={`Rating: ${manga.rating} out of 5 stars`}>
            {renderRating(manga.rating)}
          </div>

          <div className="text-xs text-muted-foreground">
            Chapter {manga.currentChapter}
            {manga.totalChapters && ` of ${manga.totalChapters}`}
            {progress > 0 && ` (${Math.round(progress)}%)`}
          </div>

          {manga.totalVolumes && (
            <div className="text-xs text-muted-foreground">
              Volume {manga.currentVolume}
              {manga.totalVolumes && ` of ${manga.totalVolumes}`}
            </div>
          )}

          {manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {manga.genres.slice(0, 3).map((genre, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {manga.genres.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{manga.genres.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        {showAddButton && onAdd ? (
          <Button
            variant="hero"
            size="lg"
            className="w-full mobile-touch-target"
            onClick={() => onAdd(manga)}
            aria-label={`Add ${manga.title} to library`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add to Library
          </Button>
        ) : (
          <>
            {manga.url && onRead && (
              <Button
                variant="hero"
                size="sm"
                className="w-full"
                onClick={() => onRead(manga)}
                aria-label={`Read ${manga.title}`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Read Now
              </Button>
            )}
            
            <div className="flex space-x-2 w-full">
              {onEdit && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 mobile-touch-target py-6"
                  onClick={() => onEdit(manga)}
                  aria-label={`Edit ${manga.title}`}
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1 mobile-touch-target py-6"
                  onClick={() => onDelete(manga.id)}
                  aria-label={`Delete ${manga.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Delete</span>
                </Button>
              )}
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}