import { GlobalLayout } from "@/layouts/GlobalLayout"

export default function Settings() {
    return (
        <GlobalLayout>
            <div className="flex flex-col h-full bg-background p-6">
                <h1 className="text-xl font-semibold mb-4">Settings</h1>
                <p className="text-muted-foreground">Settings configuration will be implemented here.</p>
            </div>
        </GlobalLayout>
    )
}
