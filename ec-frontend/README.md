# LLM Evals Cookbook - Frontend (`ec-frontend`)

A "Scientific Forensics Lab" interface for inspecting, debugging, and evaluating Large Language Model (LLM) outputs. This application prioritizes data density, precision, and observability over standard chat aesthetics.

## Features

### 🔬 Playground
- **Split View Layout**: Dedicated panels for Input (System/User prompts) and Analysis.
- **X-Ray View**: Visualizes the raw token stream with alternating colors and detailed tooltips (Logprobs, Token IDs).
- **Confidence Heatmap**: Overlays probability data on text to highlight low-confidence tokens (color-coded by entropy).
- **Real-time Metrics**: Live "Speedometer" showing Tokens Per Second (TPS), Time To First Token (TTFT), and Total Latency.
- **Streaming Simulation**: Simulates realistic token streaming for testing UI responsiveness.

### 🧪 Evaluation Lab
- **Data Table**: Comprehensive view of evaluation runs with status, scores, and latency.
- **Detail Inspector**: Side-by-side comparison of Prompts vs. Outputs with Judge Reasoning.

## Tech Stack

- **Core**: React 18+, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI (Radix Primitives)
- **State**: Zustand
- **Visualization**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Deployment

This project is optimized for deployment on **Vercel**.

```bash
npm install -g vercel
vercel
```

See `.agent/workflows/deploy_to_vercel.md` for a detailed deployment guide.
