import sharp from "sharp"
import ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "ffmpeg-static"
import path from "path"
import fs from "fs/promises"
import os from "os"

ffmpeg.setFfmpegPath(ffmpegPath)

const TEMP_DIR = path.join(os.tmpdir(), "kennyjaks-stickers")
const STICKER_SIZE = 512
const WATERMARK_TEXT = "KENNYJAKS"

const escapeXml = (unsafe) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;"
      case ">": return "&gt;"
      case "&": return "&amp;"
      case "'": return "&apos;"
      case '"': return "&quot;"
    }
    return c
  })
}

async function renderWatermark(buffer) {
  const watermarkSvg = Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <text x="256" y="500" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#ffd700" text-anchor="middle" opacity="0.6">KENNYJAKS</text>
    </svg>
  `)
  const watermarkPng = await sharp(watermarkSvg).png().toBuffer()
  
  return sharp(buffer)
    .composite([{ input: watermarkPng, gravity: "south" }])
    .webp({ quality: 90 })
    .toBuffer()
}

async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch {}
}

async function cleanupTempFile(filePath) {
  try {
    await fs.unlink(filePath)
  } catch {}
}

const USER_COLORS = ["#ff006e", "#00d9ff", "#ffd700", "#00ff00", "#ff00ff"]

async function createTextSvg(text, userName) {
  const words = text.split(" ")
  const lines = []
  let currentLine = ""
  const maxWidth = STICKER_SIZE - 60
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length > 20 && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  
  const lineHeight = 60
  const totalHeight = lines.length * lineHeight
  let y = (STICKER_SIZE - totalHeight) / 2 + 30
  
  let svgContent = `
<svg width="${STICKER_SIZE}" height="${STICKER_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff006e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00d9ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${STICKER_SIZE}" height="${STICKER_SIZE}" fill="url(#grad)"/>
  <rect x="10" y="10" width="${STICKER_SIZE - 20}" height="${STICKER_SIZE - 20}" fill="none" stroke="#ffd700" stroke-width="3"/>
  
  <text x="${STICKER_SIZE / 2}" y="40" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#ffd700" text-anchor="middle">${WATERMARK_TEXT}</text>
  
  <text x="20" y="${STICKER_SIZE - 40}" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#00d9ff">${escapeXml(userName)}</text>
`;
  
  for (let i = 0; i < lines.length; i++) {
    const color = USER_COLORS[i % USER_COLORS.length]
    const fontSize = lines.length === 1 ? 52 : lines.length === 2 ? 36 : 28
    svgContent += `<text x="${STICKER_SIZE / 2}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="middle">${escapeXml(lines[i])}</text>
`
    y += lineHeight
  }
  
  svgContent += `</svg>`
  return svgContent
}

export class StickerService {
  static async imageToSticker(imageBuffer) {
    await ensureTempDir()
    const inputPath = path.join(TEMP_DIR, `input-${Date.now()}.png`)
    const outputPath = path.join(TEMP_DIR, `sticker-${Date.now()}.webp`)

    await fs.writeFile(inputPath, imageBuffer)

    await sharp(inputPath)
      .resize(STICKER_SIZE, STICKER_SIZE, {
        fit: "cover",
        position: "center"
      })
      .webp({
        quality: 90,
        lossless: false,
        effort: 4
      })
      .toFile(outputPath)

    const stickerBuffer = await fs.readFile(outputPath)
    await cleanupTempFile(inputPath)
    await cleanupTempFile(outputPath)

    return renderWatermark(stickerBuffer)
  }

  static async videoToSticker(videoBuffer) {
    await ensureTempDir()
    const inputPath = path.join(TEMP_DIR, `video-${Date.now()}.mp4`)
    const framesDir = path.join(TEMP_DIR, `frames-${Date.now()}`)
    const outputPath = path.join(TEMP_DIR, `sticker-${Date.now()}.webp`)

    await fs.mkdir(framesDir, { recursive: true })
    await fs.writeFile(inputPath, videoBuffer)

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(path.join(framesDir, "frame%d.png"))
        .on("end", async () => {
          try {
            const files = await fs.readdir(framesDir)
            const frameFiles = files
              .filter(f => f.startsWith("frame"))
              .sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, ""))
                const numB = parseInt(b.replace(/\D/g, ""))
                return numA - numB
              })
              .slice(0, 50)

            if (frameFiles.length === 0) {
              reject(new Error("No frames extracted"))
              return
            }

            const framePaths = frameFiles.map(f => path.join(framesDir, f))

            const webpBuffer = await sharp(framePaths[0])
              .resize(STICKER_SIZE, STICKER_SIZE, {
                fit: "cover",
                position: "center"
              })
              .webp({
                quality: 90,
                lossless: false,
                effort: 4
              })
              .toBuffer()

            for (const framePath of framePaths) {
              await cleanupTempFile(framePath)
            }
            await fs.rmdir(framesDir)
            await cleanupTempFile(inputPath)

            resolve(renderWatermark(webpBuffer))
          } catch (err) {
            reject(err)
          }
        })
        .on("error", async (err) => {
          try {
            await fs.rmdir(framesDir)
            await cleanupTempFile(inputPath)
          } catch {}
          reject(err)
        })
        .run()
    })
  }

  static async stickerToImage(stickerBuffer) {
    await ensureTempDir()
    const inputPath = path.join(TEMP_DIR, `sticker-${Date.now()}.webp`)
    const outputPath = path.join(TEMP_DIR, `image-${Date.now()}.png`)

    await fs.writeFile(inputPath, stickerBuffer)

    await sharp(inputPath)
      .png()
      .toFile(outputPath)

    const imageBuffer = await fs.readFile(outputPath)
    await cleanupTempFile(inputPath)
    await cleanupTempFile(outputPath)

    return imageBuffer
  }

  static async animatedStickerToGif(stickerBuffer) {
    await ensureTempDir()
    const inputPath = path.join(TEMP_DIR, `sticker-${Date.now()}.webp`)
    const outputPath = path.join(TEMP_DIR, `gif-${Date.now()}.gif`)

    await fs.writeFile(inputPath, stickerBuffer)

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .on("end", async () => {
          const gifBuffer = await fs.readFile(outputPath)
          await cleanupTempFile(inputPath)
          await cleanupTempFile(outputPath)
          resolve(gifBuffer)
        })
        .on("error", async (err) => {
          await cleanupTempFile(inputPath)
          await cleanupTempFile(outputPath)
          reject(err)
        })
        .run()
    })
  }

  static async textToSticker(text) {
    await ensureTempDir()

    const userName = text.split(" ")[0] || "User"
    const stickerText = text.length > 20 ? text.substring(0, 20) + "..." : text
    const svgBuffer = Buffer.from(await createTextSvg(stickerText, userName))
    
    // Convert SVG to PNG first, then to WebP
    const pngBuffer = await sharp(svgBuffer)
      .png()
      .toBuffer()

    const webpBuffer = await sharp(pngBuffer)
      .webp({
        quality: 90,
        lossless: false,
        effort: 4
      })
      .toBuffer()

    return webpBuffer
  }

  static async getStickerInfo(stickerBuffer) {
    await ensureTempDir()
    const inputPath = path.join(TEMP_DIR, `sticker-${Date.now()}.webp`)

    await fs.writeFile(inputPath, stickerBuffer)

    try {
      const metadata = await sharp(inputPath).metadata()
      const stats = await sharp(inputPath).stats()

      const isAnimated = metadata.pages && metadata.pages > 1

      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        animated: isAnimated,
        pages: metadata.pages || 1,
        size: stickerBuffer.length,
        channels: metadata.channels,
        depth: metadata.depth
      }
    } finally {
      await cleanupTempFile(inputPath)
    }
  }
}
