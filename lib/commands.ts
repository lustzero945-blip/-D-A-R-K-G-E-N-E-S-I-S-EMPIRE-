export interface Command {
  name: string
  description: string
  usage: string
  category: string
}

export interface CommandCategory {
  name: string
  icon: string
  description: string
  commands: Command[]
  color: string
}

const createCommandVariants = (base: string, description: string): Command[] => {
  const variants = ["", "_user", "_server", "_id", "_logs", "_reason", "_add", "_remove", "_set", "_list", "_info", "_all"]
  return variants.map(variant => ({
    name: `.${base}${variant}`,
    description: variant === "" ? description : `${description} - ${variant.replace("_", "").toUpperCase()}`,
    usage: `.${base}${variant} [target]`,
    category: base
  }))
}

export const commandCategories: CommandCategory[] = [
  {
    name: "Modération",
    icon: "🛡️",
    description: "Commandes de modération du serveur",
    color: "text-red-500",
    commands: [
      ...createCommandVariants("ban", "Bannir un utilisateur"),
      ...createCommandVariants("unban", "Débannir un utilisateur"),
      ...createCommandVariants("kick", "Expulser un utilisateur"),
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
      ...createCommandVariants("unlock", "Déverrouiller un salon"),
      ...createCommandVariants("slowmode", "Activer le mode lent"),
    ]
  },
  {
    name: "Sécurité",
    icon: "🔒",
    description: "Protection et sécurité",
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
      ...createCommandVariants("meme", "Envoyer un mème"),
      ...createCommandVariants("gif", "Envoyer un GIF"),
      ...createCommandVariants("quote", "Citation aléatoire"),
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
      ...createCommandVariants("dice", "Lancer un dé"),
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
      ...createCommandVariants("ship", "Compatibilité amoureuse"),
      ...createCommandVariants("love", "Calculer l'amour"),
      ...createCommandVariants("slap", "Gifler quelqu'un"),
      ...createCommandVariants("hug", "Faire un câlin"),
      ...createCommandVariants("dance", "Danser"),
    ]
  },
  {
    name: "Économie",
    icon: "💰",
    description: "Système économique",
    color: "text-amber-500",
    commands: [
      ...createCommandVariants("balance", "Voir son solde"),
      ...createCommandVariants("daily", "Récompense quotidienne"),
      ...createCommandVariants("work", "Travailler"),
      ...createCommandVariants("crime", "Commettre un crime"),
      ...createCommandVariants("rob", "Voler quelqu'un"),
      ...createCommandVariants("deposit", "Déposer de l'argent"),
      ...createCommandVariants("withdraw", "Retirer de l'argent"),
      ...createCommandVariants("shop", "Boutique"),
      ...createCommandVariants("buy", "Acheter un article"),
    ]
  }
]

export const getTotalCommands = (): number => {
  return commandCategories.reduce((acc, cat) => acc + cat.commands.length, 0)
}
