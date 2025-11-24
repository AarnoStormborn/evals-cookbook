import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"
import { useAppStore } from "@/store/appStore"

export function Sparkline() {
    const { tokens } = useAppStore()

    // Transform tokens to chart data
    // We'll use logprob as a proxy for "perplexity" or confidence
    // Lower logprob (more negative) = Higher perplexity/confusion
    const data = tokens.map((token, index) => ({
        index,
        perplexity: Math.abs(token.logprob), // Visualizing magnitude of negative logprob
        token: token.text
    }))

    if (data.length === 0) return null

    return (
        <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                    <div className="bg-zinc-900 border border-zinc-700 p-2 rounded text-xs shadow-xl">
                                        <div className="text-zinc-400">Token: <span className="text-zinc-200 font-mono">"{data.token}"</span></div>
                                        <div className="text-zinc-400">Perplexity: <span className="text-zinc-200 font-mono">{data.perplexity.toFixed(4)}</span></div>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="perplexity"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
