export function parseShopPage(text, suffixPattern) {
  let page = 0
  const suffixMatch = text.match(suffixPattern)
  if (suffixMatch) {
    page = parseInt(suffixMatch[1], 10) - 1
  } else {
    const args = text.split(" ")
    if (args.length > 1 && /^\d+$/.test(args[1])) {
      page = parseInt(args[1], 10) - 1
    }
  }
  return Math.max(0, page)
}
