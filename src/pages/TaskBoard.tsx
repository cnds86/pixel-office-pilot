import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { tasks as initialTasks } from "@/data/mockData";
import type { Task, TaskStatus, TaskPriority } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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

// Draggable Task Card
function TaskCard({ task, openEditTask, deleteTask, overlay }: {
  task: Task;
  openEditTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  overlay?: boolean;
}) {
  const agent = getAgentById(task.assigneeId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (overlay) {
    return (
      <div className="pixel-border bg-primary/10 border-primary p-3 space-y-2 rotate-2 shadow-lg w-[280px]">
        <div className="flex items-start gap-1">
          <GripVertical className="h-3 w-3 text-primary mt-0.5 shrink-0" />
          <p className="font-pixel text-[8px] text-foreground leading-relaxed flex-1">{task.title}</p>
        </div>
        <div className="flex items-center gap-1">
          <Badge className={`${priorityColor[task.priority]} font-pixel text-[6px] px-1.5 py-0.5 rounded-none`}>
            {task.priority.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">{agent?.avatar}</span>
          <span className="font-pixel text-[7px] text-muted-foreground">{agent?.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="pixel-border bg-muted/30 p-3 space-y-2 hover:bg-muted/50 transition-colors group">
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-start gap-1 flex-1">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-0.5 text-muted-foreground hover:text-foreground">
            <GripVertical className="h-3 w-3" />
          </button>
          <p className="font-pixel text-[8px] text-foreground leading-relaxed flex-1">{task.title}</p>
        </div>
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
      <div className="flex items-center gap-1">
        <span className="text-sm">{agent?.avatar}</span>
        <span className="font-pixel text-[7px] text-muted-foreground">{agent?.name}</span>
      </div>
    </div>
  );
}

// Droppable Column
function KanbanColumn({ status, label, icon, tasks, openEditTask, deleteTask }: {
  status: TaskStatus;
  label: string;
  icon: string;
  tasks: Task[];
  openEditTask: (t: Task) => void;
  deleteTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`pixel-border bg-card transition-colors ${isOver ? "ring-2 ring-primary/50" : ""}`}>
      <div className="p-3 border-b-2 border-border flex items-center gap-2">
        <span>{icon}</span>
        <span className="font-pixel text-[9px] text-foreground">{label}</span>
        <span className="font-pixel text-[8px] text-muted-foreground ml-auto">{tasks.length}</span>
      </div>
      <ScrollArea className="h-[400px] md:h-[500px]">
        <div ref={setNodeRef} className="p-2 space-y-2 min-h-[100px]">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} openEditTask={openEditTask} deleteTask={deleteTask} />
          ))}
          {tasks.length === 0 && (
            <p className="font-pixel text-[8px] text-muted-foreground text-center py-8">
              {isOver ? "DROP HERE" : "NO TASKS"}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function TaskBoard() {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", assigneeId: "", priority: "medium" as TaskPriority, description: "", tags: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filtered = taskList.filter(t => {
    if (filterAgent !== "all" && t.assigneeId !== filterAgent) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const deleteTask = (taskId: string) => setTaskList(prev => prev.filter(t => t.id !== taskId));

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
      const newTask: Task = { id: `t${Date.now()}`, title: form.title, assigneeId: form.assigneeId, priority: form.priority, status: "todo", description: form.description, tags };
      setTaskList(prev => [...prev, newTask]);
    }
    setDialogOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = taskList.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const overId = over.id as string;
    const isColumn = columns.some(c => c.status === overId);
    if (isColumn) {
      setTaskList(prev => prev.map(t => t.id === active.id ? { ...t, status: overId as TaskStatus } : t));
    }
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveTask(null);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-pixel text-sm md:text-base text-primary">TASK BOARD</h1>
            <p className="font-pixel-body text-lg text-muted-foreground">Kanban • {taskList.length} tasks • Drag to move</p>
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
                <SelectItem key={a.id} value={a.id} className="font-pixel-body text-base">{a.avatar} {a.name}</SelectItem>
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

        {/* Kanban Columns with DnD */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map(col => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                icon={col.icon}
                tasks={filtered.filter(t => t.status === col.status)}
                openEditTask={openEditTask}
                deleteTask={deleteTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} openEditTask={() => {}} deleteTask={() => {}} overlay /> : null}
          </DragOverlay>
        </DndContext>
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
                  <SelectTrigger className="pixel-border bg-muted font-pixel-body text-base mt-1"><SelectValue /></SelectTrigger>
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
                  <SelectTrigger className="pixel-border bg-muted font-pixel-body text-base mt-1"><SelectValue /></SelectTrigger>
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
