import fsExtra from "fs-extra"

export function getNextPlayerId(savePath) {
  try {
    const files = fsExtra.readdirSync(savePath).filter(f => /^SJ\d+\.json$/.test(f))
    let maxNum = 0
    for (const f of files) {
      const m = /SJ(\d+)\.json/.exec(f)
      if (m) {
        const n = parseInt(m[1], 10)
        if (n > maxNum) maxNum = n
      }
    }
    return `SJ${String(maxNum + 1).padStart(6, "0")}`
  } catch {
    return "SJ000001"
  }
}
