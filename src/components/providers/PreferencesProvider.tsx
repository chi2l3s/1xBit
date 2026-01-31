"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { translations, type Locale, type TranslationKey } from "@/lib/i18n"

type Theme = "dark" | "light"

interface PreferencesContextValue {
  theme: Theme
  locale: Locale
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = "site-theme"
const LOCALE_STORAGE_KEY = "site-locale"

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeState(storedTheme)
    }
    if (storedLocale === "en" || storedLocale === "ru") {
      setLocaleState(storedLocale)
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key] ?? translations.en[key] ?? key,
    [locale]
  )

  const value = useMemo(
    () => ({ theme, locale, setTheme, toggleTheme, setLocale, t }),
    [theme, locale, setTheme, toggleTheme, setLocale, t]
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider")
  }
  return context
}
