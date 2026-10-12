export { ProfileCard } from "./profileCard.js"
export { BattleScreenCard } from "./battleScreenCard.js"
export { WalletCard } from "./walletCard.js"
export { BankCard } from "./bankCard.js"
export { LeaderboardCanvas } from "./leaderboardCard.js"
export { MissionCard } from "./missionCard.js"
export { LevelCard } from "./levelCard.js"
export { EggRevealCard } from "./eggReveal.js"
export { DepositReceipt } from "./depositReceipt.js"
export { WithdrawReceipt } from "./withdrawReceipt.js"
export { TransferReceipt } from "./transferReceipt.js"
export { InventoryCard } from "./inventoryCard.js"
export { BagCard } from "./bagCard.js"
export { ShopCanvas } from "./shopCanvas.js"
export { TechniqueCard } from "./techniqueCard.js"
export { TrainingCard } from "./trainingCard.js"
export { RCTCard } from "./rctCard.js"
export { DomainCard } from "./domainCard.js"
export { CraftingCard } from "./craftingCard.js"
export { LootCard } from "./lootCard.js"
export { SummonCard } from "./summonCard.js"
export { PvPCard } from "./pvpCard.js"

export const CanvasTheme = {
  profile: { bg: ["#0a0a12", "#0d0715", "#0a0720", "#050210"], accent: "#ffd700", panel: "rgba(13,17,23,0.85)", border: "rgba(218,165,32,0.25)", headerText: "#ffd700", bodyText: "#ffffff", muted: "#aaaaff" },
  battle: { bg: ["#0a0008", "#150510", "#0a0515", "#050208"], accent: "#dc143c", panel: "rgba(10,0,5,0.85)", border: "rgba(220,20,60,0.3)", headerText: "#dc143c", bodyText: "#ffffff", muted: "#666688" },
  wallet: { bg: ["#0a0f1a", "#0a0a14", "#0d0d20", "#060612"], accent: "#00b7ff", panel: "rgba(10,15,26,0.85)", border: "rgba(0,183,255,0.25)", headerText: "#00b7ff", bodyText: "#ffffff", muted: "#667788" },
  bank: { bg: ["#0a0d0a", "#0a120a", "#0d150d", "#050805"], accent: "#ffd700", panel: "rgba(10,13,10,0.85)", border: "rgba(255,215,0,0.25)", headerText: "#ffd700", bodyText: "#ffffff", muted: "#778866" },
  technique: { bg: ["#0d0a15", "#100a1e", "#0a0520", "#050210"], accent: "#aa44ff", panel: "rgba(13,10,21,0.85)", border: "rgba(170,68,255,0.25)", headerText: "#aa44ff", bodyText: "#ffffff", muted: "#7766aa" },
  domain: { bg: ["#08000f", "#100018", "#0a0020", "#030008"], accent: "#dc143c", panel: "rgba(8,0,15,0.9)", border: "rgba(220,20,60,0.4)", headerText: "#dc143c", bodyText: "#ffffff", muted: "#884466" },
  rct: { bg: ["#0a0808", "#120a0a", "#150808", "#080505"], accent: "#ff6b6b", panel: "rgba(18,10,10,0.85)", border: "rgba(255,107,107,0.3)", headerText: "#ff6b6b", bodyText: "#ffffff", muted: "#aa6666" },
  leaderboard: { bg: ["#0d0d12", "#101018", "#0a0a14", "#050508"], accent: "#ffd700", panel: "rgba(16,16,24,0.85)", border: "rgba(218,165,32,0.2)", headerText: "#ffd700", bodyText: "#ffffff", muted: "#666677" },
  loot: { bg: ["#0a0a10", "#0f0f18", "#0a0a14", "#040408"], accent: "#aa44ff", panel: "rgba(15,15,24,0.85)", border: "rgba(170,68,255,0.25)", headerText: "#aa44ff", bodyText: "#ffffff", muted: "#7766aa" },
  victory: { bg: ["#050a05", "#081208", "#0a150a", "#020502"], accent: "#ffd700", panel: "rgba(8,18,8,0.85)", border: "rgba(255,215,0,0.3)", headerText: "#ffd700", bodyText: "#ffffff", muted: "#667744" },
  defeat: { bg: ["#0a0505", "#120808", "#150a0a", "#080404"], accent: "#ff4444", panel: "rgba(18,8,8,0.85)", border: "rgba(255,68,68,0.25)", headerText: "#ff4444", bodyText: "#ffffff", muted: "#884444" }
}

export const canvasRegistry = {
  profile: ProfileCard,
  battle: BattleScreenCard,
  wallet: WalletCard,
  bank: BankCard,
  inventory: InventoryCard,
  bag: BagCard,
  shop: ShopCanvas,
  technique: TechniqueCard,
  training: TrainingCard,
  rct: RCTCard,
  domain: DomainCard,
  crafting: CraftingCard,
  loot: LootCard,
  summon: SummonCard,
  pvp: PvPCard,
  leaderboard: LeaderboardCanvas,
  mission: MissionCard,
  level: LevelCard,
  victory: null,
  defeat: null,
  foodShop: null,
  drinkShop: null,
  medicineShop: null,
  weaponShop: null
}
