import { useEffect, useState } from "react"

export interface ExtensionInfo {
  id: string
  name: string
  description: string
  enabled: boolean
  iconUrl?: string
  homepageUrl?: string
  optionsUrl?: string
  type: string
}

export const useExtensions = () => {
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExtensions = async () => {
    if (typeof chrome !== "undefined" && chrome.management) {
      const list = await chrome.management.getAll()
      // Filter out themes and the extension itself if needed
      const appsAndExtensions = list.filter(item =>
        (item.type === "extension" || item.type === "hosted_app") &&
        item.id !== chrome.runtime.id
      ).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        enabled: item.enabled,
        iconUrl: item.icons && item.icons.length > 0 ? item.icons[item.icons.length - 1].url : undefined,
        homepageUrl: item.homepageUrl,
        optionsUrl: item.optionsUrl,
        type: item.type
      }))
      setExtensions(appsAndExtensions)
    } else {
      setExtensions(MOCK_EXTENSIONS)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchExtensions()

    // Listen for changes if possible
    const listener = () => fetchExtensions()
    if (typeof chrome !== "undefined" && chrome.management) {
      chrome.management.onEnabled.addListener(listener)
      chrome.management.onDisabled.addListener(listener)
      chrome.management.onUninstalled.addListener(listener)
      chrome.management.onInstalled.addListener(listener)
    }

    return () => {
      if (typeof chrome !== "undefined" && chrome.management) {
        chrome.management.onEnabled.removeListener(listener)
        chrome.management.onDisabled.removeListener(listener)
        chrome.management.onUninstalled.removeListener(listener)
        chrome.management.onInstalled.removeListener(listener)
      }
    }
  }, [])

  const toggleExtension = async (id: string, enabled: boolean) => {
    if (typeof chrome !== "undefined" && chrome.management) {
      await chrome.management.setEnabled(id, enabled)
    } else {
      console.log(`Toggling mock extension ${id} to ${enabled}`)
      setExtensions(exts => exts.map(e => e.id === id ? { ...e, enabled } : e))
    }
  }

  const uninstallExtension = async (id: string) => {
    if (typeof chrome !== "undefined" && chrome.management) {
      await chrome.management.uninstall(id, { showConfirmDialog: true })
    } else {
      console.log(`Uninstalling mock extension ${id}`)
      setExtensions(exts => exts.filter(e => e.id !== id))
    }
  }

  const launchExtension = (id: string) => {
     if (typeof chrome !== "undefined" && chrome.management) {
         chrome.management.launchApp(id, () => {
             // callback
         })
     } else {
         console.log("Launching", id)
     }
  }

  const openDetails = (id: string) => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: `chrome://extensions/?id=${id}` })
    } else {
      window.open(`chrome://extensions/?id=${id}`, "_blank")
    }
  }

  return { extensions, loading, toggleExtension, uninstallExtension, launchExtension, openDetails }
}

const MOCK_EXTENSIONS: ExtensionInfo[] = [
  { id: "1", name: "React Developer Tools", description: "Debug React apps", enabled: true, type: "extension" },
  { id: "2", name: "uBlock Origin", description: "Block ads", enabled: false, type: "extension" },
  { id: "3", name: "Google Docs", description: "Create docs", enabled: true, type: "hosted_app", homepageUrl: "https://docs.google.com" }
]
