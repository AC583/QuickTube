import { DeepgramClient, type ListenV1Response } from "@deepgram/sdk";
import { Readable } from "stream";
import { KeyPool } from "./key-pool";

// Set DEEPGRAM_API_KEYS="key1,key2,key3" in .env (falls back to single key)
function getDeepgramPool() {
  return KeyPool.fromEnv(
    process.env.DEEPGRAM_API_KEYS ? "DEEPGRAM_API_KEYS" : "DEEPGRAM_API_KEY"
  );
}

export async function transcribeAudio(audioStream: Readable) {
  try {
    const response = await getDeepgramPool().run((key) => {
      const client = new DeepgramClient({ apiKey: key, timeoutInSeconds: 300 });
      return client.listen.v1.media.transcribeFile(audioStream as any, {
        smart_format: true,
        model: "nova-2",
        utterances: true,
        paragraphs: true,
      }, { timeoutInSeconds: 300 });
    });

    if (!response || !("results" in response)) {
      throw new Error(
        "No transcription results returned from Deepgram. It might have returned an accepted response (callback)."
      );
    }

    const results = response as ListenV1Response;
    const channel = results.results.channels[0];
    if (!channel) {
      throw new Error("No channels found in Deepgram response");
    }
    const alternative = (channel.alternatives ?? [])[0];
    if (!alternative) {
      throw new Error("No transcription alternatives found in Deepgram response");
    }

    const transcript: string = alternative.transcript || "";
    const words: any[] = alternative.words || [];

    return { transcript, words };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Deepgram transcription error:", errorMessage);
    throw err;
  }
}
