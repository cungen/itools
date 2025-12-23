import { Power, Trash2, Pin, Search } from "lucide-react"
import { useState } from "react"
import { useExtensions } from "../hooks/useExtensions"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
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
      <div className="px-4 pb-3 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        {filteredExtensions.map(ext => (
          <Card
            key={ext.id}
            className={`${!ext.enabled ? 'opacity-60 grayscale' : ''} transition-all hover:shadow-md`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0">
                  {ext.iconUrl ? (
                    <img src={ext.iconUrl} alt="" className="w-full h-full object-contain rounded" />
                  ) : (
                    <div className="w-full h-full bg-muted text-muted-foreground flex items-center justify-center font-bold rounded text-lg">
                      {ext.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate" title={ext.name}>
                    {ext.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate" title={ext.description}>
                    {ext.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openDetails(ext.id)}
                    title="Pin to toolbar / Details (opens Chrome settings)"
                  >
                    <Pin size={16} />
                  </Button>
                  <Button
                    variant={ext.enabled ? "default" : "destructive"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleExtension(ext.id, !ext.enabled)}
                    title={ext.enabled ? "Disable" : "Enable"}
                  >
                    <Power size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => uninstallExtension(ext.id)}
                    title="Uninstall"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredExtensions.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No extensions found.
          </div>
        )}
      </div>
    </>
  )
}
