import { AppLayout } from "@/components/AppLayout";
import { tasks, departmentInfo } from "@/data/mockData";
import type { Department } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";

const departments = Object.keys(departmentInfo) as Department[];

interface DeptStats {
  department: Department;
  totalAgents: number;
  online: number;
  busy: number;
  offline: number;
  totalTasks: number;
  done: number;
  inProgress: number;
  todo: number;
  productivity: number;
}

function computeStats(): DeptStats[] {
  return departments.map((dept) => {
    const deptAgents = agents.filter((a) => a.department === dept);
    const online = deptAgents.filter((a) => a.status === "online").length;
    const busy = deptAgents.filter((a) => a.status === "busy").length;
    const offline = deptAgents.filter((a) => a.status === "offline").length;

    const agentIds = new Set(deptAgents.map((a) => a.id));
    const deptTasks = tasks.filter((t) => agentIds.has(t.assigneeId));
    const done = deptTasks.filter((t) => t.status === "done").length;
    const inProgress = deptTasks.filter((t) => t.status === "in-progress").length;
    const todo = deptTasks.filter((t) => t.status === "todo").length;
    const total = deptTasks.length;
    const productivity = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      department: dept,
      totalAgents: deptAgents.length,
      online,
      busy,
      offline,
      totalTasks: total,
      done,
      inProgress,
      todo,
      productivity,
    };
  });
}

