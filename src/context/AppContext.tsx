import { createContext, useContext, useEffect, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { CoverPageData, Theme } from '../types';
import { DEFAULT_COVER_PAGE_DATA } from '../constants/defaultData';
import { loadSavedLogo, prepareLogo, saveLogo } from '../utils/logoStorage';

interface AppContextType {
  data: CoverPageData;
  setData: Dispatch<SetStateAction<CoverPageData>>;
  updateField: (field: keyof CoverPageData, value: string) => void;
  logoSrc: string;
  logoReady: boolean;
  logoIsCustom: boolean;
  setLogoFromFile: (file: File) => Promise<void>;
  detailsSaved: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);
const DETAILS_KEY = 'briu_cover_page_data';
const THEME_KEY = 'briu_theme';
const DEFAULT_LOGO_URL = '/briu-default-logo.png';

function initialData(): CoverPageData {
  try {
    const saved = localStorage.getItem(DETAILS_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...DEFAULT_COVER_PAGE_DATA, ...(parsed as Partial<CoverPageData>) };
      }
    }
  } catch { /* Invalid or inaccessible browser storage. */ }
  return { ...DEFAULT_COVER_PAGE_DATA };
}

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* Fall back to the device preference. */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CoverPageData>(initialData);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [logoSrc, setLogoSrc] = useState(DEFAULT_LOGO_URL);
  const [logoReady, setLogoReady] = useState(false);
  const [logoIsCustom, setLogoIsCustom] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadSavedLogo().then((stored) => {
      if (!mounted) return;
      if (stored) {
        setLogoSrc(stored);
        setLogoIsCustom(true);
      }
      setLogoReady(true);
    }).catch(() => {
      if (mounted) setLogoReady(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify(data));
      setDetailsSaved(true);
    } catch {
      setDetailsSaved(false);
    }
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* Theme still works this session. */ }
  }, [theme]);

  const setLogoFromFile = async (file: File) => {
    const prepared = await prepareLogo(file);
    // The preview updates immediately; persistence is completed before success is reported.
    setLogoSrc(prepared);
    setLogoIsCustom(true);
    await saveLogo(prepared);
  };

  const updateField = (field: keyof CoverPageData, value: string) => {
    setData((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <AppContext.Provider value={{ data, setData, updateField, logoSrc, logoReady, logoIsCustom, setLogoFromFile, detailsSaved, theme, toggleTheme: () => setTheme((value) => value === 'dark' ? 'light' : 'dark') }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used inside AppProvider');
  return context;
}
