import { Power, Trash2, Pin } from "lucide-react"
import { useState } from "react"
import { useExtensions } from "../hooks/useExtensions"
import "../style.css"

export function ExtensionManager() {
  const { extensions, loading, toggleExtension, uninstallExtension, openDetails } = useExtensions()
  const [searchQuery, setSearchQuery] = useState("")

  if (loading) {
    return <div className="p-4">Loading extensions...</div>
  }

  const filteredExtensions = extensions
    .filter(ext =>
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Enabled extensions first
      if (a.enabled && !b.enabled) return -1
      if (!a.enabled && b.enabled) return 1
      // Then alphabetical by name
      return a.name.localeCompare(b.name)
    })

  return (
    <>
      <div className="popup-search-container">
        <input
          type="text"
          placeholder="Search extensions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="popup-search-input"
          autoFocus
        />
      </div>
      <div className="extension-list">
        {filteredExtensions.map(ext => (
          <div key={ext.id} className={`extension-item ${!ext.enabled ? 'disabled' : ''}`}>
            <div className="ext-icon">
              {ext.iconUrl ? <img src={ext.iconUrl} alt="" /> : <div className="ext-icon-placeholder">{ext.name[0]}</div>}
            </div>
            <div className="ext-info">
              <h3 className="ext-name" title={ext.name}>{ext.name}</h3>
              <p className="ext-desc" title={ext.description}>{ext.description}</p>
            </div>
            <div className="ext-actions">
              <button
                className="action-btn pin-btn"
                onClick={() => openDetails(ext.id)}
                title="Pin to toolbar / Details (opens Chrome settings)"
              >
                <Pin size={16} />
              </button>
              <button
                className={`action-btn toggle-btn ${ext.enabled ? 'on' : 'off'}`}
                onClick={() => toggleExtension(ext.id, !ext.enabled)}
                title={ext.enabled ? "Disable" : "Enable"}
              >
                <Power size={16} />
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => uninstallExtension(ext.id)}
                title="Uninstall"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredExtensions.length === 0 && <div className="p-4 text-center text-gray-500">No extensions found.</div>}
      </div>
    </>
  )
}
