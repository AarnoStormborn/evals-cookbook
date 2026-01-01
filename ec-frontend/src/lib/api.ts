import { useAppStore } from "@/store/appStore"

const API_BASE_URL = "http://localhost:8000"

interface TokenEvent {
    id: number
    text: string
    logprob: number
    entropy: number
}

export async function runInference() {
    const store = useAppStore.getState()
    const { systemPrompt, userPrompt, temperature, maxTokens } = store

    store.setIsStreaming(true)
    store.resetOutput()

    const startTime = performance.now()
    let firstTokenTime = 0
    let tokenCount = 0

    try {
        const response = await fetch(`${API_BASE_URL}/playground/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            },
            body: JSON.stringify({
                system_prompt: systemPrompt,
                user_prompt: userPrompt,
                model: "llama-3.1-8b-instant",
                temperature,
                max_tokens: maxTokens,
                top_p: 1.0,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
            throw new Error("No response body")
        }

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Process complete SSE messages
            const lines = buffer.split("\n")
            buffer = lines.pop() || "" // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    const eventType = line.slice(7).trim()
                    continue
                }

                if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6)
                    try {
                        const data = JSON.parse(dataStr)

                        if (data.done) {
                            // Stream complete
                            break
                        }

                        if (data.error) {
                            console.error("Stream error:", data.error)
                            break
                        }

                        if (data.text !== undefined) {
                            // Token data
                            const token: TokenEvent = data

                            // First token timing
                            if (tokenCount === 0) {
                                firstTokenTime = performance.now() - startTime
                                store.setMetrics({ ttft: Math.round(firstTokenTime) })
                            }

                            store.appendOutput(token.text)
                            store.appendToken({
                                id: token.id,
                                text: token.text,
                                logprob: token.logprob,
                            })

                            tokenCount++
                            const currentTime = performance.now()
                            const elapsedSeconds = (currentTime - startTime) / 1000
                            const tps = elapsedSeconds > 0 ? Math.round(tokenCount / elapsedSeconds) : 0

                            store.setMetrics({
                                tps,
                                totalTokens: tokenCount,
                                totalLatency: Math.round(currentTime - startTime),
                            })
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }
    } catch (error) {
        console.error("Inference error:", error)
        store.appendOutput(`\n\n[Error: ${error instanceof Error ? error.message : "Unknown error"}]`)
    } finally {
        store.setIsStreaming(false)
    }
}

export async function fetchModels(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/playground/models`)
        const data = await response.json()
        return data.models || []
    } catch (error) {
        console.error("Failed to fetch models:", error)
        return []
    }
}

export async function tokenizeText(text: string): Promise<{ id: number; text: string }[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/playground/tokenize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, model: "llama-3.1-8b-instant" }),
        })
        const data = await response.json()
        return data.tokens || []
    } catch (error) {
        console.error("Tokenization error:", error)
        return []
    }
}

// ============= Evals API =============

export interface EvalRun {
    id: string
    status: "pending" | "processing" | "completed" | "failed"
    model: string
    dataset_name: string | null
    total_items: number
    completed_items: number
    pass_rate: number | null
    avg_latency_ms: number | null
    created_at: string
}

export interface EvalInput {
    system_prompt?: string
    user_prompt: string
    expected_output?: string
}

export interface EvalRunRequest {
    model: string
    dataset_name?: string
    inputs: EvalInput[]
    metric_config?: {
        check_json?: boolean
        check_length?: number
    }
    temperature?: number
    max_tokens?: number
}

export interface EvalReport {
    run_id: string
    status: string
    model: string
    dataset_name: string | null
    total_items: number
    passed_items: number
    failed_items: number
    pass_rate: number
    avg_latency_ms: number
    min_latency_ms: number
    max_latency_ms: number
    avg_perplexity: number | null
    created_at: string
    started_at: string | null
    completed_at: string | null
    results: Array<{
        input_prompt: string
        output: string
        latency_ms: number
        passed: boolean
        failure_reason: string | null
    }> | null
}

export async function fetchEvalRuns(): Promise<EvalRun[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/evals/runs`)
        const data = await response.json()
        return data.runs || []
    } catch (error) {
        console.error("Failed to fetch eval runs:", error)
        return []
    }
}

export async function createEvalRun(request: EvalRunRequest): Promise<{ run_id: string } | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/evals/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        })
        if (!response.ok) throw new Error("Failed to create run")
        return await response.json()
    } catch (error) {
        console.error("Failed to create eval run:", error)
        return null
    }
}

export async function getEvalStatus(runId: string): Promise<{ status: string; progress_percent: number } | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/evals/status/${runId}`)
        return await response.json()
    } catch (error) {
        console.error("Failed to get eval status:", error)
        return null
    }
}

export async function getEvalReport(runId: string): Promise<EvalReport | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/evals/report/${runId}`)
        return await response.json()
    } catch (error) {
        console.error("Failed to get eval report:", error)
        return null
    }
}

export async function deleteEvalRun(runId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/evals/${runId}`, {
            method: "DELETE",
        })
        return response.ok
    } catch (error) {
        console.error("Failed to delete eval run:", error)
        return false
    }
}

