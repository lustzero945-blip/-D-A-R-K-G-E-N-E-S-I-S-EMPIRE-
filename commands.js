let warns = {};
let logs = [];

const signature = "\n⛧ DARK GENESIS EMPIRE ⛧";
const devSignature = "\n🔥 LUST DEV0 🔥";

const quotes = [
"Le silence commande plus que les cris.",
"Tu n'es pas indispensable.",
"Observer est déjà une forme de soumission.",
"Ici, seul l'ordre existe.",
"Chaque action a un prix.",
"Dominer ne fait pas de bruit.",
"Nous sommes venus… et tout s'est évanoui.",
"Votre groupe n'était qu'une illusion.",
"La fin était écrite avant le commencement."
];

const arrogantMessages = [
"⛧ Vous aviez une chance… vous l'avez gaspillée.",
"⛧ Pathétiques. Vos protestations n'intéressent personne.",
"⛧ C'était un honneur d'avoir pu vous anéantir.",
"⛧ Votre extinction était inévitable.",
"⛧ Nous sommes supérieurs. C'est accepté maintenant.",
"⛧ Adieu faibles créatures. Oubliez-nous si vous le pouvez.",
"⛧ Vous étiez des fourmis sous nos pas.",
"⛧ Merci d'avoir compris votre place.",
"⛧ L'ordre revient enfin… sans vous."
];

const q = () => quotes[Math.floor(Math.random()*quotes.length)];
const malice = () => arrogantMessages[Math.floor(Math.random()*arrogantMessages.length)];

// =========================
// INFO GROUPE
// =========================
async function infoCmd(sock, from, group) {
  await sock.sendMessage(from, {
    text: `⛧ SCAN SYSTEM ⛧\n\nNom: ${group.subject}\nMembres: ${group.participants.length}\n\n${q()}${signature}`
  });
}

// =========================
// ADMINS
// =========================
async function adminsCmd(sock, from, group) {
  const admins = group.participants.filter(p => p.admin);

  await sock.sendMessage(from, {
    text:
`👑 ADMINS 👑\n\n${
admins.map((a,i)=>`${i+1}. @${a.id.split("@")[0]}`).join("\n")
}
${signature}`,
    mentions: admins.map(a => a.id)
  });
}

// =========================
// TAG ALL
// =========================
async function tagAllCmd(sock, from, group) {
  let list = "";
  let mentions = [];

  group.participants.forEach((m,i)=>{
    list += `${i+1}. @${m.id.split("@")[0]}\n`;
    mentions.push(m.id);
  });

  await sock.sendMessage(from,{ 
    text:`⛧ DOMINATION SIGNAL ⛧\n\n${list}\n${q()}${signature}`,
    mentions
  });
}

// =========================
// WARN SYSTEM (3 STRIKES)
// =========================
async function warnCmd(sock, from, user, senderIsAdmin) {
  if (!user) return;

  warns[user] = (warns[user] || 0) + 1;

  if (warns[user] >= 3 && senderIsAdmin) {
    warns[user] = 0;

    await sock.sendMessage(from, {
      text: `⛧ PURGE SYSTEM ⛧\n@${user.split("@")[0]} atteint la limite.\n${signature}`,
      mentions: [user]
    });
  } else {
    await sock.sendMessage(from, {
      text: `⛧ WARNING ${warns[user]}/3 ⛧\n@${user.split("@")[0]}\n${q()}${signature}`,
      mentions: [user]
    });
  }
}

// =========================
// LOCK / UNLOCK
// =========================
async function lockCmd(sock, from, isAdmin) {
  if (!isAdmin) return;

  await sock.groupSettingUpdate(from, "announcement");

  await sock.sendMessage(from, {
    text: `⛧ LOCKED ⛧\nSilence imposé.${signature}`
  });
}

async function unlockCmd(sock, from, isAdmin) {
  if (!isAdmin) return;

  await sock.groupSettingUpdate(from, "not_announcement");

  await sock.sendMessage(from, {
    text: `⛧ UNLOCKED ⛧\nParlez.${signature}`
  });
}

// =========================
// KICK ALL
// =========================
async function kickAllCmd(sock, from, group, isAdmin) {
  if (!isAdmin) return;

  const membersToKick = group.participants.filter(p => !p.admin);

  if (membersToKick.length === 0) {
    await sock.sendMessage(from, {
      text: `⛧ KICK ALL ⛧\nAucun membre à expurger.\n${signature}`
    });
    return;
  }

  for (const member of membersToKick) {
    await sock.groupParticipantsUpdate(from, [member.id], "remove");
    
    pushLog(`[KICK] ${member.id.split("@")[0]} expulsé`);
  }

  await sock.sendMessage(from, {
    text: `⛧ MASSACRE TOTAL ⛧\n\n${membersToKick.length} membres ont été expurgés.\n\n${malice()}\n\n${q()}${signature}`
  });
}

// =========================
// PAIR - GENERATE DEVICE CODE
// =========================
async function pairCmd(sock, from, isAdmin) {
  // Générer un code d'appareil unique
  const deviceCode = generateDeviceCode();
  
  const pairingMessage = `\n⛧ DEVICE PAIRING CODE ⛧\n\n🔐 CODE: ${deviceCode}\n\n📱 APPAREIL: LUST DEV0\n🌐 CONNEXION: SECURED\n⏱ EXPIRATION: 10 MIN\n\n━━━━━━━━━━━━━━━━━━\nScannez ce code pour connecter\nvotre appareil au système DARK GENESIS.\n\n⛧ LUST DEV0 ⛧\n${devSignature}`;

  await sock.sendMessage(from, {
    text: pairingMessage
  });

  pushLog(`[PAIR] Nouveau code de pairing généré: ${deviceCode}`);
}

// =========================
// GENERATE DEVICE CODE
// =========================
function generateDeviceCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Format: XXXX-XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4, 6)}${Math.floor(Math.random()*100)}`;
}

// =========================
// LOGS
// =========================
async function logsCmd(sock, from, isAdmin) {
  if (!isAdmin) return;

  await sock.sendMessage(from, {
    text: `⛧ LOG SYSTEM ⛧\n\n${logs.slice(-15).join("\n")}${signature}`
  });
}

// =========================
// DARK QUOTE
// =========================
async function darkCmd(sock, from) {
  await sock.sendMessage(from, {
    text: `⛧ ${q()} ⛧${signature}`
  });
}

// =========================
// LOGGER
// =========================
function pushLog(action) {
  const timestamp = new Date().toLocaleTimeString();
  logs.push(`[${timestamp}] ${action}`);
}

module.exports = {
  infoCmd,
  adminsCmd,
  tagAllCmd,
  warnCmd,
  lockCmd,
  unlockCmd,
  kickAllCmd,
  pairCmd,
  logsCmd,
  darkCmd,
  pushLog,
  generateDeviceCode
};