import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const result = await prisma.video.updateMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    data: { status: "FAILED", errorMessage: "Manually reset" },
  });
  return NextResponse.json({ reset: result.count });
}
