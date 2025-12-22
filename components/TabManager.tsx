import { useTabs } from "../hooks/useTabs"
import { useTabScreenshots } from "../hooks/useTabScreenshots"
import { TabCard } from "./TabCard"
import "../style.css"

export function TabManager() {
  const { tabs, loading, switchToTab, closeTab } = useTabs()
  const { screenshots, loading: screenshotsLoading } = useTabScreenshots(tabs)

  if (loading) {
    return (
      <div className="tab-manager-loading">
        <div>Loading tabs...</div>
      </div>
    )
  }

  if (tabs.length === 0) {
    return (
      <div className="tab-manager-empty">
        <div>No tabs open</div>
      </div>
    )
  }

  return (
    <div className="tab-manager-container">
      <div className="tab-manager-grid">
        {tabs.map((tab) => (
          <TabCard
            key={tab.id}
            tab={tab}
            screenshot={screenshots[tab.id]}
            isLoading={screenshotsLoading[tab.id]}
            onSwitch={switchToTab}
            onClose={closeTab}
          />
        ))}
      </div>
    </div>
  )
}

