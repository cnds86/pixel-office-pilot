import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { companyMission, type CompanyGoal, type GoalStatus } from "@/data/paperclipData";
import { getAgentById } from "@/data/mockData";
import { tasks as allTasks } from "@/data/mockData";
import { Target, ArrowUpRight, Flag, Users, ClipboardList } from "lucide-react";

const statusConfig: Record<GoalStatus, { label: string; color: string; icon: string }> = {
  "on-track": { label: "On Track", color: "border-primary text-primary", icon: "✅" },
  "at-risk": { label: "At Risk", color: "border-accent text-accent", icon: "⚠️" },
  "behind": { label: "Behind", color: "border-destructive text-destructive", icon: "🔴" },
  "completed": { label: "Completed", color: "border-muted-foreground text-muted-foreground", icon: "🏆" },
};

export default function GoalAlignment() {
  const [selectedGoal, setSelectedGoal] = useState<CompanyGoal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<GoalStatus | "all">("all");

  const { goals } = companyMission;
  const topLevelGoals = useMemo(() => goals.filter(g => g.parentGoalId === null), [goals]);
  const subGoals = (parentId: string) => goals.filter(g => g.parentGoalId === parentId);

  const filtered = useMemo(() => {
    const base = filterStatus === "all" ? goals : goals.filter(g => g.status === filterStatus);
    return base;
  }, [goals, filterStatus]);

  const avgProgress = Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length);

  const openGoal = (g: CompanyGoal) => {
    setSelectedGoal(g);
    setDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-xl text-primary flex items-center gap-2">
            <Target className="h-5 w-5" /> Goal Alignment
          </h1>
          <p className="font-pixel-body text-sm text-muted-foreground">
            Every task traces back to company mission — สิ่งที่ agents ทำมีความหมาย
          </p>
        </div>

        {/* Mission Card */}
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              <h2 className="font-pixel text-sm text-primary">{companyMission.name}</h2>
            </div>
            <p className="font-pixel-body text-sm">
              <span className="text-muted-foreground">Mission:</span> {companyMission.mission}
            </p>
            <p className="font-pixel-body text-sm">
              <span className="text-muted-foreground">Vision:</span> {companyMission.vision}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="font-pixel text-[9px] text-muted-foreground">Overall Progress</span>
              <Progress value={avgProgress} className="flex-1 h-3" />
              <span className="font-pixel text-xs text-primary">{avgProgress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "on-track", "at-risk", "behind", "completed"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`font-pixel text-[10px] px-3 py-1.5 border-2 transition-colors ${
                filterStatus === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"
              }`}>
              {s === "all" ? "All Goals" : statusConfig[s].icon + " " + statusConfig[s].label}
            </button>
          ))}
        </div>

        {/* Goal Tree */}
        <div className="space-y-4">
          {topLevelGoals
            .filter(g => filterStatus === "all" || g.status === filterStatus)
            .map(goal => (
            <div key={goal.id} className="space-y-2">
              <GoalCard goal={goal} onSelect={openGoal} isTopLevel />
              <div className="ml-6 border-l-2 border-border pl-4 space-y-2">
                {subGoals(goal.id)
                  .filter(g => filterStatus === "all" || g.status === filterStatus)
                  .map(sub => (
                  <GoalCard key={sub.id} goal={sub} onSelect={openGoal} />
                ))}
              </div>
            </div>
          ))}
          {/* Standalone goals without parent */}
          {filtered.filter(g => g.parentGoalId !== null && !topLevelGoals.some(tl => tl.id === g.parentGoalId)).length === 0 && filtered.length === 0 && (
            <p className="text-center text-muted-foreground font-pixel text-xs py-12">No goals match filter</p>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="border-2 border-border max-w-md">
            {selectedGoal && (() => {
              const sc = statusConfig[selectedGoal.status];
              const parent = selectedGoal.parentGoalId ? goals.find(g => g.id === selectedGoal.parentGoalId) : null;
              const children = subGoals(selectedGoal.id);
              const linkedTasks = selectedGoal.linkedTaskIds.map(id => allTasks.find(t => t.id === id)).filter(Boolean);

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-2">
                      <Target className="h-4 w-4" /> {selectedGoal.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 font-pixel-body text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`font-pixel text-[9px] ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </Badge>
                      <span className="text-muted-foreground text-xs">Deadline: {new Date(selectedGoal.deadline).toLocaleDateString()}</span>
                    </div>

                    <p className="bg-muted p-3 border border-border">{selectedGoal.description}</p>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary font-pixel">{selectedGoal.progress}%</span>
                      </div>
                      <Progress value={selectedGoal.progress} className="h-3" />
                    </div>

                    {parent && (
                      <div className="bg-muted p-3 border border-border">
                        <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Parent Goal
                        </p>
                        <p className="cursor-pointer hover:text-primary" onClick={() => openGoal(parent)}>{parent.title}</p>
                      </div>
                    )}

                    {children.length > 0 && (
                      <div className="bg-muted p-3 border border-border">
                        <p className="text-muted-foreground text-xs mb-2">Sub-Goals ({children.length})</p>
                        <div className="space-y-1">
                          {children.map(c => (
                            <p key={c.id} className="flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => openGoal(c)}>
                              {statusConfig[c.status].icon} {c.title}
                              <span className="text-muted-foreground text-xs ml-auto">{c.progress}%</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Agents */}
                    <div>
                      <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Assigned Agents
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGoal.assignedAgentIds.map(id => {
                          const a = getAgentById(id);
                          return a ? (
                            <Badge key={id} variant="outline" className="font-pixel text-[8px]">
                              {a.avatar} {a.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Linked Tasks */}
                    {linkedTasks.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1">
                          <ClipboardList className="h-3 w-3" /> Linked Tasks
                        </p>
                        <div className="space-y-1">
                          {linkedTasks.map(t => t && (
                            <div key={t.id} className="flex items-center gap-2 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                t.status === "done" ? "bg-primary" : t.status === "in-progress" ? "bg-accent" : "bg-muted-foreground"
                              }`} />
                              {t.title}
                              <Badge variant="outline" className="font-pixel text-[7px] ml-auto">{t.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function GoalCard({ goal, onSelect, isTopLevel }: { goal: CompanyGoal; onSelect: (g: CompanyGoal) => void; isTopLevel?: boolean }) {
  const sc = statusConfig[goal.status];
  return (
    <Card className={`border-2 cursor-pointer transition-all hover:scale-[1.005] ${
      isTopLevel ? "border-primary/20" : "border-border"
    }`} onClick={() => onSelect(goal)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-pixel text-[11px]">{goal.title}</span>
              <Badge variant="outline" className={`font-pixel text-[8px] ${sc.color}`}>
                {sc.icon} {sc.label}
              </Badge>
            </div>
            <p className="font-pixel-body text-xs text-muted-foreground line-clamp-1">{goal.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={goal.progress} className="flex-1 h-2" />
              <span className="font-pixel text-[9px] text-primary">{goal.progress}%</span>
            </div>
          </div>
          <div className="flex -space-x-1 shrink-0">
            {goal.assignedAgentIds.slice(0, 3).map(id => {
              const a = getAgentById(id);
              return a ? <span key={id} className="text-sm" title={a.name}>{a.avatar}</span> : null;
            })}
            {goal.assignedAgentIds.length > 3 && (
              <span className="font-pixel text-[8px] text-muted-foreground ml-1">+{goal.assignedAgentIds.length - 3}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
