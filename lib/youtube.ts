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

// Returns the full transcript text from YouTube's own captions, or null if unavailable.
export async function getCaptionTranscript(url: string): Promise<string | null> {
  try {
    const idMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    const videoId = idMatch?.[1];
    if (!videoId) return null;

    const entries = await YoutubeTranscript.fetchTranscript(videoId);
    if (!entries || entries.length === 0) return null;

    return entries.map((e) => e.text).join(" ");
  } catch {
    return null;
  }
}

// Returns an audio stream (webm/opus or mp4/aac) via ytdl-core — no native binaries required.
export async function getAudioStream(url: string): Promise<Readable> {
  return ytdl(url, { filter: "audioonly", quality: "highestaudio" }) as unknown as Readable;
}
