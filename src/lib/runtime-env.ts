import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Reads runtime environment variables / secrets cleanly across both
 * Cloudflare Workers (`getCloudflareContext().env`) and Node.js (`process.env`).
 */
export async function getRuntimeEnv(name: string): Promise<string | undefined> {
  try {
    // Sync mode reads an existing Cloudflare Worker / `next dev` context without
    // spawning Miniflare/workerd during `next build` or inside Alpine Docker.
    const { env } = getCloudflareContext();
    const cfVal = (env as unknown as Record<string, unknown> | undefined)?.[name];
    if (typeof cfVal === "string" && cfVal.trim()) {
      return cfVal.trim();
    }
  } catch {
    // Not running inside a Cloudflare Worker request context (e.g. next build / Node container)
  }

  const nodeVal = process.env[name];
  return typeof nodeVal === "string" && nodeVal.trim() ? nodeVal.trim() : undefined;
}
