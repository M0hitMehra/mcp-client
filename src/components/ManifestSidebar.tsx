import React from 'react';
import { MCPTool } from '../lib/mcpClient';
import { Wrench, Search } from 'lucide-react';

interface ManifestSidebarProps {
    tools: MCPTool[];
    selectedTool: MCPTool | null;
    onSelectTool: (tool: MCPTool) => void;
}

export const ManifestSidebar: React.FC<ManifestSidebarProps> = ({ tools, selectedTool, onSelectTool }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Tools</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredTools.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No tools found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {filteredTools.map((tool) => (
                            <li key={tool.name}>
                                <button
                                    onClick={() => onSelectTool(tool)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-150 focus:outline-none ${selectedTool?.name === tool.name ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900 truncate" title={tool.name}>
                                            {tool.name}
                                        </span>
                                        <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                    </div>
                                    {tool.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2" title={tool.description}>
                                            {tool.description}
                                        </p>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
