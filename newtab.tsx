import { useState } from "react"
import { useBookmarks } from "../hooks/useBookmarks"
import { Launchpad } from "./components/Launchpad"
import "./style.css"

function NewTab() {
  const { bookmarks, loading } = useBookmarks()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <div className="newtab-container">
      <Launchpad rootNodes={bookmarks} />
    </div>
  )
}

export default NewTab
