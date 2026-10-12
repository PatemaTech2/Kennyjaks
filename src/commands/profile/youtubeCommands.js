import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import YTMusic from "ytmusic-api"

const ytmusic = new YTMusic()
const pendingSearches = new Map()
const MAX_RESULTS = 10

export async function handleYouTubeSearch(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /yt <song name>\n\nExample: /yt Never Gonna Give You Up", message)
    return
  }

  const query = args.slice(1).join(" ")
  await sendQuotedWithFooter(sock, remoteJid, "🔍 Searching YouTube Music...", message)

  try {
    await ytmusic.initialize()
    const results = await ytmusic.search(query)
    if (!results || results.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "No results found. Try a different search term.", message)
      return
    }

    const songs = results.filter(r => r.type === "SONG" || r.type === "VIDEO").slice(0, MAX_RESULTS)
    if (songs.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "No songs found. Try a different search term.", message)
      return
    }

    pendingSearches.set(phoneNumber, songs)

    const lines = [
      "🎵 YouTube Music Search Results",
      `Query: ${query}`,
      "",
      "Use /ytset <number> to set a song to your profile.",
      ""
    ]

    songs.forEach((song, index) => {
      const title = song.name || "Unknown Title"
      const artist = song.artist?.name || "Unknown Artist"
      const duration = song.duration || "?:??"
      lines.push(`${index + 1}. ${title}`)
      lines.push(`   Artist: ${artist}`)
      lines.push(`   Duration: ${duration}`)
      lines.push("")
    })

    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
  } catch (error) {
    console.error("[YT SEARCH] Search failed:", error.message)
    await sendQuotedWithFooter(sock, remoteJid, "Failed to search YouTube Music. Try again later.", message)
  }
}

export async function handleYouTubeSet(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /ytset <number>\n\nExample: /ytset 1", message)
    return
  }

  const index = parseInt(args[1], 10) - 1
  const songs = pendingSearches.get(phoneNumber)

  if (!songs || index < 0 || index >= songs.length) {
    await sendQuotedWithFooter(sock, remoteJid, "No active search results.\n\nUse /yt <song name> first.", message)
    return
  }

  const song = songs[index]
  const { loadPlayerByPhone, savePlayer } = await import("../../database/playerRepo.js")
  const player = await loadPlayerByPhone(phoneNumber)

  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const songUrl = `https://music.youtube.com/watch?v=${song.videoId}`
  player.profileSong = song.videoId
  player.profileSongTitle = song.name
  player.profileSongUrl = songUrl
  await savePlayer(player)

  pendingSearches.delete(phoneNumber)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Song set to your profile!\n\n🎵 ${song.name}\nArtist: ${song.artist?.name || "Unknown"}\nDuration: ${song.duration || "?:??"}\n\nThis will now appear when others view your profile.`, message)
}
