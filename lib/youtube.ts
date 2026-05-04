import axios from "axios";

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

export async function getCaptionTranscript(url: string): Promise<string | null> {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) throw new Error("SUPADATA_API_KEY is not set");

  const idMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  const videoId = idMatch?.[1];
  if (!videoId) return null;

  try {
    const response = await axios.get("https://api.supadata.ai/v1/youtube/transcript", {
      params: { videoId, text: true },
      headers: { "x-api-key": apiKey },
    });

    const content = response.data?.content;
    if (!content) {
      console.warn(`No transcript content returned for ${videoId}`);
      return null;
    }

    if (typeof content === "string") return content.trim() || null;

    // content is an array of segment objects: { text, offset, duration }
    const text = (content as { text: string }[])
      .map((s) => s.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text || null;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(`Supadata transcript fetch failed for ${videoId}: ${err.response?.status} ${JSON.stringify(err.response?.data)}`);
    } else {
      console.error(`Supadata transcript fetch failed for ${videoId}:`, err instanceof Error ? err.message : err);
    }
    return null;
  }
}
