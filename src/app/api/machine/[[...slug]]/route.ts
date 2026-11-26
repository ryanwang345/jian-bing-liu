import {
  buildMachinePageMarkdown,
  createMachineMarkdownResponse,
  type MachinePageSlug,
} from "@/lib/machine-markdown";

export const dynamic = "force-dynamic";

const ALLOWED_SLUGS: ReadonlySet<string> = new Set<MachinePageSlug>([
  "home",
  "menu",
  "our-story",
  "visit-us",
  "gallery",
]);

function resolveSlug(slugParts?: string[]): MachinePageSlug | null {
  if (!slugParts || slugParts.length === 0) return "home";
  if (slugParts.length > 1) return null;
  const candidate = slugParts[0];
  return ALLOWED_SLUGS.has(candidate) ? (candidate as MachinePageSlug) : null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await context.params;
  const pageSlug = resolveSlug(slug);
  if (!pageSlug) {
    return new Response("Not Found", { status: 404 });
  }
  const markdown = await buildMachinePageMarkdown(pageSlug);
  return createMachineMarkdownResponse(request, markdown, { noindex: true });
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await context.params;
  const pageSlug = resolveSlug(slug);
  if (!pageSlug) {
    return new Response(null, { status: 404 });
  }
  const markdown = await buildMachinePageMarkdown(pageSlug);
  return createMachineMarkdownResponse(request, markdown, {
    noindex: true,
    headOnly: true,
  });
}
