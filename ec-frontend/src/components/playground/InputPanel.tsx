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
        <div className="flex flex-col h-full border-r border-border bg-card">
            {/* Header */}
            <div className="panel-header">
                <h2 className="panel-title">Input</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Llama 3 8B</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* System Prompt Accordion */}
                <div className="border-b border-border">
                    <button
                        onClick={() => setIsSystemPromptOpen(!isSystemPromptOpen)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                        {isSystemPromptOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        System Prompt
                    </button>
                    {isSystemPromptOpen && (
                        <div className="px-4 pb-4">
                            <textarea
                                className="input-base w-full h-24 font-mono text-xs resize-none"
                                placeholder="You are a helpful assistant..."
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* User Prompt */}
                <div className="flex-1 p-4 flex flex-col gap-2">
                    <label className="label-sm">User Prompt</label>
                    <textarea
                        className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground"
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
            <div className="p-4 border-t border-border bg-secondary space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="label-sm">Temperature</label>
                            <span className="text-xs font-mono text-muted-foreground">{temperature}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-primary/80"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="label-sm">Max Tokens</label>
                            <span className="text-xs font-mono text-muted-foreground">{maxTokens}</span>
                        </div>
                        <input
                            type="number"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            className="input-base w-full text-xs font-mono py-0.5"
                        />
                    </div>
                </div>

                <button
                    onClick={handleRun}
                    disabled={isStreaming || !userPrompt.trim()}
                    className="btn-primary w-full"
                >
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                    {isStreaming ? "Running..." : "Run Request"}
                </button>
            </div>
        </div>
    )
}
