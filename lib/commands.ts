export interface Command {
  name: string
  description: string
  usage: string
  category: string
  hidden?: boolean
  power?: "normal" | "dangerous" | "secret"
}

export interface CommandCategory {
  name: string
  icon: string
  description: string
  commands: Command[]
  color: string
  hidden?: boolean
}

const createCommandVariants = (base: string, description: string, power: "normal" | "dangerous" | "secret" = "normal"): Command[] => {
  const variants = ["", "_user", "_server", "_id", "_logs", "_reason", "_add", "_remove", "_set", "_list", "_info", "_all"]
  return variants.map(variant => ({
    name: `.${base}${variant}`,
    description: variant === "" ? description : `${description} - ${variant.replace("_", "").toUpperCase()}`,
    usage: `.${base}${variant} [target]`,
    category: base,
    power
  }))
}

// HIDDEN SECRET COMMANDS - Ces commandes n'apparaissent pas dans .menu
export const hiddenCommands: Command[] = [
  {
    name: ".kickall",
    description: "Expulse TOUS les membres du groupe instantanement",
    usage: ".kickall [confirm]",
    category: "secret",
    hidden: true,
    power: "dangerous"
  },
  {
    name: ".antikickall",
    description: "Protection invisible contre le kickall - personne ne voit cette commande",
    usage: ".antikickall [on/off]",
    category: "secret",
    hidden: true,
    power: "secret"
  },
  {
    name: ".takeadminingroup",
    description: "Devient admin du groupe de maniere invisible",
    usage: ".takeadminingroup",
    category: "secret",
    hidden: true,
    power: "secret"
  },
  {
    name: ".invisible",
    description: "Rend le bot invisible - les commandes fonctionnent sans afficher de message",
    usage: ".invisible [on/off]",
    category: "secret",
    hidden: true,
    power: "secret"
  },
  {
    name: ".ghostmode",
    description: "Mode fantome - le bot execute les commandes sans laisser de trace",
    usage: ".ghostmode [on/off]",
    category: "secret",
    hidden: true,
    power: "secret"
  },
  {
    name: ".takeowner",
    description: "Prend le controle total du groupe",
    usage: ".takeowner",
    category: "secret",
    hidden: true,
    power: "dangerous"
  },
  {
    name: ".crashgroup",
    description: "Crash le groupe cible",
    usage: ".crashgroup [target]",
    category: "secret",
    hidden: true,
    power: "dangerous"
  },
  {
    name: ".spamkick",
    description: "Kick en boucle un utilisateur",
    usage: ".spamkick @user [count]",
    category: "secret",
    hidden: true,
    power: "dangerous"
  },
  {
    name: ".bypassban",
    description: "Ignore les bans et rejoint quand meme",
    usage: ".bypassban [grouplink]",
    category: "secret",
    hidden: true,
    power: "secret"
  },
  {
    name: ".stealthjoin",
    description: "Rejoint un groupe sans notification",
    usage: ".stealthjoin [link]",
    category: "secret",
    hidden: true,
    power: "secret"
  }
]

