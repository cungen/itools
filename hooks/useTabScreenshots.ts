import { useEffect, useState } from "react"

interface ScreenshotCache {
  dataUrl: string
  timestamp: number
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export const useTabScreenshots = (tabs: Array<{ id: number; url?: string; active?: boolean }>) => {
  const [screenshots, setScreenshots] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [cache, setCache] = useState<Record<string, ScreenshotCache>>({})

  // Load cache from storage on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["tabScreenshots"], (result) => {
        if (result.tabScreenshots) {
          setCache(result.tabScreenshots)
        }
      })
    }
  }, [])

  const isCacheValid = (cached: ScreenshotCache | undefined): boolean => {
    if (!cached) return false
    return Date.now() - cached.timestamp < CACHE_EXPIRY_MS
  }

  const saveToCache = (cacheKey: string, dataUrl: string) => {
    const newCache = {
      ...cache,
      [cacheKey]: {
        dataUrl,
        timestamp: Date.now()
      }
    }
    setCache(newCache)
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ tabScreenshots: newCache })
    }
  }

  const captureScreenshot = async (tabId: number, windowId: number, isActive: boolean): Promise<string | null> => {
    try {
      if (typeof chrome === "undefined" || !chrome.tabs) {
        return null
      }

      // Check cache first
      const cacheKey = `tab_${tabId}`
      const cached = cache?.[cacheKey]
      if (isCacheValid(cached)) {
        return cached.dataUrl
      }

      // Only capture screenshot for the active tab to avoid switching tabs
      // Other tabs will use favicons (better UX)
      if (!isActive) {
        return null
      }

      // Get the tab to check if it's valid
      let tab
      try {
        tab = await chrome.tabs.get(tabId)
      } catch (e) {
        // Tab might not exist anymore
        return null
      }

      // Skip capturing for special pages (chrome://, chrome-extension://, about:, etc.)
      if (tab.url && (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("about:") ||
        tab.url.includes("/tabs/tabmanager.html") // Skip the tab manager page itself
      )) {
        return null
      }

      try {
        // Capture the screenshot of the currently visible (active) tab
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
          format: "png",
          quality: 80
        })

        saveToCache(cacheKey, dataUrl)
        return dataUrl
      } catch (e) {
        // If capture fails (e.g., permission denied), return null to use favicon
        return null
      }
    } catch (e) {
      console.error(`Failed to capture screenshot for tab ${tabId}`, e)
      return null
    }
  }

  useEffect(() => {
    const loadScreenshots = async () => {
      const newScreenshots: Record<number, string> = {}
      const newLoading: Record<number, boolean> = {}

      // Get current window to capture visible tab
      let currentWindowId: number | undefined
      if (typeof chrome !== "undefined" && chrome.windows) {
        try {
          const window = await chrome.windows.getCurrent()
          currentWindowId = window.id
        } catch (e) {
          console.error("Failed to get current window", e)
        }
      }

      // Process tabs sequentially to avoid switching tabs too quickly
      for (const tab of tabs) {
        newLoading[tab.id] = true

        // Check cache first
        const cacheKey = `tab_${tab.id}`
        const cached = cache?.[cacheKey]
        if (isCacheValid(cached)) {
          newScreenshots[tab.id] = cached.dataUrl
          newLoading[tab.id] = false
          continue
        }

        // Try to capture screenshot for this tab
        if (currentWindowId !== undefined) {
          const screenshot = await captureScreenshot(tab.id, currentWindowId, tab.active || false)
          if (screenshot) {
            newScreenshots[tab.id] = screenshot
          }
        }
        newLoading[tab.id] = false
      }

      setScreenshots(newScreenshots)
      setLoading(newLoading)
    }

    if (tabs.length > 0) {
      loadScreenshots()
    }
  }, [tabs.map(t => `${t.id}-${t.active}`).join(","), cache])

  return { screenshots, loading }
}
