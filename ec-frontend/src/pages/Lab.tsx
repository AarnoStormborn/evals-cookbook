import { GlobalLayout } from "@/layouts/GlobalLayout"
import { EvalTable } from "@/components/lab/EvalTable"

export default function Lab() {
    return (
        <GlobalLayout>
            <div className="flex flex-col h-full bg-background">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h1 className="text-xl font-semibold">Evaluation Lab</h1>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover:bg-primary/90">
                        Create New Run
                    </button>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                    <EvalTable />
                </div>
            </div>
        </GlobalLayout>
    )
}
