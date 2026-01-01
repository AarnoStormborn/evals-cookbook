import { useState, useEffect } from "react"
import { Loader2, Eye, RefreshCw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { EvalDetail } from "@/components/lab/EvalDetail"
import { fetchEvalRuns, deleteEvalRun, type EvalRun } from "@/lib/api"

export function EvalTable() {
    const [runs, setRuns] = useState<EvalRun[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null)

    const loadRuns = async () => {
        setLoading(true)
        const data = await fetchEvalRuns()
        setRuns(data)
        setLoading(false)
    }

    useEffect(() => {
        loadRuns()
        // Poll for updates every 5 seconds
        const interval = setInterval(loadRuns, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleDelete = async (runId: string) => {
        if (confirm("Delete this evaluation run?")) {
            await deleteEvalRun(runId)
            loadRuns()
        }
    }

    if (loading && runs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading runs...
            </div>
        )
    }

    if (runs.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No evaluation runs yet.</p>
                <p className="text-sm mt-1">Create a new run to get started.</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border border-border bg-card">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
                    <span className="text-xs text-muted-foreground">{runs.length} run(s)</span>
                    <button
                        onClick={loadRuns}
                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-4 py-3 w-[100px]">Status</th>
                            <th className="px-4 py-3">Dataset</th>
                            <th className="px-4 py-3 w-[150px]">Model</th>
                            <th className="px-4 py-3 w-[100px]">Progress</th>
                            <th className="px-4 py-3 w-[100px]">Pass Rate</th>
                            <th className="px-4 py-3 w-[120px]">Latency</th>
                            <th className="px-4 py-3 w-[80px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {runs.map((run) => (
                            <tr key={run.id} className="hover:bg-accent/50 transition-colors group">
                                <td className="px-4 py-3">
                                    <StatusBadge status={run.status} />
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-foreground truncate max-w-[200px]">
                                    {run.dataset_name || run.id.slice(0, 8)}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                    {run.model}
                                </td>
                                <td className="px-4 py-3">
                                    <ProgressBar current={run.completed_items} total={run.total_items} />
                                </td>
                                <td className="px-4 py-3">
                                    <PassRateBadge rate={run.pass_rate} />
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {run.avg_latency_ms ? `${Math.round(run.avg_latency_ms)}ms` : "-"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setSelectedRun(run)}
                                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(run.id)}
                                            className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRun && (
                <EvalDetail run={selectedRun} onClose={() => setSelectedRun(null)} />
            )}
        </>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === "processing" || status === "pending") {
        return (
            <div className="flex items-center gap-2 text-sky-400 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                {status === "pending" ? "Queued" : "Running"}
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <div className={cn("h-2 w-2 rounded-full", status === "completed" ? "bg-emerald-500" : "bg-red-500")} />
            {status === "completed" ? "Completed" : "Failed"}
        </div>
    )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
    const percent = total > 0 ? (current / total) * 100 : 0
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
                {current}/{total}
            </span>
        </div>
    )
}

function PassRateBadge({ rate }: { rate: number | null }) {
    if (rate === null) return <span className="text-muted-foreground text-xs">-</span>

    const percent = Math.round(rate * 100)
    const colorClass = percent >= 80 ? "text-emerald-400" : percent >= 50 ? "text-amber-400" : "text-red-400"

    return (
        <span className={cn("text-xs font-mono font-medium", colorClass)}>
            {percent}%
        </span>
    )
}
