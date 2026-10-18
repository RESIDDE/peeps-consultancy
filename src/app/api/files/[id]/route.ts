import { serveDocument } from "@/server/documents-download";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return serveDocument((await params).id);
}
