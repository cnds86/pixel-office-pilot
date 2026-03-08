import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, Target, AlertTriangle, ArrowRight, Flame, Star, ChevronDown, ChevronRight } from "lucide-react";
import { subTasks, agentXPData, getSubTasksByParent, type SubTask, type AgentXP } from "@/data/clawEmpireData";
import { tasks, getAgentById } from "@/data/mockData";

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  todo: { label: "To Do", color: "bg-muted text-muted-foreground", icon: "○" },
  "in-progress": { label: "In Progress", color: "bg-primary/20 text-primary", icon: "◉" },
  done: { label: "Done", color: "bg-primary text-primary-foreground", icon: "✓" },
  blocked: { label: "Blocked", color: "bg-destructive/20 text-destructive", icon: "✕" },
};

const rankConfig: Record<string, { color: string; icon: string }> = {
  Intern: { color: "text-muted-foreground", icon: "🌱" },
  Junior: { color: "text-blue-400", icon: "⚡" },
  Mid: { color: "text-accent", icon: "🔥" },
  Senior: { color: "text-secondary", icon: "💎" },
  Lead: { color: "text-primary", icon: "👑" },
  Architect: { color: "text-primary", icon: "🏛️" },
};

export default function SubTasksXP() {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(["t6", "t2"]));
  const [tab, setTab] = useState("subtasks");

  const sortedLeaderboard = useMemo(
    () => [...agentXPData].sort((a, b) => b.xp - a.xp),
    []
  );

  const tasksWithSubs = useMemo(
    () => tasks.filter(t => subTasks.some(st => st.parentTaskId === t.id)),
    []
  );

  const stats = useMemo(() => ({
    totalSubs: subTasks.length,
    done: subTasks.filter(s => s.status === "done").length,
    blocked: subTasks.filter(s => s.status === "blocked").length,
    delegations: subTasks.filter(s => s.delegatedFrom).length,
  }), []);

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-lg text-primary">⚔️ SubTasks & XP Ranking</h1>
          <p className="font-pixel-body text-lg text-muted-foreground">
            Cross-department delegation • Agent progression system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{stats.totalSubs}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">SubTasks</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{stats.done}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="font-pixel text-lg text-destructive">{stats.blocked}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Blocked</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <ArrowRight className="h-5 w-5 text-secondary mx-auto mb-1" />
              <p className="font-pixel text-lg text-secondary">{stats.delegations}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Delegated</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="pixel-border bg-card">
            <TabsTrigger value="subtasks" className="font-pixel text-[9px]">📋 SubTasks</TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-pixel text-[9px]">🏆 Leaderboard</TabsTrigger>
          </TabsList>

          {/* SubTasks Tab */}
          <TabsContent value="subtasks">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3">
                {tasksWithSubs.map(task => {
                  const subs = getSubTasksByParent(task.id);
                  const expanded = expandedTasks.has(task.id);
                  const doneCount = subs.filter(s => s.status === "done").length;
                  const progress = (doneCount / subs.length) * 100;

                  return (
                    <Card key={task.id} className="pixel-border">
                      <CardHeader className="p-4 pb-2 cursor-pointer" onClick={() => toggleExpand(task.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {expanded ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <CardTitle className="font-pixel text-[10px]">{task.title}</CardTitle>
                            <Badge variant="outline" className="font-pixel-body text-xs">{subs.length} subtasks</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-pixel-body text-sm text-muted-foreground">{doneCount}/{subs.length}</span>
                            <Progress value={progress} className="w-20 h-2" />
                          </div>
                        </div>
                      </CardHeader>
                      {expanded && (
                        <CardContent className="p-4 pt-0 space-y-2">
                          {subs.map(sub => {
                            const agent = getAgentById(sub.assigneeId);
                            const cfg = statusConfig[sub.status];
                            return (
                              <div key={sub.id} className="flex items-center justify-between p-3 bg-muted/30 border border-border">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="font-pixel text-[8px]">{cfg.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-pixel-body text-base truncate">{sub.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm">{agent?.avatar}</span>
                                      <span className="font-pixel-body text-sm text-muted-foreground">{agent?.name}</span>
                                      {sub.delegatedFrom && (
                                        <span className="flex items-center gap-1 font-pixel-body text-xs text-secondary">
                                          <ArrowRight className="h-3 w-3" />
                                          from {getAgentById(sub.delegatedFrom)?.name}
                                        </span>
                                      )}
                                    </div>
                                    {sub.blockedReason && (
                                      <p className="font-pixel-body text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {sub.blockedReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${cfg.color} font-pixel text-[7px]`}>{cfg.label}</Badge>
                                  <Badge variant="outline" className="font-pixel-body text-xs">+{sub.xpReward} XP</Badge>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {sortedLeaderboard.map((entry, idx) => {
                  const agent = getAgentById(entry.agentId);
                  const rc = rankConfig[entry.rank];
                  const maxXP = sortedLeaderboard[0]?.xp || 1;

                  return (
                    <Card key={entry.agentId} className={`pixel-border ${idx < 3 ? "pixel-border-glow" : ""}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        {/* Rank position */}
                        <div className="w-8 text-center">
                          {idx === 0 && <span className="text-2xl">🥇</span>}
                          {idx === 1 && <span className="text-2xl">🥈</span>}
                          {idx === 2 && <span className="text-2xl">🥉</span>}
                          {idx > 2 && <span className="font-pixel text-sm text-muted-foreground">#{idx + 1}</span>}
                        </div>

                        {/* Agent info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{agent?.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-pixel text-[10px] truncate">{agent?.name}</p>
                              <span className={`font-pixel text-[8px] ${rc.color}`}>{rc.icon} {entry.rank}</span>
                            </div>
                            <p className="font-pixel-body text-sm text-muted-foreground">{agent?.specialty} • {agent?.department}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-destructive" />
                              <span className="font-pixel text-[9px]">{entry.streak}</span>
                            </div>
                            <p className="font-pixel-body text-xs text-muted-foreground">streak</p>
                          </div>
                          <div className="text-center">
                            <p className="font-pixel text-[9px]">{entry.tasksDone}</p>
                            <p className="font-pixel-body text-xs text-muted-foreground">tasks</p>
                          </div>
                          <div className="w-24">
                            <div className="flex items-center justify-between mb-1">
                              <Star className="h-3 w-3 text-accent" />
                              <span className="font-pixel text-[9px] text-accent">{entry.xp} XP</span>
                            </div>
                            <Progress value={(entry.xp / maxXP) * 100} className="h-2" />
                          </div>
                        </div>

                        <span className="font-pixel-body text-xs text-muted-foreground">{entry.lastActive}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
