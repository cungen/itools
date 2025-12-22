import { X } from "lucide-react"
import type { TabInfo } from "../hooks/useTabs"
import "../style.css"

interface TabCardProps {
  tab: TabInfo
  screenshot?: string
  isLoading?: boolean
  onSwitch: (tabId: number) => void
  onClose: (tabId: number) => void
}

export function TabCard({ tab, screenshot, isLoading, onSwitch, onClose }: TabCardProps) {
  const getFaviconUrl = () => {
    if (tab.favIconUrl) return tab.favIconUrl
    if (tab.url && typeof chrome !== "undefined" && chrome.runtime) {
      return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`
    }
    return null
  }
  const faviconUrl = getFaviconUrl()

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose(tab.id)
  }

  return (
    <div
      className="tab-card-container"
      onClick={() => onSwitch(tab.id)}
    >
      <div className="tab-card-visual">
        {isLoading ? (
          <div className="tab-card-loading">Loading...</div>
        ) : screenshot ? (
          <img
            src={screenshot}
            alt={tab.title}
            className="tab-card-screenshot"
          />
        ) : faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="tab-card-favicon"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <div className="tab-card-placeholder">🌐</div>
        )}
        <button
          className="tab-card-close"
          onClick={handleClose}
          title="Close tab"
        >
          <X size={16} />
        </button>
      </div>
      <span className="tab-card-label" title={tab.title}>
        {tab.title}
      </span>
    </div>
  )
}

