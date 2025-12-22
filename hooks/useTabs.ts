import { useEffect, useState } from "react"

export interface TabInfo {
  id: number
  title: string
  url?: string
  favIconUrl?: string
  active: boolean
  pinned: boolean
  windowId: number
}

export const useTabs = () => {
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTabs = async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        const chromeTabs = await chrome.tabs.query({ currentWindow: true })
        const tabInfos: TabInfo[] = chromeTabs.map(tab => ({
          id: tab.id!,
          title: tab.title || "Untitled",
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          active: tab.active || false,
          pinned: tab.pinned || false,
          windowId: tab.windowId || 0
        }))
        setTabs(tabInfos)
      } else {
        // Mock data for development
        setTabs(MOCK_TABS)
      }
    } catch (e) {
      console.error("Failed to fetch tabs", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTabs()

    // Listen for tab changes
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const handleTabCreated = () => fetchTabs()
      const handleTabRemoved = () => fetchTabs()
      const handleTabUpdated = () => fetchTabs()

      chrome.tabs.onCreated.addListener(handleTabCreated)
      chrome.tabs.onRemoved.addListener(handleTabRemoved)
      chrome.tabs.onUpdated.addListener(handleTabUpdated)

      return () => {
        chrome.tabs.onCreated.removeListener(handleTabCreated)
        chrome.tabs.onRemoved.removeListener(handleTabRemoved)
        chrome.tabs.onUpdated.removeListener(handleTabUpdated)
      }
    }
  }, [])

  const switchToTab = async (tabId: number) => {
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        await chrome.tabs.update(tabId, { active: true })
        // Close the tab manager tab if we're in it
        if (typeof chrome !== "undefined" && chrome.tabs) {
          const currentTab = await chrome.tabs.getCurrent()
          if (currentTab) {
            chrome.tabs.remove(currentTab.id!)
          }
        }
      }
    } catch (e) {
      console.error("Failed to switch to tab", e)
    }
  }

  const closeTab = async (tabId: number) => {
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        await chrome.tabs.remove(tabId)
      } else {
        // Mock: remove from state
        setTabs(prev => prev.filter(tab => tab.id !== tabId))
      }
    } catch (e) {
      console.error("Failed to close tab", e)
    }
  }

  return { tabs, loading, switchToTab, closeTab, refreshTabs: fetchTabs }
}

const MOCK_TABS: TabInfo[] = [
  {
    id: 1,
    title: "Google",
    url: "https://google.com",
    favIconUrl: "https://www.google.com/favicon.ico",
    active: true,
    pinned: false,
    windowId: 1
  },
  {
    id: 2,
    title: "GitHub",
    url: "https://github.com",
    favIconUrl: "https://github.com/favicon.ico",
    active: false,
    pinned: false,
    windowId: 1
  },
  {
    id: 3,
    title: "Example Page",
    url: "https://example.com",
    favIconUrl: undefined,
    active: false,
    pinned: false,
    windowId: 1
  }
]

