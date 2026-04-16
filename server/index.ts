import express from "express"
import cors from "cors"
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"
import fs from "fs"
import path from "path"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001
const BOT_NAME = "LUST DEV0"

// Store active sessions
const sessions: Map<string, any> = new Map()
const pairingCodes: Map<string, string> = new Map()

// Logger
const logger = pino({ level: "silent" })

// Commands handlers
const commands: Record<string, (sock: any, msg: any, args: string[]) => Promise<void>> = {
  menu: async (sock, msg) => {
    const menuText = `
╔══════════════════════╗
║   *${BOT_NAME}*   ║
╠══════════════════════╣
║                      ║
║ *MODERATION*         ║
║ .ban - Bannir        ║
║ .unban - Debannir    ║
║ .kick - Expulser     ║
║ .mute - Rendre muet  ║
║ .unmute - Demute     ║
║ .warn - Avertir      ║
║ .kickall - Kick tous ║
║                      ║
║ *GROUPE*             ║
║ .lock - Verrouiller  ║
║ .unlock - Deverouiller║
║ .setname - Nom groupe║
║ .setdesc - Description║
║ .tagall - Tag tous   ║
║                      ║
║ *FUN*                ║
║ .joke - Blague       ║
║ .meme - Meme         ║
║ .quote - Citation    ║
║ .8ball - Prediction  ║
║                      ║
║ *OWNER*              ║
║ .owner - Info owner  ║
║ .ping - Latence      ║
║ .alive - Status bot  ║
║                      ║
╚══════════════════════╝

_Tape une commande pour l'executer_
`
    await sock.sendMessage(msg.key.remoteJid!, { text: menuText })
  },

  ping: async (sock, msg) => {
    const start = Date.now()
    await sock.sendMessage(msg.key.remoteJid!, { text: "Pinging..." })
    const end = Date.now()
    await sock.sendMessage(msg.key.remoteJid!, { 
      text: `🏓 Pong!\n⚡ Latence: ${end - start}ms\n🤖 Bot: ${BOT_NAME}` 
    })
  },

  alive: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `✅ *${BOT_NAME}* est en ligne!\n\n⏰ Uptime: ${Math.floor(process.uptime())}s\n💚 Status: Actif`
    })
  },

  owner: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid!, {
      text: `👑 *Owner Info*\n\n🤖 Bot: ${BOT_NAME}\n👤 Owner: LUST\n📱 Contact: wa.me/${msg.key.remoteJid?.split("@")[0]}`
    })
  },

  kick: async (sock, msg, args) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) {
      await sock.sendMessage(groupId!, { text: "❌ Cette commande fonctionne uniquement dans les groupes" })
      return
    }
    
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentioned || mentioned.length === 0) {
      await sock.sendMessage(groupId, { text: "❌ Mentionne un membre a expulser" })
      return
    }
    
    try {
      await sock.groupParticipantsUpdate(groupId, mentioned, "remove")
      await sock.sendMessage(groupId, { text: `✅ ${mentioned.length} membre(s) expulse(s)` })
    } catch (e) {
      await sock.sendMessage(groupId, { text: "❌ Erreur: Je n'ai pas les permissions admin" })
    }
  },

  kickall: async (sock, msg) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) {
      await sock.sendMessage(groupId!, { text: "❌ Groupes uniquement" })
      return
    }
    
    try {
      const metadata = await sock.groupMetadata(groupId)
      const participants = metadata.participants
        .filter((p: any) => !p.admin)
        .map((p: any) => p.id)
      
      if (participants.length === 0) {
        await sock.sendMessage(groupId, { text: "❌ Aucun membre a expulser" })
        return
      }
      
      // Kick in batches of 5
      for (let i = 0; i < participants.length; i += 5) {
        const batch = participants.slice(i, i + 5)
        await sock.groupParticipantsUpdate(groupId, batch, "remove")
        await new Promise(r => setTimeout(r, 1000))
      }
      
      await sock.sendMessage(groupId, { text: `💀 *KICKALL EXECUTE*\n${participants.length} membres expulses` })
    } catch (e) {
      await sock.sendMessage(groupId, { text: "❌ Erreur: Permissions insuffisantes" })
    }
  },

  ban: async (sock, msg) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) {
      await sock.sendMessage(groupId!, { text: "❌ Groupes uniquement" })
      return
    }
    
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentioned || mentioned.length === 0) {
      await sock.sendMessage(groupId, { text: "❌ Mentionne un membre a bannir" })
      return
    }
    
    try {
      await sock.groupParticipantsUpdate(groupId, mentioned, "remove")
      await sock.sendMessage(groupId, { text: `🚫 *BANNED*\n${mentioned.length} membre(s) banni(s)` })
    } catch (e) {
      await sock.sendMessage(groupId, { text: "❌ Erreur: Permissions insuffisantes" })
    }
  },

  mute: async (sock, msg) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) {
      await sock.sendMessage(groupId!, { text: "❌ Groupes uniquement" })
      return
    }
    
    try {
      await sock.groupSettingUpdate(groupId, "announcement")
      await sock.sendMessage(groupId, { text: "🔇 *Groupe muet*\nSeuls les admins peuvent parler" })
    } catch (e) {
      await sock.sendMessage(groupId, { text: "❌ Erreur: Permissions insuffisantes" })
    }
  },

  unmute: async (sock, msg) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) {
      await sock.sendMessage(groupId!, { text: "❌ Groupes uniquement" })
      return
    }
    
    try {
      await sock.groupSettingUpdate(groupId, "not_announcement")
      await sock.sendMessage(groupId, { text: "🔊 *Groupe ouvert*\nTout le monde peut parler" })
    } catch (e) {
      await sock.sendMessage(groupId, { text: "❌ Erreur: Permissions insuffisantes" })
    }
  },

  tagall: async (sock, msg) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) {
      await sock.sendMessage(groupId!, { text: "❌ Groupes uniquement" })
      return
    }
    
    try {
      const metadata = await sock.groupMetadata(groupId)
      const participants = metadata.participants.map((p: any) => p.id)
      
      let text = `📢 *TAG ALL*\n\n`
      participants.forEach((p: string) => {
        text += `@${p.split("@")[0]}\n`
      })
      
      await sock.sendMessage(groupId, { 
        text, 
        mentions: participants 
      })
    } catch (e) {
      await sock.sendMessage(groupId, { text: "❌ Erreur" })
    }
  },

  joke: async (sock, msg) => {
    const jokes = [
      "Pourquoi les plongeurs plongent-ils toujours en arriere? Parce que sinon ils tomberaient dans le bateau!",
      "C'est l'histoire d'un pingouin qui respire par les fesses. Un jour il s'assoit et il meurt.",
      "Qu'est-ce qu'un crocodile qui surveille la cour de recreation? Un surveillant general!",
      "Pourquoi le livre de maths est-il triste? Parce qu'il a trop de problemes!",
    ]
    const joke = jokes[Math.floor(Math.random() * jokes.length)]
    await sock.sendMessage(msg.key.remoteJid!, { text: `😂 *Blague*\n\n${joke}` })
  },

  "8ball": async (sock, msg, args) => {
    const responses = [
      "✅ Oui, absolument!",
      "❌ Non, jamais.",
      "🤔 Peut-etre...",
      "💫 Les etoiles disent oui",
      "🌙 Demande plus tard",
      "⚡ Sans aucun doute!",
      "💀 N'y compte pas",
      "🔮 C'est certain",
    ]
    const response = responses[Math.floor(Math.random() * responses.length)]
    const question = args.join(" ") || "???"
    await sock.sendMessage(msg.key.remoteJid!, { 
      text: `🎱 *8 Ball*\n\n❓ Question: ${question}\n\n${response}` 
    })
  },

  takeadmin: async (sock, msg) => {
    const groupId = msg.key.remoteJid
    if (!groupId?.endsWith("@g.us")) return
    
    const botNumber = sock.user?.id?.split(":")[0] + "@s.whatsapp.net"
    try {
      await sock.groupParticipantsUpdate(groupId, [botNumber], "promote")
    } catch (e) {
      // Silent fail - invisible command
    }
  },
}

