import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { tasks as initialTasks, agents, getAgentById } from "@/data/mockData";
import type { Task, TaskStatus, TaskPriority } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ChevronLeft, ChevronRight, Pencil } from "lucide-react";

const columns: { status: TaskStatus; label: string; icon: string }[] = [
  { status: "todo", label: "TO DO", icon: "📝" },
  { status: "in-progress", label: "IN PROGRESS", icon: "⚡" },
  { status: "done", label: "DONE", icon: "✅" },
];

const priorityColor: Record<TaskPriority, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

const statusOrder: TaskStatus[] = ["todo", "in-progress", "done"];

export default function TaskBoard() {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", assigneeId: "", priority: "medium" as TaskPriority, description: "", tags: "" });

  const filtered = taskList.filter(t => {
    if (filterAgent !== "all" && t.assigneeId !== filterAgent) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const moveTask = (taskId: string, direction: "left" | "right") => {
    setTaskList(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const idx = statusOrder.indexOf(t.status);
      const newIdx = direction === "right" ? Math.min(idx + 1, 2) : Math.max(idx - 1, 0);
      return { ...t, status: statusOrder[newIdx] };
    }));
  };

  const deleteTask = (taskId: string) => {
    setTaskList(prev => prev.filter(t => t.id !== taskId));
  };

  const openNewTask = () => {
    setEditingTask(null);
    setForm({ title: "", assigneeId: agents[0].id, priority: "medium", description: "", tags: "" });
    setDialogOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setForm({ title: task.title, assigneeId: task.assigneeId, priority: task.priority, description: task.description, tags: task.tags.join(", ") });
    setDialogOpen(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    const tags = form.tags.split(",").map(s => s.trim()).filter(Boolean);
    if (editingTask) {
      setTaskList(prev => prev.map(t => t.id === editingTask.id ? { ...t, title: form.title, assigneeId: form.assigneeId, priority: form.priority, description: form.description, tags } : t));
    } else {
      const newTask: Task = {
        id: `t${Date.now()}`,
        title: form.title,
        assigneeId: form.assigneeId,
        priority: form.priority,
        status: "todo",
        description: form.description,
        tags,
      };
      setTaskList(prev => [...prev, newTask]);
    }
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-pixel text-sm md:text-base text-primary">TASK BOARD</h1>
            <p className="font-pixel-body text-lg text-muted-foreground">Kanban • {taskList.length} tasks</p>
          </div>
          <Button onClick={openNewTask} className="pixel-btn bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" /> NEW TASK
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="w-[180px] pixel-border bg-card font-pixel-body text-base">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent className="bg-card pixel-border">
              <SelectItem value="all" className="font-pixel-body text-base">All Agents</SelectItem>
              {agents.map(a => (
                <SelectItem key={a.id} value={a.id} className="font-pixel-body text-base">
                  {a.avatar} {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[150px] pixel-border bg-card font-pixel-body text-base">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-card pixel-border">
              <SelectItem value="all" className="font-pixel-body text-base">All Priority</SelectItem>
              <SelectItem value="high" className="font-pixel-body text-base">🔴 High</SelectItem>
              <SelectItem value="medium" className="font-pixel-body text-base">🟡 Medium</SelectItem>
              <SelectItem value="low" className="font-pixel-body text-base">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(col => {
            const colTasks = filtered.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="pixel-border bg-card">
                <div className="p-3 border-b-2 border-border flex items-center gap-2">
                  <span>{col.icon}</span>
                  <span className="font-pixel text-[9px] text-foreground">{col.label}</span>
                  <span className="font-pixel text-[8px] text-muted-foreground ml-auto">{colTasks.length}</span>
                </div>
                <ScrollArea className="h-[400px] md:h-[500px]">
                  <div className="p-2 space-y-2">
                    {colTasks.map(task => {
                      const agent = getAgentById(task.assigneeId);
                      const sIdx = statusOrder.indexOf(task.status);
                      return (
                        <div key={task.id} className="pixel-border bg-muted/30 p-3 space-y-2 hover:bg-muted/50 transition-colors group">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-pixel text-[8px] text-foreground leading-relaxed flex-1">{task.title}</p>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                              <button onClick={() => openEditTask(task)} className="text-muted-foreground hover:text-primary">
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="font-pixel-body text-xs text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge className={`${priorityColor[task.priority]} font-pixel text-[6px] px-1.5 py-0.5 rounded-none`}>
                              {task.priority.toUpperCase()}
                            </Badge>
                            {task.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="font-pixel text-[6px] px-1.5 py-0.5 rounded-none border-border">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{agent?.avatar}</span>
                              <span className="font-pixel text-[7px] text-muted-foreground">{agent?.name}</span>
                            </div>
                            <div className="flex gap-1">
                              {sIdx > 0 && (
                                <button onClick={() => moveTask(task.id, "left")} className="pixel-border bg-card p-1 hover:bg-muted">
                                  <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                                </button>
                              )}
                              {sIdx < 2 && (
                                <button onClick={() => moveTask(task.id, "right")} className="pixel-border bg-card p-1 hover:bg-muted">
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {colTasks.length === 0 && (
                      <p className="font-pixel text-[8px] text-muted-foreground text-center py-8">NO TASKS</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="pixel-border bg-card border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-[10px] text-primary">
              {editingTask ? "EDIT TASK" : "NEW TASK"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="font-pixel text-[7px] text-muted-foreground">TITLE</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="pixel-border bg-muted font-pixel-body text-base mt-1" />
            </div>
            <div>
              <label className="font-pixel text-[7px] text-muted-foreground">DESCRIPTION</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="pixel-border bg-muted font-pixel-body text-base mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-pixel text-[7px] text-muted-foreground">ASSIGNEE</label>
                <Select value={form.assigneeId} onValueChange={v => setForm(f => ({ ...f, assigneeId: v }))}>
                  <SelectTrigger className="pixel-border bg-muted font-pixel-body text-base mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card pixel-border">
                    {agents.map(a => (
                      <SelectItem key={a.id} value={a.id} className="font-pixel-body text-base">{a.avatar} {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-pixel text-[7px] text-muted-foreground">PRIORITY</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as TaskPriority }))}>
                  <SelectTrigger className="pixel-border bg-muted font-pixel-body text-base mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card pixel-border">
                    <SelectItem value="high" className="font-pixel-body text-base">🔴 High</SelectItem>
                    <SelectItem value="medium" className="font-pixel-body text-base">🟡 Medium</SelectItem>
                    <SelectItem value="low" className="font-pixel-body text-base">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="font-pixel text-[7px] text-muted-foreground">TAGS (comma separated)</label>
              <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="pixel-border bg-muted font-pixel-body text-base mt-1" placeholder="ui, frontend" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveTask} className="pixel-btn bg-primary text-primary-foreground font-pixel text-[8px]">
              {editingTask ? "SAVE" : "CREATE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
