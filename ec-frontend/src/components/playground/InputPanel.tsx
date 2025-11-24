import { useState } from "react"
import { ChevronDown, ChevronRight, Play, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { runInference } from "@/lib/api"

export function InputPanel() {
    const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)

    const {
        systemPrompt, setSystemPrompt,
        userPrompt, setUserPrompt,
        temperature, setTemperature,
        maxTokens, setMaxTokens,
        isStreaming
    } = useAppStore()

    const handleRun = () => {
        if (!userPrompt.trim()) return
        runInference()
    }

    return (
        <div className="flex flex-col h-full border-r border-zinc-800 bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                <h2 className="text-sm font-semibold text-zinc-100">Input</h2>
                <div className="flex items-center gap-2">
                    {/* Model Selector Placeholder */}
                    <span className="text-xs text-zinc-500">Llama 3 8B</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* System Prompt Accordion */}
                <div className="border-b border-zinc-800">
                    <button
                        onClick={() => setIsSystemPromptOpen(!isSystemPromptOpen)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                    >
                        {isSystemPromptOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        System Prompt
                    </button>
                    {isSystemPromptOpen && (
                        <div className="px-4 pb-4">
                            <textarea
                                className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-sm p-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-300 placeholder:text-zinc-600"
                                placeholder="You are a helpful assistant..."
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* User Prompt */}
                <div className="flex-1 p-4 flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-500">User Prompt</label>
                    <textarea
                        className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600"
                        placeholder="Enter your prompt here..."
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleRun()
                            }
                        }}
                        autoFocus
                    />
                </div>
            </div>

            {/* Controls Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Temperature</label>
                            <span className="text-[10px] font-mono text-zinc-400">{temperature}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-zinc-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Max Tokens</label>
                            <span className="text-[10px] font-mono text-zinc-400">{maxTokens}</span>
                        </div>
                        <input
                            type="number"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-2 py-0.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <button
                    onClick={handleRun}
                    disabled={isStreaming || !userPrompt.trim()}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-sm text-sm font-medium transition-colors shadow-sm shadow-indigo-900/20",
                        (isStreaming || !userPrompt.trim()) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                    {isStreaming ? "Running..." : "Run Request"}
                </button>
            </div>
        </div>
    )
}