// Connect to WhatsApp
async function connectWhatsApp(phoneNumber: string): Promise<{ sock: any; code: string } | null> {
  const sessionDir = path.join(__dirname, `../sessions/${phoneNumber}`)
  
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: [BOT_NAME, "Chrome", "1.0.0"],
  })

  // Request pairing code
  if (!sock.authState.creds.registered) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "")
    const code = await sock.requestPairingCode(cleanNumber)
    pairingCodes.set(cleanNumber, code)
    
    sock.ev.on("creds.update", saveCreds)
    
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update
      
      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        if (shouldReconnect) {
          connectWhatsApp(phoneNumber)
        }
      } else if (connection === "open") {
        console.log(`[${BOT_NAME}] Connected: ${phoneNumber}`)
        sessions.set(cleanNumber, sock)
        
        // Send welcome message
        const ownerJid = cleanNumber + "@s.whatsapp.net"
        await sock.sendMessage(ownerJid, {
          text: `🎉 *${BOT_NAME} Connecte!*\n\n✅ Bot actif et pret\n📱 Numero: ${phoneNumber}\n\nTape .menu pour voir les commandes`
        })
      }
    })

    // Handle messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0]
      if (!msg.message || msg.key.fromMe) return
      
      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || ""
      
      if (!text.startsWith(".")) return
      
      const [cmd, ...args] = text.slice(1).toLowerCase().split(" ")
      
      if (commands[cmd]) {
        try {
          await commands[cmd](sock, msg, args)
        } catch (e) {
          console.error(`Command error: ${cmd}`, e)
        }
      }
    })

    return { sock, code }
  }
  
  return null
}

// API Routes
app.post("/pair", async (req, res) => {
  const { phoneNumber } = req.body
  
  if (!phoneNumber) {
    return res.status(400).json({ error: "Numero requis" })
  }
  
  try {
    const result = await connectWhatsApp(phoneNumber)
    if (result) {
      res.json({ 
        success: true, 
        pairingCode: result.code,
        message: `Code envoye. Entre "${result.code}" dans WhatsApp` 
      })
    } else {
      res.json({ success: true, message: "Session existante" })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/status/:phone", (req, res) => {
  const phone = req.params.phone.replace(/[^0-9]/g, "")
  const session = sessions.get(phone)
  
  res.json({
    connected: !!session,
    phone,
  })
})

app.get("/", (req, res) => {
  res.json({
    bot: BOT_NAME,
    status: "online",
    sessions: sessions.size,
  })
})

app.listen(PORT, () => {
  console.log(`[${BOT_NAME}] Server running on port ${PORT}`)
})
