import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Camera, Image as ImageIcon, FileImage } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (imageData: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className = '' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setIsProcessing(false);
        toast({
          title: "Image uploaded",
          description: "Cover image has been set successfully",
        });
      };
      reader.onerror = () => {
        setIsProcessing(false);
        toast({
          title: "Upload failed",
          description: "Failed to process the image file",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Image upload failed",
        description: "An error occurred while processing the image.",
        variant: "destructive",
      });
    }
  }, [onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={value}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={triggerFileSelect}
                    disabled={isProcessing}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">
                <ImageIcon className="h-3 w-3 mr-1" />
                Cover Image Set
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div
              className={`image-upload-area p-8 text-center transition-all duration-300 ${
                isDragging ? 'drag-over' : ''
              } ${isProcessing ? 'opacity-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Processing image...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Upload Cover Image</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Drag and drop an image here, or click to select
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={triggerFileSelect}
                        className="mobile-touch-target"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supports JPG, PNG, WebP • Max 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}