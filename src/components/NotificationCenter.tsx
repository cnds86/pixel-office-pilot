import { useState } from "react";
import { useGlobalNotifications, type NotificationType } from "@/contexts/NotificationContext";
import { getAgentById } from "@/data/mockData";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const typeConfig: Record<NotificationType, { label: string; color: string; icon: string }> = {
  reply: { label: "Reply", color: "bg-primary/20 text-primary", icon: "💬" },
  "task-done": { label: "Task Done", color: "bg-primary text-primary-foreground", icon: "✅" },
  mention: { label: "Mention", color: "bg-secondary/20 text-secondary", icon: "📢" },
  blocker: { label: "Blocker", color: "bg-destructive/20 text-destructive", icon: "🚫" },
  "agent-complete": { label: "Complete", color: "bg-primary/20 text-primary", icon: "🎉" },
  delegation: { label: "Delegation", color: "bg-accent/20 text-accent", icon: "↗️" },
  alert: { label: "Alert", color: "bg-destructive text-destructive-foreground", icon: "⚠️" },
  heartbeat: { label: "Heartbeat", color: "bg-primary/20 text-primary", icon: "💚" },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationCenter() {
  const { notifications, unreadCount, dismiss, markRead, markAllRead, clearAll } = useGlobalNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center gap-1 px-2 py-1 bg-muted/50 hover:bg-muted pixel-border transition-colors cursor-pointer" style={{ borderWidth: 1 }}>
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground font-pixel text-[6px] flex items-center justify-center animate-pixel-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 pixel-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[9px] text-primary">🔔 NOTIFICATIONS</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="font-pixel text-[7px] px-1.5 py-0">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAllRead} title="Mark all read">
              <CheckCheck className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearAll} title="Clear all">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-2xl">🔕</span>
              <p className="font-pixel text-[9px] text-muted-foreground mt-2">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => {
                const agent = getAgentById(n.agentId);
                const cfg = typeConfig[n.type];
                return (
                  <div
                    key={n.id}
                    className={`p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{agent?.avatar ?? "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-pixel text-[9px] text-foreground truncate">{agent?.name ?? "Agent"}</span>
                        <Badge className={`${cfg.color} font-pixel text-[6px] px-1 py-0`}>{cfg.icon} {cfg.label}</Badge>
                        {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                      </div>
                      <p className="font-pixel-body text-sm text-muted-foreground truncate">{n.message}</p>
                      <span className="font-pixel text-[7px] text-muted-foreground">{timeAgo(n.timestamp)}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="text-muted-foreground hover:text-foreground shrink-0 mt-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
