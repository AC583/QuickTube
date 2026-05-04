import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getCaptionTranscript, getAudioStream, getVideoMetadata } from "@/lib/youtube";
import { transcribeAudio } from "@/lib/deepgram";
import { summarizeTranscript } from "@/lib/nvidia";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

async function processVideo(videoId: string, url: string) {
  try {
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "PROCESSING" },
    });

    let transcript = await getCaptionTranscript(url);
    if (!transcript) {
      const audioStream = await getAudioStream(url);
      ({ transcript } = await transcribeAudio(audioStream));
    }
    const { summary, highlights } = await summarizeTranscript(transcript);

    await prisma.video.update({
      where: { id: videoId },
      data: {
        transcript,
        summary,
        highlights: JSON.stringify(highlights),
        status: "COMPLETED",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process video";
    console.error("Background processing error:", errorMessage);
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "FAILED", errorMessage },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await getVideoMetadata(url);

    // Return existing completed video immediately
    const existingVideo = await prisma.video.findFirst({
      where: { youtubeId: metadata.youtubeId, status: "COMPLETED" },
    });
    if (existingVideo) {
      return NextResponse.json({ videoId: existingVideo.id, cached: true });
    }

    // Return in-progress video if already queued
    const inProgressVideo = await prisma.video.findFirst({
      where: { youtubeId: metadata.youtubeId, status: { in: ["PENDING", "PROCESSING"] } },
    });
    if (inProgressVideo) {
      return NextResponse.json({ videoId: inProgressVideo.id, cached: true });
    }

    const video = await prisma.video.create({
      data: {
        youtubeUrl: url,
        youtubeId: metadata.youtubeId,
        title: metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
        status: "PENDING",
      },
    });

    waitUntil(processVideo(video.id, url));

    return NextResponse.json({ videoId: video.id, cached: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process video";
    console.error("Processing error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
