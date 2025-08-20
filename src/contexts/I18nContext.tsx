import React, { useState, ReactNode } from 'react';
import { translations } from '@/lib/translations';
import { I18nContext } from './I18n';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en'); // Default locale

  const t = (key: string, vars?: { [key: string]: string | number }) => {
    let translated = translations[key]?.[locale] || key; // Fallback to key if translation not found
    
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        translated = translated.replace(`{${k}}`, String(v));
      }
    }
    return translated;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};