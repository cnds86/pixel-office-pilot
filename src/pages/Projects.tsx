import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agents, tasks, departmentInfo, type Department } from "@/data/mockData";
import { projects as initialProjects, type Project, type ProjectStatus } from "@/data/projectData";
import { Textarea } from "@/components/ui/textarea";

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: string }> = {
  active: { label: "ACTIVE", color: "bg-primary text-primary-foreground", icon: "🟢" },
  completed: { label: "DONE", color: "bg-accent text-accent-foreground", icon: "✅" },
  archived: { label: "ARCHIVED", color: "bg-muted text-muted-foreground", icon: "📦" },
};

export default function Projects() {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDept, setFormDept] = useState<Department>("engineering");
  const [formStatus, setFormStatus] = useState<ProjectStatus>("active");
  const [formIcon, setFormIcon] = useState("📁");
  const [formDeadline, setFormDeadline] = useState("");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return projectList;
    return projectList.filter((p) => p.status === statusFilter);
  }, [projectList, statusFilter]);

  // Stats
  const totalProjects = projectList.length;
  const activeCount = projectList.filter((p) => p.status === "active").length;
  const completedCount = projectList.filter((p) => p.status === "completed").length;

  function getProjectProgress(p: Project) {
    if (p.taskIds.length === 0) return 0;
    const doneTasks = p.taskIds.filter((tid) => {
      const t = tasks.find((tt) => tt.id === tid);
      return t?.status === "done";
    }).length;
    return Math.round((doneTasks / p.taskIds.length) * 100);
  }

  function openDetail(p: Project) {
    setSelectedProject(p);
    setDetailOpen(true);
  }

  function openNewProject() {
    setEditingProject(null);
    setFormName("");
    setFormDesc("");
    setFormDept("engineering");
    setFormStatus("active");
    setFormIcon("📁");
    setFormDeadline("");
    setFormOpen(true);
  }

  function openEditProject(p: Project) {
    setEditingProject(p);
    setFormName(p.name);
    setFormDesc(p.description);
    setFormDept(p.department);
    setFormStatus(p.status);
    setFormIcon(p.icon);
    setFormDeadline(p.deadline ?? "");
    setFormOpen(true);
  }

  function saveProject() {
    if (!formName.trim()) return;
    if (editingProject) {
      setProjectList((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: formName, description: formDesc, department: formDept, status: formStatus, icon: formIcon, deadline: formDeadline || undefined }
            : p
        )
      );
    } else {
      const newP: Project = {
        id: `p-${Date.now()}`,
        name: formName,
        description: formDesc,
        status: formStatus,
        department: formDept,
        icon: formIcon,
        color: departmentInfo[formDept].color,
        taskIds: [],
        agentIds: [],
        createdAt: new Date().toISOString().slice(0, 10),
        deadline: formDeadline || undefined,
      };
      setProjectList((prev) => [...prev, newP]);
    }
    setFormOpen(false);
  }

  function deleteProject(id: string) {
    setProjectList((prev) => prev.filter((p) => p.id !== id));
    setDetailOpen(false);
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-lg text-primary">📂 PROJECTS</h1>
            <p className="font-pixel text-[10px] text-muted-foreground mt-1">
              Manage all your projects, tasks, and teams
            </p>
          </div>
          <Button className="font-pixel text-[11px] h-10 px-5" onClick={openNewProject}>
            + NEW PROJECT
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="pixel-border bg-card p-4" style={{ borderWidth: 2 }}>
            <div className="font-pixel text-2xl text-primary">{totalProjects}</div>
            <div className="font-pixel text-[10px] text-muted-foreground">TOTAL</div>
          </div>
          <div className="pixel-border bg-card p-4" style={{ borderWidth: 2 }}>
            <div className="font-pixel text-2xl text-primary">{activeCount}</div>
            <div className="font-pixel text-[10px] text-muted-foreground">ACTIVE</div>
          </div>
          <div className="pixel-border bg-card p-4" style={{ borderWidth: 2 }}>
            <div className="font-pixel text-2xl text-accent">{completedCount}</div>
            <div className="font-pixel text-[10px] text-muted-foreground">COMPLETED</div>
          </div>
        </div>

        {/* Filter */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | ProjectStatus)}>
          <TabsList className="h-9">
            <TabsTrigger value="all" className="font-pixel text-[10px] h-8">ALL</TabsTrigger>
            <TabsTrigger value="active" className="font-pixel text-[10px] h-8">🟢 ACTIVE</TabsTrigger>
            <TabsTrigger value="completed" className="font-pixel text-[10px] h-8">✅ DONE</TabsTrigger>
            <TabsTrigger value="archived" className="font-pixel text-[10px] h-8">📦 ARCHIVED</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const progress = getProjectProgress(p);
            const deptInfo = departmentInfo[p.department];
            const sc = statusConfig[p.status];
            const projectTasks = p.taskIds.map((tid) => tasks.find((t) => t.id === tid)).filter(Boolean);
            const projectAgents = p.agentIds.map((aid) => agents.find((a) => a.id === aid)).filter(Boolean);

            return (
              <div
                key={p.id}
                className="pixel-border bg-card p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                style={{ borderWidth: 2 }}
                onClick={() => openDetail(p)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <h3 className="font-pixel text-xs text-primary">{p.name}</h3>
                      <span className="font-pixel text-[9px] text-muted-foreground">
                        {deptInfo.icon} {deptInfo.label}
                      </span>
                    </div>
                  </div>
                  <Badge className={`font-pixel text-[8px] ${sc.color}`}>
                    {sc.icon} {sc.label}
                  </Badge>
                </div>

                <p className="font-pixel-body text-sm text-muted-foreground mb-3 line-clamp-2">
                  {p.description}
                </p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-pixel text-[9px] text-muted-foreground">PROGRESS</span>
                    <span className="font-pixel text-[9px] text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Tasks count & Agents */}
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] text-muted-foreground">
                    📋 {projectTasks.length} tasks
                  </span>
                  <div className="flex items-center gap-0.5">
                    {projectAgents.slice(0, 4).map((a) => (
                      <span key={a!.id} className="text-sm" title={a!.name}>
                        {a!.avatar}
                      </span>
                    ))}
                    {projectAgents.length > 4 && (
                      <span className="font-pixel text-[9px] text-muted-foreground ml-1">
                        +{projectAgents.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {p.deadline && (
                  <div className="font-pixel text-[9px] text-muted-foreground mt-2">
                    ⏰ Deadline: {p.deadline}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="pixel-border bg-card max-w-lg">
          {selectedProject && (() => {
            const p = selectedProject;
            const progress = getProjectProgress(p);
            const deptInfo = departmentInfo[p.department];
            const sc = statusConfig[p.status];
            const projectTasks = p.taskIds.map((tid) => tasks.find((t) => t.id === tid)).filter(Boolean);
            const projectAgents = p.agentIds.map((aid) => agents.find((a) => a.id === aid)).filter(Boolean);

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span> {p.name}
                  </DialogTitle>
                  <DialogDescription className="font-pixel text-[10px] text-muted-foreground">
                    {deptInfo.icon} {deptInfo.label} · Created {p.createdAt}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`font-pixel text-[9px] ${sc.color}`}>{sc.icon} {sc.label}</Badge>
                    {p.deadline && (
                      <span className="font-pixel text-[9px] text-muted-foreground">⏰ {p.deadline}</span>
                    )}
                  </div>

                  <p className="font-pixel-body text-sm text-foreground">{p.description}</p>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-pixel text-[10px] text-muted-foreground">PROGRESS</span>
                      <span className="font-pixel text-[10px] text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {/* Tasks */}
                  <div>
                    <h4 className="font-pixel text-[10px] text-primary mb-2">📋 TASKS ({projectTasks.length})</h4>
                    <ScrollArea className="max-h-32">
                      <div className="space-y-1">
                        {projectTasks.map((t) => {
                          if (!t) return null;
                          const assignee = agents.find((a) => a.id === t.assigneeId);
                          return (
                            <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 pixel-border" style={{ borderWidth: 1 }}>
                              <span className="font-pixel text-[9px]">
                                {t.status === "done" ? "✅" : t.status === "in-progress" ? "🔄" : "⬜"}
                              </span>
                              <span className="font-pixel-body text-sm flex-1 truncate">{t.title}</span>
                              {assignee && <span className="text-sm" title={assignee.name}>{assignee.avatar}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Agents */}
                  <div>
                    <h4 className="font-pixel text-[10px] text-primary mb-2">👥 TEAM ({projectAgents.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {projectAgents.map((a) => {
                        if (!a) return null;
                        return (
                          <div key={a.id} className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 pixel-border" style={{ borderWidth: 1 }}>
                            <span className="text-base">{a.avatar}</span>
                            <div>
                              <div className="font-pixel text-[9px]">{a.name}</div>
                              <div className="font-pixel text-[7px] text-muted-foreground">{a.specialty}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="font-pixel text-[10px] h-9 flex-1"
                      onClick={() => { setDetailOpen(false); openEditProject(p); }}
                    >
                      ✏️ EDIT
                    </Button>
                    <Button
                      variant="destructive"
                      className="font-pixel text-[10px] h-9"
                      onClick={() => deleteProject(p.id)}
                    >
                      🗑️ DELETE
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="pixel-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm text-primary">
              {editingProject ? "✏️ Edit Project" : "➕ New Project"}
            </DialogTitle>
            <DialogDescription className="font-pixel text-[10px] text-muted-foreground">
              {editingProject ? "Update project details" : "Create a new project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">NAME</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="font-pixel-body text-sm h-10"
                placeholder="Project name..."
              />
            </div>
            <div>
              <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">DESCRIPTION</label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="font-pixel-body text-sm"
                placeholder="What's this project about?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">DEPARTMENT</label>
                <Select value={formDept} onValueChange={(v) => setFormDept(v as Department)}>
                  <SelectTrigger className="font-pixel-body text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(departmentInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="font-pixel-body text-sm">
                        {info.icon} {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">STATUS</label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ProjectStatus)}>
                  <SelectTrigger className="font-pixel-body text-sm h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="font-pixel-body text-sm">🟢 Active</SelectItem>
                    <SelectItem value="completed" className="font-pixel-body text-sm">✅ Completed</SelectItem>
                    <SelectItem value="archived" className="font-pixel-body text-sm">📦 Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">ICON</label>
                <Input
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="font-pixel-body text-lg h-10 text-center"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">DEADLINE</label>
                <Input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="font-pixel-body text-sm h-10"
                />
              </div>
            </div>

            <Button className="w-full font-pixel text-[11px] h-10" onClick={saveProject} disabled={!formName.trim()}>
              {editingProject ? "💾 SAVE CHANGES" : "🚀 CREATE PROJECT"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
