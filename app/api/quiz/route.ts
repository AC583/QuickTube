import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/nvidia";
import { prisma } from "@/lib/prisma";
import { getClientIP, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP, 5)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { videoId } = await req.json();

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { transcript: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (!video.transcript) {
      return NextResponse.json({ error: "Transcript not available" }, { status: 400 });
    }

    const questions = await generateQuiz(video.transcript);

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred during quiz generation";
    console.error("Quiz generation error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}