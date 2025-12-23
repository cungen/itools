import React from "react"
import ReactDOM from "react-dom/client"
import NewTab from "./newtab"
import "./style.css"

// Create root element if it doesn't exist
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <NewTab />
  </React.StrictMode>
)

