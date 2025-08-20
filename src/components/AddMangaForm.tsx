import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from '@/hooks/use-toast';
import { 
  Star, 
  Plus, 
  X, 
  Save,
  Wand2
} from 'lucide-react';
import { localStorageInstance } from '@/lib/storage';
import { Manga, MangaType, MangaStatus, JikanMangaResult } from '@/types/manga';
import { useAppContext } from '@/hooks/useAppContext';

interface AddMangaFormProps {
  editingManga?: Manga | null;
  onSave: () => void;
  onCancel: () => void;
}

export function AddMangaForm({ editingManga, onSave, onCancel }: AddMangaFormProps) {
  const { storage } = useAppContext();
  const [formData, setFormData] = useState({
    title: editingManga?.title || '',
    coverImage: editingManga?.coverImage || '',
    rating: editingManga?.rating || 0,
    status: editingManga?.status || 'ongoing' as MangaStatus,
    type: editingManga?.type || 'manga' as MangaType,
    currentChapter: editingManga?.currentChapter || 0,
    totalChapters: editingManga?.totalChapters || 0,
    currentVolume: editingManga?.currentVolume || 0,
    totalVolumes: editingManga?.totalVolumes || 0,
    url: editingManga?.url || '',
    notes: editingManga?.notes || '',
    favorite: editingManga?.favorite || false,
  });

  const [searchQueryApi, setSearchQueryApi] = useState('');
  const [searchResults, setSearchResults] = useState<JikanMangaResult[]>([]);
  const [isLoadingApiSearch, setIsLoadingApiSearch] = useState(false);

  const [genres, setGenres] = useState<string[]>(editingManga?.genres || []);
  const [newGenre, setNewGenre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const popularGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
    'Thriller', 'Historical', 'Psychological', 'School', 'Seinen', 'Shoujo',
    'Shounen', 'Josei', 'Isekai', 'Mecha', 'Magic', 'Martial Arts'
  ];

  const handleInputChange = (field: string, value: string | number | boolean | MangaType | MangaStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchApi = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setIsLoadingApiSearch(false);
        return;
      }

      setIsLoadingApiSearch(true);
      try {
        const response = await fetch(`https://api.jikan.moe/v4/manga?q=${query}&limit=10`);
        const data = await response.json();
        setSearchResults(data.data || []);
      } catch (error) {
        console.error('Error searching Jikan API:', error);
        setSearchResults([]);
        toast({
          title: "API Search Error",
          description: "Failed to fetch search results from Jikan API.",
          variant: "destructive",
        });
        toast({
          title: "API Search Error",
          description: "Failed to fetch search results from Jikan API.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingApiSearch(false);
      }
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearchApi(searchQueryApi);
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [handleSearchApi, searchQueryApi]);

  const handleSelectSearchResult = (result: JikanMangaResult) => {
    setFormData(prev => ({
      ...prev,
      title: result.title || '',
      coverImage: result.images?.webp?.image_url || '',
      rating: result.score ? Math.round(result.score / 2) : 0, // Jikan score is out of 10, our rating is out of 5
      status: result.status?.toLowerCase() === 'finished' ? 'completed' : result.status?.toLowerCase() || 'ongoing',
      type: result.type?.toLowerCase() || 'manga',
      totalChapters: result.chapters || 0,
      url: result.url || '',
      notes: result.synopsis || '',
    }));
            setGenres(result.genres?.map((g: { name: string }) => g.name) || []);
    setSearchResults([]); // Clear search results after selection
    setSearchQueryApi(''); // Clear search query
  };

  const handleAddGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      setGenres(prev => [...prev, genre]);
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setGenres(prev => prev.filter(g => g !== genre));
  };

  const handleRatingClick = (rating: number) => {
    handleInputChange('rating', rating);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('coverImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const mangaData = {
        ...formData,
        genres,
        title: formData.title.trim(),
        currentChapter: Math.max(0, formData.currentChapter),
        totalChapters: formData.totalChapters > 0 ? formData.totalChapters : undefined,
        currentVolume: Math.max(0, formData.currentVolume),
        totalVolumes: formData.totalVolumes > 0 ? formData.totalVolumes : undefined,
      };

      if (editingManga) {
        storage.updateManga(editingManga.id, mangaData);
        toast({
          title: "Success! ✨",
          description: "Manga updated successfully",
        });
      } else {
        storage.addManga(mangaData);
        toast({
          title: "Success! 🎉",
          description: "New manga added to your library",
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save manga. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomData = () => {
    const sampleTitles = [
      "Attack on Titan", "One Piece", "Solo Leveling", "Tower of God", 
      "Demon Slayer", "My Hero Academia", "Jujutsu Kaisen", "Chainsaw Man"
    ];
    const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    
    setFormData(prev => ({
      ...prev,
      title: randomTitle,
      rating: Math.floor(Math.random() * 5) + 1,
      currentChapter: Math.floor(Math.random() * 100) + 1,
      totalChapters: Math.floor(Math.random() * 200) + 100,
    }));
    
    setGenres(['Action', 'Adventure', 'Fantasy']);
    
    toast({
      title: "Demo Data Filled! 🎲",
      description: "Sample manga data has been generated and filled into the form.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 mobile-safe-area">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center justify-between">
            <span>{editingManga ? 'Edit Manga' : 'Add New Manga'}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRandomData}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Demo Data
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cover Image Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Cover Image</Label>
                <ImageUpload
                  value={formData.coverImage}
                  onChange={(imageData) => handleInputChange('coverImage', imageData)}
                />
              </div>

              {/* Main Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* API Search */}
                <div className="space-y-2">
                  <Label htmlFor="api-search" className="text-base font-semibold">Search Manga Online</Label>
                  <Input
                    id="api-search"
                    value={searchQueryApi}
                    onChange={(e) => setSearchQueryApi(e.target.value)}
                    placeholder="Search for manga title..."
                    className="mobile-touch-target"
                  />
                  {isLoadingApiSearch && <p className="text-sm text-muted-foreground mt-2">Searching...</p>}
                  {searchResults.length > 0 && (
                    <div className="mt-4 max-h-60 overflow-y-auto border rounded-md bg-background shadow-lg">
                      {searchResults.map((result) => (
                        <div
                          key={result.mal_id}
                          className="flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleSelectSearchResult(result)}
                        >
                          {result.images?.webp?.image_url && (
                            <img src={result.images.webp.image_url} alt={result.title} className="w-10 h-10 object-cover rounded-sm mr-3" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{result.title}</p>
                            <p className="text-xs text-muted-foreground">{result.type} - {result.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter manga title"
                    className="text-lg mobile-touch-target"
                    required
                  />
                </div>

                {/* Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Type</Label>
                    <Select value={formData.type} onValueChange={(value: MangaType) => handleInputChange('type', value)}>
                      <SelectTrigger className="mobile-touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manga">📚 Manga</SelectItem>
                        <SelectItem value="manhwa">🇰🇷 Manhwa</SelectItem>
                        <SelectItem value="manhua">🇨🇳 Manhua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Status</Label>
                    <Select value={formData.status} onValueChange={(value: MangaStatus) => handleInputChange('status', value)}>
                      <SelectTrigger className="mobile-touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ongoing">📖 Ongoing</SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                        <SelectItem value="hold">⏸️ On Hold</SelectItem>
                        <SelectItem value="hiatus">⏰ Hiatus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Chapters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentChapter" className="text-base font-semibold">Current Chapter</Label>
                    <Input
                      id="currentChapter"
                      type="number"
                      min="0"
                      value={formData.currentChapter}
                      onChange={(e) => handleInputChange('currentChapter', parseInt(e.target.value) || 0)}
                      className="mobile-touch-target"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalChapters" className="text-base font-semibold">Total Chapters (Optional)</Label>
                    <Input
                      id="totalChapters"
                      type="number"
                      min="0"
                      value={formData.totalChapters || ''}
                      onChange={(e) => handleInputChange('totalChapters', parseInt(e.target.value) || 0)}
                      placeholder="Leave empty if unknown"
                      className="mobile-touch-target"
                    />
                  </div>
                </div>

                {/* Volumes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentVolume" className="text-base font-semibold">Current Volume</Label>
                    <Input
                      id="currentVolume"
                      type="number"
                      min="0"
                      value={formData.currentVolume || ''}
                      onChange={(e) => handleInputChange('currentVolume', parseInt(e.target.value) || 0)}
                      className="mobile-touch-target"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalVolumes" className="text-base font-semibold">Total Volumes (Optional)</Label>
                    <Input
                      id="totalVolumes"
                      type="number"
                      min="0"
                      value={formData.totalVolumes || ''}
                      onChange={(e) => handleInputChange('totalVolumes', parseInt(e.target.value) || 0)}
                      placeholder="Leave empty if unknown"
                      className="mobile-touch-target"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Rating</Label>
                  <div className="flex space-x-1 justify-center p-3 border rounded-lg">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRatingClick(i + 1)}
                        className="p-1 mobile-touch-target"
                      >
                        <Star
                          className={`h-6 w-6 transition-all ${
                            i < formData.rating
                              ? 'fill-yellow-400 text-yellow-400 scale-110'
                              : 'text-muted-foreground hover:text-yellow-400'
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base font-semibold">Reading URL (Optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://example.com/manga-name"
                    className="mobile-touch-target"
                  />
                </div>

                {/* Favorite */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favorite"
                    checked={formData.favorite}
                    onCheckedChange={(checked) => handleInputChange('favorite', checked)}
                    className="mobile-touch-target"
                  />
                  <Label htmlFor="favorite" className="text-base font-semibold cursor-pointer">
                    Add to Favorites ⭐
                  </Label>
                </div>
              </div>
            </div>

            {/* Genres Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Genres</Label>
              
              {/* Current Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-sm">
                      {genre}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 hover:bg-transparent"
                        onClick={() => handleRemoveGenre(genre)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Genre */}
              <div className="flex space-x-2">
                <Input
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Add a genre"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGenre(newGenre);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddGenre(newGenre)}
                  disabled={!newGenre.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Popular Genres */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Popular genres:</p>
                <div className="flex flex-wrap gap-2">
                  {popularGenres.filter(genre => !genres.includes(genre)).map((genre) => (
                    <Button
                      key={genre}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any notes or thoughts about this manga..."
                  rows={3}
                  className="mobile-touch-target resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 mobile-touch-target"
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {editingManga ? 'Update Manga' : 'Add to Library'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
                disabled={isSubmitting}
                className="mobile-touch-target"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}