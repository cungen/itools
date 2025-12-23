import type { BookmarkNode } from "~/hooks/useBookmarks"

/**
 * Parse HTML bookmark file (Netscape format)
 * @param htmlContent - The HTML content of the bookmark file
 * @returns Array of BookmarkNode representing the bookmark tree
 */
export function parseHTMLBookmarks(htmlContent: string): BookmarkNode[] {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, "text/html")
    const dlElements = doc.querySelectorAll("dl")

    if (dlElements.length === 0) {
      throw new Error("No bookmark structure found in HTML file")
    }

    // Start with the root DL element
    const rootDl = dlElements[0]
    const bookmarks: BookmarkNode[] = []
    let nodeIdCounter = 1

    const parseDL = (dl: Element, parentId?: string): BookmarkNode[] => {
      const nodes: BookmarkNode[] = []
      let currentChild = dl.firstElementChild

      while (currentChild) {
        if (currentChild.tagName === "DT") {
          const aTag = currentChild.querySelector("a")
          const h3Tag = currentChild.querySelector("h3")

          if (aTag) {
            // It's a bookmark
            const href = aTag.getAttribute("href") || ""
            const title = aTag.textContent?.trim() || "Untitled"
            const addDate = aTag.getAttribute("add_date")
            const id = `bookmark_${nodeIdCounter++}`

            nodes.push({
              id,
              title,
              url: href,
              parentId,
            })
          } else if (h3Tag) {
            // It's a folder
            const folderName = h3Tag.textContent?.trim() || "Untitled Folder"
            const folderId = `folder_${nodeIdCounter++}`

            // Find the nested DL element for this folder
            let nextSibling = currentChild.nextElementSibling
            let nestedDl: Element | null = null

            while (nextSibling) {
              if (nextSibling.tagName === "DL") {
                nestedDl = nextSibling
                break
              }
              if (nextSibling.tagName === "DT") {
                break
              }
              nextSibling = nextSibling.nextElementSibling
            }

            const folderNode: BookmarkNode = {
              id: folderId,
              title: folderName,
              parentId,
            }

            if (nestedDl) {
              folderNode.children = parseDL(nestedDl, folderId)
            }

            nodes.push(folderNode)
          }
        }

        currentChild = currentChild.nextElementSibling
      }

      return nodes
    }

    return parseDL(rootDl)
  } catch (error) {
    throw new Error(
      `Failed to parse HTML bookmarks: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Parse CSV bookmark file
 * Expected format: title,url,folder_path (or similar variations)
 * @param csvContent - The CSV content of the bookmark file
 * @returns Array of BookmarkNode representing the bookmark tree
 */
export function parseCSVBookmarks(csvContent: string): BookmarkNode[] {
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim().length > 0)

    if (lines.length === 0) {
      throw new Error("CSV file is empty")
    }

    // Parse header to determine column positions
    const header = lines[0].split(",").map((col) => col.trim().toLowerCase())
    const titleIndex = header.findIndex((col) =>
      ["title", "name", "bookmark"].includes(col)
    )
    const urlIndex = header.findIndex((col) => ["url", "link", "href"].includes(col))
    const folderIndex = header.findIndex((col) =>
      ["folder", "path", "folder_path", "category"].includes(col)
    )

    if (titleIndex === -1 || urlIndex === -1) {
      throw new Error(
        "CSV file must contain 'title' and 'url' columns (case-insensitive)"
      )
    }

    // Build bookmark tree from flat CSV structure
    const bookmarkMap = new Map<string, BookmarkNode>()
    const rootNodes: BookmarkNode[] = []
    let nodeIdCounter = 1

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      if (values.length <= Math.max(titleIndex, urlIndex)) {
        continue // Skip invalid rows
      }

      const title = values[titleIndex]?.trim() || "Untitled"
      const url = values[urlIndex]?.trim() || ""
      const folderPath = folderIndex >= 0 ? values[folderIndex]?.trim() : ""

      if (!title && !url) {
        continue // Skip empty rows
      }

      const id = `bookmark_${nodeIdCounter++}`

      // Build folder hierarchy
      let parentId: string | undefined
      let currentPath = ""

      if (folderPath) {
        const folderParts = folderPath.split("/").filter((p) => p.trim().length > 0)

        for (let j = 0; j < folderParts.length; j++) {
          const folderName = folderParts[j].trim()
          currentPath = j === 0 ? folderName : `${currentPath}/${folderName}`
          const folderId = `folder_${currentPath}`

          if (!bookmarkMap.has(folderId)) {
            const folderNode: BookmarkNode = {
              id: folderId,
              title: folderName,
              parentId: j > 0 ? bookmarkMap.get(`folder_${folderParts.slice(0, j).join("/")}`)?.id : undefined,
              children: [],
            }
            bookmarkMap.set(folderId, folderNode)

            // Add to root or parent
            if (j === 0) {
              if (!rootNodes.find((n) => n.id === folderId)) {
                rootNodes.push(folderNode)
              }
            } else {
              const parentFolderId = `folder_${folderParts.slice(0, j).join("/")}`
              const parentFolder = bookmarkMap.get(parentFolderId)
              if (parentFolder && !parentFolder.children) {
                parentFolder.children = []
              }
              if (parentFolder && !parentFolder.children?.find((n) => n.id === folderId)) {
                parentFolder.children?.push(folderNode)
              }
            }
          }

          parentId = folderId
        }
      }

      // Create bookmark node
      const bookmarkNode: BookmarkNode = {
        id,
        title,
        url: url || undefined,
        parentId,
      }

      if (parentId) {
        const parentFolder = bookmarkMap.get(parentId)
        if (parentFolder) {
          if (!parentFolder.children) {
            parentFolder.children = []
          }
          parentFolder.children.push(bookmarkNode)
        }
      } else {
        rootNodes.push(bookmarkNode)
      }
    }

    return rootNodes
  } catch (error) {
    throw new Error(
      `Failed to parse CSV bookmarks: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Parse a CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of value
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  // Add last value
  values.push(current)

  return values
}

