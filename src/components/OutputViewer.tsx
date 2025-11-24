import React, { useState } from 'react';
import { Copy, Download, Check, Clock, AlertTriangle } from 'lucide-react';

interface OutputViewerProps {
    output: any;
    meta?: {
        status: number;
        statusText: string;
        headers: Record<string, string>;
        durationMs: number;
    };
    error?: string;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({ output, meta, error }) => {
    const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = JSON.stringify(output, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const text = JSON.stringify(output, null, 2);
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mcp-output-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!output && !error) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                Run a tool to see output here
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-700">Output</h2>
                <div className="flex space-x-2">
                    <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden">
                        <button
                            onClick={() => setViewMode('pretty')}
                            className={`px-3 py-1 text-xs font-medium ${viewMode === 'pretty' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Pretty
                        </button>
                        <div className="w-px bg-gray-300"></div>
                        <button
                            onClick={() => setViewMode('raw')}
                            className={`px-3 py-1 text-xs font-medium ${viewMode === 'raw' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Raw
                        </button>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Download JSON"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {meta && (
                <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 flex items-center space-x-4">
                    <span className={`font-mono ${meta.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                        {meta.status} {meta.statusText}
                    </span>
                    <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {meta.durationMs}ms
                    </span>
                </div>
            )}

            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                        <div className="flex items-center mb-2 font-bold">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Error
                        </div>
                        <pre className="whitespace-pre-wrap">{error}</pre>
                    </div>
                ) : (
                    <pre className="text-gray-800 whitespace-pre-wrap break-all">
                        {viewMode === 'pretty' ? JSON.stringify(output, null, 2) : JSON.stringify(output)}
                    </pre>
                )}
            </div>
        </div>
    );
};
