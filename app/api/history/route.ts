import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        youtubeId: true,
        thumbnailUrl: true,
        createdAt: true,
      },
    });
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
