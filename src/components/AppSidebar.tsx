import { Gauge, ClipboardList, BarChart3, Activity, MessageSquare, FolderKanban, Users, Network, DollarSign, Shield, Target, Heart, Ticket, GitBranch, Radio, Server, Sparkles, Settings2, Swords, Workflow, FileText, Building2, UserCog, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { CompanySwitcher } from "@/components/CompanySwitcher";
import { useCompany } from "@/contexts/CompanyContext";
import { useGlobalNotifications } from "@/contexts/NotificationContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Mission Control", url: "/", icon: Gauge },
  { title: "Task Board", url: "/tasks", icon: ClipboardList },
  { title: "Dept Stats", url: "/stats", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: Activity },
  { title: "Chat Hub", url: "/chat", icon: MessageSquare },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Meetings", url: "/meetings", icon: Users },
];

const paperclipItems = [
  { title: "Org Chart", url: "/org-chart", icon: Network },
  { title: "Budget", url: "/budget", icon: DollarSign },
  { title: "Governance", url: "/governance", icon: Shield },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Heartbeat", url: "/heartbeat", icon: Heart },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Coordination", url: "/coordination", icon: GitBranch },
  { title: "Activity", url: "/activity", icon: Radio },
  { title: "Gateways", url: "/gateways", icon: Server },
  { title: "Skills", url: "/skills", icon: Sparkles },
  { title: "Tags", url: "/tags", icon: Settings2 },
  { title: "SubTasks & XP", url: "/subtasks", icon: Swords },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Org Mgmt", url: "/org-management", icon: UserCog },
  { title: "Settings", url: "/settings", icon: Building2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { currentCompany } = useCompany();
  const { unreadCount } = useGlobalNotifications();

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-border">
      {/* Company Switcher */}
      <div className="p-2 border-b-2 border-border">
        <CompanySwitcher collapsed={collapsed} />
      </div>

      <SidebarContent className="pt-2">
        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="font-pixel text-[7px] text-muted-foreground px-3">
              WORKSPACE
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 font-pixel-body text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                      activeClassName="bg-sidebar-accent text-primary pixel-border-glow"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Paperclip Features */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="font-pixel text-[7px] text-muted-foreground px-3 mt-2">
              📎 PAPERCLIP
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {paperclipItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2.5 font-pixel-body text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                      activeClassName="bg-sidebar-accent text-primary pixel-border-glow"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
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
              <p>v0.5.0-paperclip</p>
              <p className="mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-primary animate-pixel-pulse" />
                {currentCompany.agentCount} agents • {currentCompany.name}
              </p>
              {unreadCount > 0 && (
                <p className="mt-1 flex items-center gap-1 text-destructive">
                  <span className="inline-block w-2 h-2 bg-destructive animate-pixel-pulse" />
                  {unreadCount} notifications
                </p>
              )}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
