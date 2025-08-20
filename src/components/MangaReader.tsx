import React from 'react';
import { Manga } from '@/types/manga';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface MangaReaderProps {
  manga: Manga;
  onClose: () => void;
  onUpdateProgress: (chapter: number, volume?: number) => void;
}

export const MangaReader: React.FC<MangaReaderProps> = ({ manga, onClose, onUpdateProgress }) => {
  const [currentChapter, setCurrentChapter] = React.useState(manga.currentChapter || 0);

  const handleNextChapter = () => {
    const nextChapter = currentChapter + 1;
    setCurrentChapter(nextChapter);
    onUpdateProgress(nextChapter);
  };

  const handlePrevChapter = () => {
    const prevChapter = currentChapter - 1;
    if (prevChapter >= 0) {
      setCurrentChapter(prevChapter);
      onUpdateProgress(prevChapter);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Library
        </Button>
        <h2 className="text-2xl font-bold gradient-text-primary">{manga.title}</h2>
        <div></div> {/* Spacer */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapter {currentChapter}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          {manga.url ? (
            <p className="text-muted-foreground mb-4">
              In a real application, this would display the manga content from: <a href={manga.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{manga.url}</a>
            </p>
          ) : (
            <p className="text-muted-foreground mb-4">No URL provided for this manga.</p>
          )}
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={handlePrevChapter} disabled={currentChapter === 0}>
              <ChevronLeft className="h-5 w-5 mr-2" /> Previous Chapter
            </Button>
            <Button onClick={handleNextChapter}>
              Next Chapter <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};