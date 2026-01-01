import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { getEvalReport, type EvalReport, type EvalRun } from "@/lib/api"

export function EvalDetail({ run, onClose }: { run: EvalRun, onClose: () => void }) {
    const [report, setReport] = useState<EvalReport | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadReport = async () => {
            setLoading(true)
            const data = await getEvalReport(run.id)
            setReport(data)
            setLoading(false)
        }
        loadReport()
    }, [run.id])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border w-[900px] max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="panel-header">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Run Details: <span className="font-mono text-muted-foreground">{run.id.slice(0, 8)}</span>
                        </h2>
                        <p className="text-xs text-muted-foreground">Model: {run.model}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-6 bg-card">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Loading report...
                        </div>
                    ) : report ? (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                <StatCard label="Total Items" value={report.total_items.toString()} />
                                <StatCard label="Pass Rate" value={`${Math.round(report.pass_rate * 100)}%`} highlight={report.pass_rate >= 0.8} />
                                <StatCard label="Avg Latency" value={`${Math.round(report.avg_latency_ms)}ms`} />
                                <StatCard label="Status" value={report.status} />
                            </div>

                            {/* Results */}
                            {report.results && report.results.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="label-sm">Results ({report.results.length})</h3>
                                    <div className="space-y-3 max-h-[400px] overflow-auto">
                                        {report.results.map((result, idx) => (
                                            <div key={idx} className="bg-secondary border border-border rounded-md p-4">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                                                        <p className="text-sm font-mono text-foreground">{result.input_prompt}</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs font-medium ${result.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                                        {result.passed ? "PASS" : "FAIL"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Output</p>
                                                    <p className="text-sm font-mono text-foreground/80 whitespace-pre-wrap">{result.output.slice(0, 500)}{result.output.length > 500 ? "..." : ""}</p>
                                                </div>
                                                {result.failure_reason && (
                                                    <p className="text-xs text-red-400 mt-2">Reason: {result.failure_reason}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-2">Latency: {Math.round(result.latency_ms)}ms</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            Report not available yet
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-secondary flex justify-end">
                    <button onClick={onClose} className="btn-primary">Close</button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="bg-secondary border border-border rounded-md p-3">
            <p className="label-sm mb-1">{label}</p>
            <p className={`text-lg font-mono font-semibold ${highlight ? "text-emerald-400" : "text-foreground"}`}>{value}</p>
        </div>
    )
}
