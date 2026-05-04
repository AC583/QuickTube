import { task, logger } from "@trigger.dev/sdk/v3";
import { getCaptionTranscript } from "@/lib/youtube";
import { summarizeTranscript } from "@/lib/nvidia";
import { prisma } from "@/lib/prisma";

export const processVideoTask = task({
  id: "process-video",
  maxDuration: 300,
  run: async (payload: { videoId: string; url: string }) => {
    const { videoId, url } = payload;

    await prisma.video.update({
      where: { id: videoId },
      data: { status: "PROCESSING" },
    });

    let transcript: string | null;
    try {
      logger.log("Fetching captions", { videoId });
      transcript = await getCaptionTranscript(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch captions";
      logger.error("Caption fetch error", { error: errorMessage });
      await prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED", errorMessage },
      });
      throw error;
    }

    if (!transcript) {
      const errorMessage = "This video has captions disabled. Only videos with captions or auto-generated subtitles can be processed.";
      logger.warn("No captions available", { videoId });
      await prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED", errorMessage },
      });
      return;
    }

    logger.log("Captions fetched", { chars: transcript.length });

    try {
      logger.log("Summarizing transcript");
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
      logger.log("Video processed successfully", { videoId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to summarize";
      logger.error("Summarization error", { error: errorMessage });
      await prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED", errorMessage },
      });
      throw error;
    }
  },
});
