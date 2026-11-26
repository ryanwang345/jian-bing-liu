import {
  buildLlmsTxt,
  createMachineMarkdownResponse,
} from "@/lib/machine-markdown";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const markdown = await buildLlmsTxt();
  return createMachineMarkdownResponse(request, markdown);
}

export async function HEAD(request: Request) {
  const markdown = await buildLlmsTxt();
  return createMachineMarkdownResponse(request, markdown, { headOnly: true });
}
