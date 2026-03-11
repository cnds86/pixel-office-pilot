import { AppLayout } from "@/components/AppLayout";
import { tasks, milestones, activityLogs } from "@/data/mockData";
import type { AgentStatus } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentContext";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PixelOffice } from "@/components/PixelOffice";

const statusColor: Record<AgentStatus, string> = {
  online: "bg-primary",
  busy: "bg-accent",
  offline: "bg-muted-foreground",
};

const typeIcon: Record<string, string> = {
  commit: "📦",
  review: "👁️",
  deploy: "🚀",
  test: "🧪",
  fix: "🔧",
};

const Index = () => {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const onlineAgents = agents.filter(a => a.status === "online").length;
  const progressPercent = Math.round((doneTasks / totalTasks) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="font-pixel text-sm md:text-base text-primary">MISSION CONTROL</h1>
          <p className="font-pixel-body text-lg text-muted-foreground mt-1">OpenClaw Project Dashboard</p>
        </div>

        {/* Pixel Art Office Room */}
        <PixelOffice />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="TOTAL TASKS" value={totalTasks} icon="📋" />
          <StatCard label="COMPLETED" value={doneTasks} icon="✅" />
          <StatCard label="IN PROGRESS" value={inProgress} icon="⚡" />
          <StatCard label="AGENTS ONLINE" value={onlineAgents} icon="🤖" />
        </div>

        {/* Progress Bar */}
        <div className="pixel-border bg-card p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-pixel text-[8px] text-muted-foreground">PROJECT PROGRESS</span>
            <span className="font-pixel text-[10px] text-primary">{progressPercent}%</span>
          </div>
          <div className="h-4 bg-muted pixel-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="pixel-border bg-card p-4">
            <h2 className="font-pixel text-[10px] text-accent mb-4">📍 ROADMAP</h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {milestones.map((ms) => (
                  <div key={ms.id} className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 flex items-center justify-center text-sm z-10 ${
                      ms.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    } pixel-border`}>
                      {ms.completed ? "✓" : "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-pixel text-[8px] ${ms.completed ? "text-primary" : "text-foreground"}`}>
                        {ms.title}
                      </p>
                      <p className="font-pixel-body text-sm text-muted-foreground">{ms.description}</p>
                      <p className="font-pixel text-[7px] text-muted-foreground mt-1">{ms.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team & Agents */}
          <div className="pixel-border bg-card p-4">
            <h2 className="font-pixel text-[10px] text-accent mb-4">👥 TEAM & AGENTS</h2>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 p-2 bg-muted/50 pixel-border">
                    <span className="text-xl">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[8px] text-foreground truncate">{agent.name}</p>
                      <p className="font-pixel-body text-xs text-muted-foreground">{agent.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 ${statusColor[agent.status]} ${agent.status === "online" ? "animate-pixel-pulse" : ""}`} />
                      <span className="font-pixel text-[7px] text-muted-foreground uppercase">{agent.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="pixel-border bg-card p-4">
          <h2 className="font-pixel text-[10px] text-accent mb-4">📡 AGENT ACTIVITY FEED</h2>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 font-pixel-body">
              {activityLogs.map((log) => {
                const agent = getAgentById(log.agentId);
                return (
                  <div key={log.id} className="flex items-start gap-2 p-2 hover:bg-muted/30 transition-colors">
                    <span className="text-sm">{typeIcon[log.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-primary text-sm">[{agent?.name}]</span>
                      <span className="text-foreground text-sm ml-2">{log.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="pixel-border bg-card p-4 flex flex-col items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <span className="font-pixel text-lg md:text-xl text-primary">{value}</span>
      <span className="font-pixel text-[7px] text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default Index;
