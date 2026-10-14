/**
 * Purpose: Provide a lightweight deployment and review health check.
 * Function: Reports that the web application and MCP endpoint are configured.
 * Inputs/Outputs: No input; JSON service status output.
 */
import { BENEFITBRIDGE_MCP_VERSION } from "@/mcp/server";

export async function GET(): Promise<Response> {
  console.info("[BenefitBridge][health] Health check requested");
  return Response.json({
    status: "ok",
    service: "benefitbridge-alexa",
    mcpEndpoint: "/mcp",
    mcpVersion: BENEFITBRIDGE_MCP_VERSION,
    timestamp: new Date().toISOString()
  });
}
