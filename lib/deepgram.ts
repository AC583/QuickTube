import { DeepgramClient, type ListenV1Response } from "@deepgram/sdk";
import { KeyPool } from "./key-pool";

// Set DEEPGRAM_API_KEYS="key1,key2,key3" in .env (falls back to single key)
const deepgramPool = KeyPool.fromEnv(
  process.env.DEEPGRAM_API_KEYS ? "DEEPGRAM_API_KEYS" : "DEEPGRAM_API_KEY"
);

export async function transcribeAudio(audioBuffer: Buffer) {
  try {
    const response = await deepgramPool.run((key) => {
      const client = new DeepgramClient({ apiKey: key });
      return client.listen.v1.media.transcribeFile(audioBuffer, {
        smart_format: true,
        model: "nova-2",
        utterances: true,
        paragraphs: true,
      });
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
