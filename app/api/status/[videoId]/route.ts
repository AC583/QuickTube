import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STALE_PROCESSING_MS = 8 * 60 * 1000; // 8 minutes

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { status: true, errorMessage: true, updatedAt: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If stuck in PROCESSING with no DB update for 8+ minutes, the background job was killed.
  if (
    video.status === "PROCESSING" &&
    Date.now() - video.updatedAt.getTime() > STALE_PROCESSING_MS
  ) {
    await prisma.video.update({
      where: { id: videoId },
      data: { status: "FAILED", errorMessage: "Processing timed out. Please try again." },
    });
    return NextResponse.json({
      status: "FAILED",
      error: "Processing timed out. Please try again.",
    });
  }

  return NextResponse.json({ status: video.status, error: video.errorMessage });
}
