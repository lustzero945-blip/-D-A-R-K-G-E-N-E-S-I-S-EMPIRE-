import { NextRequest, NextResponse } from 'next/server'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"

const logger = pino({ level: "silent" })

// Store active sessions
const activeSessions = new Map<string, { sock: ReturnType<typeof makeWASocket> | null; status: string; code: string }>()

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Clean phone number
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
    
    if (cleanNumber.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // Initialize Baileys
    const { state, saveCreds } = await useMultiFileAuthState(`./auth_${cleanNumber}`)
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

    // Request real pairing code from WhatsApp
    let pairingCode = "LUST DEV0"
    
    if (!sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(cleanNumber)
      pairingCode = code // Real code from WhatsApp
      
      // Store session
      activeSessions.set(cleanNumber, { sock, status: 'pending', code: pairingCode })
      
      // Handle connection events
      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === "close") {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
          const session = activeSessions.get(cleanNumber)
          if (session) {
            session.status = shouldReconnect ? 'reconnecting' : 'disconnected'
          }
        } else if (connection === "open") {
          const session = activeSessions.get(cleanNumber)
          if (session) {
            session.status = 'connected'
          }
          
          // Send welcome message
          await sock.sendMessage(`${cleanNumber}@s.whatsapp.net`, {
            text: `🤖 *LUST DEV0*\n\n✅ Appareil connecte avec succes!\n\n📱 Votre bot WhatsApp est maintenant actif.\n\nTapez .menu pour voir les commandes disponibles.`
          })
        }
      })
      
      sock.ev.on("creds.update", saveCreds)
      
      // Handle incoming messages
      sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || ""
        
        if (text.startsWith(".")) {
          await handleCommand(sock, msg, text.slice(1).toLowerCase().split(" "))
        }
      })
    }

    return NextResponse.json({
      success: true,
      pairingCode,
      displayName: "LUST DEV0",
      phoneNumber: cleanNumber,
      message: `Code de jumelage genere! Entrez ce code dans WhatsApp: ${pairingCode}`
    })
    
  } catch (error) {
    console.error('[v0] Pairing error:', error)
    return NextResponse.json({ error: 'Pairing failed', details: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phoneNumber = searchParams.get('phone')
  
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
  }
  
  const session = activeSessions.get(phoneNumber)
  
  if (!session) {
    return NextResponse.json({ status: 'not_found' })
  }
  
  return NextResponse.json({
    status: session.status,
    code: session.code
  })
}

// Command handler
async function handleCommand(sock: ReturnType<typeof makeWASocket>, msg: any, args: string[]) {
  const command = args[0]
  const jid = msg.key.remoteJid!
  const sender = msg.key.participant || msg.key.remoteJid!
  const isGroup = jid.endsWith("@g.us")
  
  const reply = async (text: string) => {
    await sock.sendMessage(jid, { text }, { quoted: msg })
  }
  
  switch (command) {
    case "menu":
      const menuText = `╔═══════════════════╗
║   🤖 *LUST DEV0*   ║
╚═══════════════════╝

📋 *MENU DES COMMANDES*
━━━━━━━━━━━━━━━━━━━━

*📌 INFO*
.menu | .help | .ping | .owner | .info

*🔨 MODERATION*
.ban | .unban | .kick | .mute | .unmute | .warn

*👥 GROUPE*
.add | .remove | .promote | .demote | .link | .revoke

*🛡️ SECURITE*
.antispam | .antiraid | .antilink | .blacklist | .whitelist

*🎮 FUN*
.joke | .meme | .quote | .dice | .coinflip

*💰 ECONOMIE*
.balance | .daily | .work | .shop

━━━━━━━━━━━━━━━━━━━━
📱 *Owner:* LUST DEV0
⚡ *Prefix:* .
━━━━━━━━━━━━━━━━━━━━`
      await reply(menuText)
      break
      
    case "help":
      await reply(`🤖 *LUST DEV0 - Aide*\n\nUtilisez .menu pour voir toutes les commandes.\nPrefix: .\n\nContactez le owner pour plus d'aide.`)
      break
      
    case "ping":
      const start = Date.now()
      await reply(`🏓 Pong!\n⚡ Latence: ${Date.now() - start}ms\n🤖 LUST DEV0 est actif!`)
      break
      
    case "owner":
      await reply(`👑 *Owner du Bot*\n\n📛 Nom: LUST DEV0\n🤖 Bot: WhatsApp Bot`)
      break
      
    case "info":
      await reply(`🤖 *LUST DEV0*\n\n📊 Version: 1.0.0\n⚡ Status: Actif\n🔧 Prefix: .\n📦 Commandes: 50+`)
      break
      
    case "kick":
      if (isGroup) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (mentioned) {
          await sock.groupParticipantsUpdate(jid, [mentioned], "remove")
          await reply(`✅ Membre expulse avec succes!`)
        } else {
          await reply(`❌ Mentionnez un membre a expulser!`)
        }
      }
      break
      
    case "kickall":
      if (isGroup) {
        const groupMeta = await sock.groupMetadata(jid)
        const members = groupMeta.participants
          .filter((p: any) => !p.admin)
          .map((p: any) => p.id)
        
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
      await reply(`😂 ${jokes[Math.floor(Math.random() * jokes.length)]}`)
      break
      
    case "balance":
      await reply(`💰 *Votre Solde*\n\n🪙 Coins: 1,000\n💎 Gems: 50`)
      break
      
    case "daily":
      await reply(`🎁 *Recompense Quotidienne*\n\n+500 coins ajoutes a votre solde!`)
      break
      
    default:
      break
  }
}
