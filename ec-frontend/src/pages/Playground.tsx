import { GlobalLayout } from "@/layouts/GlobalLayout"
import { InputPanel } from "@/components/playground/InputPanel"
import { AnalysisPanel } from "@/components/playground/AnalysisPanel"

export default function Playground() {
    return (
        <GlobalLayout>
            <div className="flex h-full">
                {/* Left Panel: Input */}
                <div className="w-1/2 min-w-[300px] max-w-[800px]">
                    <InputPanel />
                </div>

                {/* Right Panel: Analysis */}
                <div className="flex-1 border-l border-border">
                    <AnalysisPanel />
                </div>
            </div>
        </GlobalLayout>
    )
}
