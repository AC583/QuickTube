// Rate-limit error codes that should trigger key rotation
const ROTATE_ON = new Set([401, 402, 403, 429]);

function isRotatableError(err: unknown): boolean {
  if (err instanceof Error) {
    // OpenAI-compatible SDKs expose a `status` field
    const status = (err as any).status ?? (err as any).statusCode;
    if (typeof status === "number") return ROTATE_ON.has(status);
    // Deepgram and others may embed the code in the message
    if (/rate.?limit|quota|unauthorized|forbidden|credits/i.test(err.message))
      return true;
  }
  return false;
}

export class KeyPool {
  private keys: string[];
  private index = 0;
  private usageCount = new Map<string, number>();

  constructor(keys: string[]) {
    if (keys.length === 0) throw new Error("KeyPool requires at least one key");
    this.keys = keys;
    keys.forEach((k) => this.usageCount.set(k, 0));
  }

  /** Build a KeyPool from a comma-separated env var (e.g. "key1,key2,key3"). */
  static fromEnv(envVar: string): KeyPool {
    const raw = process.env[envVar] ?? "";
    const keys = raw.split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length === 0)
      throw new Error(`No API keys found in env var ${envVar}`);
    return new KeyPool(keys);
  }

  get current(): string {
    return this.keys[this.index];
  }

  getUsage(key: string): number {
    return this.usageCount.get(key) ?? 0;
  }

  private incrementUsage(key: string): void {
    const count = this.usageCount.get(key) ?? 0;
    this.usageCount.set(key, count + 1);
    if (count > 0 && count % 50 === 0) {
      console.log(`Key usage: ${key.slice(0, 8)}... used ${count} times`);
    }
  }

  private rotate(): boolean {
    if (this.index < this.keys.length - 1) {
      this.index++;
      return true;
    }
    return false;
  }

  /**
   * Run `fn` with the current key, rotating to the next key on rate-limit /
   * auth errors and retrying automatically. Throws once all keys are exhausted.
   *
   * Usage:
   *   const result = await pool.run((key) => callSomeApi(key));
   */
  async run<T>(fn: (key: string) => Promise<T>): Promise<T> {
    while (true) {
      try {
        const result = await fn(this.current);
        this.incrementUsage(this.current);
        return result;
      } catch (err) {
        if (!isRotatableError(err)) throw err;
        console.warn(
          `Key at index ${this.index} hit a limit. Rotating to next key…`
        );
        if (!this.rotate()) {
          throw new Error(
            `All ${this.keys.length} API key(s) exhausted. Last error: ${err}`
          );
        }
      }
    }
  }
}
