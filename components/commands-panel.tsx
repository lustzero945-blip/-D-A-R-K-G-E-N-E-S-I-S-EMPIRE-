"use client"

import { useState } from "react"
import { commandCategories, type CommandCategory, type Command } from "@/lib/commands"
import { Search, Copy, CheckCircle2, Terminal, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandsPanelProps {
  activeCategory: string
}

export function CommandsPanel({ activeCategory }: CommandsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null)

  const category = commandCategories.find(c => c.name === activeCategory)
  
  if (!category) return null

  const filteredCommands = category.commands.filter(cmd => 
    cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  // Group commands by base name
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const baseName = cmd.name.split("_")[0]
    if (!acc[baseName]) {
      acc[baseName] = []
    }
    acc[baseName].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
        </div>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une commande..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold text-primary">{category.commands.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Filtered</p>
          <p className="text-2xl font-bold text-foreground">{filteredCommands.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Groups</p>
          <p className="text-2xl font-bold text-foreground">{Object.keys(groupedCommands).length}</p>
        </div>
      </div>

      {/* Commands Grid */}
      <div className="space-y-4">
        {Object.entries(groupedCommands).map(([baseName, commands]) => (
          <div key={baseName} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => setExpandedCommand(expandedCommand === baseName ? null : baseName)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-primary" />
                <span className="font-mono font-bold text-foreground">{baseName}</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {commands.length} variants
                </span>
              </div>
              <ChevronRight className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                expandedCommand === baseName && "rotate-90"
              )} />
            </button>

            {/* Expanded Commands */}
            {expandedCommand === baseName && (
              <div className="border-t border-border">
                {commands.map((cmd) => (
                  <div
                    key={cmd.name}
                    className="flex items-center justify-between p-3 px-4 hover:bg-secondary/30 transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-primary">{cmd.name}</code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{cmd.description}</p>
                    </div>
                    <button
                      onClick={() => copyCommand(cmd.name)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors ml-2"
                    >
                      {copiedCommand === cmd.name ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCommands.length === 0 && (
        <div className="text-center py-12">
          <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Aucune commande trouvée</p>
        </div>
      )}
    </div>
  )
}
