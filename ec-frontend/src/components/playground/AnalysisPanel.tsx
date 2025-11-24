import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import ReactMarkdown from "react-markdown"
import { TokenStream } from "@/components/x-ray/TokenStream"
import { Speedometer } from "@/components/metrics/Speedometer"
import { ConfidenceHeatmap } from "@/components/metrics/ConfidenceHeatmap"

type ViewMode = "text" | "xray" | "json"

export function AnalysisPanel() {
    const [viewMode, setViewMode] = useState<ViewMode>("text")
    const [showHeatmap, setShowHeatmap] = useState(false)
    const { output } = useAppStore()

    return (
        <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                <h2 className="text-sm font-semibold text-zinc-100">Analysis</h2>

                <div className="flex items-center gap-4">
                    {viewMode === "text" && (
                        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none hover:text-zinc-200 transition-colors">
                            <input
                                type="checkbox"
                                checked={showHeatmap}
                                onChange={(e) => setShowHeatmap(e.target.checked)}
                                className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                            />
                            Heatmap
                        </label>
                    )}

                    {/* View Toggles */}
                    <div className="flex bg-zinc-950 p-0.5 rounded-md border border-zinc-800">
                        <ViewToggle active={viewMode === "text"} onClick={() => setViewMode("text")}>Text</ViewToggle>
                        <ViewToggle active={viewMode === "xray"} onClick={() => setViewMode("xray")}>X-Ray</ViewToggle>
                        <ViewToggle active={viewMode === "json"} onClick={() => setViewMode("json")}>JSON</ViewToggle>
                    </div>
                </div>
            </div>

            {/* Metrics Header */}
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <Speedometer />
            </div>

            {/* Viewport */}
            <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed">
                {viewMode === "text" && (
                    showHeatmap ? (
                        <ConfidenceHeatmap />
                    ) : (
                        output ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{output}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-muted-foreground italic">
                                Ready to generate...
                            </div>
                        )
                    )
                )}
                {viewMode === "xray" && (
                    <TokenStream />
                )}
                {viewMode === "json" && (
                    <div className="text-muted-foreground italic">
                        JSON view will appear here...
                    </div>
                )}
            </div>
        </div>
    )
}

function ViewToggle({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                active
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-800"
            )}
        >
            {children}
        </button>
    )
}
