# MCP Universal Frontend

A universal React + TypeScript frontend for Model Context Protocol (MCP) servers.

## Features

-   **Universal Client**: Connects to any MCP server exposing HTTP endpoints.
-   **Dynamic Forms**: Automatically generates forms based on tool schemas.
-   **Secure**: API keys are stored locally and sent directly to your server.
-   **Developer Friendly**: Raw JSON modes, output inspection, and easy deployment.

## Getting Started

### Prerequisites

-   Node.js 18+
-   An MCP Server running with an HTTP adapter (e.g., exposing `/.well-known/mcp-manifest.json` and `/mcp/call`).

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

1.  Start the development server:
    ```bash
    npm run dev
    ```

2.  Open your browser at `http://localhost:5173`.

3.  **Connect to your MCP Server**:
    -   Enter the **Server URL** (e.g., `http://localhost:8443`).
    -   Enter your **API Key** (if required by your server).
    -   Click **Connect**.

### Running Tests

Run the automated acceptance tests with Playwright:

```bash
npx playwright install --with-deps
npm test
```

## Configuration

You can configure default values in `.env`:

-   `VITE_DEFAULT_MCP_URL`: Default server URL to populate.
-   `VITE_ALLOW_INSECURE_HTTP`: Allow connecting to non-HTTPS servers (default: true).

## API Reference

This frontend expects the MCP server to expose:

-   `GET /.well-known/mcp-manifest.json`: Returns the MCP manifest.
-   `POST /mcp/call`: Executes a tool.

**Example Call Payload:**
```json
{
  "tool": "tool-name",
  "inputs": { "arg": "value" },
  "context": {}
}
```

## License

MIT
