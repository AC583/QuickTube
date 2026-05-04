import axios from "axios";
import ytdl from "@distube/ytdl-core";

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

// Fetches captions via ytdl.getInfo (YouTube's InnerTube player API), which is
// more reliable on server IPs than page-scraping libraries like youtube-transcript.
export async function getCaptionTranscript(url: string): Promise<string | null> {
  try {
    const info = await ytdl.getInfo(url);
    const tracks =
      info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks?.length) return null;

    // Prefer English, fall back to first available track
    const track =
      tracks.find((t) => t.languageCode?.startsWith("en")) ?? tracks[0];

    const captionUrl = `${track.baseUrl}&fmt=json3`;
    const resp = await fetch(captionUrl);
    if (!resp.ok) return null;

    const data = await resp.json();
    const text = ((data.events ?? []) as any[])
      .filter((e) => e.segs)
      .flatMap((e) => (e.segs as any[]).map((s) => s.utf8 ?? ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text || null;
  } catch (err) {
    console.warn(
      "Caption fetch failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
