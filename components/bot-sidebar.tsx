"use client"

import { cn } from "@/lib/utils"
import { commandCategories } from "@/lib/commands"
import { 
  Shield, 
  Settings, 
  Lock, 
  Users, 
  PartyPopper, 
  Gamepad2, 
  Heart, 
  Coins,
  Link,
  Terminal,
  LayoutDashboard
} from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  "Modération": Shield,
  "Gestion": Settings,
  "Sécurité": Lock,
  "Utilisateurs": Users,
  "Fun": PartyPopper,
  "Jeux": Gamepad2,
  "Social": Heart,
  "Économie": Coins,
}

interface BotSidebarProps {
  activeCategory: string | null
  onCategorySelect: (category: string | null) => void
  onPairClick: () => void
  showPairing: boolean
}

export function BotSidebar({ activeCategory, onCategorySelect, onPairClick, showPairing }: BotSidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Bot Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://i.imgur.com/YmKZNR0.jpeg" 
              alt="LUST DEV0 Bot"
              className="w-12 h-12 rounded-full border-2 border-primary neon-glow"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-card animate-pulse-neon" />
          </div>
          <div>
            <h2 className="font-bold text-foreground neon-text">LUST DEV0</h2>
            <p className="text-xs text-muted-foreground">WhatsApp Bot</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => onCategorySelect(null)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              !activeCategory && !showPairing
                ? "bg-primary/20 text-primary border border-primary/50"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Pair Button */}
          <button
            onClick={onPairClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              showPairing
                ? "bg-primary/20 text-primary border border-primary/50"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Link className="w-4 h-4" />
            <span>Pair Device</span>
          </button>

          <div className="py-2">
            <p className="px-3 text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Commandes
            </p>
          </div>

          {/* Command Categories */}
          {commandCategories.map((category) => {
            const Icon = iconMap[category.name] || Terminal
            return (
              <button
                key={category.name}
                onClick={() => onCategorySelect(category.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  activeCategory === category.name
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded-full">
                  {category.commands.length}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Total Commands</span>
            <span className="text-primary font-mono">
              {commandCategories.reduce((acc, cat) => acc + cat.commands.length, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Categories</span>
            <span className="text-primary font-mono">{commandCategories.length}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
