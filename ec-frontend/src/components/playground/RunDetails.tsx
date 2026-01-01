import { useAppStore } from "@/store/appStore"

export function RunDetails() {
    const { systemPrompt, userPrompt, output } = useAppStore()

    return (
        <div className="flex flex-col h-full bg-zinc-950 p-6 space-y-6 overflow-auto">
            {/* Comparison */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prompt</h3>
                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 text-sm font-mono whitespace-pre-wrap text-zinc-300">
                        {systemPrompt && (
                            <div className="mb-4 pb-4 border-b border-zinc-800">
                                <span className="text-zinc-500 block mb-1 text-[10px] uppercase">System</span>
                                {systemPrompt}
                            </div>
                        )}
                        <div>
                            <span className="text-zinc-500 block mb-1 text-[10px] uppercase">User</span>
                            {userPrompt || <span className="text-zinc-600 italic">No user prompt entered...</span>}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Output</h3>
                    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 text-sm font-mono whitespace-pre-wrap text-zinc-300">
                        {output || <span className="text-zinc-600 italic">No output generated yet...</span>}
                    </div>
                </div>
            </div>

            {/* Judge Reasoning (Placeholder for Playground) */}
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Judge Reasoning</h3>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4 text-sm text-zinc-500 italic">
                    Run an evaluation to see judge reasoning here.
                </div>
            </div>
        </div>
    )
}
