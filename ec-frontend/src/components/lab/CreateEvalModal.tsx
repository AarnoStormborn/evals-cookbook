import { useState } from "react"
import { X, Plus, Trash2, Loader2 } from "lucide-react"
import { createEvalRun, type EvalInput } from "@/lib/api"

interface CreateEvalModalProps {
    onClose: () => void
}

export function CreateEvalModal({ onClose }: CreateEvalModalProps) {
    const [model, setModel] = useState("llama-3.1-8b-instant")
    const [datasetName, setDatasetName] = useState("")
    const [inputs, setInputs] = useState<EvalInput[]>([{ user_prompt: "" }])
    const [checkJson, setCheckJson] = useState(false)
    const [loading, setLoading] = useState(false)

    const addInput = () => {
        setInputs([...inputs, { user_prompt: "" }])
    }

    const removeInput = (index: number) => {
        setInputs(inputs.filter((_, i) => i !== index))
    }

    const updateInput = (index: number, value: string) => {
        const newInputs = [...inputs]
        newInputs[index] = { user_prompt: value }
        setInputs(newInputs)
    }

    const handleSubmit = async () => {
        const validInputs = inputs.filter(i => i.user_prompt.trim())
        if (validInputs.length === 0) return

        setLoading(true)
        const result = await createEvalRun({
            model,
            dataset_name: datasetName || undefined,
            inputs: validInputs,
            metric_config: checkJson ? { check_json: true } : undefined,
        })
        setLoading(false)

        if (result) {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border w-[600px] max-h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="panel-header">
                    <h2 className="text-lg font-semibold text-foreground">Create Evaluation Run</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-5">
                    {/* Model Selection */}
                    <div className="space-y-2">
                        <label className="label-sm">Model</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="input-base w-full"
                        >
                            <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                            <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                            <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                            <option value="gemma2-9b-it">Gemma 2 9B</option>
                        </select>
                    </div>

                    {/* Dataset Name */}
                    <div className="space-y-2">
                        <label className="label-sm">Dataset Name (optional)</label>
                        <input
                            type="text"
                            value={datasetName}
                            onChange={(e) => setDatasetName(e.target.value)}
                            placeholder="e.g., JSON Extraction Test"
                            className="input-base w-full"
                        />
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="label-sm">Test Prompts ({inputs.length})</label>
                            <button
                                onClick={addInput}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                            >
                                <Plus className="h-3 w-3" /> Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-auto">
                            {inputs.map((input, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <textarea
                                        value={input.user_prompt}
                                        onChange={(e) => updateInput(idx, e.target.value)}
                                        placeholder={`Prompt ${idx + 1}...`}
                                        rows={2}
                                        className="input-base flex-1 resize-none font-mono text-xs"
                                    />
                                    {inputs.length > 1 && (
                                        <button
                                            onClick={() => removeInput(idx)}
                                            className="p-2 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        <label className="label-sm">Validation Options</label>
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={checkJson}
                                onChange={(e) => setCheckJson(e.target.checked)}
                                className="rounded border-border bg-input text-primary focus:ring-primary"
                            />
                            Validate JSON output
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-secondary flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || inputs.every(i => !i.user_prompt.trim())}
                        className="btn-primary"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {loading ? "Creating..." : "Start Evaluation"}
                    </button>
                </div>
            </div>
        </div>
    )
}
