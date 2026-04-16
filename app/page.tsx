"use client"

import { useState } from "react"
import { BotSidebar } from "@/components/bot-sidebar"
import { CommandsPanel } from "@/components/commands-panel"
import { DashboardPanel } from "@/components/dashboard-panel"
import { PairingPanel } from "@/components/pairing-panel"
import { Menu, X } from "lucide-react"

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showPairing, setShowPairing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleCategorySelect = (category: string | null) => {
    setActiveCategory(category)
    setShowPairing(false)
    setSidebarOpen(false)
  }

  const handlePairClick = () => {
    setShowPairing(true)
    setActiveCategory(null)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "url('https://i.imgur.com/Qglq80d.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Overlay gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-background/95 to-background/90" />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/YmKZNR0.jpeg" 
              alt="LUST DEV0"
              className="w-8 h-8 rounded-full border border-primary"
            />
            <span className="font-bold text-foreground">LUST DEV0</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-secondary"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block fixed top-0 left-0 h-screen">
          <BotSidebar 
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
            onPairClick={handlePairClick}
            showPairing={showPairing}
          />
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] z-50">
              <BotSidebar 
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
                onPairClick={handlePairClick}
                showPairing={showPairing}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
          <div className="min-h-screen">
            {showPairing ? (
              <PairingPanel />
            ) : activeCategory ? (
              <CommandsPanel activeCategory={activeCategory} />
            ) : (
              <DashboardPanel onCategorySelect={handleCategorySelect} />
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 lg:ml-64 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-muted-foreground">
            © 2024 <span className="text-primary font-semibold">LUST DEV0</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Bot Online
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
