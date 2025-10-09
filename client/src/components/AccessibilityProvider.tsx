
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  simplifiedVisuals: boolean;
  literalLanguage: boolean;
  highContrast: boolean;
  dyslexicFont: boolean;
  textToSpeech: boolean;
  voiceInput: boolean;
  fontSize: 'default' | 'large' | 'xlarge';
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  simplifiedVisuals: false,
  literalLanguage: false,
  highContrast: false,
  dyslexicFont: false,
  textToSpeech: false,
  voiceInput: false,
  fontSize: 'default',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      return { ...defaultPreferences, ...JSON.parse(saved) };
    }
    
    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      ...defaultPreferences,
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
    };
  });

  useEffect(() => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    
    // Apply preferences to document
    const root = document.documentElement;
    
    // Reduce motion
    if (preferences.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // High contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Dyslexic font
    if (preferences.dyslexicFont) {
      root.classList.add('dyslexic-font');
    } else {
      root.classList.remove('dyslexic-font');
    }
    
    // Simplified visuals
    if (preferences.simplifiedVisuals) {
      root.classList.add('simplified-visuals');
    } else {
      root.classList.remove('simplified-visuals');
    }
    
    // Font size
    root.setAttribute('data-font-size', preferences.fontSize);
    
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
