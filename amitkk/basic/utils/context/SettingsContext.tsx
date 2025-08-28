
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface SiteSettings {
  country: string;
  currency: string;
  language: string;
  flag: string;
}

export const currencySymbols: { [key: string]: string } = {
  INR: '₹',
  USD: '$',
  AED: 'د.إ',
  GBP: '£',
};

const defaultSettings: SiteSettings = {
  country: 'IN',
  currency: 'INR',
  language: 'ENG',
  flag: '🇮🇳',
};

interface SettingsContextType {
  settings: SiteSettings;
  setSettings: (settings: SiteSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with default settings. This ensures the server and client initial render match.
  const [settings, setSettingsState] = useState<SiteSettings>(defaultSettings);

  // This effect runs only on the client, after the initial render.
  useEffect(() => {
    try {
      // const storedSettings = getCookie('siteSettings');
      // if (storedSettings) {
      //   const parsed = JSON.parse(storedSettings);
      //   // Basic validation
      //   if(parsed.country && parsed.currency && parsed.language && parsed.flag) {
      //     setSettingsState(parsed); // Re-render on client with stored settings.
      //   }
      // }
    } catch (e) { }
  }, []);
  useEffect(() => {
  }, [settings]);
  
  const setSettings = (newSettings: SiteSettings) => {
    setSettingsState(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
