import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  Star, 
  Clock,
  Plus,
  Eye,
  Heart,
  CheckCircle
} from 'lucide-react';
import { localStorageInstance } from '@/lib/storage';
import { Manga } from '@/types/manga';
import { useAppContext } from '@/hooks/useAppContext';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { storage } = useAppContext();
  const [library, setLibrary] = useState<Manga[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    favorites: 0,
    recentlyAdded: [] as Manga[],
    totalChaptersRead: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const loadDashboardData = () => {
      const mangaLibrary = storage.getMangaLibrary();
      setLibrary(mangaLibrary);

      const totalChaptersRead = mangaLibrary.reduce((sum, manga) => sum + manga.currentChapter, 0);
      const totalRating = mangaLibrary.reduce((sum, manga) => sum + manga.rating, 0);
      const averageRating = mangaLibrary.length > 0 ? totalRating / mangaLibrary.length : 0;

      setStats({
        total: mangaLibrary.length,
        ongoing: mangaLibrary.filter(m => m.status === 'ongoing').length,
        completed: mangaLibrary.filter(m => m.status === 'completed').length,
        favorites: mangaLibrary.filter(m => m.favorite).length,
        recentlyAdded: mangaLibrary
          .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
          .slice(0, 4),
        totalChaptersRead,
        averageRating,
      });
    };
    loadDashboardData();
  }, [onNavigate, storage, setLibrary, setStats]);
    

  const statCards = [
    {
      title: 'Total Manga',
      value: stats.total,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Currently Reading',
      value: stats.ongoing,
      icon: Clock,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Favorites',
      value: stats.favorites,
      icon: Heart,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6 mobile-safe-area">
      {/* Welcome Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text-hero float-animation">
          Welcome to OmniReader
        </h1>
        <p className="text-lg text-muted-foreground">
          Your ultimate manga, manhwa, and manhua management hub
        </p>
        {stats.total === 0 && (
          <Button
            variant="hero"
            size="xl"
            onClick={() => onNavigate('add')}
            className="mt-4"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Manga
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Reading Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Chapters Read</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {stats.totalChaptersRead}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Library Types</span>
                <div className="flex space-x-2">
                  <Badge variant="manga" className="text-xs">
                    {library.filter(m => m.type === 'manga').length} Manga
                  </Badge>
                  <Badge variant="manhwa" className="text-xs">
                    {library.filter(m => m.type === 'manhwa').length} Manhwa
                  </Badge>
                  <Badge variant="manhua" className="text-xs">
                    {library.filter(m => m.type === 'manhua').length} Manhua
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Recently Added
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('library')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentlyAdded.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentlyAdded.map((manga) => (
                    <div key={manga.id} className="flex items-center space-x-3">
                      <div className="w-12 h-16 bg-gradient-primary rounded-md flex items-center justify-center text-white text-xs">
                        {manga.type.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{manga.title}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={manga.type} className="text-xs">
                            {manga.type}
                          </Badge>
                          {manga.favorite && (
                            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No manga added yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="premium"
              className="h-16"
              onClick={() => onNavigate('add')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Manga
            </Button>
            <Button
              variant="premium"
              className="h-16"
              onClick={() => onNavigate('search')}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Library
            </Button>
            <Button
              variant="premium"
              className="h-16"
              onClick={() => onNavigate('settings')}
            >
              <Star className="h-5 w-5 mr-2" />
              Manage Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}