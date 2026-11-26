import { NextResponse, type NextRequest } from "next/server";

const MACHINE_NEGOTIATED_PATHS: ReadonlySet<string> = new Set([
  "/",
  "/menu",
  "/our-story",
  "/visit-us",
  "/gallery",
]);

/**
 * Checks whether the client explicitly prefers Markdown (e.g. `Accept: text/markdown`
 * sent by AI coding agents, Cloudflare-compatible crawlers, or `curl -H "Accept: text/markdown"`).
 * Normal browser requests (`Accept: text/html,...` or wildcard accept headers) always continue to the HTML page.
 */
function prefersMarkdown(acceptHeader: string): boolean {
  if (!acceptHeader) return false;
  const lower = acceptHeader.toLowerCase();
  if (!lower.includes("text/markdown") && !lower.includes("text/x-markdown")) {
    return false;
  }

  // Respect explicit q-values if both text/html and text/markdown are listed
  const parts = lower.split(",").map((part) => part.trim());
  let mdQ = 0;
  let htmlQ = 0;
  for (const part of parts) {
    const [media, ...params] = part.split(";").map((s) => s.trim());
    const qParam = params.find((p) => p.startsWith("q="));
    const parsed = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    const q = Number.isFinite(parsed) ? parsed : 1;
    if (media === "text/markdown" || media === "text/x-markdown") {
      mdQ = Math.max(mdQ, q);
    } else if (media === "text/html") {
      htmlQ = Math.max(htmlQ, q);
    }
  }
  return mdQ > 0 && mdQ >= htmlQ;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!MACHINE_NEGOTIATED_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") ?? "";
  if (
    (request.method === "GET" || request.method === "HEAD") &&
    prefersMarkdown(accept)
  ) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? "/api/machine" : `/api/machine${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Ensure CDNs & browsers key cached HTML separately from negotiated Markdown
  const response = NextResponse.next();
  const existingVary = response.headers.get("vary");
  if (!existingVary) {
    response.headers.set("Vary", "Accept");
  } else if (!existingVary.toLowerCase().includes("accept")) {
    response.headers.set("Vary", `${existingVary}, Accept`);
  }
  return response;
}

export const config = {
  matcher: ["/", "/menu", "/our-story", "/visit-us", "/gallery"],
};
