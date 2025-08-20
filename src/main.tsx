import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "next-themes"
import { I18nProvider } from './contexts/I18nContext';

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" attribute="class">
    <I18nProvider>
      <App />
    </I18nProvider>
  </ThemeProvider>
);

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

