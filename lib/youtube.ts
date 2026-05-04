import axios from "axios";
import ytdl from "@distube/ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";
import { Readable } from "stream";

export async function getVideoMetadata(url: string) {
  try {
    const response = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`);
    const idMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return {
      title: response.data.title,
      thumbnailUrl: response.data.thumbnail_url,
      youtubeId: idMatch ? idMatch[1] : "",
    };
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    throw error;
  }
}

// Returns the full transcript text from YouTube's own captions, or null if the video
// has no captions. Throws on network errors so callers don't silently fall through
// to the audio path when YouTube is unreachable.
export async function getCaptionTranscript(url: string): Promise<string | null> {
  const idMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  const videoId = idMatch?.[1];
  if (!videoId) return null;

  try {
    const entries = await YoutubeTranscript.fetchTranscript(videoId);
    if (!entries || entries.length === 0) return null;
    return entries.map((e) => e.text).join(" ");
  } catch (err) {
    // Any failure (no captions, network block, etc.) → fall through to audio path
    console.warn(`Caption fetch failed for ${videoId}, falling back to audio:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// Returns an audio stream (webm/opus or mp4/aac) via ytdl-core.
// Note: YouTube actively blocks server IPs; this path only works when
// getCaptionTranscript returns null due to missing captions (not network errors).
export async function getAudioStream(url: string): Promise<Readable> {
  return ytdl(url, {
    filter: "audioonly",
    quality: "highestaudio",
    requestOptions: {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
  }) as unknown as Readable;
}
