import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, ArrowLeft, X, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAppContext } from '@/hooks/useAppContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export function AIChatbot() {
  const navigate = useNavigate();
  const { appSettings } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hello! I\'m your AI assistant for OmniReader. I can help you with manga recommendations, answer questions about your library, or just chat about manga and anime. How can I help you today?',
      sender: 'ai',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if AI is configured
  const isAiConfigured = appSettings.aiApiKey && appSettings.aiProvider;

  const handleGoBack = () => {
    navigate('/');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add keyboard shortcut to go back
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleGoBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    if (!isAiConfigured) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI settings first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      // Use the configured AI settings to make the request
      const requestBody = {
        message: userMessage.text,
        provider: appSettings.aiProvider,
        model: appSettings.aiModel,
        apiKey: appSettings.aiApiKey,
      };

      const response = await fetch('http://localhost:3001/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      const aiResponseText = data.response;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error("Error getting AI response:", error);
      const errorDescription = error instanceof Error ? error.message : "Failed to get a response from the AI. Please check your AI settings and try again.";
      toast({
        title: "AI Error",
        description: errorDescription,
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please check your AI settings in the Settings page and try again.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isAiConfigured, appSettings]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSending) {
      handleSendMessage();
    }
  }, [handleSendMessage, isSending]);

  return (
    <div className="min-h-screen bg-background mobile-safe-area">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-gradient-card backdrop-blur-md border-b border-border/20 shadow-card-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="hover:bg-muted/50 mobile-touch-target"
                aria-label="Go back to dashboard (Press Escape)"
                title="Go back to dashboard (Press Escape)"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-8 w-8 text-primary glow-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text-hero">AI Chatbot</h1>
                  <p className="text-xs text-muted-foreground">Press Escape to go back</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="hover:bg-muted/50 mobile-touch-target"
              aria-label="Close AI Chatbot (Press Escape)"
              title="Close AI Chatbot (Press Escape)"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4 pt-8">
        <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          <CardHeader className="bg-gradient-primary text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-6 w-6 mr-2" />
                Chat with AI Assistant
              </div>
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([{
                    id: 'welcome',
                    text: 'Hello! I\'m your AI assistant for OmniReader. I can help you with manga recommendations, answer questions about your library, or just chat about manga and anime. How can I help you today?',
                    sender: 'ai',
                  }])}
                  className="text-white hover:bg-white/20"
                >
                  Clear Chat
                </Button>
              )}
            </CardTitle>
          </CardHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col">
          {!isAiConfigured && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">AI Not Configured</p>
                  <p className="text-sm">Please configure your AI settings in the Settings page to use the chatbot.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/settings')}
                  >
                    Go to Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-muted text-muted-foreground rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t bg-background space-y-3">
          {/* Quick Action Buttons */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage('Recommend me some popular manga')}
                className="text-xs"
              >
                📚 Recommend Manga
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage('What are the best manga genres?')}
                className="text-xs"
              >
                🎭 Best Genres
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage('Help me organize my manga library')}
                className="text-xs"
              >
                📖 Library Tips
              </Button>
            </div>
          )}
          
          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder={isAiConfigured ? "Type your message..." : "Configure AI settings first..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isSending || !isAiConfigured}
            />
            <Button onClick={handleSendMessage} disabled={isSending || !inputMessage.trim() || !isAiConfigured}>
              {isSending ? 'Sending...' : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        </Card>
      </div>
    </div>
  );
}