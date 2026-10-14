/**
 * Purpose: Serve BenefitBridge tools over the required Streamable HTTP MCP transport.
 * Function: Adapts Next.js Web Requests to the official MCP handler with 2025-era compatibility.
 * Inputs/Outputs: MCP HTTP requests at /mcp in, MCP JSON/SSE responses out.
 */
import { timingSafeEqual } from "node:crypto";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createBenefitBridgeMcpServer } from "../../mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler(() => createBenefitBridgeMcpServer(), {
  legacy: "stateless",
  responseMode: "auto",
  maxRequestBodySize: 256 * 1024,
  onerror: (error) => {
    console.error("[BenefitBridge][mcp-http] Request failed", {
      message: error.message,
      stack: error.stack
    });
  }
});

async function serve(request: Request): Promise<Response> {
  // Fail closed: no anonymous case access, writes, schedules, or Bedrock spending.
  // This is a single-operator demo credential, NOT multi-user authorization.
  const secret = process.env.BENEFITBRIDGE_MCP_TOKEN;
  if (!secret || secret.length < 32) return Response.json({ error: "Private MCP demo is not configured. Use the browser-local simulator." }, { status: 503 });
  const provided = request.headers.get("authorization") ?? "";
  const expected = "Bearer " + secret;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Origin rejected" }, { status: 403 });
  console.info("[BenefitBridge][mcp-http] Request started", {
    method: request.method,
    protocolVersion: request.headers.get("mcp-protocol-version")
  });
  const response = await handler.fetch(request);
  console.info("[BenefitBridge][mcp-http] Request completed", {
    method: request.method,
    status: response.status
  });
  return response;
}

export const GET = serve;
export const POST = serve;
export const DELETE = serve;
