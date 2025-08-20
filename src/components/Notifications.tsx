import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { localStorageInstance } from '@/lib/storage';
import { notificationManager } from '@/lib/notifications';
import { Save } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NotificationSettings } from '@/types/manga';

export function Notifications() {
  const { storage, notificationManager } = useAppContext();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(storage.getNotificationSettings());

  const handleNotificationSettingChange = (field: keyof NotificationSettings, value: boolean | string | ('manga' | 'manhwa' | 'manhua')[]) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveNotificationSettings = () => {
    storage.saveNotificationSettings(notificationSettings);
    notificationManager.scheduleReminders();
    toast({
      title: "Settings Saved",
      description: "Your notification settings have been updated.",
    });
  };

  return (
    <div className="space-y-6 mobile-safe-area">
      <h2 className="text-2xl font-bold gradient-text-primary">Notifications</h2>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <Switch
              id="notifications-enabled"
              checked={notificationSettings.enabled}
              onCheckedChange={(checked) => handleNotificationSettingChange('enabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-frequency">Frequency</Label>
            <Select
              value={notificationSettings.frequency}
              onValueChange={(value) => handleNotificationSettingChange('frequency', value)}
              disabled={!notificationSettings.enabled}
            >
              <SelectTrigger id="notification-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-time">Time</Label>
            <Input
              id="notification-time"
              type="time"
              value={notificationSettings.time}
              onChange={(e) => handleNotificationSettingChange('time', e.target.value)}
              disabled={!notificationSettings.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Manga Types</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manga-type-manga"
                  checked={notificationSettings.types.includes('manga')}
                  onCheckedChange={(checked) => {
                    const types = checked
                      ? [...notificationSettings.types, 'manga']
                      : notificationSettings.types.filter(t => t !== 'manga');
                    handleNotificationSettingChange('types', types);
                  }}
                  disabled={!notificationSettings.enabled}
                />
                <Label htmlFor="manga-type-manga">Manga</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manga-type-manhwa"
                  checked={notificationSettings.types.includes('manhwa')}
                  onCheckedChange={(checked) => {
                    const types = checked
                      ? [...notificationSettings.types, 'manhwa']
                      : notificationSettings.types.filter(t => t !== 'manhwa');
                    handleNotificationSettingChange('types', types);
                  }}
                  disabled={!notificationSettings.enabled}
                />
                <Label htmlFor="manga-type-manhwa">Manhwa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manga-type-manhua"
                  checked={notificationSettings.types.includes('manhua')}
                  onCheckedChange={(checked) => {
                    const types = checked
                      ? [...notificationSettings.types, 'manhua']
                      : notificationSettings.types.filter(t => t !== 'manhua');
                    handleNotificationSettingChange('types', types);
                  }}
                  disabled={!notificationSettings.enabled}
                />
                <Label htmlFor="manga-type-manhua">Manhua</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="only-favorites">Only Notify for Favorites</Label>
            <Switch
              id="only-favorites"
              checked={notificationSettings.onlyFavorites}
              onCheckedChange={(checked) => handleNotificationSettingChange('onlyFavorites', checked)}
              disabled={!notificationSettings.enabled}
            />
          </div>

          <Button variant="premium" onClick={saveNotificationSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}