const DepartmentStats = () => {
  const stats = computeStats();
  const totalOnline = agents.filter((a) => a.status !== "offline").length;
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const overallProd = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-pixel text-sm md:text-base text-primary">DEPARTMENT STATS</h1>
          <p className="font-pixel-body text-lg text-muted-foreground mt-1">
            Performance overview by department
          </p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Productivity Bar Chart */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <h2 className="font-pixel text-[8px] text-primary">PRODUCTIVITY BY DEPARTMENT</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.map(s => ({
                name: departmentInfo[s.department].label,
                productivity: s.productivity,
                fill: departmentInfo[s.department].color,
              }))}>
                <XAxis dataKey="name" tick={{ fontSize: 8, fontFamily: '"Press Start 2P"' }} />
                <YAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '2px solid hsl(var(--border))', fontFamily: '"Press Start 2P"', fontSize: 7 }}
                />
                <Bar dataKey="productivity" radius={[2, 2, 0, 0]}>
                  {stats.map((s, i) => (
                    <Cell key={i} fill={departmentInfo[s.department].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Pie Chart */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <h2 className="font-pixel text-[8px] text-primary">TASK STATUS OVERVIEW</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Done", value: totalDone, fill: "hsl(var(--primary))" },
                    { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length, fill: "hsl(var(--accent))" },
                    { name: "Todo", value: tasks.filter(t => t.status === "todo").length, fill: "hsl(var(--muted))" },
                  ]}
                  cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                  dataKey="value" stroke="none"
                >
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '2px solid hsl(var(--border))', fontFamily: '"Press Start 2P"', fontSize: 7 }} />
                <Legend wrapperStyle={{ fontSize: 8, fontFamily: '"Press Start 2P"' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <h2 className="font-pixel text-[8px] text-primary">DEPARTMENT RADAR</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={stats.map(s => ({
                dept: departmentInfo[s.department].icon,
                productivity: s.productivity,
                agents: (s.online / Math.max(s.totalAgents, 1)) * 100,
                tasks: Math.min(s.totalTasks * 10, 100),
              }))}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dept" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 7 }} />
                <Radar name="Productivity" dataKey="productivity" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Radar name="Online %" dataKey="agents" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 7, fontFamily: '"Press Start 2P"' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat icon="👥" label="TOTAL AGENTS" value={agents.length} sub={`${totalOnline} online`} />
          <MiniStat icon="📋" label="TOTAL TASKS" value={tasks.length} sub={`${totalDone} done`} />
          <MiniStat icon="📈" label="OVERALL PROD." value={`${overallProd}%`} sub="completion rate" />
          <MiniStat icon="🏢" label="DEPARTMENTS" value={departments.length} sub="active" />
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((s) => {
            const info = departmentInfo[s.department];
            return (
              <div key={s.department} className="pixel-border bg-card p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <h2 className="font-pixel text-[9px]" style={{ color: info.color }}>
                        {info.label.toUpperCase()}
                      </h2>
                      <p className="font-pixel text-[6px] text-muted-foreground">
                        {s.totalAgents} members
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-pixel text-lg text-primary">{s.productivity}%</span>
                    <p className="font-pixel text-[5px] text-muted-foreground">PRODUCTIVITY</p>
                  </div>
                </div>

                {/* Productivity Bar */}
                <div>
                  <div className="h-3 bg-muted pixel-border relative overflow-hidden" style={{ borderWidth: 2 }}>
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${s.productivity}%`,
                        backgroundColor: info.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>

                {/* Agent Status */}
                <div>
                  <h3 className="font-pixel text-[6px] text-muted-foreground mb-1.5">AGENT STATUS</h3>
                  <div className="flex gap-3">
                    <StatusDot color="bg-primary" label="Online" count={s.online} />
                    <StatusDot color="bg-accent" label="Busy" count={s.busy} />
                    <StatusDot color="bg-muted-foreground" label="Offline" count={s.offline} />
                  </div>
                </div>

                {/* Task Breakdown */}
                <div>
                  <h3 className="font-pixel text-[6px] text-muted-foreground mb-1.5">TASKS</h3>
                  <div className="flex gap-2">
                    <TaskPill label="DONE" count={s.done} className="bg-primary/20 text-primary" />
                    <TaskPill label="WIP" count={s.inProgress} className="bg-accent/20 text-accent" />
                    <TaskPill label="TODO" count={s.todo} className="bg-muted text-muted-foreground" />
                  </div>
                  {/* Task bar */}
                  {s.totalTasks > 0 && (
                    <div className="flex h-2 mt-2 overflow-hidden pixel-border" style={{ borderWidth: 1 }}>
                      <div className="bg-primary/70 h-full" style={{ width: `${(s.done / s.totalTasks) * 100}%` }} />
                      <div className="bg-accent/70 h-full" style={{ width: `${(s.inProgress / s.totalTasks) * 100}%` }} />
                      <div className="bg-muted h-full flex-1" />
                    </div>
                  )}
                </div>

                {/* Agent List */}
                <div>
                  <h3 className="font-pixel text-[6px] text-muted-foreground mb-1">MEMBERS</h3>
                  <ScrollArea className="max-h-[100px]">
                    <div className="space-y-1">
                      {agents
                        .filter((a) => a.department === s.department)
                        .map((a) => (
                          <div key={a.id} className="flex items-center gap-2 px-1.5 py-1 bg-muted/30 pixel-border" style={{ borderWidth: 1 }}>
                            <span className="text-sm">{a.avatar}</span>
                            <span className="font-pixel text-[6px] text-foreground flex-1 truncate">{a.name}</span>
                            <span className="font-pixel text-[5px] text-muted-foreground">{a.specialty}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              a.status === "online" ? "bg-primary" : a.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                            }`} />
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

function MiniStat({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub: string }) {
  return (
    <div className="pixel-border bg-card p-3 flex flex-col items-center gap-1">
      <span className="text-xl">{icon}</span>
      <span className="font-pixel text-lg text-primary">{value}</span>
      <span className="font-pixel text-[6px] text-muted-foreground">{label}</span>
      <span className="font-pixel text-[5px] text-muted-foreground/60">{sub}</span>
    </div>
  );
}

function StatusDot({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 ${color} rounded-sm`} />
      <span className="font-pixel text-[6px] text-foreground">{count}</span>
      <span className="font-pixel text-[5px] text-muted-foreground">{label}</span>
    </div>
  );
}

function TaskPill({ label, count, className }: { label: string; count: number; className: string }) {
  return (
    <div className={`px-2 py-0.5 pixel-border font-pixel text-[6px] flex items-center gap-1 ${className}`} style={{ borderWidth: 1 }}>
      <span className="text-[8px] font-bold">{count}</span> {label}
    </div>
  );
}

export default DepartmentStats;
