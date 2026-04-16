"use client"

import { useState, useEffect } from "react"
import { Smartphone, Link2, CheckCircle2, Loader2, Copy, RefreshCw } from "lucide-react"

export function PairingPanel() {
  const [pairingCode, setPairingCode] = useState("")
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "connected">("idle")
  const [copied, setCopied] = useState(false)

  const generateCode = () => {
    setStatus("generating")
    // Simulate code generation
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      setPairingCode(code)
      setStatus("ready")
    }, 2000)
  }

  useEffect(() => {
    generateCode()
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(pairingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="gradient-border rounded-2xl p-8 max-w-md w-full bg-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pair Your Device</h2>
          <p className="text-muted-foreground text-sm">
            Connectez votre WhatsApp au bot LUST DEV0
          </p>
        </div>

        {/* Pairing Code */}
        <div className="mb-8">
          {status === "generating" ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : status === "connected" ? (
            <div className="flex flex-col items-center py-6">
              <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
              <p className="text-primary font-semibold">Connected Successfully!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-background border border-border rounded-xl p-6 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Your Pairing Code</p>
                  <p className="text-3xl font-mono font-bold text-primary tracking-[0.3em] neon-text">
                    {pairingCode}
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <button
                onClick={generateCode}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Code
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground font-medium mb-2">Instructions:</p>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
            <p className="text-muted-foreground">{"Ouvrez WhatsApp sur votre téléphone"}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
            <p className="text-muted-foreground">{"Allez dans Paramètres → Appareils connectés"}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</span>
            <p className="text-muted-foreground">{"Sélectionnez \"Lier avec un code\" et entrez le code ci-dessus"}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${status === "ready" ? "bg-yellow-500 animate-pulse" : status === "connected" ? "bg-primary" : "bg-muted"}`} />
            <span className="text-muted-foreground">
              {status === "generating" && "Generating code..."}
              {status === "ready" && "Waiting for connection..."}
              {status === "connected" && "Connected to WhatsApp"}
              {status === "idle" && "Ready to pair"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
