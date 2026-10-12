import fs from "fs-extra"
import path from "path"

const TRANSACTION_LOG_PATH = path.join(process.cwd(), "database", "transactions")

export async function getPlayerTransactions(playerId, limit = 5) {
  try {
    if (!await fs.pathExists(TRANSACTION_LOG_PATH)) {
      return []
    }

    let allTxns = []

    const txnsPath = path.join(TRANSACTION_LOG_PATH, `${playerId}.json`)
    if (await fs.pathExists(txnsPath)) {
      allTxns = await fs.readJson(txnsPath)
      allTxns = allTxns.sort((a, b) => b.timestamp - a.timestamp)
    }

    return allTxns.slice(0, limit)
  } catch {
    return []
  }
}

export async function logPlayerTransaction(playerId, entry) {
  try {
    await fs.ensureDir(TRANSACTION_LOG_PATH)
    const txnsPath = path.join(TRANSACTION_LOG_PATH, `${playerId}.json`)
    let txns = []
    if (await fs.pathExists(txnsPath)) {
      txns = await fs.readJson(txnsPath)
    }
    txns.push(entry)
    await fs.writeJson(txnsPath, txns, { spaces: 2 })
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Failed to log transaction:", err.message)
  }
}
