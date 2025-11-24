import { useAppStore } from "@/store/appStore"
import { cn } from "@/lib/utils"

export function ConfidenceHeatmap() {
    const { tokens } = useAppStore()

    return (
        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {tokens.length === 0 && (
                <div className="text-muted-foreground italic">
                    Ready to generate...
                </div>
            )}
            {tokens.map((token) => (
                <HeatmapToken key={token.id} token={token} />
            ))}
        </div>
    )
}

function HeatmapToken({ token }: { token: any }) {
    // Calculate entropy/confidence from logprob
    // logprob is usually negative. Closer to 0 is high confidence.
    // e.g. 0 to -0.1 (High), -0.1 to -1.0 (Medium), < -1.0 (Low)

    let bgClass = "bg-transparent"
    let textClass = "text-zinc-300"

    const logprob = token.logprob

    if (logprob > -0.1) {
        // High confidence
        textClass = "text-zinc-300"
    } else if (logprob > -0.5) {
        // Medium confidence
        bgClass = "bg-yellow-500/20"
        textClass = "text-yellow-200"
    } else {
        // Low confidence
        bgClass = "bg-red-500/30"
        textClass = "text-red-200"
    }

    return (
        <span
            className={cn(
                "transition-colors duration-300",
                bgClass,
                textClass
            )}
            title={`Logprob: ${logprob.toFixed(4)}`}
        >
            {token.text}
        </span>
    )
}
