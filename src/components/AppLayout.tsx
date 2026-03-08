import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useCompany } from "@/contexts/CompanyContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentCompany } = useCompany();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b-2 border-border px-4 bg-card gap-2">
            <SidebarTrigger className="text-muted-foreground hover:text-primary" />
            <div className="ml-2 font-pixel text-[10px] text-muted-foreground">
              <span className="text-primary">$</span> {currentCompany.name.toLowerCase().replace(/\s+/g, "-")}
              <span className="animate-blink ml-1">_</span>
            </div>

            {/* Company badge */}
            <div className="ml-2 px-2 py-0.5 bg-primary/10 border border-primary/20 hidden sm:flex items-center gap-1">
              <span className="text-sm">{currentCompany.logo}</span>
              <span className="font-pixel text-[7px] text-primary">{currentCompany.name}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <NotificationCenter />
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
                className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 hover:bg-muted pixel-border transition-colors cursor-pointer"
                style={{ borderWidth: 1 }}
              >
                <span className="font-pixel text-[6px] text-muted-foreground">🔍 Search</span>
                <kbd className="font-pixel text-[5px] text-muted-foreground/70 bg-muted px-1 py-0.5 rounded-sm">/</kbd>
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
