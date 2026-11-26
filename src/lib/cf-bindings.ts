import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1ExecResult<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1ExecResult<T>>;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run(): Promise<D1ExecResult>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatement[]
  ): Promise<Array<D1ExecResult<T>>>;
}

export interface R2HttpMetadata {
  contentType?: string;
  cacheControl?: string;
}

export interface R2ObjectBody {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: R2HttpMetadata;
  httpEtag?: string;
  size: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream<Uint8Array> | string,
    options?: { httpMetadata?: R2HttpMetadata }
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
}

interface ImageTransform {
  transform(options: { width: number; height: number; fit: "scale-down" }): ImageTransform;
  output(options: { format: "image/webp"; quality: number }): Promise<{ response(): Response }>;
}

interface CloudflareMenuEnv {
  IMAGES?: { input(stream: ReadableStream<Uint8Array>): ImageTransform };
  ASSETS?: { fetch(request: Request): Promise<Response> };
  MENU_DB?: D1Database;
  MENU_IMAGES?: R2Bucket;
}

export async function getCfEnv(): Promise<CloudflareMenuEnv | undefined> {
  try {
    // Use sync mode so `next build` (including inside Alpine Docker) and standalone
    // Node containers never try to spawn Miniflare/workerd, while Cloudflare Workers
    // and `next dev` (`initOpenNextCloudflareForDev`) still resolve `env` immediately.
    const { env } = getCloudflareContext();
    return env as unknown as CloudflareMenuEnv | undefined;
  } catch {
    return undefined;
  }
}

export async function getMenuDb(): Promise<D1Database | null> {
  const env = await getCfEnv();
  return env?.MENU_DB ?? null;
}

export async function getMenuImagesBucket(): Promise<R2Bucket | null> {
  const env = await getCfEnv();
  return env?.MENU_IMAGES ?? null;
}
