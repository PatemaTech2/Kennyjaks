export function normalizeItemReference(input) {
  const value = (input || "").toString().trim().toLowerCase()
  return value.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim()
}

export function normalizeItemId(input) {
  const value = (input || "").toString().trim().toLowerCase()
  return value.replace(/[_\s-]+/g, "_").trim()
}

export function parseItemName(input) {
  return normalizeItemReference(input)
}

export function findItemByName(name, items) {
  const normalized = normalizeItemReference(name)
  return items.find(item => {
    const itemName = (item.name || "").toLowerCase().trim()
    if (itemName === normalized) return true
    const normalizedId = normalizeItemReference(item.id || "")
    if (normalizedId === normalized) return true
    const canonicalId = normalizeItemId(item.id || "")
    if (canonicalId === normalizeItemId(name)) return true
    return false
  }) || null
}

export function findItemIndexByName(name, items) {
  const normalized = normalizeItemReference(name)
  return items.findIndex(item => {
    const itemName = (item.name || "").toLowerCase().trim()
    const normalizedId = normalizeItemReference(item.id || "")
    return itemName === normalized || normalizedId === normalized
  })
}

export function formatItemNotFound(name, items) {
  const suggestions = (items || []).slice(0, 5).map(item => `• ${item.name || "Unknown Item"}`).join("\n")
  return `❌ ITEM NOT FOUND\n\nI couldn't find:\n\n"${name}"\n\nCheck the available shops with:\n/shops`
}
