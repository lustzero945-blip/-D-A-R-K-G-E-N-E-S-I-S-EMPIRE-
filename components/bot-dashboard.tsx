"use client"

import { useState } from "react"
import { commandCategories, getVisibleCommands, hiddenCommands } from "@/lib/commands"
import { 
  Menu, X, Copy, CheckCircle2, ChevronDown, ChevronRight, 
  Shield, Zap, Users, Activity, Terminal, Eye, EyeOff,
  Skull, Ghost
} from "lucide-react"

export function BotDashboard() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopied(cmd)
    setTimeout(() => setCopied(null), 1500)
  }

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  const visibleCategories = commandCategories.filter(cat => !cat.hidden)

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('https://i.imgur.com/Qglq80d.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/80" />
      
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-xl border-r border-border
          transform transition-transform lg:transform-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Bot Profile */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="https://i.imgur.com/YmKZNR0.jpeg" 
                  alt="LUST DEV0"
                  className="w-16 h-16 rounded-full border-2 border-primary"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-card animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground">LUST DEV0</h1>
                <p className="text-xs text-muted-foreground font-mono">WhatsApp Bot</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/20 rounded text-xs text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 grid grid-cols-2 gap-2 border-b border-border">
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{getVisibleCommands()}</p>
              <p className="text-xs text-muted-foreground">Commands</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{visibleCategories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 overflow-y-auto h-[calc(100vh-280px)]">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Categories</p>
            <div className="space-y-1">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.name)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                    ${activeCategory === cat.name 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-secondary text-foreground"
                    }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                  <span className="ml-auto text-xs opacity-60">{cat.commands.length}</span>
                </button>
              ))}
            </div>

            {/* Hidden Commands Toggle - Secret */}
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowHidden(!showHidden)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all"
              >
                {showHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <span className="font-medium">Secret Commands</span>
                <Ghost className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-secondary"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {activeCategory || "Dashboard"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {activeCategory ? `${visibleCategories.find(c => c.name === activeCategory)?.commands.length || 0} commandes` : "Bienvenue sur LUST DEV0"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-sm text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  .menu
                </span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {!activeCategory && !showHidden ? (
              // Dashboard Home
              <div className="space-y-6">
                <div className="text-center py-8">
                  <img 
                    src="https://i.imgur.com/YmKZNR0.jpeg" 
                    alt="LUST DEV0"
                    className="w-24 h-24 rounded-full border-4 border-primary mx-auto mb-4 neon-glow"
                  />
                  <h1 className="text-3xl font-black text-foreground neon-text">LUST DEV0</h1>
                  <p className="text-muted-foreground mt-2">Tapez .menu dans WhatsApp pour voir les commandes</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                    <Shield className="w-8 h-8 text-red-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">72</p>
                    <p className="text-sm text-muted-foreground">Moderation</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                    <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">60</p>
                    <p className="text-sm text-muted-foreground">Fun & Games</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">48</p>
                    <p className="text-sm text-muted-foreground">Social</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
                    <Activity className="w-8 h-8 text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">108</p>
                    <p className="text-sm text-muted-foreground">Economy</p>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className="bg-card/80 backdrop-blur rounded-xl p-6 border border-border hover:border-primary transition-all text-left group"
                    >
                      <span className="text-3xl mb-3 block">{cat.icon}</span>
                      <h3 className={`text-lg font-bold ${cat.color}`}>{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                      <p className="text-xs text-primary mt-3 group-hover:underline">
                        {cat.commands.length} commandes →
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : showHidden ? (
              // Hidden Commands Panel
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                  <Skull className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="font-bold text-red-500">COMMANDES SECRETES - OWNER ONLY</h3>
                    <p className="text-sm text-red-400/80">Ces commandes sont invisibles et n'apparaissent pas dans .menu</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {hiddenCommands.map((cmd) => (
                    <div
                      key={cmd.name}
                      className="bg-card/80 backdrop-blur border border-red-500/20 rounded-xl p-4 flex items-center justify-between group hover:border-red-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                          ${cmd.power === "dangerous" ? "bg-red-500/20" : "bg-purple-500/20"}
                        `}>
                          {cmd.power === "dangerous" ? (
                            <Skull className="w-5 h-5 text-red-500" />
                          ) : (
                            <Ghost className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-foreground">{cmd.name}</p>
                          <p className="text-sm text-muted-foreground">{cmd.description}</p>
                          <p className="text-xs text-red-400/60 font-mono mt-1">{cmd.usage}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyCommand(cmd.name)}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copied === cmd.name ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Category Commands
              <div className="space-y-4">
                {visibleCategories
                  .filter(cat => cat.name === activeCategory)
                  .map(cat => (
                    <div key={cat.name}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">{cat.icon}</span>
                        <div>
                          <h2 className={`text-2xl font-bold ${cat.color}`}>{cat.name}</h2>
                          <p className="text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {cat.commands.map((cmd) => (
                          <div
                            key={cmd.name}
                            className="bg-card/80 backdrop-blur border border-border rounded-lg p-3 flex items-center justify-between group hover:border-primary/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <code className="px-2 py-1 bg-background rounded text-primary font-mono text-sm">
                                {cmd.name}
                              </code>
                              <span className="text-sm text-muted-foreground hidden sm:block">
                                {cmd.description}
                              </span>
                            </div>
                            <button
                              onClick={() => copyCommand(cmd.name)}
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {copied === cmd.name ? (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
