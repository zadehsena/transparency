// src/lib/http.ts
export async function fetchWithTimeout(
    url: string,
    opts: RequestInit & { timeoutMs?: number } = {},
    attempt = 1,
    maxAttempts = 3
): Promise<Response> {
    const timeoutMs = opts.timeoutMs ?? 15000; // default 15s
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
        const res = await fetch(url, { ...opts, signal: ctrl.signal, cache: "no-store" });
        if (res.ok) return res;

        // retry on 429/5xx
        if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
            const backoff = 400 * Math.pow(2, attempt - 1);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithTimeout(url, opts, attempt + 1, maxAttempts);
        }
        return res;
    } catch (err) {
        if (attempt < maxAttempts) {
            const backoff = 400 * Math.pow(2, attempt - 1);
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithTimeout(url, opts, attempt + 1, maxAttempts);
        }
        throw err;
    } finally {
        clearTimeout(id);
    }
}
