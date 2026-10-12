import { loadImage } from "canvas"

export async function loadImageFromUrl(url) {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return await loadImage(buffer)
  } catch (error) {
    console.error("[KENNYJAKS ERROR] Failed to load image from URL:", error.message)
    return null
  }
}

export async function loadImageFromBuffer(buffer) {
  if (!buffer || buffer.length === 0) return null
  try {
    return await loadImage(buffer)
  } catch (error) {
    console.error("[KENNYJAKS ERROR] Failed to load image from buffer:", error.message)
    return null
  }
}
