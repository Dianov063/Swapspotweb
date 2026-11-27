const retryableCodes = new Set([
  "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ECONNRESET", "UND_ERR_CONNECT_TIMEOUT",
]);
const retryableStatuses = new Set([502, 503, 504]);

export async function readDirectoryPage<T>(
  request: (signal: AbortSignal) => Promise<Response>,
  pause = () => new Promise<void>((resolve) => setTimeout(resolve, 250 + Math.random() * 250)),
): Promise<T[]> {
  for (let attempt = 1; ; attempt++) {
    const signal = AbortSignal.timeout(4_000);
    let status: number | undefined;
    try {
      const response = await request(signal);
      if (!response.ok) {
        status = response.status;
        void response.body?.cancel().catch(() => {});
        throw new Error(`Directory upstream HTTP ${status}`);
      }
      const rows: unknown = await response.json();
      if (!Array.isArray(rows)) throw new Error("Directory upstream returned a non-array response");
      return rows as T[];
    } catch (error) {
      const cause = (error as { cause?: { code?: string } } | null)?.cause?.code;
      const reason = signal.aborted ? "timeout" : status ?? (cause && retryableCodes.has(cause) ? cause : "unexpected");
      const retry = attempt === 1 && (signal.aborted ||
        (status !== undefined && retryableStatuses.has(status)) ||
        (cause !== undefined && retryableCodes.has(cause)));
      console[retry ? "warn" : "error"]("SwapSpot directory-category-pairs upstream", { attempt, reason, retry });
      if (!retry) throw error;
      await pause();
    }
  }
}
