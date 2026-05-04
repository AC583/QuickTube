import axios from "axios";
import { Innertube } from "youtubei.js";

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

// Uses YouTube's InnerTube API (via youtubei.js) which properly emulates a real
// YouTube client and is far less susceptible to server-IP blocking than page scrapers.
export async function getCaptionTranscript(url: string): Promise<string | null> {
  const idMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  const videoId = idMatch?.[1];
  if (!videoId) return null;

  try {
    const yt = await Innertube.create({ retrieve_player: false });
    const info = await yt.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    if (!transcriptData) {
      console.warn(`No transcript data returned for ${videoId}`);
      return null;
    }

    const segments =
      transcriptData.transcript?.content?.body?.initial_segments ?? [];

    if (!segments.length) {
      console.warn(`Empty transcript segments for ${videoId}`);
      return null;
    }

    const text = segments
      .map((s: any) => s.snippet?.text ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text || null;
  } catch (err) {
    console.error(
      `Caption fetch failed for ${videoId}:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
