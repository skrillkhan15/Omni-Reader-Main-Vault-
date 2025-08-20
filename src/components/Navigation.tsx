import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Plus,
  Library,
  Search,
  Settings,
  Bell,
  Menu,
  BookOpen,
  Star,
  TrendingUp,
  X,
  Bot
} from 'lucide-react';

interface NavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Navigation({ activeSection = '', onSectionChange }: NavigationProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'library', label: 'Library', icon: Library, path: '/library' },
    { id: 'genres', label: 'Genres', icon: BookOpen, path: '/genres' },
    { id: 'add', label: 'Add New', icon: Plus, path: '/add' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'favorites', label: 'Favorites', icon: Star, path: '/favorites' },
    { id: 'stats', label: 'Statistics', icon: TrendingUp, path: '/stats' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'ai-chatbot', label: 'AI Chatbot', icon: Bot, path: '/ai-chatbot' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-card backdrop-blur-md border-b border-border/20 shadow-card-elegant mobile-safe-area">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center" style={{ minHeight: 'var(--mobile-header)' }}>
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-primary glow-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-xl font-bold gradient-text-hero">OmniReader</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 overflow-x-auto">
            {navItems
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavClick(item.path)}
                    className={`transition-all duration-300 whitespace-nowrap mobile-touch-target ${isActive
                      ? "shadow-glow-primary"
                      : "hover:bg-muted/50"
                      }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50 mobile-touch-target" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gradient-card border-l border-border/20 mobile-safe-area smooth-scroll">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold gradient-text-hero">OmniReader</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-muted/50 mobile-touch-target" aria-label="Close navigation menu">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-border/20">
                    <div className="relative">
                      <BookOpen className="h-8 w-8 text-primary glow-primary" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="text-xl font-bold gradient-text-hero">OmniReader</h2>
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        size="lg"
                        onClick={() => handleNavClick(item.path)}
                        className={`justify-start w-full transition-all duration-300 mobile-touch-target ${isActive
                          ? "shadow-glow-primary"
                          : "hover:bg-muted/50"
                          }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}