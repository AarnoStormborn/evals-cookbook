import { useState } from "react"
import { useAppStore } from "@/store/appStore"
import { cn } from "@/lib/utils"

export function TokenStream() {
    const { tokens } = useAppStore()
    const [showWhitespace, setShowWhitespace] = useState(false)

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-end mb-4 gap-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showWhitespace}
                        onChange={(e) => setShowWhitespace(e.target.checked)}
                        className="rounded border-border bg-input text-primary focus:ring-primary"
                    />
                    Show Whitespace
                </label>
            </div>

            {/* Token Stream */}
            <div className="flex-1 flex flex-wrap content-start gap-y-1 font-mono text-sm leading-relaxed select-text">
                {tokens.length === 0 && (
                    <div className="text-muted-foreground italic w-full">
                        No tokens generated yet. Run the model to see the stream.
                    </div>
                )}

                {tokens.map((token, index) => (
                    <Token
                        key={token.id}
                        token={token}
                        index={index}
                        showWhitespace={showWhitespace}
                    />
                ))}
            </div>
        </div>
    )
}

function Token({ token, index, showWhitespace }: { token: any, index: number, showWhitespace: boolean }) {
    // Alternating colors for visibility
    const isEven = index % 2 === 0

    // Handle whitespace visualization
    const displayText = showWhitespace
        ? token.text.replace(/ /g, "·").replace(/\n/g, "↵\n")
        : token.text

    return (
        <div className="group relative inline-block">
            <span
                className={cn(
                    "px-0.5 rounded-[1px] transition-colors cursor-default",
                    isEven ? "bg-transparent" : "bg-muted/30",
                    "hover:bg-primary/20 hover:ring-1 hover:ring-primary/40"
                )}
            >
                {displayText}
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-max">
                <div className="bg-popover border border-border rounded-md shadow-xl p-2 text-xs space-y-1">
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-mono text-foreground">{token.id}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Logprob</span>
                        <span className="font-mono text-foreground">{token.logprob.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">String</span>
                        <span className="font-mono text-emerald-400">"{token.text}"</span>
                    </div>
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
            </div>
        </div>
    )
}
