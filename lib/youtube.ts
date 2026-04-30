import axios from "axios";
import { spawn } from "child_process";
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

export async function getAudioStream(url: string): Promise<Readable> {
  const ytDlpPath = "/Library/Frameworks/Python.framework/Versions/3.14/bin/yt-dlp";
  const proc = spawn(ytDlpPath, [
    "--no-playlist",
    "--no-check-certificate",
    "-f", "bestaudio[ext=webm]/bestaudio/best",
    "-o", "-",
    url,
  ]);

  proc.stderr.on("data", (data) => {
    console.error("[yt-dlp]", data.toString());
  });

  return proc.stdout as unknown as Readable;
}
