import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { tasks } from "@/data/mockData";
import type { Task } from "@/data/mockData";
import { departmentInfo } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type ResultType = "page" | "agent" | "task" | "action";

interface PaletteItem {
  id: string;
  type: ResultType;
  icon: string;
  title: string;
  subtitle: string;
  action: () => void;
}

const pages = [
  { path: "/", label: "Dashboard", icon: "🏠", desc: "Main overview" },
  { path: "/tasks", label: "Task Board", icon: "📋", desc: "Kanban board" },
  { path: "/stats", label: "Department Stats", icon: "📊", desc: "Department statistics" },
  { path: "/analytics", label: "Analytics", icon: "📈", desc: "Real-time analytics" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { agents } = useAgents();

  // Keyboard shortcut: Ctrl+K or /
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const exec = useCallback((fn: () => void) => {
    fn();
    setOpen(false);
    setQuery("");
  }, []);

  // Build results
  const q = query.toLowerCase().trim();

  const results: PaletteItem[] = [];

  // Pages
  pages.forEach(p => {
    if (!q || p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
      results.push({
        id: `page-${p.path}`,
        type: "page",
        icon: p.icon,
        title: p.label,
        subtitle: p.desc,
        action: () => exec(() => navigate(p.path)),
      });
    }
  });

  // Actions
  if (!q || "create task".includes(q) || "new task".includes(q) || "สร้าง".includes(q)) {
    results.push({
      id: "action-new-task",
      type: "action",
      icon: "➕",
      title: "Create New Task",
      subtitle: "Add a task to the board",
      action: () => exec(() => navigate("/tasks")),
    });
  }

  // Agents
  agents.forEach(a => {
    if (!q || a.name.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q) || a.department.includes(q)) {
      results.push({
        id: `agent-${a.id}`,
        type: "agent",
        icon: a.avatar,
        title: a.name,
        subtitle: `${departmentInfo[a.department].icon} ${a.specialty} • ${a.status}`,
        action: () => exec(() => navigate("/")),
      });
    }
  });

  // Tasks
  tasks.forEach(t => {
    if (!q || t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)) || t.description.toLowerCase().includes(q)) {
      results.push({
        id: `task-${t.id}`,
        type: "task",
        icon: t.status === "done" ? "✅" : t.status === "in-progress" ? "🔄" : "📌",
        title: t.title,
        subtitle: `${t.priority.toUpperCase()} • ${t.status} • ${t.tags.join(", ")}`,
        action: () => exec(() => navigate("/tasks")),
      });
    }
  });

  // Limit for performance
  const visible = results.slice(0, 20);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && visible[selectedIndex]) {
      e.preventDefault();
      visible[selectedIndex].action();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const typeLabel: Record<ResultType, string> = {
    page: "PAGE",
    agent: "AGENT",
    task: "TASK",
    action: "ACTION",
  };

  const typeColor: Record<ResultType, string> = {
    page: "bg-primary text-primary-foreground",
    agent: "bg-accent text-accent-foreground",
    task: "bg-secondary text-secondary-foreground",
    action: "bg-destructive text-destructive-foreground",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <DialogContent className="pixel-border max-w-lg bg-card border-border p-0 gap-0 overflow-hidden" onKeyDown={handleKeyDown}>
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">Search tasks, agents, and navigate pages</DialogDescription>

        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-border">
          <span className="font-pixel text-[10px] text-primary">{">"}</span>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search agents, tasks, pages..."
            className="border-0 bg-transparent font-pixel-body text-sm h-8 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            autoFocus
          />
          <kbd className="font-pixel text-[6px] text-muted-foreground bg-muted px-1.5 py-0.5 pixel-border" style={{ borderWidth: 1 }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[360px]">
          {visible.length === 0 ? (
            <div className="p-6 text-center">
              <span className="font-pixel text-[8px] text-muted-foreground">
                No results found for "{query}" 🔍
              </span>
            </div>
          ) : (
            <div className="p-1">
              {visible.map((item, i) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-sm ${
                    i === selectedIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground/80 hover:bg-muted/50"
                  }`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="text-base flex-shrink-0 w-6 text-center">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[8px] truncate">{item.title}</div>
                    <div className="font-pixel text-[6px] text-muted-foreground truncate">{item.subtitle}</div>
                  </div>
                  <Badge className={`font-pixel text-[5px] ${typeColor[item.type]} shrink-0`}>
                    {typeLabel[item.type]}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer hints */}
        <div className="flex items-center gap-3 px-3 py-1.5 border-t-2 border-border bg-muted/30">
          <span className="font-pixel text-[5px] text-muted-foreground">↑↓ navigate</span>
          <span className="font-pixel text-[5px] text-muted-foreground">↵ select</span>
          <span className="font-pixel text-[5px] text-muted-foreground">esc close</span>
          <span className="ml-auto font-pixel text-[5px] text-muted-foreground">{visible.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
