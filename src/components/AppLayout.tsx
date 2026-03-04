import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b-2 border-border px-4 bg-card">
            <SidebarTrigger className="text-muted-foreground hover:text-primary" />
            <div className="ml-4 font-pixel text-[10px] text-muted-foreground">
              <span className="text-primary">$</span> openclaw
              <span className="animate-blink ml-1">_</span>
            </div>
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-muted/50 hover:bg-muted pixel-border transition-colors cursor-pointer"
              style={{ borderWidth: 1 }}
            >
              <span className="font-pixel text-[6px] text-muted-foreground">🔍 Search</span>
              <kbd className="font-pixel text-[5px] text-muted-foreground/70 bg-muted px-1 py-0.5 rounded-sm">/</kbd>
            </button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
