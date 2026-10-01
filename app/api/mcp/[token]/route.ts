import { handleMcp } from "@/lib/mcp/handler";

// Same endpoint with the token in the path, for connectors that can't send headers.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handle = (request: Request, { params }: { params: { token: string } }) => handleMcp(request, params.token);

export { handle as GET, handle as POST, handle as DELETE };
