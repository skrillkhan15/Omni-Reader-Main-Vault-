import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, Settings as SettingsIcon, Palette, Database, Bot, Zap, Github } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/hooks/useAppContext';
import { AppSettings } from '@/types/settings';

export function Settings() {
  const { appSettings, setAppSettings, storage } = useAppContext();

  const handleApiProviderChange = (value: string) => {
    const newSettings = { ...appSettings, apiProvider: value as AppSettings['apiProvider'] };
    setAppSettings(newSettings);
    storage.saveAppSettings(newSettings);
    toast({
      title: "API Provider Changed",
      description: `The API provider has been changed to ${value}.`,
    });
  };

  const handleCustomApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...appSettings, customApiUrl: e.target.value };
    setAppSettings(newSettings);
    storage.saveAppSettings(newSettings);
  };

  const handleAiApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...appSettings, aiApiKey: e.target.value };
    setAppSettings(newSettings);
    storage.saveAppSettings(newSettings);
  };

  const handleThemeChange = (value: string) => {
    const newSettings = { ...appSettings, customTheme: value };
    setAppSettings(newSettings);
    storage.saveAppSettings(newSettings);
  };

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
    
    toast({
      title: "Export Complete! 📥",
      description: "Your library has been exported successfully",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (storage.importData(data)) {
            toast({
              title: "Import Complete! 📤",
              description: "Your library has been imported successfully",
            });
            // Refresh the page to reload the imported data
            window.location.reload();
          } else {
            throw new Error('Import failed');
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Could not import data. Please ensure the file is a valid JSON backup.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 mobile-safe-area">
      <h2 className="text-2xl font-bold gradient-text-primary">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="premium" onClick={exportData} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Library
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Button variant="premium" asChild className="w-full">
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Library
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-provider">Manga Search API Provider</Label>
              <Select value={appSettings.apiProvider} onValueChange={handleApiProviderChange}>
                <SelectTrigger id="api-provider">
                  <SelectValue placeholder="Select an API provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jikan">Jikan (MyAnimeList)</SelectItem>
                  <SelectItem value="kitsu">Kitsu</SelectItem>

                  <SelectItem value="anilist">AniList</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {appSettings.apiProvider === 'custom' && (
              <div className="space-y-2">
              <Label htmlFor="custom-api-url">Custom API URL</Label>
              <Input
                id="custom-api-url"
                type="url"
                placeholder="e.g., https://my-custom-api.com/manga"
                value={appSettings.customApiUrl || ''}
                onChange={handleCustomApiUrlChange}
              />
              <p className="text-sm text-muted-foreground">
                This API should accept a `?q=` query parameter and return data in a format similar to Jikan/Kitsu/AniList.
              </p>
            </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-api-key">AI API Key</Label>
              <Input
                id="ai-api-key"
                type="password"
                placeholder="Enter your AI API Key"
                value={appSettings.aiApiKey || ''}
                onChange={handleAiApiKeyChange}
              />
              <p className="text-sm text-muted-foreground">
                Your AI API key is stored locally in your browser. For production, a backend proxy is recommended for security.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Select Theme</span>
              <ThemeToggle />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-theme">Custom Color Palette</Label>
              <Select 
                value={appSettings.customTheme || 'default'} 
                onValueChange={handleThemeChange}
              >
                <SelectTrigger id="custom-theme">
                  <SelectValue placeholder="Select a custom palette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="ocean-blue">Ocean Blue</SelectItem>
                  <SelectItem value="forest-green">Forest Green</SelectItem>
                  <SelectItem value="sunset-orange">Sunset Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
