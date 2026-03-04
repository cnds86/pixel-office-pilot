import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
