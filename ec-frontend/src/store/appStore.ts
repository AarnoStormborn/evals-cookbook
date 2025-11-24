import { create } from 'zustand'

interface Metrics {
    tps: number
    ttft: number
    totalTokens: number
    totalLatency: number
}

interface TokenData {
    id: number
    text: string
    logprob: number
}

interface AppState {
    // Input State
    systemPrompt: string
    userPrompt: string
    temperature: number
    maxTokens: number
    setSystemPrompt: (prompt: string) => void
    setUserPrompt: (prompt: string) => void
    setTemperature: (temp: number) => void
    setMaxTokens: (tokens: number) => void

    // Execution State
    isStreaming: boolean
    setIsStreaming: (isStreaming: boolean) => void

    // Output State
    output: string
    tokens: TokenData[]
    metrics: Metrics
    setOutput: (output: string) => void
    appendOutput: (chunk: string) => void
    setTokens: (tokens: TokenData[]) => void
    appendToken: (token: TokenData) => void
    setMetrics: (metrics: Partial<Metrics>) => void
    resetOutput: () => void
}

export const useAppStore = create<AppState>((set) => ({
    systemPrompt: "You are a helpful assistant.",
    userPrompt: "",
    temperature: 0.7,
    maxTokens: 1024,
    setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
    setUserPrompt: (prompt) => set({ userPrompt: prompt }),
    setTemperature: (temp) => set({ temperature: temp }),
    setMaxTokens: (tokens) => set({ maxTokens: tokens }),

    isStreaming: false,
    setIsStreaming: (isStreaming) => set({ isStreaming }),

    output: "",
    tokens: [],
    metrics: { tps: 0, ttft: 0, totalTokens: 0, totalLatency: 0 },
    setOutput: (output) => set({ output }),
    appendOutput: (chunk) => set((state) => ({ output: state.output + chunk })),
    setTokens: (tokens) => set({ tokens }),
    appendToken: (token) => set((state) => ({ tokens: [...state.tokens, token] })),
    setMetrics: (metrics) => set((state) => ({ metrics: { ...state.metrics, ...metrics } })),
    resetOutput: () => set({ output: "", tokens: [], metrics: { tps: 0, ttft: 0, totalTokens: 0, totalLatency: 0 } }),
}))
