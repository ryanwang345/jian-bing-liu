import {
  buildMachinePageMarkdown,
  createMachineMarkdownResponse,
} from "@/lib/machine-markdown";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const markdown = await buildMachinePageMarkdown("menu");
  return createMachineMarkdownResponse(request, markdown, { noindex: true });
}

export async function HEAD(request: Request) {
  const markdown = await buildMachinePageMarkdown("menu");
  return createMachineMarkdownResponse(request, markdown, {
    noindex: true,
    headOnly: true,
  });
}
