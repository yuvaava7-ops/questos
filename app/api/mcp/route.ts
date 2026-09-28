import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashApiToken, TOKEN_PREFIX } from "@/lib/api-tokens";
import { createQuestOsMcpServer } from "@/lib/mcp/server";

// Remote MCP endpoint (Streamable HTTP, stateless: a fresh server per
// request, JSON responses, no sessions). Auth is a personal access token
// from /dashboard/settings sent as `Authorization: Bearer qos_...`.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized(message: string) {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32001, message }, id: null },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="questos"' } }
  );
}

async function handle(request: Request): Promise<Response> {
  const db = createAdminClient();
  if (!db) {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "MCP is not configured: set SUPABASE_SERVICE_ROLE_KEY." }, id: null },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token.startsWith(TOKEN_PREFIX)) return unauthorized("Missing or malformed bearer token.");

  const { data: row, error } = await db
    .from("api_tokens")
    .select("id, user_id")
    .eq("token_hash", hashApiToken(token))
    .maybeSingle();
  if (error) {
    console.error("[mcp] token lookup failed", error);
    return Response.json({ jsonrpc: "2.0", error: { code: -32603, message: "Token lookup failed." }, id: null }, { status: 500 });
  }
  if (!row) return unauthorized("Invalid or revoked token.");

  // Best-effort; a failed timestamp update shouldn't fail the request.
  void db.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", row.id).then(() => undefined);

  const server = createQuestOsMcpServer(db, row.user_id);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export { handle as GET, handle as POST, handle as DELETE };
