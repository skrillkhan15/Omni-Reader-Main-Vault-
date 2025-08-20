import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AIChatbot } from "./pages/AIChatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppProviders } from "./contexts/AppProviders";
import { AppContent } from "./AppContent";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppProviders>
              <AppContent>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/library" element={<Index />} />
                  <Route path="/genres" element={<Index />} />
                  <Route path="/add" element={<Index />} />
                  <Route path="/search" element={<Index />} />
                  <Route path="/favorites" element={<Index />} />
                  <Route path="/stats" element={<Index />} />
                  <Route path="/notifications" element={<Index />} />
                  <Route path="/ai-chatbot" element={<AIChatbot />} />
                  <Route path="/settings" element={<Index />} />
                  <Route path="/read" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppContent>
            </AppProviders>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
