"use client"

import { commandCategories, getTotalCommands } from "@/lib/commands"
import { 
  Terminal, 
  Zap, 
  Shield, 
  Users, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react"

interface DashboardPanelProps {
  onCategorySelect: (category: string) => void
}

export function DashboardPanel({ onCategorySelect }: DashboardPanelProps) {
  const totalCommands = getTotalCommands()
  
  const stats = [
    { 
      label: "Total Commands", 
      value: totalCommands.toString(), 
      icon: Terminal, 
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      label: "Categories", 
      value: commandCategories.length.toString(), 
      icon: Zap, 
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    { 
      label: "Active Users", 
      value: "1.2K", 
      icon: Users, 
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Uptime", 
      value: "99.9%", 
      icon: Activity, 
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
  ]

  const recentActivity = [
    { action: ".ban", user: "+33 6** *** **42", time: "2 min ago", status: "success" },
    { action: ".mute", user: "+33 7** *** **18", time: "5 min ago", status: "success" },
    { action: ".warn", user: "+33 6** *** **91", time: "12 min ago", status: "success" },
    { action: ".kick", user: "+33 7** *** **55", time: "23 min ago", status: "success" },
    { action: ".unban", user: "+33 6** *** **33", time: "45 min ago", status: "success" },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to <span className="text-primary neon-text">LUST DEV0</span>
        </h1>
        <p className="text-muted-foreground">
          Puissant WhatsApp Bot - Moderation, Fun, Economy & More
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="gradient-border rounded-xl p-4 bg-card"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commandCategories.slice(0, 8).map((category) => (
            <button
              key={category.name}
              onClick={() => onCategorySelect(category.name)}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.commands.length} cmds
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <div>
                    <code className="text-sm font-mono text-primary">{activity.action}</code>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance
          </h2>
          <div className="space-y-4">
            {[
              { label: "Response Time", value: "45ms", percent: 95 },
              { label: "Success Rate", value: "99.8%", percent: 99 },
              { label: "Messages/Day", value: "12.5K", percent: 78 },
              { label: "Memory Usage", value: "256MB", percent: 32 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="text-foreground font-medium">{metric.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${metric.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bot Features */}
      <div className="mt-8 p-6 bg-card border border-border rounded-xl">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Bot Features
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Moderation", desc: "Ban, kick, mute, warn & more", icon: "🛡️" },
            { title: "Auto-Protection", desc: "Antispam, antiraid, blacklist", icon: "🔒" },
            { title: "Economy System", desc: "Balance, shop, daily rewards", icon: "💰" },
            { title: "Fun Commands", desc: "Jokes, memes, games", icon: "🎉" },
            { title: "Social Features", desc: "Ship, hug, slap interactions", icon: "💕" },
            { title: "Customization", desc: "Full command configuration", icon: "⚙️" },
          ].map((feature) => (
            <div key={feature.title} className="p-4 bg-secondary/30 rounded-lg">
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <h3 className="font-medium text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
