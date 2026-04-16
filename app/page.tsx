"use client"

import { useState } from "react"
import { PairingPanel } from "@/components/pairing-panel"
import { BotDashboard } from "@/components/bot-dashboard"

export default function Home() {
  const [isPaired, setIsPaired] = useState(false)

  // Par defaut, on montre la page de pairing
  // Une fois connecte, on peut acceder au dashboard
  
  return (
    <main className="min-h-screen bg-background">
      {!isPaired ? (
        <PairingPanel />
      ) : (
        <BotDashboard />
      )}
    </main>
  )
}
