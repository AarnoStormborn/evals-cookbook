import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import ReactMarkdown from "react-markdown"
import { TokenStream } from "@/components/x-ray/TokenStream"
import { Speedometer } from "@/components/metrics/Speedometer"
import { ConfidenceHeatmap } from "@/components/metrics/ConfidenceHeatmap"
import { RunDetails } from "@/components/playground/RunDetails"

type ViewMode = "text" | "xray" | "json"
type Tab = "analysis" | "details"

export function AnalysisPanel() {
    const [activeTab, setActiveTab] = useState<Tab>("analysis")
    const [viewMode, setViewMode] = useState<ViewMode>("text")
    const [showHeatmap, setShowHeatmap] = useState(false)
    const { output } = useAppStore()

    return (
        <div className="flex flex-col h-full bg-card border-l border-border">
            {/* Header */}
            <div className="panel-header">
                {/* Top-Level Tabs */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("analysis")}
                        className={cn(
                            "text-sm font-semibold transition-colors",
                            activeTab === "analysis" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab("details")}
                        className={cn(
                            "text-sm font-semibold transition-colors",
                            activeTab === "details" ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        Run Details
                    </button>
                </div>

                {/* Analysis Controls (Only visible in Analysis tab) */}
                {activeTab === "analysis" && (
                    <div className="flex items-center gap-4">
                        {viewMode === "text" && (
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showHeatmap}
                                    onChange={(e) => setShowHeatmap(e.target.checked)}
                                    className="rounded border-border bg-input text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                Heatmap
                            </label>
                        )}

                        {/* View Toggles */}
                        <div className="flex bg-background p-0.5 rounded-md border border-border">
                            <ViewToggle active={viewMode === "text"} onClick={() => setViewMode("text")}>Text</ViewToggle>
                            <ViewToggle active={viewMode === "xray"} onClick={() => setViewMode("xray")}>X-Ray</ViewToggle>
                            <ViewToggle active={viewMode === "json"} onClick={() => setViewMode("json")}>JSON</ViewToggle>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {activeTab === "analysis" ? (
                <>
                    {/* Metrics Header */}
                    <div className="px-4 py-3 border-b border-border bg-secondary/50">
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
                </>
            ) : (
                <RunDetails />
            )}
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
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
        >
            {children}
        </button>
    )
}
