import { useState, useEffect, useCallback } from "react";
import { agents } from "@/data/mockData";
import { allChannels } from "@/data/chatData";

export interface Notification {
  id: string;
  agentId: string;
  channelId: string;
  message: string;
  timestamp: Date;
  type: "reply" | "task-done" | "mention";
}

interface NotificationPopupProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationPopup({ notifications, onDismiss, onClearAll }: NotificationPopupProps) {
  const visible = notifications.slice(0, 4);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {visible.map((n, i) => (
        <NotificationCard key={n.id} notification={n} onDismiss={onDismiss} index={i} />
      ))}
      {notifications.length > 1 && (
        <button
          onClick={onClearAll}
          className="font-pixel text-[6px] text-muted-foreground hover:text-primary transition-colors text-right pr-1"
        >
          CLEAR ALL ({notifications.length})
        </button>
      )}
    </div>
  );
}

function NotificationCard({
  notification: n,
  onDismiss,
  index,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}) {
  const agent = agents.find((a) => a.id === n.agentId);
  const channel = allChannels.find((c) => c.id === n.channelId);

  // Auto-dismiss after 5s
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(n.id), 5000);
    return () => clearTimeout(timer);
  }, [n.id, onDismiss]);

  const typeConfig = {
    reply: { label: "REPLY", color: "bg-primary", icon: "💬" },
    "task-done": { label: "TASK DONE", color: "bg-accent", icon: "✅" },
    mention: { label: "MENTION", color: "bg-secondary", icon: "📢" },
  };
  const cfg = typeConfig[n.type];

  return (
    <div
      className="pixel-border bg-card p-3 shadow-lg animate-in slide-in-from-right-5 fade-in duration-300"
      style={{
        borderWidth: 2,
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg shrink-0">{agent?.avatar ?? "🤖"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-pixel text-[7px] text-primary truncate">
              {agent?.name ?? "Agent"}
            </span>
            <span
              className={`font-pixel text-[5px] px-1.5 py-0.5 ${cfg.color} text-primary-foreground`}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>
          {channel && (
            <div className="font-pixel text-[5px] text-muted-foreground mb-1">
              in {channel.name}
            </div>
          )}
          <p className="font-pixel-body text-[11px] text-foreground leading-snug truncate">
            {n.message}
          </p>
          <div className="font-pixel text-[5px] text-muted-foreground mt-1">
            {n.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <button
          onClick={() => onDismiss(n.id)}
          className="font-pixel text-[7px] text-muted-foreground hover:text-foreground shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Hook to manage notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const push = useCallback((n: Omit<Notification, "id" | "timestamp">) => {
    setNotifications((prev) => [
      {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, push, dismiss, clearAll };
}
