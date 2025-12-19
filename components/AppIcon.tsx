import { useState } from "react"
import { Folder, Globe } from "lucide-react"
import type { BookmarkNode } from "../hooks/useBookmarks"
import "../style.css"

interface AppIconProps {
  node: BookmarkNode
  onClick: (node: BookmarkNode) => void
  variant?: 'grid' | 'list' | 'gallery'
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

import { useFavicon } from "../hooks/useFavicon"

function MiniFavicon({ node }: { node: BookmarkNode }) {
  const { discoveredIcon } = useFavicon(node.url)
  const [fallbackLevel, setFallbackLevel] = useState(0)

  if (!node.url) return <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>

  const getFaviconUrls = (url: string, discovered?: string | null) => {
    try {
      const hostname = new URL(url).hostname
      const urls = [
        `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`,
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=32`,
        `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
      ]
      if (discovered) urls.unshift(discovered)
      return urls
    } catch (e) {
      return []
    }
  }

  const urls = getFaviconUrls(node.url, discoveredIcon)
  const currentUrl = urls[fallbackLevel] || ""

  return (
    <img
      key={currentUrl}
      src={currentUrl}
      alt=""
      className="w-4 h-4 object-contain"
      onError={() => {
        if (fallbackLevel < urls.length - 1) {
          setFallbackLevel(prev => prev + 1)
        }
      }}
    />
  )
}

export function AppIcon({ node, onClick, variant = 'grid' }: AppIconProps) {
  const [fallbackLevel, setFallbackLevel] = useState(0)
  const isFolder = !node.url
  const { discoveredIcon } = useFavicon(node.url)

  // List of favicon services to try in order
  const getFaviconUrls = (url: string, size: number, discovered?: string | null) => {
    try {
      const hostname = new URL(url).hostname
      const urls = [
        `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=${size}`,
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=${size}`,
        `https://www.google.com/s2/favicons?domain=${hostname}&sz=${size}`,
        `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
        `${new URL(url).origin}/favicon.ico`,
        `${new URL(url).origin}/favicon.png`,
        `${new URL(url).origin}/favicon.svg`,
        `${new URL(url).origin}/assets/favicon.ico`,
        `${new URL(url).origin}/assets/favicon.png`,
        `${new URL(url).origin}/assets/favicon.svg`,
      ]

      // If we have a discovered icon from HTML parsing, put it at the front (or after Chrome service)
      if (discovered) {
         urls.unshift(discovered)
      }

      return urls
    } catch (e) {
      return []
    }
  }

  const faviconUrls = node.url ? getFaviconUrls(node.url, 64, discoveredIcon) : []
  const currentFaviconUrl = faviconUrls[fallbackLevel] || ""

  const handleIconError = () => {
    if (fallbackLevel < faviconUrls.length - 1) {
      setFallbackLevel(prev => prev + 1)
    } else {
      setFallbackLevel(-1) // Signal to use emoji fallback
    }
  }

  const getSafeHostname = (url?: string) => {
    if (!url) return ""
    try {
      return new URL(url).hostname
    } catch {
      return ""
    }
  }

  if (variant === 'list') {
    return (
      <div
        className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group"
        onClick={() => onClick(node)}
      >
        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5">
           {isFolder ? (
             <Folder size={20} color="#fff" strokeWidth={1.5} />
           ) : (
             fallbackLevel !== -1 ? (
               <img key={currentFaviconUrl} src={currentFaviconUrl} alt="" className="w-6 h-6 object-contain" onError={handleIconError} />
             ) : (
               <div className="text-xl">{getEmojiFallback(node.title, node.url)}</div>
             )
           )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-white font-medium truncate text-sm">{node.title}</span>
          {node.url && <span className="text-white/40 text-[11px] truncate">{getSafeHostname(node.url)}</span>}
        </div>
      </div>
    )
  }

  if (variant === 'gallery') {
    return (
      <div
        className="w-full flex flex-col gap-3 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-[24px] cursor-pointer transition-all duration-300 border border-white/10 group hover:-translate-y-1 hover:shadow-2xl"
        onClick={() => onClick(node)}
      >
        <div className="w-full aspect-square bg-black/20 rounded-[18px] flex items-center justify-center overflow-hidden border border-white/5">
           {isFolder ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-1 p-3 w-full h-full">
                {node.children?.slice(0, 4).map(child => (
                  <div key={child.id} className="w-full h-full flex items-center justify-center bg-white/5 rounded-lg">
                    <MiniFavicon node={child} />
                  </div>
                ))}
                {(!node.children || node.children.length === 0) && <Folder size={48} color="#fff" strokeWidth={1} className="opacity-50" />}
              </div>
           ) : (
             fallbackLevel !== -1 ? (
               <img key={currentFaviconUrl} src={currentFaviconUrl} alt="" className="w-16 h-16 object-contain drop-shadow-2xl" onError={handleIconError} />
             ) : (
               <div className="text-5xl">{getEmojiFallback(node.title, node.url)}</div>
             )
           )}
        </div>
        <div className="px-1">
          <span className="text-white font-semibold truncate text-sm block">{node.title}</span>
          <span className="text-white/40 text-xs truncate block">{isFolder ? `${node.children?.length || 0} items` : getSafeHostname(node.url)}</span>
        </div>
      </div>
    )
  }

  // Default Grid
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer w-[100px] group transition-all duration-200" onClick={() => onClick(node)}>
      <div className="w-[68px] h-[68px] bg-white/10 backdrop-blur-xl rounded-[22px] flex items-center justify-center overflow-hidden shadow-lg border border-white/10 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-white/30">
        {isFolder ? (
           <div className="grid grid-cols-2 grid-rows-2 gap-[2px] p-2.5 w-full h-full">
             {node.children?.slice(0, 4).map(child => (
               <div key={child.id} className="w-full h-full flex items-center justify-center">
                 <MiniFavicon node={child} />
               </div>
             ))}
             {(!node.children || node.children.length === 0) && <Folder size={32} color="#fff" strokeWidth={1.5} />}
           </div>
        ) : (
          fallbackLevel !== -1 ? (
            <img
              key={currentFaviconUrl} // Key helps reload img correctly when URL changes
              src={currentFaviconUrl}
              alt={node.title}
              className="w-12 h-12 object-contain"
              onError={handleIconError}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-3xl">
              {getEmojiFallback(node.title, node.url)}
            </div>
          )
        )}
      </div>
      <span className="text-[13px] text-white font-medium text-center w-full truncate px-1 drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis">{node.title}</span>
    </div>
  )
}
