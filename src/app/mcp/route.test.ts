/** Purpose: Prove public MCP fails closed before persistence or paid language calls. */
import { afterEach, expect, it, vi } from 'vitest';
import { POST } from './route';
afterEach(() => vi.unstubAllEnvs());
it('disables unconfigured public tools', async () => { vi.stubEnv('BENEFITBRIDGE_MCP_TOKEN',''); expect((await POST(new Request('http://localhost/mcp',{method:'POST'}))).status).toBe(503); });
it('rejects unauthorized and cross-origin access', async () => { vi.stubEnv('BENEFITBRIDGE_MCP_TOKEN','x'.repeat(40)); expect((await POST(new Request('http://localhost/mcp',{method:'POST'}))).status).toBe(401); expect((await POST(new Request('http://localhost/mcp',{method:'POST',headers:{authorization:'Bearer '+'x'.repeat(40),origin:'https://evil.example'}}))).status).toBe(403); });

it('supports authenticated MCP discovery without public access', async () => {
 vi.stubEnv('BENEFITBRIDGE_MCP_TOKEN','z'.repeat(40));
 const response = await POST(new Request('http://localhost/mcp',{method:'POST',headers:{authorization:'Bearer '+'z'.repeat(40),'content-type':'application/json',accept:'application/json, text/event-stream','mcp-protocol-version':'2025-11-25'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list',params:{}})}));
 expect(response.status).toBe(200);
 const text=await response.text(); expect(text).toContain('benefitbridge_start_case'); expect(text).toContain('description');
});

it('rejects same-character-length multibyte credentials without throwing', async()=>{vi.stubEnv('BENEFITBRIDGE_MCP_TOKEN','x'.repeat(40));expect((await POST(new Request('http://localhost/mcp',{method:'POST',headers:{authorization:'Bearer '+'é'.repeat(40)}}))).status).toBe(401);});
