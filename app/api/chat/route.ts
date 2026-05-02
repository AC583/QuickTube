import { NextRequest, NextResponse } from "next/server";
import { chatWithTranscript } from "@/lib/nvidia";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { videoId, message, history } = await req.json();

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { transcript: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const response = await chatWithTranscript(video.transcript ?? "", message, history);

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred during chat";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
