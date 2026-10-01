import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashApiToken, TOKEN_PREFIX } from "@/lib/api-tokens";
import { createQuestOsMcpServer } from "@/lib/mcp/server";

// Remote MCP endpoint (Streamable HTTP, stateless: a fresh server per
// request, JSON responses, no sessions). A personal access token from
// /dashboard/settings authenticates the request, either as
// `Authorization: Bearer qos_...` (Claude Code, API clients) or as the last
// path segment of the URL (/api/mcp/qos_...), which is what lets claude.ai and
// ChatGPT custom connectors work without OAuth.

function unauthorized(message: string) {
  return Response.json(
    { jsonrpc: "2.0", error: { code: -32001, message }, id: null },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="questos"' } }
  );
}

export async function handleMcp(request: Request, urlToken?: string): Promise<Response> {
  const db = createAdminClient();
  if (!db) {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "MCP is not configured: set SUPABASE_SERVICE_ROLE_KEY." }, id: null },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const token = bearer || (urlToken ?? "").trim();
  if (!token.startsWith(TOKEN_PREFIX)) return unauthorized("Missing or malformed token.");

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
