"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslations, defaultLanguage, type Translations } from '../lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(defaultLanguage);
  const [t, setTranslations] = useState(getTranslations(defaultLanguage));

  useEffect(() => {
    // Cargar idioma guardado del localStorage
    const savedLanguage = localStorage.getItem('chat-language') || defaultLanguage;
    setLanguageState(savedLanguage);
    setTranslations(getTranslations(savedLanguage));
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setTranslations(getTranslations(lang));
    localStorage.setItem('chat-language', lang);
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
