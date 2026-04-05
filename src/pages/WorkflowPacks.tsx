import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Pause, ArrowRight, Users, Rocket, Clock, Timer, Trash2, CalendarClock, Zap, Plus, Pencil } from "lucide-react";
import { departmentInfo, type Department } from "@/data/mockData";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { useAgents } from "@/contexts/AgentContext";
import { useToast } from "@/hooks/use-toast";
import type { WorkflowPack, WorkflowPackType } from "@/data/clawEmpireData";

const packTypes: { value: WorkflowPackType; label: string }[] = [
  { value: "dev", label: "Development" },
  { value: "report", label: "Report" },
  { value: "novel", label: "Novel/Content" },
  { value: "video", label: "Video" },
  { value: "research", label: "Research" },
  { value: "roleplay", label: "Roleplay" },
];

const departments: { value: Department; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "qa", label: "QA" },
  { value: "devops", label: "DevOps" },
  { value: "support", label: "Support" },
];

export default function WorkflowPacks() {
  const {
    packs, togglePack, addPack, updatePack, removePack, runWorkflow, workflowRuns,
    scheduledWorkflows, scheduleWorkflow, unscheduleWorkflow, toggleSchedule,
  } = useWorkflow();
  const { agents } = useAgents();
  const [selectedPack, setSelectedPack] = useState<WorkflowPack | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [schedulePackId, setSchedulePackId] = useState<string>("");
  const [scheduleInterval, setScheduleInterval] = useState("60");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<WorkflowPack | null>(null);
  const [newPack, setNewPack] = useState({
    name: "", description: "", type: "dev" as WorkflowPackType, icon: "⚡",
    department: "engineering" as Department, roles: "", steps: "",
  });
  const [editForm, setEditForm] = useState({
    name: "", description: "", type: "dev" as WorkflowPackType, icon: "⚡",
    department: "engineering" as Department, roles: "", steps: "",
  });
  const { toast } = useToast();

  const activeCount = packs.filter(p => p.isActive).length;
  const runningCount = workflowRuns.filter(r => r.status === "running").length;

  const handleToggle = (id: string) => {
    const pack = packs.find(p => p.id === id);
    togglePack(id);
    toast({
      title: pack?.isActive ? "Workflow Deactivated" : "Workflow Activated",
      description: `${pack?.name} is now ${pack?.isActive ? "paused" : "running"}`,
    });
  };

  const handleRun = (packId: string) => {
    const run = runWorkflow(packId);
    if (run) {
      toast({
        title: "🚀 Workflow Launched!",
        description: `Created ${run.tasksCreated} tasks with ${run.assignedAgents.length} agents`,
      });
    }
  };

  const handleSchedule = () => {
    if (!schedulePackId) return;
    scheduleWorkflow(schedulePackId, parseInt(scheduleInterval));
    setScheduleDialogOpen(false);
    const pack = packs.find(p => p.id === schedulePackId);
    toast({
      title: "⏰ Workflow Scheduled",
      description: `${pack?.name} will run every ${scheduleInterval} minutes`,
    });
  };

  const handleCreatePack = () => {
    if (!newPack.name || !newPack.steps) return;
    const pack: WorkflowPack = {
      id: `wp-${Date.now()}`,
      type: newPack.type,
      name: newPack.name,
      description: newPack.description,
      icon: newPack.icon || "📦",
      agentRoles: newPack.roles.split(",").map(r => r.trim()).filter(Boolean),
      defaultDepartment: newPack.department,
      steps: [newPack.steps],
      isActive: true,
    };
    addPack(pack);
    setCreateDialogOpen(false);
    setNewPack({ name: "", description: "", type: "dev", icon: "⚡", department: "engineering", roles: "", steps: "" });
    toast({ title: "✅ Pack Created!", description: `${pack.name} is ready to run` });
  };

  const openEditDialog = (pack: WorkflowPack) => {
    setEditingPack(pack);
    setEditForm({
      name: pack.name,
      description: pack.description,
      type: pack.type,
      icon: pack.icon,
      department: pack.defaultDepartment,
      roles: pack.agentRoles.join(", "),
      steps: pack.steps[0],
    });
    setSelectedPack(null);
    setEditDialogOpen(true);
  };

  const handleUpdatePack = () => {
    if (!editingPack || !editForm.name || !editForm.steps) return;
    updatePack(editingPack.id, {
      name: editForm.name,
      description: editForm.description,
      type: editForm.type,
      icon: editForm.icon || "📦",
      agentRoles: editForm.roles.split(",").map(r => r.trim()).filter(Boolean),
      defaultDepartment: editForm.department,
      steps: [editForm.steps],
    });
    setEditDialogOpen(false);
    setEditingPack(null);
    toast({ title: "✏️ Pack Updated!", description: `${editForm.name} has been updated` });
  };

  const handleDeletePack = (packId: string, packName: string) => {
    removePack(packId);
    setSelectedPack(null);
    toast({ title: "🗑️ Pack Deleted", description: `${packName} has been removed` });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-pixel text-lg text-primary">🔄 Workflow Packs</h1>
            <p className="font-pixel-body text-lg text-muted-foreground">
              Workflow engine with auto-routing & scheduled runs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-pixel text-[9px]">
              {activeCount} active
            </Badge>
            {runningCount > 0 && (
              <Badge className="bg-primary text-primary-foreground font-pixel text-[9px] animate-pulse">
                {runningCount} running
              </Badge>
            )}
            <Button
              size="sm"
              className="font-pixel text-[9px]"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-3 w-3 mr-1" /> Create Pack
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-pixel text-[9px]"
              onClick={() => { setScheduleDialogOpen(true); setSchedulePackId(packs[0]?.id || ""); }}
            >
              <CalendarClock className="h-3 w-3 mr-1" /> Schedule
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Rocket className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{workflowRuns.length}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Total Runs</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{workflowRuns.filter(r => r.status === "completed").length}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Timer className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{scheduledWorkflows.filter(s => s.isActive).length}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">
                {new Set(workflowRuns.flatMap(r => r.assignedAgents)).size}
              </p>
              <p className="font-pixel-body text-sm text-muted-foreground">Agents Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Pack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map(pack => {
            const dept = departmentInfo[pack.defaultDepartment];
            const packRuns = workflowRuns.filter(r => r.packId === pack.id);
            const isRunning = packRuns.some(r => r.status === "running");

            return (
              <Card
                key={pack.id}
                className={`pixel-border cursor-pointer transition-all hover:scale-[1.02] ${pack.isActive ? "pixel-border-glow" : "opacity-70"} ${isRunning ? "ring-2 ring-primary/50" : ""}`}
                onClick={() => setSelectedPack(pack)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pack.icon}</span>
                      <div>
                        <CardTitle className="font-pixel text-[10px]">{pack.name}</CardTitle>
                        <Badge variant="outline" className="font-pixel-body text-xs mt-1">
                          {dept.icon} {dept.label}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={pack.isActive}
                      onCheckedChange={() => handleToggle(pack.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="font-pixel-body text-sm text-muted-foreground">{pack.description}</p>

                  <div className="bg-muted/30 border border-border p-2">
                    <p className="font-pixel-body text-xs text-primary">{pack.steps[0]}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {pack.agentRoles.map(role => (
                      <Badge key={role} variant="secondary" className="font-pixel-body text-xs">{role}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pack.isActive ? (
                        <span className="flex items-center gap-1 font-pixel text-[8px] text-primary">
                          <Play className="h-3 w-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-pixel text-[8px] text-muted-foreground">
                          <Pause className="h-3 w-3" /> PAUSED
                        </span>
                      )}
                      {isRunning && (
                        <span className="font-pixel text-[8px] text-primary animate-pulse">⚡ RUNNING</span>
                      )}
                    </div>
                    {packRuns.length > 0 && (
                      <span className="font-pixel text-[8px] text-muted-foreground">{packRuns.length} runs</span>
                    )}
                  </div>

                  {/* Run Button */}
                  <Button
                    size="sm"
                    className="w-full font-pixel text-[9px] h-8"
                    disabled={!pack.isActive || isRunning}
                    onClick={(e) => { e.stopPropagation(); handleRun(pack.id); }}
                  >
                    <Rocket className="h-3 w-3 mr-1" />
                    {isRunning ? "RUNNING..." : "RUN WORKFLOW"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Scheduled Workflows Section */}
        {scheduledWorkflows.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-pixel text-sm text-primary flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Scheduled Workflows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheduledWorkflows.map(sched => {
                const pack = packs.find(p => p.id === sched.packId);
                return (
                  <Card key={sched.id} className="pixel-border">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pack?.icon}</span>
                        <div>
                          <p className="font-pixel text-[10px]">{pack?.name}</p>
                          <p className="font-pixel-body text-xs text-muted-foreground">
                            Every {sched.intervalMinutes}m · {sched.runsCompleted} runs completed
                          </p>
                          {sched.lastRun && (
                            <p className="font-pixel-body text-xs text-muted-foreground">
                              Last: {new Date(sched.lastRun).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sched.isActive}
                          onCheckedChange={() => toggleSchedule(sched.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unscheduleWorkflow(sched.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Runs */}
        {workflowRuns.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-pixel text-sm text-primary flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent Runs
            </h2>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {workflowRuns.slice(0, 10).map(run => {
                  const pack = packs.find(p => p.id === run.packId);
                  const runAgents = run.assignedAgents.map(id => agents.find(a => a.id === id)).filter(Boolean);
                  return (
                    <Card key={run.id} className="pixel-border">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{pack?.icon}</span>
                          <div>
                            <p className="font-pixel text-[9px]">{run.packName}</p>
                            <p className="font-pixel-body text-xs text-muted-foreground">
                              {run.tasksCreated} tasks · {run.xpAwarded} XP
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {runAgents.slice(0, 3).map(a => (
                              <span key={a!.id} className="text-sm">{a!.avatar}</span>
                            ))}
                          </div>
                          <Badge
                            className={`font-pixel text-[7px] ${
                              run.status === "running" ? "bg-primary/20 text-primary animate-pulse" :
                              run.status === "completed" ? "bg-primary text-primary-foreground" :
                              "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {run.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
          <DialogContent className="pixel-border bg-card max-w-lg">
            {selectedPack && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-pixel text-sm flex items-center gap-2">
                    <span className="text-2xl">{selectedPack.icon}</span>
                    {selectedPack.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="font-pixel-body text-base text-muted-foreground">{selectedPack.description}</p>

                  <div>
                    <p className="font-pixel text-[9px] text-muted-foreground mb-2">WORKFLOW STEPS</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedPack.steps[0].split(" → ").map((step, i, arr) => (
                        <span key={i} className="flex items-center gap-1">
                          <Badge className="bg-primary/20 text-primary font-pixel-body text-sm">{step}</Badge>
                          {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-pixel text-[9px] text-muted-foreground mb-2">AGENT ROLES</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPack.agentRoles.map(role => (
                        <Badge key={role} variant="outline" className="font-pixel-body text-sm">{role}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-pixel text-[9px] text-muted-foreground mb-2">ASSIGNED AGENTS ({selectedPack.defaultDepartment})</p>
                    <div className="flex gap-2 flex-wrap">
                      {agents
                        .filter(a => a.department === selectedPack.defaultDepartment)
                        .slice(0, selectedPack.agentRoles.length)
                        .map(a => (
                          <Badge key={a.id} variant="secondary" className="font-pixel-body text-xs">
                            {a.avatar} {a.name}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      className="flex-1 font-pixel text-[9px]"
                      disabled={!selectedPack.isActive}
                      onClick={() => { handleRun(selectedPack.id); setSelectedPack(null); }}
                    >
                      <Rocket className="h-3 w-3 mr-1" /> Run Now
                    </Button>
                    <Button
                      variant="outline"
                      className="font-pixel text-[9px]"
                      onClick={() => openEditDialog(selectedPack)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="font-pixel text-[9px]"
                      onClick={() => {
                        setSchedulePackId(selectedPack.id);
                        setSelectedPack(null);
                        setScheduleDialogOpen(true);
                      }}
                    >
                      <CalendarClock className="h-3 w-3 mr-1" /> Schedule
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedPack.isActive ? "destructive" : "default"}
                      className="flex-1 font-pixel text-[9px]"
                      onClick={() => {
                        handleToggle(selectedPack.id);
                        setSelectedPack({ ...selectedPack, isActive: !selectedPack.isActive });
                      }}
                    >
                      {selectedPack.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="font-pixel text-[9px]"
                      onClick={() => handleDeletePack(selectedPack.id, selectedPack.name)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="pixel-border bg-card max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-primary">
                ⏰ Schedule Workflow
              </DialogTitle>
              <DialogDescription className="font-pixel-body text-sm text-muted-foreground">
                Set up recurring workflow execution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-pixel text-[9px] text-muted-foreground mb-1 block">WORKFLOW</label>
                <Select value={schedulePackId} onValueChange={setSchedulePackId}>
                  <SelectTrigger className="font-pixel-body text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packs.filter(p => p.isActive).map(p => (
                      <SelectItem key={p.id} value={p.id} className="font-pixel-body text-sm">
                        {p.icon} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-pixel text-[9px] text-muted-foreground mb-1 block">INTERVAL</label>
                <Select value={scheduleInterval} onValueChange={setScheduleInterval}>
                  <SelectTrigger className="font-pixel-body text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="font-pixel-body text-sm">Every 5 minutes</SelectItem>
                    <SelectItem value="15" className="font-pixel-body text-sm">Every 15 minutes</SelectItem>
                    <SelectItem value="30" className="font-pixel-body text-sm">Every 30 minutes</SelectItem>
                    <SelectItem value="60" className="font-pixel-body text-sm">Every hour</SelectItem>
                    <SelectItem value="360" className="font-pixel-body text-sm">Every 6 hours</SelectItem>
                    <SelectItem value="1440" className="font-pixel-body text-sm">Daily</SelectItem>
                    <SelectItem value="10080" className="font-pixel-body text-sm">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full font-pixel text-[9px]" onClick={handleSchedule} disabled={!schedulePackId}>
                <CalendarClock className="h-3 w-3 mr-1" /> Create Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Pack Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm">Create Workflow Pack</DialogTitle>
              <DialogDescription className="font-pixel-body text-sm">Define a new reusable workflow template</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-16">
                  <Label className="font-pixel text-[9px]">Icon</Label>
                  <Input value={newPack.icon} onChange={e => setNewPack(p => ({ ...p, icon: e.target.value }))} className="font-pixel text-center text-lg h-9" maxLength={2} />
                </div>
                <div className="flex-1">
                  <Label className="font-pixel text-[9px]">Name</Label>
                  <Input value={newPack.name} onChange={e => setNewPack(p => ({ ...p, name: e.target.value }))} placeholder="My Workflow" className="font-pixel-body text-sm h-9" />
                </div>
              </div>
              <div>
                <Label className="font-pixel text-[9px]">Description</Label>
                <Textarea value={newPack.description} onChange={e => setNewPack(p => ({ ...p, description: e.target.value }))} placeholder="What does this workflow do?" className="font-pixel-body text-sm min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="font-pixel text-[9px]">Type</Label>
                  <Select value={newPack.type} onValueChange={v => setNewPack(p => ({ ...p, type: v as WorkflowPackType }))}>
                    <SelectTrigger className="font-pixel-body text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {packTypes.map(t => <SelectItem key={t.value} value={t.value} className="font-pixel-body text-sm">{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-pixel text-[9px]">Department</Label>
                  <Select value={newPack.department} onValueChange={v => setNewPack(p => ({ ...p, department: v as Department }))}>
                    <SelectTrigger className="font-pixel-body text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.value} value={d.value} className="font-pixel-body text-sm">{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="font-pixel text-[9px]">Agent Roles <span className="text-muted-foreground">(comma-separated)</span></Label>
                <Input value={newPack.roles} onChange={e => setNewPack(p => ({ ...p, roles: e.target.value }))} placeholder="Architect, Developer, Reviewer" className="font-pixel-body text-sm h-9" />
              </div>
              <div>
                <Label className="font-pixel text-[9px]">Steps <span className="text-muted-foreground">(use → to separate)</span></Label>
                <Input value={newPack.steps} onChange={e => setNewPack(p => ({ ...p, steps: e.target.value }))} placeholder="Plan → Build → Test → Deploy" className="font-pixel-body text-sm h-9" />
              </div>
              <DialogFooter>
                <Button className="w-full font-pixel text-[9px]" onClick={handleCreatePack} disabled={!newPack.name || !newPack.steps}>
                  <Plus className="h-3 w-3 mr-1" /> Create Pack
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
