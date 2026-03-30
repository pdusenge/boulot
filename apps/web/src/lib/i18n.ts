'use client';

import { createContext, useContext } from 'react';
import en from '../locales/en.json';
import rw from '../locales/rw.json';

export const locales = ['en', 'rw'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const messages: Record<Locale, typeof en> = { en, rw };

export function getMessages(locale: Locale): typeof en {
  return messages[locale] || messages.en;
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  return (localStorage.getItem('boulot_locale') as Locale) || defaultLocale;
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('boulot_locale', locale);
  }
}

type NestedMessages = typeof en;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
}

export function useTranslation() {
  const locale = getStoredLocale();
  const msgs = getMessages(locale);

  function t(key: string): string {
    return getNestedValue(msgs, key);
  }

  return { t, locale };
}
