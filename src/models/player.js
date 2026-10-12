export class Player {
  constructor(data) {
    this.id = data.id || data.playerId
    this.playerId = data.playerId || data.id || 0
    this.phoneNumber = data.phoneNumber || data.id || ""
    this.name = data.name || "Unknown Sorcerer"
    this.faction = data.faction || "sorcerer"
    this.registrationDate = data.registrationDate || new Date().toISOString()
    this.wallet = data.wallet || 0
    this.bank = data.bank || 0
    this.level = data.level || 1
    this.xp = data.xp || 0
    this.lifetimeXp = data.lifetimeXp || data.xp || 0
    this.baseStats = data.baseStats || {}
    this.baseStats.hp = this.baseStats.hp || data.maxHealth || 100
    this.baseStats.ce = this.baseStats.ce || data.maxCursedEnergy || 50
    this.baseStats.strength = this.baseStats.strength || data.strength || 10
    this.baseStats.defense = this.baseStats.defense || data.defense || 10
    this.baseStats.speed = this.baseStats.speed || data.speed || 10
    this.baseStats.intelligence = this.baseStats.intelligence || data.intelligence || 10
    this.baseStats.stamina = this.baseStats.stamina || 10
    this.baseStats.luck = this.baseStats.luck !== undefined ? this.baseStats.luck : (data.luck || 10)
    this.baseStats.techniqueControl = this.baseStats.techniqueControl || data.techniqueControl || 0
    this.grade = data.grade !== undefined ? data.grade : 4
    this.sorcererGrade = data.sorcererGrade || (data.grade !== undefined && data.grade !== null ? ["Special Grade", "Grade 1", "Grade 2", "Grade 3", "Grade 4"][data.grade] : "Grade 4")
    this.health = data.health || 100
    this.maxHealth = data.maxHealth || 100
    this.cursedEnergy = data.cursedEnergy || 50
    this.maxCursedEnergy = data.maxCursedEnergy || 50
    this.strength = data.strength || 10
    this.defense = data.defense || 10
    this.speed = data.speed || 10
    this.intelligence = data.intelligence || 10
    this.luck = data.luck || 10
    this.reputation = data.reputation || 0
    this.inventory = data.inventory || []
    this.equippedWeapon = data.equippedWeapon || null
    this.equippedArmor = data.equippedArmor || null
    this.equippedAccessory = data.equippedAccessory || null
    this.inventoryCapacity = data.inventoryCapacity || 30
    this.bagCapacity = data.bagCapacity || 0
    this.bagInventory = data.bagInventory || []
    this.equippedBag = data.equippedBag || null
    this.activeMissions = data.activeMissions || null
    this.completedMissions = data.completedMissions || []
    this.friends = data.friends || []
    this.titles = data.titles || []
    this.achievements = data.achievements || []
    this.domainExpansion = data.domainExpansion || null
    this.reverseCursedTechnique = data.reverseCursedTechnique || false
    this.technique = data.technique || null
    this.skillPoints = data.skillPoints || 0
    this.totalSpentSkillPoints = data.totalSpentSkillPoints || 0
    this.blackFlashes = data.blackFlashes || 0
    this.blackFlashAffinity = data.blackFlashAffinity == null ? null : data.blackFlashAffinity
    this.highestChain = data.highestChain || 0
    this.totalBlackFlashDamage = data.totalBlackFlashDamage || 0
    this.lifetimeEarned = data.lifetimeEarned || 0
    this.critRate = data.critRate || 0
    this.accuracy = data.accuracy || 100
    this.blockChance = data.blockChance || 0
    this.status = data.status || null
    this.gamblingProfit = data.gamblingProfit || 0
    this.gamblingLosses = data.gamblingLosses || 0
    this.gamblingGamesPlayed = data.gamblingGamesPlayed || 0
    this.largestWin = data.largestWin || 0
    this.largestLoss = data.largestLoss || 0
    this.biggestMultiplier = data.biggestMultiplier || 0
    this.currentWinStreak = data.currentWinStreak || 0
    this.currentLoseStreak = data.currentLoseStreak || 0
    this.pvpWins = data.pvpWins || 0
    this.pvpLosses = data.pvpLosses || 0
    this.eggs = data.eggs || []
    this.shikigami = data.shikigami || null
    this.pets = data.pets || []
    this.activePet = data.activePet || null
    this.bags = data.bags || []
    this.dailyChecklist = data.dailyChecklist || {
      salaryClaimed: false,
      dailyMissionCompleted: false,
      cursesDefeated: 0,
      petFed: false,
      techniqueTrained: false,
      blackMarketVisited: false,
      investigationCompleted: false,
      allCompleted: false
    }
    this.lastDailyReset = data.lastDailyReset || Date.now()
    this.dailySalaryClaimed = data.dailySalaryClaimed || false
    this.lastSeen = data.lastSeen || Date.now()
    this.totalPlayTime = data.totalPlayTime || 0
    this.potential = data.potential || "F"
    this.potentialBonuses = data.potentialBonuses || {}
    this.curseKills = data.curseKills || 0
    this.specialGradeKills = data.specialGradeKills || 0
    this.curseKillsByGrade = data.curseKillsByGrade || {}
    this.completedMissionDifficulties = data.completedMissionDifficulties || []
    this.criticalHits = data.criticalHits || 0
    this.rct = data.rct || { unlocked: false, trained: false }
    this.hasRCT = data.hasRCT !== undefined ? data.hasRCT : (data.rct && data.rct.unlocked) || false
    this.reversedTechnique = data.reversedTechnique || null
    this.reverseTechniqueUnlocked = data.reverseTechniqueUnlocked !== undefined ? data.reverseTechniqueUnlocked : this.hasRCT
    this.rctMethod = data.rctMethod || null
    this.rctAwakenedAt = data.rctAwakenedAt || null
    // V3 Auto RCT Evolution
    this.autoRct = data.autoRct || {
      unlocked: false,
      enabled: false,
      streak: 0,
      lastTrainDate: null,
      completed: false,
      startedAt: null
    }
    this.rctTrainProgress = data.rctTrainProgress || {
      stage: 0,
      progress: 0,
      completed: 0,
      challenges: {}
    }
    this.techniqueChallenges = data.techniqueChallenges || {}
    this.domains = data.domains || { infernalPurgatory: false, name: null }
    this.rctCooldowns = data.rctCooldowns || {}
    this.techniqueMastery = data.techniqueMastery || {}
    this.shikigamiMastery = data.shikigamiMastery || { conquered: [], currentTraining: null, trainingStartTime: null }
    this.equippedItems = data.equippedItems || {}
    this.lifetimeSpent = data.lifetimeSpent || 0
    this.progression = data.progression || null
    this.yujiTrainingLevel = data.yujiTrainingLevel || 0
    this.yujiMission = data.yujiMission || null
    this.yujiMissionProgress = data.yujiMissionProgress || 0
    this.yujiMissionParam = data.yujiMissionParam || 0
    this.yujiUnlocked = data.yujiUnlocked || ["battack1"]
    this.lastCommandTime = data.lastCommandTime || 0
    this.combatCommandCooldown = data.combatCommandCooldown || {}
    this.blocks = data.blocks || 0
    this.totalDamageDealt = data.totalDamageDealt || 0
    this.thirst = data.thirst !== undefined ? data.thirst : 100
    this.burnout = data.burnout || null
    this.currentLocation = data.currentLocation || "tokyo"
    this.discoveredCurses = data.discoveredCurses || {}
    this.reputationTitle = data.reputationTitle || null
    this.cards = data.cards || []
    this.profileStyle = data.profileStyle || "A"
    this.profileTitle = data.profileTitle || null
    this.profileBadge = data.profileBadge || null
    this.profileBio = data.profileBio || null
    this.profileAccent = data.profileAccent || null
    this.profileSong = data.profileSong || null
    this.profileSongTitle = data.profileSongTitle || null
    this.profileSongUrl = data.profileSongUrl || null
    this.premiumTier = data.premiumTier || 0
    this.premiumExpiry = data.premiumExpiry || null
    this.kenTokens = data.kenTokens || 0
    this.dailyCheckInStreak = data.dailyCheckInStreak || 0
    this.lastDailyCheckIn = data.lastDailyCheckIn || null
    this.kloots = data.kloots || []
    this.sealedCurses = data.sealedCurses || []
    this.klootCooldowns = data.klootCooldowns || {}
    this.birthdayCakeCurrency = data.birthdayCakeCurrency || 0
    this.totalBirthdayBonuses = data.totalBirthdayBonuses || 0
    this.lastBirthdayBonusDate = data.lastBirthdayBonusDate || null
    this.profileBio = data.profileBio || null
    this.profileAccent = data.profileAccent || null
    this.profileSong = data.profileSong || null
    this.profileSongTitle = data.profileSongTitle || null
    this.profileSongUrl = data.profileSongUrl || null
    this.premiumTier = data.premiumTier || 0
    this.premiumExpiry = data.premiumExpiry || null
    this.kenTokens = data.kenTokens || 0
    this.dailyCheckInStreak = data.dailyCheckInStreak || 0
    this.lastDailyCheckIn = data.lastDailyCheckIn || null
    this.kloots = data.kloots || []
    this.sealedCurses = data.sealedCurses || []
    this.klootCooldowns = data.klootCooldowns || {}
    this.birthdayCakeCurrency = data.birthdayCakeCurrency || 0
    this.totalBirthdayBonuses = data.totalBirthdayBonuses || 0
    this.lastBirthdayBonusDate = data.lastBirthdayBonusDate || null
    this.birthdayGifts = data.birthdayGifts || []
    this.isBirthdayEventActive = data.isBirthdayEventActive || false
    // Sprite fields
    this.currentSprite = data.currentSprite || 'johnken.png'
    this.currentSpriteName = data.currentSpriteName || 'johnken'
    // Profile style - TECH is the new black-and-white tech profile matching the reference aesthetic
    this.profileStyle = data.profileStyle || 'TECH'
  }
}
