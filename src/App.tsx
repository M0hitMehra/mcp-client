import React, { useState, useEffect } from 'react';
import { MCPClient, MCPManifest, MCPTool } from './lib/mcpClient';
import { ManifestSidebar } from './components/ManifestSidebar';
import { ToolForm } from './components/ToolForm';
import { OutputViewer } from './components/OutputViewer';
import { Settings, Key, Server, Trash2 } from 'lucide-react';

function App() {
    // State for connection settings
    const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_DEFAULT_MCP_URL || 'http://localhost:8443');
    const [apiKey, setApiKey] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // State for MCP data
    const [manifest, setManifest] = useState<MCPManifest | null>(null);
    const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
    const [output, setOutput] = useState<any>(null);
    const [outputMeta, setOutputMeta] = useState<any>(null);
    const [outputError, setOutputError] = useState<string | undefined>(undefined);
    const [isRunning, setIsRunning] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        const storedUrl = localStorage.getItem('mcp_server_url');
        const storedKey = localStorage.getItem('mcp_api_key');
        if (storedUrl) setServerUrl(storedUrl);
        if (storedKey) setApiKey(storedKey);
    }, []);

    // Save settings to localStorage when they change
    const handleSaveSettings = () => {
        localStorage.setItem('mcp_server_url', serverUrl);
        if (apiKey) {
            localStorage.setItem('mcp_api_key', apiKey);
        } else {
            localStorage.removeItem('mcp_api_key');
        }
    };

    const handleClearStorage = () => {
        if (window.confirm('Are you sure you want to clear local storage? This will remove your saved URL and API Key.')) {
            localStorage.removeItem('mcp_server_url');
            localStorage.removeItem('mcp_api_key');
            setServerUrl(import.meta.env.VITE_DEFAULT_MCP_URL || 'http://localhost:8443');
            setApiKey('');
            setIsConnected(false);
            setManifest(null);
            setSelectedTool(null);
        }
    };

    const connect = async () => {
        setIsConnecting(true);
        setOutputError(undefined);
        try {
            handleSaveSettings();
            const client = new MCPClient(serverUrl, apiKey);
            const manifestData = await client.fetchManifest();
            setManifest(manifestData);
            setIsConnected(true);
            if (manifestData.tools.length > 0) {
                setSelectedTool(manifestData.tools[0]);
            }
        } catch (err) {
            console.error(err);
            setOutputError(`Failed to connect to MCP server: ${err instanceof Error ? err.message : String(err)}`);
            setIsConnected(false);
        } finally {
            setIsConnecting(false);
        }
    };

    const runTool = async (inputs: Record<string, any>) => {
        if (!selectedTool) return;

        setIsRunning(true);
        setOutput(null);
        setOutputMeta(null);
        setOutputError(undefined);

        const startTime = performance.now();

        try {
            const client = new MCPClient(serverUrl, apiKey);
            const result = await client.callTool(selectedTool.name, inputs);
            const endTime = performance.now();

            setOutput(result);
            setOutputMeta({
                status: 200,
                statusText: 'OK',
                headers: {}, // We don't easily get headers from fetch unless we change the client to return them
                durationMs: Math.round(endTime - startTime),
            });
        } catch (err) {
            const endTime = performance.now();
            console.error(err);
            setOutputError(err instanceof Error ? err.message : String(err));
            setOutputMeta({
                status: 500, // Approximate
                statusText: 'Error',
                headers: {},
                durationMs: Math.round(endTime - startTime),
            });
        } finally {
            setIsRunning(false);
        }
    };


    function parseMcpContent(response: any = []) {

        return response

        // console.log("response", response)
        // if (!response) return {}

        // console.log(response)
        // const parsed = [];

        // for (const block of response?.content) {
        //     if (block.type === "text") {
        //         const text = block.text;

        //         try {
        //             // attempt JSON parse
        //             const json = JSON.parse(text);
        //             parsed.push(json);
        //         } catch (e) {
        //             // not JSON → keep raw text
        //             parsed.push(text);
        //         }
        //     }
        // }

        // return parsed;
    }


    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Server className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-800">MCP Universal Client</h1>
                </div>

                <div className="flex items-center space-x-4 flex-1 justify-end max-w-4xl">
                    <div className="flex items-center space-x-2 flex-1 max-w-md">
                        <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Server URL</label>
                        <input
                            type="text"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                            placeholder="http://localhost:8443"
                        />
                    </div>

                    <div className="flex items-center space-x-2 flex-1 max-w-xs">
                        <label className="text-xs font-medium text-gray-500 whitespace-nowrap flex items-center">
                            <Key className="w-3 h-3 mr-1" /> API Key
                        </label>
                        <input
                            type="password"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                        />
                    </div>

                    <button
                        onClick={connect}
                        disabled={isConnecting}
                        className={`px-4 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${isConnected
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                            } ${isConnecting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isConnecting ? 'Connecting...' : isConnected ? 'Refresh' : 'Connect'}
                    </button>

                    <button
                        onClick={handleClearStorage}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Clear Local Storage"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {isConnected && manifest ? (
                    <>
                        <ManifestSidebar
                            tools={manifest.tools}
                            selectedTool={selectedTool}
                            onSelectTool={setSelectedTool}
                        />
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="flex-1 border-r border-gray-200 overflow-hidden">
                                {selectedTool ? (
                                    <ToolForm
                                        tool={selectedTool}
                                        onRun={runTool}
                                        isLoading={isRunning}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        Select a tool to get started
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-gray-50 overflow-hidden">
                                <OutputViewer
                                    output={parseMcpContent(output)}
                                    meta={outputMeta}
                                    error={outputError}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Server className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect to MCP Server</h2>
                            <p className="text-gray-600 mb-6">
                                Enter your MCP server URL and API key above to discover and interact with available tools.
                            </p>
                            {outputError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-left text-sm text-red-700 mb-4">
                                    <p className="font-bold mb-1">Connection Failed</p>
                                    <p>{outputError}</p>
                                    <p className="mt-2 text-xs text-red-600">
                                        Tip: Ensure your server has CORS enabled if running locally, or use a proxy.
                                    </p>
                                </div>
                            )}
                            <div className="text-xs text-gray-400 mt-4">
                                Settings are stored locally in your browser.
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
