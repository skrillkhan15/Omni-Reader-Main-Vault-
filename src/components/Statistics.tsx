import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Manga } from '@/types/manga';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Star, Book, CheckCircle, Clock } from 'lucide-react';

interface StatisticsProps {
  library: Manga[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

export function Statistics({ library }: StatisticsProps) {
  const stats = useMemo(() => {
    if (library.length === 0) {
      return null;
    }

    const statusData = [
      { name: 'Ongoing', value: library.filter(m => m.status === 'ongoing').length },
      { name: 'Completed', value: library.filter(m => m.status === 'completed').length },
      { name: 'On Hold', value: library.filter(m => m.status === 'hold').length },
      { name: 'Hiatus', value: library.filter(m => m.status === 'hiatus').length },
    ].filter(item => item.value > 0);

    const typeData = [
        { name: 'Manga', value: library.filter(m => m.type === 'manga').length },
        { name: 'Manhwa', value: library.filter(m => m.type === 'manhwa').length },
        { name: 'Manhua', value: library.filter(m => m.type === 'manhua').length },
    ].filter(item => item.value > 0);

    const ratingData = Array.from({ length: 5 }, (_, i) => i + 1).map(rating => ({
      name: `${rating} Star${rating > 1 ? 's' : ''}`,
      count: library.filter(m => m.rating === rating).length,
    }));

    const genreCounts: { [key: string]: number } = {};
    library.forEach(manga => {
      manga.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const totalMangaRead = library.reduce((sum, manga) => sum + manga.currentChapter, 0);
    const averageRating = library.length > 0 
      ? (library.reduce((sum, manga) => sum + manga.rating, 0) / library.length).toFixed(1)
      : 0;

    return { statusData, typeData, ratingData, topGenres, totalMangaRead, averageRating };
  }, [library]);

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Statistics Yet</h3>
          <p className="text-muted-foreground">Add some manga to your library to see your stats!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mobile-safe-area">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold gradient-text-primary">Your Statistics</h2>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Manga Read</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-6xl font-bold gradient-text-primary">{stats.totalMangaRead}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average Rating</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-6xl font-bold gradient-text-primary flex items-center">
              {stats.averageRating}
              <Star className="h-12 w-12 fill-yellow-400 text-yellow-400 ml-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top 10 Genres</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topGenres} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}/>
                <Legend />
                <Bar dataKey="count" name="Manga Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ratings Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}/>
                <Legend />
                <Bar dataKey="count" name="Manga with this rating" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={stats.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {stats.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={stats.typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d" label>
                        {stats.typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
