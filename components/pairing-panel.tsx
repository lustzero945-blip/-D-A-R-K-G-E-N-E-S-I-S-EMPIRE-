"use client"

import { useState } from "react"
import { Smartphone, CheckCircle2, Loader2, Copy, RefreshCw, Zap, Shield, Link2 } from "lucide-react"

export function PairingPanel() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pairingCode, setPairingCode] = useState("")
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "connected">("idle")
  const [copied, setCopied] = useState(false)

  const generateCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      return
    }
    setStatus("generating")
    setTimeout(() => {
      const code = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      setPairingCode(code)
      setStatus("ready")
    }, 2500)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(pairingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetPairing = () => {
    setPhoneNumber("")
    setPairingCode("")
    setStatus("idle")
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('https://i.imgur.com/Qglq80d.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Bot Profile Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img 
              src="https://i.imgur.com/YmKZNR0.jpeg" 
              alt="LUST DEV0"
              className="w-28 h-28 rounded-full border-4 border-primary mx-auto neon-glow"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-primary rounded-full border-2 border-background animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white mt-4 neon-text">LUST DEV0</h1>
          <p className="text-primary text-sm font-mono mt-1">WhatsApp Multi-Device Bot</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 bg-primary/20 border border-primary/50 rounded-full text-xs text-primary">v2.0.0</span>
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs text-red-400">POWER MODE</span>
          </div>
        </div>

        {/* Pairing Card */}
        <div className="gradient-border rounded-2xl p-6 bg-card/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Pair Device</h2>
              <p className="text-sm text-muted-foreground">Connectez votre WhatsApp</p>
            </div>
          </div>

          {status === "idle" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Numero de telephone (avec indicatif pays)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="+243 XXX XXX XXX"
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Exemple: +243812345678 ou +33612345678</p>
              </div>

              <button
                onClick={generateCode}
                disabled={phoneNumber.length < 10}
                className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 transition-all neon-glow"
              >
                <Zap className="w-5 h-5" />
                Generer le Code
              </button>
            </div>
          )}

          {status === "generating" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Generation du code pour</p>
              <p className="text-primary font-mono font-bold">{phoneNumber}</p>
            </div>
          )}

          {status === "ready" && (
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-background border-2 border-primary rounded-xl p-6 text-center neon-glow">
                  <p className="text-xs text-muted-foreground mb-2">Votre Code de Jumelage</p>
                  <p className="text-4xl font-mono font-black text-primary tracking-widest neon-text">
                    {pairingCode}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{phoneNumber}</p>
                </div>
                <button
                  onClick={copyCode}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-background/50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Comment utiliser:</p>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                  <p className="text-sm text-muted-foreground">Ouvrez WhatsApp sur votre telephone</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                  <p className="text-sm text-muted-foreground">Menu → Appareils connectes → Connecter un appareil</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
                  <p className="text-sm text-muted-foreground">{"Cliquez sur \"Lier avec un numero\" et entrez le code"}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generateCode}
                  className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nouveau Code
                </button>
                <button
                  onClick={resetPairing}
                  className="flex-1 py-3 rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive font-medium transition-colors"
                >
                  Changer Numero
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">En attente de connexion...</span>
              </div>
            </div>
          )}

          {status === "connected" && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
              <p className="text-xl font-bold text-primary">Connecte avec succes!</p>
              <p className="text-muted-foreground text-sm mt-2">Utilisez .menu pour voir les commandes</p>
              <button
                onClick={resetPairing}
                className="mt-6 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors"
              >
                Connecter un autre appareil
              </button>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}
