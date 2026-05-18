// Rate-limit error codes that should trigger key rotation
const ROTATE_ON = new Set([401, 402, 403, 429]);
const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";

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

async function validateKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${NVIDIA_API_BASE}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      method: "HEAD",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export class KeyPool {
  private keys: string[];
  private index = 0;
  private usageCount = new Map<string, number>();
  private validatedKeys: Set<string> | null = null;

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

  /** Validate all keys and remove invalid ones. Called automatically on first run. */
  async validateKeys(): Promise<void> {
    const validKeys: string[] = [];
    for (const key of this.keys) {
      if (await validateKey(key)) {
        validKeys.push(key);
      } else {
        console.warn(`Key validation failed, removing: ${key.slice(0, 8)}...`);
      }
    }
    if (validKeys.length === 0) {
      throw new Error("All API keys failed validation");
    }
    this.keys = validKeys;
    this.validatedKeys = new Set(validKeys);
    this.index = 0;
    this.usageCount.clear();
    validKeys.forEach((k) => this.usageCount.set(k, 0));
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
    if (!this.validatedKeys) {
      await this.validateKeys();
    }

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
