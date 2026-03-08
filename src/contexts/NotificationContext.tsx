import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { agents, getAgentById } from "@/data/mockData";

// ── Types ──
export type NotificationType = "reply" | "task-done" | "mention" | "blocker" | "agent-complete" | "delegation" | "alert" | "heartbeat";

export interface GlobalNotification {
  id: string;
  agentId: string;
  message: string;
  timestamp: Date;
  type: NotificationType;
  read: boolean;
  channelId?: string;
}

interface NotificationContextType {
  notifications: GlobalNotification[];
  unreadCount: number;
  push: (n: Omit<GlobalNotification, "id" | "timestamp" | "read">) => void;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  push: () => {},
  dismiss: () => {},
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
});

// ── Simulated events ──
const eventTemplates: { type: NotificationType; messages: string[] }[] = [
  { type: "task-done", messages: [
    "completed task: Setup OAuth providers",
    "finished: Design token export",
    "completed: Integration test suite",
    "done: K8s cluster configuration",
  ]},
  { type: "blocker", messages: [
    "blocked on: Waiting for design token review",
    "blocked: DNS records pending for staging deploy",
    "blocked on: Budget approval needed from governance",
    "blocker: API rate limit hit on external service",
  ]},
  { type: "agent-complete", messages: [
    "finished all assigned subtasks for Sprint 12",
    "workflow pipeline completed successfully",
    "report generation completed — ready for review",
    "code review cycle completed — 3 PRs approved",
  ]},
  { type: "delegation", messages: [
    "delegated frontend task to design team",
    "cross-dept delegation: QA testing assigned",
    "task re-routed to DevOps for infrastructure review",
  ]},
  { type: "alert", messages: [
    "⚠️ Budget utilization exceeded 90%",
    "⚠️ Agent heartbeat missed — checking status",
    "⚠️ CI pipeline failure on main branch",
    "⚠️ Staging deployment rolled back",
  ]},
  { type: "heartbeat", messages: [
    "heartbeat recovered — back online",
    "scheduled maintenance completed",
    "uptime restored to 99.9%",
  ]},
];

const agentPool = agents.filter(a => a.role === "agent").map(a => a.id);

function randomEvent(): Omit<GlobalNotification, "id" | "timestamp" | "read"> {
  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
  const message = template.messages[Math.floor(Math.random() * template.messages.length)];
  const agentId = agentPool[Math.floor(Math.random() * agentPool.length)];
  return { type: template.type, message, agentId };
}

// ── Provider ──
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);

  const push = useCallback((n: Omit<GlobalNotification, "id" | "timestamp" | "read">) => {
    const newNotif: GlobalNotification = {
      ...n,
      id: `gn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // keep max 50
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulate real-time events
  useEffect(() => {
    // Initial burst of 3 notifications
    const initTimer = setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => push(randomEvent()), i * 800);
      }
    }, 2000);

    // Ongoing random notifications every 8-15 seconds
    const interval = setInterval(() => {
      push(randomEvent());
    }, 8000 + Math.random() * 7000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [push]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, push, dismiss, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useGlobalNotifications() {
  return useContext(NotificationContext);
}
