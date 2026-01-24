'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇲🇽' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function LanguageSelector() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set Google Translate cookie
  const setGoogleTranslateCookie = useCallback((langCode: string) => {
    const cookieValue = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; max-age=31536000`;
  }, []);

  // Get current Google Translate language from cookie
  const getCurrentGoogleLang = useCallback(() => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'googtrans') {
        const match = value.match(/\/([a-z\-]+)$/i);
        return match ? match[1] : 'en';
      }
    }
    return 'en';
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    const selectedLang = languages.find(l => l.code === langCode);
    if (selectedLang?.dir === 'rtl') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = langCode;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = langCode;
    }

    // Set Google Translate cookie
    setGoogleTranslateCookie(langCode);

    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', langCode);
    }

    // Force Google Translate to re-render by reloading
    // This is necessary because Google Translate doesn't respond to programmatic changes
    window.location.reload();
  }, [setGoogleTranslateCookie]);

  useEffect(() => {
    setMounted(true);

    // Check both cookie and localStorage for saved language
    const savedLang = localStorage.getItem('preferredLanguage');
    const cookieLang = getCurrentGoogleLang();

    // Use the most recently saved preference
    if (savedLang && savedLang !== cookieLang) {
      // Apply saved preference
      setGoogleTranslateCookie(savedLang);
      setCurrentLang(savedLang);
    } else if (cookieLang !== 'en') {
      setCurrentLang(cookieLang);
    }

    // Listen for Google Translate language changes
    const handleGoogleTranslateChange = () => {
      const newLang = getCurrentGoogleLang();
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    };

    document.addEventListener('languagechange', handleGoogleTranslateChange);

    // Handle clicks outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('languagechange', handleGoogleTranslateChange);
    };
  }, [currentLang, getCurrentGoogleLang, setGoogleTranslateCookie]);

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  if (!mounted) {
    return (
      <div className="flex items-center">
        <div className="w-32 h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm"
        aria-label={`Language: ${currentLanguage.name}`}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-gray-700 font-medium hidden md:inline">{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-2 max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    currentLang === lang.code
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {currentLang === lang.code && (
                    <svg className="w-4 h-4 ml-auto text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Google Translate widget */}
      <div id="google_translate_element" className="hidden" />
    </div>
  );
}
