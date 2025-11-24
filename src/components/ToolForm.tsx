import React, { useState, useEffect } from 'react';
import { MCPTool } from '../lib/mcpClient';
import { Play, AlertCircle } from 'lucide-react';

interface ToolFormProps {
    tool: MCPTool;
    onRun: (inputs: Record<string, any>) => void;
    isLoading: boolean;
}

export const ToolForm: React.FC<ToolFormProps> = ({ tool, onRun, isLoading }) => {
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [rawJsonMode, setRawJsonMode] = useState(false);
    const [rawJsonInput, setRawJsonInput] = useState('');

    // Reset inputs when tool changes
    useEffect(() => {
        setInputs({});
        setRawJsonMode(false);
        setRawJsonInput('{}');
        setJsonError(null);
    }, [tool]);

    const handleInputChange = (key: string, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rawJsonMode) {
            try {
                const parsed = JSON.parse(rawJsonInput);
                onRun(parsed);
            } catch (err) {
                setJsonError('Invalid JSON');
            }
        } else {
            onRun(inputs);
        }
    };

    const renderField = (key: string, schema: any) => {
        const isRequired = tool.inputSchema.required?.includes(key);
        const label = (
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {key} {isRequired && <span className="text-red-500">*</span>}
            </label>
        );

        if (schema.type === 'string') {
            return (
                <div key={key} className="mb-4">
                    {label}
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={inputs[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        required={isRequired}
                        placeholder={schema.description || ''}
                    />
                    {schema.description && <p className="mt-1 text-xs text-gray-500">{schema.description}</p>}
                </div>
            );
        }

        if (schema.type === 'number' || schema.type === 'integer') {
            return (
                <div key={key} className="mb-4">
                    {label}
                    <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={inputs[key] || ''}
                        onChange={(e) => handleInputChange(key, Number(e.target.value))}
                        required={isRequired}
                        placeholder={schema.description || ''}
                    />
                    {schema.description && <p className="mt-1 text-xs text-gray-500">{schema.description}</p>}
                </div>
            );
        }

        if (schema.type === 'boolean') {
            return (
                <div key={key} className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id={`field-${key}`}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={inputs[key] || false}
                        onChange={(e) => handleInputChange(key, e.target.checked)}
                    />
                    <label htmlFor={`field-${key}`} className="ml-2 block text-sm text-gray-900">
                        {key} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    {schema.description && <p className="ml-2 text-xs text-gray-500">- {schema.description}</p>}
                </div>
            );
        }

        // Fallback for objects/arrays or unknown types -> suggest raw JSON
        return (
            <div key={key} className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-2">
                    Field <strong>{key}</strong> is complex ({schema.type}). Please use Raw JSON mode to input this value.
                </p>
            </div>
        );
    };

    const schemaProperties = tool.inputSchema.properties || {};
    const hasComplexTypes = Object.values(schemaProperties).some((s: any) =>
        s.type === 'object' || s.type === 'array' || s.$ref
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                    {tool.description && <p className="text-sm text-gray-600 mt-1">{tool.description}</p>}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setRawJsonMode(!rawJsonMode)}
                        className={`px-3 py-1 text-xs font-medium rounded border ${rawJsonMode ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {rawJsonMode ? 'Switch to Form' : 'Raw JSON'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit}>
                    {rawJsonMode || hasComplexTypes ? (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Input JSON
                            </label>
                            <textarea
                                className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                value={rawJsonInput}
                                onChange={(e) => {
                                    setRawJsonInput(e.target.value);
                                    setJsonError(null);
                                }}
                                placeholder='{"key": "value"}'
                            />
                            {jsonError && (
                                <div className="mt-2 flex items-center text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {jsonError}
                                </div>
                            )}
                            {!rawJsonMode && hasComplexTypes && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Note: This tool has complex inputs, so we defaulted to JSON mode.
                                </p>
                            )}
                        </div>
                    ) : (
                        Object.entries(schemaProperties).map(([key, schema]) =>
                            renderField(key, schema)
                        )
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <Play className="w-4 h-4 mr-2" />
                            )}
                            Run Tool
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
