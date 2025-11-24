import { useAppStore } from "@/store/appStore"

export async function runInference() {
    const store = useAppStore.getState()

    store.setIsStreaming(true)
    store.resetOutput()

    const startTime = performance.now()
    let firstTokenTime = 0
    let tokenCount = 0

    // Mock Streaming Implementation
    // In a real app, this would fetch from an API
    const mockResponse = "The concept of 'Scientific Forensics' for LLMs implies a rigorous, data-driven approach to understanding model behavior. Unlike traditional chat interfaces which prioritize smoothness, a forensics lab prioritizes observability. We want to see the raw tokens, the probabilities, and the latency spikes. This allows engineers to debug prompts and fine-tune models with precision."

    const words = mockResponse.split(" ")

    for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? " " : "")

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20))

        if (i === 0) {
            firstTokenTime = performance.now() - startTime
            store.setMetrics({ ttft: Math.round(firstTokenTime) })
        }

        store.appendOutput(word)

        // Mock token data
        store.appendToken({
            id: i,
            text: word,
            logprob: Math.random() * -0.5 // Random logprob between 0 and -0.5
        })

        tokenCount++
        const currentTime = performance.now()
        const elapsedSeconds = (currentTime - startTime) / 1000
        const tps = Math.round(tokenCount / elapsedSeconds)

        store.setMetrics({
            tps,
            totalTokens: tokenCount,
            totalLatency: Math.round(currentTime - startTime)
        })
    }

    store.setIsStreaming(false)
}
