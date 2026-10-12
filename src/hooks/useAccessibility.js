import { useEffect, useState } from 'react';

const HIGH_CONTRAST_STORAGE_KEY = 'storyforge_high_contrast';
const FONT_SCALE_STORAGE_KEY = 'storyforge_font_scale';
const FONT_SCALE_VALUES = ['normal', 'medium', 'large'];

export default function useAccessibility() {
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return window.localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [fontScale, setFontScaleState] = useState(() => {
    try {
      const savedScale = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      return FONT_SCALE_VALUES.includes(savedScale) ? savedScale : 'normal';
    } catch {
      return 'normal';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', highContrast);

    try {
      window.localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(highContrast));
    } catch (error) {
      console.warn('Não foi possível salvar a preferência de alto contraste:', error);
    }
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-normal', 'font-scale-medium', 'font-scale-large');
    root.classList.add(`font-scale-${fontScale}`);

    try {
      window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, fontScale);
    } catch (error) {
      console.warn('Não foi possível salvar a escala de fonte:', error);
    }
  }, [fontScale]);

  useEffect(() => {
    const syncPreference = (event) => {
      setHighContrast(event.detail);
    };

    const syncFontScale = (event) => {
      if (FONT_SCALE_VALUES.includes(event.detail)) {
        setFontScaleState(event.detail);
      }
    };

    window.addEventListener('storyforge:high-contrast-change', syncPreference);
    window.addEventListener('storyforge:font-scale-change', syncFontScale);
    return () => {
      window.removeEventListener('storyforge:high-contrast-change', syncPreference);
      window.removeEventListener('storyforge:font-scale-change', syncFontScale);
    };
  }, []);

  const toggleHighContrast = () => {
    const nextValue = !highContrast;
    setHighContrast(nextValue);
    window.dispatchEvent(new CustomEvent('storyforge:high-contrast-change', { detail: nextValue }));
  };

  const setFontScale = (nextScale) => {
    if (!FONT_SCALE_VALUES.includes(nextScale)) return;

    setFontScaleState(nextScale);
    window.dispatchEvent(new CustomEvent('storyforge:font-scale-change', { detail: nextScale }));
  };

  return { highContrast, toggleHighContrast, fontScale, setFontScale };
}
