export interface MCPTool {
    name: string;
    description?: string;
    inputSchema: {
        type: string;
        properties?: Record<string, any>;
        required?: string[];
        [key: string]: any;
    };
}

export interface MCPManifest {
    name?: string;
    version?: string;
    tools: MCPTool[];
}

export interface MCPCallRequest {
    name: string;
    arguments: Record<string, any>;
}

export interface MCPCallResponse {
    content: Array<{
        type: string;
        text?: string;
        [key: string]: any;
    }>;
    isError?: boolean;
}

export class MCPClient {
    private baseUrl: string;
    private apiKey?: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }

    async fetchManifest(): Promise<MCPManifest> {
        // TODO: verify with mcp-client-typescript/index.ts if this path is correct
        // Assuming standard /.well-known/mcp-manifest.json or similar if HTTP
        // But since we are connecting to a server that might be running via stdio in the reference implementation,
        // we are assuming here it is exposed via HTTP.
        // If the server uses a different path, this needs to be updated.
        // Based on the prompt, we should try `/.well-known/mcp-manifest.json` first.
        // However, the prompt also says "Lets a user select a tool... Sends MCP call requests".
        // The reference client uses `listTools` via SDK.
        // We will assume the server exposes `POST /` for JSON-RPC or specific endpoints.
        // Given the prompt asks for "Connect button that fetches /.well-known/mcp-manifest.json", we'll stick to that.

        // Wait, the prompt says: "Connect button that fetches /.well-known/mcp-manifest.json (or path from index.ts spec)".
        // index.ts uses SDK `listTools()`.
        // We will implement a fetch to `/.well-known/mcp-manifest.json` as requested.

        try {
            // Try the standard manifest location
            const response = await fetch(`${this.baseUrl}/.well-known/mcp-manifest.json`, {
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                // Fallback: maybe it's just /mcp/manifest or similar? 
                // For now, throw error to let UI handle it.
                throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            // If the manifest endpoint doesn't exist, we might be dealing with a server that only does JSON-RPC.
            // But for this task, we are explicitly asked to fetch a manifest JSON.
            throw error;
        }
    }

    async callTool(toolName: string, args: Record<string, any>): Promise<MCPCallResponse> {
        // TODO: verify with mcp-client-typescript/index.ts
        // The prompt suggests `POST /mcp/call` with `{ tool: "<id>", inputs: {...} }`.
        // The SDK uses JSON-RPC.
        // We will follow the prompt's suggested shape:
        // POST to `/mcp/call` with JSON: { "tool": "get-user-by-id", "inputs": {"id":"1234"}, "context": {} }

        const payload = {
            name: toolName, // Prompt says "tool", but SDK usually uses "name". Prompt example: "tool": "get-user-by-id".
            // We will use "name" to match the prompt's example if we look closely at the prompt example:
            // "tool": "get-user-by-id"
            // Wait, let's look at the prompt example again.
            // Prompt: { "tool": "get-user-by-id", "inputs": {"id":"1234"}, "context": {} }
            // So we should use "tool".

            tool: toolName,
            arguments: args, // Prompt says "inputs", SDK says "arguments". Prompt example: "inputs": {...}
            inputs: args,
            context: {}
        };

        const response = await fetch(`${this.baseUrl}/mcp/call`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tool call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    }
}
