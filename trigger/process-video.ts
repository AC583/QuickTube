import { task, logger } from "@trigger.dev/sdk/v3";
import { getCaptionTranscript, getAudioStream } from "@/lib/youtube";
import { transcribeAudio } from "@/lib/deepgram";
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

    let transcript: string;

    try {
      logger.log("Fetching captions", { videoId });
      const captionTranscript = await getCaptionTranscript(url);

      if (captionTranscript) {
        logger.log("Captions found", { chars: captionTranscript.length });
        transcript = captionTranscript;
      } else {
        logger.log("No captions, falling back to audio transcription");
        const audioStream = await getAudioStream(url);
        ({ transcript } = await transcribeAudio(audioStream));
        logger.log("Audio transcribed", { chars: transcript.length });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch transcript";
      logger.error("Transcript error", { error: errorMessage });
      await prisma.video.update({
        where: { id: videoId },
        data: { status: "FAILED", errorMessage },
      });
      throw error;
    }

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
