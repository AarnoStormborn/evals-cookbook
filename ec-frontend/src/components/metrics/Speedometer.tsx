import { Zap, Clock, Activity } from "lucide-react"
import { useAppStore } from "@/store/appStore"

export function Speedometer() {
    const { metrics } = useAppStore()

    return (
        <div className="flex gap-6">
            <MetricItem
                icon={<Zap className="h-3 w-3 text-yellow-500" />}
                label="TPS"
                value={metrics.tps.toString()}
                unit="tok/s"
            />
            <MetricItem
                icon={<Clock className="h-3 w-3 text-blue-500" />}
                label="TTFT"
                value={metrics.ttft.toString()}
                unit="ms"
            />
            <MetricItem
                icon={<Activity className="h-3 w-3 text-emerald-500" />}
                label="Total"
                value={metrics.totalLatency.toString()}
                unit="ms"
            />
        </div>
    )
}

function MetricItem({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none mb-0.5">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-mono font-bold text-foreground leading-none">{value}</span>
                    <span className="text-[10px] text-muted-foreground leading-none">{unit}</span>
                </div>
            </div>
        </div>
    )
}
