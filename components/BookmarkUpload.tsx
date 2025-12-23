import { useState } from "react"
import { Upload, FileText, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { parseHTMLBookmarks, parseCSVBookmarks } from "~/lib/bookmarkParsers"
import type { BookmarkNode } from "~/hooks/useBookmarks"
import "../style.css"

interface BookmarkUploadProps {
  onUploadSuccess: (bookmarks: BookmarkNode[]) => void
  onUploadError: (error: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function BookmarkUpload({ onUploadSuccess, onUploadError }: BookmarkUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string>("")

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const isHTML = file.type === "text/html" || file.name.endsWith(".html")
    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv")

    if (!isHTML && !isCSV) {
      const error = "Please select an HTML or CSV bookmark file"
      setUploadStatus("error")
      setStatusMessage(error)
      onUploadError(error)
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const error = `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      setUploadStatus("error")
      setStatusMessage(error)
      onUploadError(error)
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")
    setStatusMessage("")

    try {
      const fileContent = await file.text()
      let bookmarks: BookmarkNode[]

      if (isHTML) {
        bookmarks = parseHTMLBookmarks(fileContent)
      } else {
        bookmarks = parseCSVBookmarks(fileContent)
      }

      if (bookmarks.length === 0) {
        throw new Error("No bookmarks found in file")
      }

      setUploadStatus("success")
      setStatusMessage(`Successfully imported ${bookmarks.length} bookmark(s)`)
      onUploadSuccess(bookmarks)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to parse bookmark file. Please check the file format."
      setUploadStatus("error")
      setStatusMessage(errorMessage)
      onUploadError(errorMessage)
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Upload size={24} />
            <h3 className="text-lg font-semibold">Upload Bookmarks</h3>
          </div>

          <p className="text-sm text-slate-300 text-center max-w-md">
            Upload your bookmarks from an HTML or CSV file exported from your browser.
          </p>

          <div className="flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center gap-4 justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FileText size={16} />
                <span>HTML</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FileSpreadsheet size={16} />
                <span>CSV</span>
              </div>
            </div>

            <label htmlFor="bookmark-file-input">
              <input
                id="bookmark-file-input"
                type="file"
                accept=".html,.csv,text/html,text/csv"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="default"
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                asChild
              >
                <span className="cursor-pointer">
                  {isUploading ? "Processing..." : "Choose File"}
                </span>
              </Button>
            </label>

            {uploadStatus !== "idle" && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  uploadStatus === "success"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {uploadStatus === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span className="text-sm">{statusMessage}</span>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center mt-2">
              Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

