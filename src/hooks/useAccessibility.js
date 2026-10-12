import { useEffect, useState } from 'react';

const STORAGE_KEY = 'storyforge_high_contrast';

export default function useAccessibility() {
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', highContrast);

    try {
      window.localStorage.setItem(STORAGE_KEY, String(highContrast));
    } catch (error) {
      console.warn('Não foi possível salvar a preferência de alto contraste:', error);
    }
  }, [highContrast]);

  useEffect(() => {
    const syncPreference = (event) => {
      setHighContrast(event.detail);
    };

    window.addEventListener('storyforge:high-contrast-change', syncPreference);
    return () => window.removeEventListener('storyforge:high-contrast-change', syncPreference);
  }, []);

  const toggleHighContrast = () => {
    const nextValue = !highContrast;
    setHighContrast(nextValue);
    window.dispatchEvent(new CustomEvent('storyforge:high-contrast-change', { detail: nextValue }));
  };

  return { highContrast, toggleHighContrast };
}
