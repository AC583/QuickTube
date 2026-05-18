import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { getVideoMetadata } from "@/lib/youtube";
import { prisma } from "@/lib/prisma";
import type { processVideoTask } from "@/trigger/process-video";
import { getClientIP, checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP, 10)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await getVideoMetadata(url);

    const existingVideo = await prisma.video.findFirst({
      where: { youtubeId: metadata.youtubeId, status: "COMPLETED" },
    });
    if (existingVideo) {
      return NextResponse.json({ videoId: existingVideo.id, cached: true });
    }

    const staleThreshold = new Date(Date.now() - 2 * 60 * 1000);
    const inProgressVideo = await prisma.video.findFirst({
      where: {
        youtubeId: metadata.youtubeId,
        status: { in: ["PENDING", "PROCESSING"] },
        updatedAt: { gte: staleThreshold },
      },
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

    await tasks.trigger<typeof processVideoTask>("process-video", {
      videoId: video.id,
      url,
    });

    return NextResponse.json({ videoId: video.id, cached: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process video";
    console.error("Processing error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
