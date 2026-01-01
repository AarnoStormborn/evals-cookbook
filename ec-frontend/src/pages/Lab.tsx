import { useState } from "react"
import { GlobalLayout } from "@/layouts/GlobalLayout"
import { EvalTable } from "@/components/lab/EvalTable"
import { CreateEvalModal } from "@/components/lab/CreateEvalModal"

export default function Lab() {
    const [showCreateModal, setShowCreateModal] = useState(false)

    return (
        <GlobalLayout>
            <div className="flex flex-col h-full bg-background">
                <div className="panel-header">
                    <h1 className="text-xl font-semibold text-foreground">Evaluation Lab</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                    >
                        Create New Run
                    </button>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                    <EvalTable />
                </div>
            </div>

            {showCreateModal && (
                <CreateEvalModal onClose={() => setShowCreateModal(false)} />
            )}
        </GlobalLayout>
    )
}
