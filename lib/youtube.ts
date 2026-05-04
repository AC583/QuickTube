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
  const ytDlp = spawn(ytDlpPath, [
    "--no-playlist",
    "--no-check-certificate",
    "-f", "bestaudio",
    "-o", "-",
    url,
  ]);

  const ffmpeg = spawn("/opt/homebrew/bin/ffmpeg", [
    "-i", "pipe:0",
    "-vn",
    "-ar", "16000",
    "-ac", "1",
    "-f", "mp3",
    "pipe:1",
  ]);

  ytDlp.stderr.on("data", (data) => console.error("[yt-dlp]", data.toString()));
  ffmpeg.stderr.on("data", (data) => console.error("[ffmpeg]", data.toString()));
  ytDlp.stdout.pipe(ffmpeg.stdin);

  return ffmpeg.stdout as unknown as Readable;
}
