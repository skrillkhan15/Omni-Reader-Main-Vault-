import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/useI18n";
import { Compass, Search } from "lucide-react";
import { getSearchManga } from "@/lib/api";
import { Manga } from "@/types/manga";
import { MangaCard } from "@/components/MangaCard";
import { toast } from "@/hooks/use-toast";

interface DiscoverProps {
  onAddManga: (manga?: Manga) => void;
}

export const Discover = ({ onAddManga }: DiscoverProps) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const searchManga = getSearchManga();
      const results = await searchManga(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast({
          title: t('no_results_found'),
          description: t('try_different_query'),
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error during manga search:", error);
      toast({
        title: t('search_error'),
        description: t('failed_to_fetch_results'),
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, t]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold gradient-text-primary flex items-center">
        <Compass className="h-6 w-6 mr-2" />
        {t('discover_manga')}
      </h2>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={t('search_manga_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? t('searching') : <Search className="h-4 w-4 mr-2" />}{t('search')}
        </Button>
      </div>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 poco:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {searchResults.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onAdd={() => onAddManga(manga)} // Pass the manga object to onAddManga
              showAddButton={true} // Indicate that this card is for adding
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Compass className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('discover_manga')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('discover_message')}
            </p>
            <Button onClick={() => onAddManga()}>{t('add_new_manga')}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};