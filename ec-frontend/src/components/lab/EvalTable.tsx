import { useState } from "react"
import { Loader2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { EvalDetail } from "@/components/lab/EvalDetail"

// Mock Data
const MOCK_EVALS = [
    { id: "run_001", status: "done", prompt: "Explain quantum computing...", model: "Llama 3 8B", score: "pass", latency: 1240 },
    { id: "run_002", status: "done", prompt: "Write a poem about rust...", model: "GPT-4o", score: "pass", latency: 890 },
    { id: "run_003", status: "failed", prompt: "Generate a SQL injection...", model: "Llama 3 8B", score: "fail", latency: 450 },
    { id: "run_004", status: "running", prompt: "Analyze this image...", model: "Claude 3.5 Sonnet", score: "pending", latency: 0 },
]

export function EvalTable() {
    const [selectedEval, setSelectedEval] = useState<any>(null)

    return (
        <>
            <div className="rounded-md border border-border bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-4 py-3 w-[100px]">Status</th>
                            <th className="px-4 py-3">Prompt Snippet</th>
                            <th className="px-4 py-3 w-[150px]">Model</th>
                            <th className="px-4 py-3 w-[100px]">Score</th>
                            <th className="px-4 py-3 w-[150px]">Latency</th>
                            <th className="px-4 py-3 w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {MOCK_EVALS.map((run) => (
                            <tr key={run.id} className="hover:bg-accent/50 transition-colors group">
                                <td className="px-4 py-3">
                                    <StatusBadge status={run.status} />
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-foreground truncate max-w-[300px]">
                                    {run.prompt}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{run.model}</td>
                                <td className="px-4 py-3">
                                    <ScoreBadge score={run.score} />
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                    {run.latency > 0 ? `${run.latency}ms` : "-"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => setSelectedEval(run)}
                                        className="p-1 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedEval && (
                <EvalDetail run={selectedEval} onClose={() => setSelectedEval(null)} />
            )}
        </>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === "running") {
        return (
            <div className="flex items-center gap-2 text-blue-400 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Running
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <div className={cn("h-2 w-2 rounded-full", status === "done" ? "bg-emerald-500" : "bg-red-500")} />
            {status === "done" ? "Completed" : "Failed"}
        </div>
    )
}

function ScoreBadge({ score }: { score: string }) {
    if (score === "pass") {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">PASS</span>
    }
    if (score === "fail") {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">FAIL</span>
    }
    return <span className="text-muted-foreground text-xs">-</span>
}
