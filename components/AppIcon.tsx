import { useState } from "react"
import { Folder, Globe } from "lucide-react"
import type { BookmarkNode } from "../hooks/useBookmarks"
import "../style.css"

interface AppIconProps {
  node: BookmarkNode
  onClick: (node: BookmarkNode) => void
}

const getEmojiFallback = (title: string, url?: string) => {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url?.toLowerCase() || "";

  if (lowerUrl.includes("github.com") || lowerTitle.includes("github")) return "🐙";
  if (lowerUrl.includes("google.com") || lowerTitle.includes("google")) return "🔍";
  if (lowerUrl.includes("youtube.com") || lowerTitle.includes("youtube") || lowerTitle.includes("video")) return "📺";
  if (lowerUrl.includes("mail.google.com") || lowerTitle.includes("mail") || lowerTitle.includes("outlook")) return "📧";
  if (lowerUrl.includes("notion.so") || lowerTitle.includes("notion")) return "📓";
  if (lowerUrl.includes("chatgpt.com") || lowerUrl.includes("openai.com") || lowerUrl.includes("claude.ai") || lowerTitle.includes("ai")) return "🤖";
  if (lowerUrl.includes("calendar.google.com") || lowerTitle.includes("calendar")) return "📅";
  if (lowerUrl.includes("spotify.com") || lowerTitle.includes("music") || lowerTitle.includes("spotify")) return "🎵";
  if (lowerUrl.includes("news") || lowerTitle.includes("news")) return "📰";
  if (lowerUrl.includes("bank") || lowerUrl.includes("paypal") || lowerTitle.includes("money") || lowerTitle.includes("pay")) return "💰";
  if (lowerUrl.includes("reddit.com")) return "🦊";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com") || lowerTitle.includes("twitter")) return "🐦";
  if (lowerUrl.includes("facebook.com") || lowerTitle.includes("facebook")) return "👥";
  if (lowerUrl.includes("amazon.com") || lowerTitle.includes("shop") || lowerTitle.includes("amazon")) return "🛍️";
  if (lowerUrl.includes("netflix.com")) return "🎬";
  if (lowerUrl.includes("discord.com")) return "👾";

  return "🌐"; // Default
}

export function AppIcon({ node, onClick }: AppIconProps) {
  const [iconError, setIconError] = useState(false)
  const isFolder = !node.url

  // Local Chrome Favicon URL construction
  const faviconUrl = node.url
    ? `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(node.url)}&size=64`
    : null

  return (
    <div className="app-icon-container" onClick={() => onClick(node)}>
      <div className="app-icon-visual">
        {isFolder ? (
           <div className="folder-icon-preview">
             {/* Mini grid preview of first 4 items inside */}
             {node.children?.slice(0, 4).map(child => (
               <div key={child.id} className="mini-icon">
                 {child.url ? (
                   <img
                     src={`chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(child.url)}&size=32`}
                     alt=""
                     onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                     }}
                   />
                 ) : (
                    <div className="mini-folder-dot"></div>
                 )}
               </div>
             ))}
             {(!node.children || node.children.length === 0) && <Folder size={32} color="#fff" />}
           </div>
        ) : (
          !iconError ? (
            <img
              src={faviconUrl || ""}
              alt={node.title}
              className="favicon-img"
              onError={() => setIconError(true)}
            />
          ) : (
            <div className="favicon-fallback">
              {getEmojiFallback(node.title, node.url)}
            </div>
          )
        )}
      </div>
      <span className="app-icon-label">{node.title}</span>
    </div>
  )
}
