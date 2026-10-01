import { handleMcp } from "@/lib/mcp/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handle = (request: Request) => handleMcp(request);

export { handle as GET, handle as POST, handle as DELETE };
