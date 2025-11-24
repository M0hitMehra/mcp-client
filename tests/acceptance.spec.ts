import { test, expect } from '@playwright/test';

test.describe('MCP Frontend Acceptance', () => {
    test('Load manifest and list tools', async ({ page }) => {
        // Mock the manifest request
        await page.route('**/.well-known/mcp-manifest.json', async route => {
            const json = {
                name: "test-server",
                version: "1.0",
                tools: [
                    {
                        name: "test-tool",
                        description: "A test tool",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: { type: "string" }
                            }
                        }
                    }
                ]
            };
            await route.fulfill({ json });
        });

        await page.goto('/');

        // Fill server URL (should be default, but let's ensure)
        await page.getByPlaceholder('http://localhost:8443').fill('http://localhost:8443');

        // Click connect
        await page.getByRole('button', { name: 'Connect' }).click();

        // Check if tool is listed
        await expect(page.getByText('test-tool')).toBeVisible();
        await expect(page.getByText('A test tool')).toBeVisible();
    });

    test('Run tool - simple', async ({ page }) => {
        // Mock manifest
        await page.route('**/.well-known/mcp-manifest.json', async route => {
            await route.fulfill({
                json: {
                    tools: [{
                        name: "echo",
                        inputSchema: {
                            type: "object",
                            properties: { msg: { type: "string" } },
                            required: ["msg"]
                        }
                    }]
                }
            });
        });

        // Mock tool call
        await page.route('**/mcp/call', async route => {
            const request = route.request();
            const postData = request.postDataJSON();
            expect(postData.tool).toBe('echo');
            expect(postData.inputs.msg).toBe('Hello World');

            await route.fulfill({
                json: {
                    content: [{ type: "text", text: "Echo: Hello World" }]
                }
            });
        });

        await page.goto('/');
        await page.getByRole('button', { name: 'Connect' }).click();

        // Select tool
        await page.getByText('echo').click();

        // Fill form
        await page.getByLabel('msg').fill('Hello World');

        // Run
        await page.getByRole('button', { name: 'Run Tool' }).click();

        // Verify output
        await expect(page.getByText('"Echo: Hello World"')).toBeVisible();
    });

    test('Save & clear API key', async ({ page }) => {
        await page.goto('/');

        // Set API key
        await page.getByPlaceholder('sk-...').fill('test-api-key');
        await page.getByRole('button', { name: 'Connect' }).click(); // Triggers save

        // Reload
        await page.reload();

        // Check persistence
        await expect(page.getByPlaceholder('sk-...')).toHaveValue('test-api-key');

        // Clear
        page.on('dialog', dialog => dialog.accept());
        await page.getByTitle('Clear Local Storage').click();

        // Check cleared
        await expect(page.getByPlaceholder('sk-...')).toHaveValue('');
    });
});