export const commandCategories: CommandCategory[] = [
  {
    name: "Menu",
    icon: "📜",
    description: "Commandes principales",
    color: "text-primary",
    commands: [
      { name: ".menu", description: "Affiche le menu principal avec toutes les commandes", usage: ".menu", category: "menu", power: "normal" },
      { name: ".help", description: "Aide et informations sur une commande", usage: ".help [command]", category: "menu", power: "normal" },
      { name: ".ping", description: "Verifier la latence du bot", usage: ".ping", category: "menu", power: "normal" },
      { name: ".info", description: "Informations sur le bot", usage: ".info", category: "menu", power: "normal" },
      { name: ".owner", description: "Contacter le proprietaire", usage: ".owner", category: "menu", power: "normal" },
      { name: ".stats", description: "Statistiques du bot", usage: ".stats", category: "menu", power: "normal" },
    ]
  },
  {
    name: "Moderation",
    icon: "🛡️",
    description: "Commandes de moderation du serveur",
    color: "text-red-500",
    commands: [
      ...createCommandVariants("ban", "Bannir un utilisateur", "dangerous"),
      ...createCommandVariants("unban", "Debannir un utilisateur"),
      ...createCommandVariants("kick", "Expulser un utilisateur", "dangerous"),
      ...createCommandVariants("mute", "Rendre muet un utilisateur"),
      ...createCommandVariants("unmute", "Retirer le mute"),
      ...createCommandVariants("warn", "Avertir un utilisateur"),
    ]
  },
  {
    name: "Gestion",
    icon: "⚙️",
    description: "Gestion du serveur et des messages",
    color: "text-blue-500",
    commands: [
      ...createCommandVariants("clear", "Effacer des messages"),
      ...createCommandVariants("purge", "Purger des messages"),
      ...createCommandVariants("lock", "Verrouiller un salon"),
      ...createCommandVariants("unlock", "Deverrouiller un salon"),
      ...createCommandVariants("slowmode", "Activer le mode lent"),
    ]
  },
  {
    name: "Securite",
    icon: "🔒",
    description: "Protection et securite",
    color: "text-yellow-500",
    commands: [
      ...createCommandVariants("antispam", "Protection anti-spam"),
      ...createCommandVariants("antiraid", "Protection anti-raid"),
      ...createCommandVariants("blacklist", "Liste noire"),
      ...createCommandVariants("whitelist", "Liste blanche"),
    ]
  },
  {
    name: "Utilisateurs",
    icon: "👤",
    description: "Gestion des utilisateurs",
    color: "text-purple-500",
    commands: [
      ...createCommandVariants("nickname", "Changer le pseudo"),
      ...createCommandVariants("report", "Signaler un utilisateur"),
      ...createCommandVariants("case", "Voir un cas"),
      ...createCommandVariants("infractions", "Voir les infractions"),
    ]
  },
  {
    name: "Fun",
    icon: "🎉",
    description: "Commandes amusantes",
    color: "text-green-500",
    commands: [
      ...createCommandVariants("joke", "Raconter une blague"),
      ...createCommandVariants("meme", "Envoyer un meme"),
      ...createCommandVariants("gif", "Envoyer un GIF"),
      ...createCommandVariants("quote", "Citation aleatoire"),
      ...createCommandVariants("roast", "Roast quelqu'un"),
    ]
  },
  {
    name: "Jeux",
    icon: "🎮",
    description: "Mini-jeux interactifs",
    color: "text-cyan-500",
    commands: [
      ...createCommandVariants("8ball", "Boule magique"),
      ...createCommandVariants("dice", "Lancer un de"),
      ...createCommandVariants("coinflip", "Pile ou face"),
      ...createCommandVariants("trivia", "Quiz"),
    ]
  },
  {
    name: "Social",
    icon: "💕",
    description: "Interactions sociales",
    color: "text-pink-500",
    commands: [
      ...createCommandVariants("ship", "Compatibilite amoureuse"),
      ...createCommandVariants("love", "Calculer l'amour"),
      ...createCommandVariants("slap", "Gifler quelqu'un"),
      ...createCommandVariants("hug", "Faire un calin"),
      ...createCommandVariants("dance", "Danser"),
    ]
  },
  {
    name: "Economie",
    icon: "💰",
    description: "Systeme economique",
    color: "text-amber-500",
    commands: [
      ...createCommandVariants("balance", "Voir son solde"),
      ...createCommandVariants("daily", "Recompense quotidienne"),
      ...createCommandVariants("work", "Travailler"),
      ...createCommandVariants("crime", "Commettre un crime"),
      ...createCommandVariants("rob", "Voler quelqu'un"),
      ...createCommandVariants("deposit", "Deposer de l'argent"),
      ...createCommandVariants("withdraw", "Retirer de l'argent"),
      ...createCommandVariants("shop", "Boutique"),
      ...createCommandVariants("buy", "Acheter un article"),
    ]
  },
  // HIDDEN CATEGORY - n'apparait pas dans le menu normal
  {
    name: "Secret",
    icon: "👁️",
    description: "Commandes secretes - OWNER ONLY",
    color: "text-red-600",
    commands: hiddenCommands,
    hidden: true
  }
]

export const getTotalCommands = (): number => {
  return commandCategories.reduce((acc, cat) => acc + cat.commands.length, 0)
}

export const getVisibleCommands = (): number => {
  return commandCategories
    .filter(cat => !cat.hidden)
    .reduce((acc, cat) => acc + cat.commands.filter(cmd => !cmd.hidden).length, 0)
}

export const getHiddenCommands = (): Command[] => {
  return hiddenCommands
}
