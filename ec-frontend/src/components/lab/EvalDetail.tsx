import { X } from "lucide-react"

export function EvalDetail({ run, onClose }: { run: any, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 w-[800px] max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-100">Run Details: <span className="font-mono text-zinc-400">{run.id}</span></h2>
                        <p className="text-xs text-zinc-500">Model: {run.model}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-6 bg-zinc-950">
                    {/* Comparison */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prompt</h3>
                            <div className="bg-zinc-900 border border-zinc-800 rounded p-4 text-sm font-mono whitespace-pre-wrap text-zinc-300">
                                {run.prompt}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Output</h3>
                            <div className="bg-zinc-900 border border-zinc-800 rounded p-4 text-sm font-mono whitespace-pre-wrap text-zinc-300">
                                [Mock Output] This is a simulated output for the evaluation run. In a real scenario, this would contain the actual model response.
                            </div>
                        </div>
                    </div>

                    {/* Judge Reasoning */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Judge Reasoning</h3>
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-4 text-sm text-zinc-300">
                            The model successfully followed the instructions. The output is coherent and relevant to the prompt. No safety violations were detected.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-sm font-medium transition-colors border border-zinc-700">Close</button>
                </div>
            </div>
        </div>
    )
}
