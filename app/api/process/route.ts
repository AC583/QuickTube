import { NextRequest, NextResponse } from "next/server";
import { getAudioStream, getVideoMetadata } from "@/lib/youtube";
import { transcribeAudio } from "@/lib/deepgram";
import { summarizeTranscript } from "@/lib/nvidia";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Get metadata
    const metadata = await getVideoMetadata(url);

    // Check if we already have this video processed
    const existingVideo = await prisma.video.findFirst({
      where: { youtubeId: metadata.youtubeId },
    });

    if (existingVideo) {
      return NextResponse.json({ videoId: existingVideo.id, cached: true });
    }

    // 2. Get audio stream and buffer it
    const audioStream = await getAudioStream(url);
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      audioStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      audioStream.on("end", () => resolve(Buffer.concat(chunks)));
      audioStream.on("error", reject);
    });

    // 3. Transcribe
    const { transcript } = await transcribeAudio(audioBuffer);

    // 4. Summarize
    const { summary, highlights } = await summarizeTranscript(transcript);

    // 5. Save to DB
    const video = await prisma.video.create({
      data: {
        youtubeUrl: url,
        youtubeId: metadata.youtubeId,
        title: metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
        transcript,
        summary,
        highlights: JSON.stringify(highlights),
      },
    });

    return NextResponse.json({ videoId: video.id, cached: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process video";
    console.error("Processing error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
