import { useState, useEffect } from "react"

export interface Settings {
  theme: "light" | "dark" | "system"
  wallpaperUrl: string
  gridSize: "small" | "medium" | "large"
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  wallpaperUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80",
  gridSize: "medium"
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load settings from storage
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.get(["settings"], (result) => {
        if (result.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...result.settings })
        }
        setLoading(false)
      })
    } else {
      // Mock for dev
      const saved = localStorage.getItem("settings")
      if (saved) {
        setSettings(JSON.parse(saved))
      }
      setLoading(false)
    }
  }, [])

  const updateSetting = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ settings: newSettings })
    } else {
      localStorage.setItem("settings", JSON.stringify(newSettings))
    }
  }

  return { settings, updateSetting, loading }
}
