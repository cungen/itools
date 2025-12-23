import { ExtensionManager } from "./components/ExtensionManager"
import "./style.css"

function IndexPopup() {
  return (
    <div className="min-w-[360px] max-w-[360px] h-[500px] flex flex-col bg-background">
      <div className="px-4 py-4 border-b sticky top-0 z-10 bg-background">
        <h2 className="text-xl font-semibold">Extensions</h2>
      </div>
      <ExtensionManager />
    </div>
  )
}

export default IndexPopup
