import { useState, useEffect } from "react";

const FAVICON_CACHE_KEY = "itools_favicon_cache";

export interface FaviconCache {
  [url: string]: string;
}

// Memory cache to avoid async blink on remount
const memoryCache: FaviconCache = {};

export function useFavicon(url?: string) {
  const [discoveredIcon, setDiscoveredIcon] = useState<string | null>(
    url ? memoryCache[url] || null : null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    // If already in memory cache, we're done
    if (memoryCache[url]) {
      if (discoveredIcon !== memoryCache[url]) {
         setDiscoveredIcon(memoryCache[url]);
      }
      return;
    }

    const fetchIcon = async () => {
      try {
        setLoading(true);

        // 1. Check Chrome Storage (Async)
        const storage = await chrome.storage.local.get(FAVICON_CACHE_KEY);
        const cache: FaviconCache = storage[FAVICON_CACHE_KEY] || {};

        if (cache[url]) {
          memoryCache[url] = cache[url];
          setDiscoveredIcon(cache[url]);
          setLoading(false);
          return;
        }

        // 2. Fetch HTML and Parse (only if not found in storage)
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Look for various icon tags
        const iconTags = [
          'link[rel="apple-touch-icon"]',
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="alternate icon"]'
        ];

        let iconHref: string | null = null;

        for (const selector of iconTags) {
          const el = doc.querySelector(selector);
          if (el && el.getAttribute("href")) {
            iconHref = el.getAttribute("href");
            break;
          }
        }

        if (iconHref) {
          // Resolve relative URL
          const absoluteUrl = new URL(iconHref, url).href;

          // Update Cache
          memoryCache[url] = absoluteUrl;
          cache[url] = absoluteUrl;
          await chrome.storage.local.set({ [FAVICON_CACHE_KEY]: cache });

          setDiscoveredIcon(absoluteUrl);
        }

      } catch (error) {
        // console.error("Failed to fetch favicon for", url, error);
      } finally {
        setLoading(false);
      }
    };

    fetchIcon();
  }, [url]);

  return { discoveredIcon, loading };
}
