import { useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { useAgents } from "@/contexts/AgentContext";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Activity, CheckCircle2, Clock, Flame, Trophy, Users, Zap, TrendingUp } from "lucide-react";

const COLORS = [
  "hsl(160 100% 50%)", "hsl(270 80% 65%)", "hsl(45 100% 60%)",
  "hsl(180 100% 60%)", "hsl(330 100% 65%)", "hsl(0 85% 55%)",
];

const tooltipStyle = {
  contentStyle: { background: "hsl(240 18% 12%)", border: "1px solid hsl(240 15% 22%)", borderRadius: 0, fontSize: 12 },
  labelStyle: { color: "hsl(60 30% 90%)" },
};

export default function WorkflowDashboard() {
  const { workflowRuns, xpData, tasks, subTasks, packs, scheduledWorkflows } = useWorkflow();
  const { agents, getAgentById } = useAgents();

  // ── Stats ──
  const completedRuns = workflowRuns.filter(r => r.status === "completed").length;
  const runningRuns = workflowRuns.filter(r => r.status === "running").length;
  const failedRuns = workflowRuns.filter(r => r.status === "failed").length;
  const totalXP = xpData.reduce((s, x) => s + x.xp, 0);
  const totalTasksDone = xpData.reduce((s, x) => s + x.tasksDone, 0);

  // ── XP Distribution by Rank ──
  const xpByRank = useMemo(() => {
    const map: Record<string, { rank: string; count: number; totalXP: number }> = {};
    xpData.forEach(x => {
      if (!map[x.rank]) map[x.rank] = { rank: x.rank, count: 0, totalXP: 0 };
      map[x.rank].count++;
      map[x.rank].totalXP += x.xp;
    });
    return Object.values(map).sort((a, b) => b.totalXP - a.totalXP);
  }, [xpData]);

  // ── Top Agents by XP ──
  const topAgents = useMemo(() =>
    [...xpData].sort((a, b) => b.xp - a.xp).slice(0, 8), [xpData]);

  // ── Agent Utilization ──
  const agentUtil = useMemo(() => {
    const taskCount: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.assigneeId) taskCount[t.assigneeId] = (taskCount[t.assigneeId] || 0) + 1;
    });
    return agents.slice(0, 12).map(a => ({
      name: a.name.split(" ")[0],
      id: a.id,
      tasks: taskCount[a.id] || 0,
      xp: xpData.find(x => x.agentId === a.id)?.xp || 0,
      rank: xpData.find(x => x.agentId === a.id)?.rank || "—",
    }));
  }, [agents, tasks, xpData]);

  // ── Runs by Pack ──
  const runsByPack = useMemo(() => {
    const map: Record<string, { name: string; runs: number; completed: number; xp: number }> = {};
    workflowRuns.forEach(r => {
      if (!map[r.packId]) map[r.packId] = { name: r.packName, runs: 0, completed: 0, xp: 0 };
      map[r.packId].runs++;
      if (r.status === "completed") map[r.packId].completed++;
      map[r.packId].xp += r.xpAwarded;
    });
    return Object.values(map);
  }, [workflowRuns]);

  // ── Scheduled summary ──
  const activeSchedules = scheduledWorkflows.filter(s => s.isActive).length;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground pixel-text">⚡ Workflow Dashboard</h1>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={<Zap className="w-4 h-4" />} label="Total Runs" value={workflowRuns.length} color="text-primary" />
          <KPI icon={<CheckCircle2 className="w-4 h-4" />} label="Completed" value={completedRuns} color="text-accent" />
          <KPI icon={<Trophy className="w-4 h-4" />} label="Total XP" value={totalXP} color="text-secondary" />
          <KPI icon={<Users className="w-4 h-4" />} label="Active Schedules" value={activeSchedules} color="text-primary" />
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Running" value={runningRuns} variant="running" />
          <MiniStat label="Failed" value={failedRuns} variant="failed" />
          <MiniStat label="Tasks Done" value={totalTasksDone} variant="done" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="xp">XP & Ranks</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="runs">Run Log</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Runs by Pack */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Runs by Workflow Pack</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  {runsByPack.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={runsByPack}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 22%)" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(240 10% 55%)", fontSize: 10 }} />
                        <YAxis tick={{ fill: "hsl(240 10% 55%)", fontSize: 10 }} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="runs" fill="hsl(160 100% 50%)" name="Total Runs" />
                        <Bar dataKey="completed" fill="hsl(45 100% 60%)" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyState text="No workflow runs yet. Run a workflow pack to see data here." />}
                </CardContent>
              </Card>

              {/* XP Distribution Pie */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">XP Distribution by Rank</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  {xpByRank.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={xpByRank} dataKey="totalXP" nameKey="rank" cx="50%" cy="50%" outerRadius={70} label={({ rank, percent }) => `${rank} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                          {xpByRank.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <EmptyState text="No XP data yet." />}
                </CardContent>
              </Card>
            </div>

            {/* Agent Utilization Bar */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Agent Task Load</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentUtil} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 22%)" />
                    <XAxis type="number" tick={{ fill: "hsl(240 10% 55%)", fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "hsl(240 10% 55%)", fontSize: 10 }} width={60} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="tasks" fill="hsl(180 100% 60%)" name="Tasks" />
                    <Bar dataKey="xp" fill="hsl(270 80% 65%)" name="XP" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── XP & Ranks Tab ── */}
          <TabsContent value="xp" className="space-y-4">
            {/* Leaderboard */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" /> XP Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <div className="space-y-2">
                    {topAgents.map((x, i) => {
                      const agent = getAgentById(x.agentId);
                      const maxXP = topAgents[0]?.xp || 1;
                      return (
                        <div key={x.agentId} className="flex items-center gap-3 p-2 bg-muted/30 border border-border">
                          <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </span>
                          <span className="text-sm font-medium text-foreground flex-1 truncate">
                            {agent?.avatar} {agent?.name || x.agentId}
                          </span>
                          <Badge variant="outline" className="text-[10px] border-secondary text-secondary">
                            {x.rank}
                          </Badge>
                          <div className="w-24">
                            <Progress value={(x.xp / maxXP) * 100} className="h-2" />
                          </div>
                          <span className="text-xs font-bold text-primary w-12 text-right">{x.xp} XP</span>
                        </div>
                      );
                    })}
                    {topAgents.length === 0 && <EmptyState text="No XP data yet." />}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Rank Distribution Bar */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Agent Count by Rank</CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                {xpByRank.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={xpByRank}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 22%)" />
                      <XAxis dataKey="rank" tick={{ fill: "hsl(240 10% 55%)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(240 10% 55%)", fontSize: 10 }} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="count" fill="hsl(330 100% 65%)" name="Agents" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState text="No rank data." />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Agents Tab ── */}
          <TabsContent value="agents" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Agent Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Agent</TableHead>
                        <TableHead className="text-xs text-center">Tasks</TableHead>
                        <TableHead className="text-xs text-center">XP</TableHead>
                        <TableHead className="text-xs text-center">Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentUtil.map(a => {
                        const agent = getAgentById(a.id);
                        return (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs font-medium">{agent?.avatar} {agent?.name || a.id}</TableCell>
                            <TableCell className="text-xs text-center">{a.tasks}</TableCell>
                            <TableCell className="text-xs text-center text-primary font-bold">{a.xp}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-[10px]">{a.rank}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Run Log Tab ── */}
          <TabsContent value="runs" className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> All Workflow Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {workflowRuns.length > 0 ? (
                    <div className="space-y-2">
                      {workflowRuns.map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 bg-muted/20 border border-border">
                          <StatusDot status={r.status} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.packName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(r.startedAt).toLocaleString()} · {r.tasksCreated} tasks · {r.assignedAgents.length} agents
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={r.status === "completed" ? "default" : r.status === "running" ? "secondary" : "destructive"} className="text-[10px]">
                              {r.status}
                            </Badge>
                            {r.xpAwarded > 0 && (
                              <p className="text-[10px] text-accent mt-1">+{r.xpAwarded} XP</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState text="No runs yet. Go to Workflows to start one!" />}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function KPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="text-lg md:text-xl font-bold text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, variant }: { label: string; value: number; variant: "running" | "failed" | "done" }) {
  const colors = { running: "text-secondary", failed: "text-destructive", done: "text-primary" };
  return (
    <div className="text-center p-2 bg-muted/30 border border-border">
      <p className={`text-lg font-bold ${colors[variant]}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const c = status === "completed" ? "bg-primary" : status === "running" ? "bg-secondary animate-pulse" : "bg-destructive";
  return <div className={`w-2 h-2 rounded-full ${c}`} />;
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex items-center justify-center h-full text-xs text-muted-foreground">{text}</div>;
}
