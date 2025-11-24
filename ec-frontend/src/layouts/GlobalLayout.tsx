import { useState } from "react"
import { LayoutDashboard, FlaskConical, Settings, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate, useLocation } from "react-router-dom"

interface GlobalLayoutProps {
    children: React.ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col border-r border-border bg-card transition-all duration-300",
                    isSidebarOpen ? "w-64" : "w-16"
                )}
            >
                <div className="flex h-14 items-center border-b border-border px-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-accent rounded-md"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    {isSidebarOpen && <span className="ml-2 font-semibold">LLM Evals</span>}
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    <NavItem
                        icon={<LayoutDashboard />}
                        label="Playground"
                        isOpen={isSidebarOpen}
                        active={location.pathname === "/playground"}
                        onClick={() => navigate("/playground")}
                    />
                    <NavItem
                        icon={<FlaskConical />}
                        label="Lab (Evals)"
                        isOpen={isSidebarOpen}
                        active={location.pathname === "/evals"}
                        onClick={() => navigate("/evals")}
                    />
                    <NavItem
                        icon={<Settings />}
                        label="Settings"
                        isOpen={isSidebarOpen}
                        active={location.pathname === "/settings"}
                        onClick={() => navigate("/settings")}
                    />
                </nav>

                <div className="p-4 border-t border-border">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">API Connected</span>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {children}
            </main>
        </div>
    )
}

function NavItem({ icon, label, isOpen, active, onClick }: { icon: React.ReactNode, label: string, isOpen: boolean, active?: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer select-none",
                active ? "bg-primary/10 text-primary" : "hover:bg-accent hover:text-accent-foreground",
                !isOpen && "justify-center px-2"
            )}
        >
            {/* Clone icon to enforce size if needed, or just rely on parent sizing */}
            <div className="h-5 w-5 flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
                {icon}
            </div>
            {isOpen && <span>{label}</span>}
        </div>
    )
}
