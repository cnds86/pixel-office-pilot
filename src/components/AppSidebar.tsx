import { Gauge, ClipboardList, BarChart3, Activity, MessageSquare, FolderKanban } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Mission Control", url: "/", icon: Gauge },
  { title: "Task Board", url: "/tasks", icon: ClipboardList },
  { title: "Dept Stats", url: "/stats", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Chat Hub", url: "/chat", icon: MessageSquare },
  { title: "Projects", url: "/projects", icon: FolderKanban },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-border">
      <div className="p-4 border-b-2 border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦀</span>
          {!collapsed && (
            <h1 className="font-pixel text-xs text-primary leading-tight">
              Open<br />Claw
            </h1>
          )}
        </div>
      </div>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-3 font-pixel-body text-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                      activeClassName="bg-sidebar-accent text-primary pixel-border-glow"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 border-t-2 border-border">
            <div className="font-pixel text-[8px] text-muted-foreground leading-relaxed">
              <p>v0.3.2-alpha</p>
              <p className="mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-primary animate-pixel-pulse" />
                3 agents online
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
