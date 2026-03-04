import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { agents, tasks, departmentInfo, activityLogs, getAgentById } from "@/data/mockData";
import type { Department } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line,
} from "recharts";

const departments = Object.keys(departmentInfo) as Department[];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8AM-7PM

// Generate fake heatmap data
function generateHeatmapData() {
  return departments.map(dept => ({
    dept,
    hours: hours.map(h => ({
      hour: h,
      activity: Math.floor(Math.random() * 100),
    })),
  }));
}

// Fake time-series productivity data
function generateTimeSeriesData() {
  const data = [];
  for (let i = 0; i < 14; i++) {
    const day = `Day ${i + 1}`;
    const entry: Record<string, string | number> = { day };
    departments.forEach(dept => {
      entry[dept] = 30 + Math.floor(Math.random() * 60);
    });
    data.push(entry);
  }
  return data;
}

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

// Heatmap cell color based on value
function heatColor(value: number): string {
  if (value > 80) return "hsl(var(--primary) / 0.8)";
  if (value > 60) return "hsl(var(--primary) / 0.5)";
  if (value > 40) return "hsl(var(--accent) / 0.5)";
  if (value > 20) return "hsl(var(--accent) / 0.3)";
  return "hsl(var(--muted))";
}

const AnalyticsDashboard = () => {
  const [liveAgents, setLiveAgents] = useState(agents.filter(a => a.status !== "offline").length);
  const [heatmap] = useState(generateHeatmapData);
  const [timeSeries] = useState(generateTimeSeriesData);
  const [pulse, setPulse] = useState(0);

  // Simulate live pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p + 1);
      setLiveAgents(agents.filter(a => a.status !== "offline").length + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const completionRate = Math.round((doneTasks / totalTasks) * 100);

  // Productivity by department for bar chart
  const deptProductivity = departments.map(dept => {
    const deptAgents = agents.filter(a => a.department === dept);
    const agentIds = new Set(deptAgents.map(a => a.id));
    const deptTasks = tasks.filter(t => agentIds.has(t.assigneeId));
    const done = deptTasks.filter(t => t.status === "done").length;
    const total = deptTasks.length;
    return {
      name: departmentInfo[dept].icon,
      fullName: departmentInfo[dept].label,
      productivity: total > 0 ? Math.round((done / total) * 100) : 0,
      color: departmentInfo[dept].color,
    };
  });

  // Task velocity (fake streaming data)
  const velocityData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      tick: i,
      velocity: 5 + Math.floor(Math.random() * 15) + (pulse % 3),
      bugs: Math.floor(Math.random() * 5),
    }));
  }, [pulse]);

  const chartTooltipStyle = {
    background: 'hsl(var(--card))',
    border: '2px solid hsl(var(--border))',
    fontFamily: '"Press Start 2P"',
    fontSize: 7,
    color: 'hsl(var(--foreground))',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-sm md:text-base text-primary">ANALYTICS DASHBOARD</h1>
            <p className="font-pixel-body text-lg text-muted-foreground mt-1">Real-time performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary animate-pixel-pulse" />
            <span className="font-pixel text-[7px] text-primary">LIVE</span>
          </div>
        </div>

        {/* Animated KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard icon="📊" label="COMPLETION RATE" suffix="%">
            <AnimatedCounter target={completionRate} />
          </KPICard>
          <KPICard icon="⚡" label="ACTIVE AGENTS">
            <AnimatedCounter target={liveAgents} duration={800} />
          </KPICard>
          <KPICard icon="🔥" label="TASKS IN FLIGHT">
            <AnimatedCounter target={inProgress} duration={600} />
          </KPICard>
          <KPICard icon="✅" label="TASKS DONE">
            <AnimatedCounter target={doneTasks} duration={1000} />
          </KPICard>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Productivity Trend (Area) */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-[8px] text-primary">📈 PRODUCTIVITY TREND (14 DAYS)</h2>
              <span className="font-pixel text-[6px] text-muted-foreground animate-pixel-pulse">UPDATING...</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timeSeries}>
                <defs>
                  {departments.map(dept => (
                    <linearGradient key={dept} id={`grad-${dept}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={departmentInfo[dept].color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={departmentInfo[dept].color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 7, fontFamily: '"Press Start 2P"', fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip contentStyle={chartTooltipStyle} />
                {departments.slice(0, 3).map(dept => (
                  <Area
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    stroke={departmentInfo[dept].color}
                    fill={`url(#grad-${dept})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Velocity (Live Line) */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-[8px] text-primary">⚡ TASK VELOCITY (LIVE)</h2>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pixel-pulse" />
                <span className="font-pixel text-[6px] text-primary">STREAMING</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={velocityData}>
                <XAxis dataKey="tick" tick={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="velocity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bugs" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center">
              <LegendDot color="bg-primary" label="Velocity" />
              <LegendDot color="bg-destructive" label="Bugs" />
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="pixel-border bg-card p-4 space-y-3">
          <h2 className="font-pixel text-[8px] text-primary">🗺️ AGENT ACTIVITY HEATMAP</h2>
          <p className="font-pixel text-[6px] text-muted-foreground">Activity intensity by department & hour</p>
          
          {/* Hour labels */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-center gap-0.5 ml-[80px] mb-1">
                {hours.map(h => (
                  <div key={h} className="flex-1 text-center font-pixel text-[5px] text-muted-foreground">
                    {h}:00
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {heatmap.map(row => {
                const info = departmentInfo[row.dept];
                return (
                  <div key={row.dept} className="flex items-center gap-0.5 mb-0.5">
                    <div className="w-[80px] flex items-center gap-1 pr-2">
                      <span className="text-xs">{info.icon}</span>
                      <span className="font-pixel text-[5px] truncate" style={{ color: info.color }}>
                        {info.label.toUpperCase()}
                      </span>
                    </div>
                    {row.hours.map(cell => (
                      <div
                        key={cell.hour}
                        className="flex-1 h-6 pixel-border relative group cursor-pointer transition-transform hover:scale-110"
                        style={{
                          backgroundColor: heatColor(cell.activity),
                          borderWidth: 1,
                        }}
                      >
                        <span className="font-pixel text-[4px] absolute inset-0 flex items-center justify-center text-foreground/60">
                          {cell.activity}
                        </span>
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 bg-card pixel-border px-1.5 py-0.5 whitespace-nowrap"
                          style={{ borderWidth: 1 }}>
                          <span className="font-pixel text-[5px] text-foreground">{info.label} @ {cell.hour}:00 — {cell.activity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Heatmap Legend */}
              <div className="flex items-center gap-2 mt-2 ml-[80px]">
                <span className="font-pixel text-[5px] text-muted-foreground">LOW</span>
                {[20, 40, 60, 80, 100].map(v => (
                  <div key={v} className="w-4 h-3" style={{ backgroundColor: heatColor(v) }} />
                ))}
                <span className="font-pixel text-[5px] text-muted-foreground">HIGH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Department Productivity Bar */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <h2 className="font-pixel text-[8px] text-primary">🏢 DEPT PRODUCTIVITY</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={deptProductivity} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={30} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value: number, _name: string, props: any) => [`${value}%`, props.payload.fullName]}
                />
                <Bar dataKey="productivity" radius={[0, 3, 3, 0]}>
                  {deptProductivity.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Live Activity Feed */}
          <div className="pixel-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-[8px] text-primary">📡 LIVE ACTIVITY</h2>
              <span className="font-pixel text-[6px] text-muted-foreground">{activityLogs.length} events</span>
            </div>
            <ScrollArea className="h-[160px]">
              <div className="space-y-1.5 font-pixel-body">
                {activityLogs.map((log, i) => {
                  const agent = getAgentById(log.agentId);
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 p-1.5 bg-muted/30 pixel-border transition-all hover:bg-muted/50"
                      style={{ borderWidth: 1, animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-sm">{agent?.avatar || "📌"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-primary text-xs font-bold">{agent?.name}</span>
                        <p className="text-foreground text-xs truncate">{log.action}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Agent Status Grid */}
        <div className="pixel-border bg-card p-4 space-y-3">
          <h2 className="font-pixel text-[8px] text-primary">👥 AGENT STATUS GRID</h2>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-1.5">
            {agents.map(agent => {
              const isOnline = agent.status === "online";
              const isBusy = agent.status === "busy";
              return (
                <div
                  key={agent.id}
                  className="pixel-border p-1 flex flex-col items-center gap-0.5 cursor-pointer hover:bg-muted/50 transition-colors group relative"
                  style={{ borderWidth: 1 }}
                >
                  <span className={`text-lg ${agent.status === "offline" ? "grayscale opacity-30" : ""} group-hover:scale-110 transition-transform`}>
                    {agent.avatar}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-primary animate-pixel-pulse" : isBusy ? "bg-accent" : "bg-muted-foreground"}`} />
                  <span className="font-pixel text-[3px] text-muted-foreground truncate w-full text-center">{agent.name.split(/[-\s]/)[0]}</span>
                  {/* Hover card */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 bg-card pixel-border px-2 py-1 whitespace-nowrap"
                    style={{ borderWidth: 1 }}>
                    <span className="font-pixel text-[5px] text-foreground">{agent.name} — {agent.specialty}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function KPICard({ icon, label, children, suffix }: {
  icon: string; label: string; children: React.ReactNode; suffix?: string;
}) {
  return (
    <div className="pixel-border bg-card p-4 flex flex-col items-center gap-2 hover:pixel-border-glow transition-all group">
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <div className="font-pixel text-lg md:text-xl text-primary">
        {children}{suffix}
      </div>
      <span className="font-pixel text-[6px] text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-sm ${color}`} />
      <span className="font-pixel text-[6px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default AnalyticsDashboard;
