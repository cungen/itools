import { useSettings } from "../hooks/useSettings"
import "./style.css"

function Options() {
  const { settings, updateSetting, loading } = useSettings()

  if (loading) return <div className="options-container">Loading...</div>

  return (
    <div className="options-container">
      <h1 className="options-title">Extension Settings</h1>

      <div className="settings-section">
        <h2 className="section-title">Appearance</h2>

        <div className="setting-control">
          <label>Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSetting("theme", e.target.value)}
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="setting-control">
          <label>Wallpaper URL</label>
          <input
            type="text"
            value={settings.wallpaperUrl}
            onChange={(e) => updateSetting("wallpaperUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="setting-control">
          <label>Grid Size</label>
           <select
            value={settings.gridSize}
            onChange={(e) => updateSetting("gridSize", e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default Options

