import { ExtensionManager } from "./components/ExtensionManager"
import "./style.css"

function IndexPopup() {
  return (
    <div className="popup-container">
      <div className="popup-header">
        <h2>Extensions</h2>
      </div>
      <ExtensionManager />
    </div>
  )
}

export default IndexPopup
