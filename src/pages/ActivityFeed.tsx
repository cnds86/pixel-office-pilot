import { useState, useEffect, useMemo } from "react";
import { Activity, Bot, CheckCircle, Shield, Rocket, Heart, Ticket, Settings, Filter, Radio } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityEvents, getAgentById, type ActivityEvent, type ActivityEventType } from "@/data/missionControlData";
import { agents } from "@/data/mockData";

const eventConfig: Record<ActivityEventType, { icon: typeof Activity; color: string; label: string }> = {
  task_update: { icon: CheckCircle, color: "text-blue-400", label: "Task" },
  agent_action: { icon: Bot, color: "text-emerald-400", label: "Agent" },
  approval: { icon: Shield, color: "text-amber-400", label: "Approval" },
  deployment: { icon: Rocket, color: "text-purple-400", label: "Deploy" },
  governance: { icon: Shield, color: "text-rose-400", label: "Governance" },
  heartbeat: { icon: Heart, color: "text-pink-400", label: "Heartbeat" },
  ticket: { icon: Ticket, color: "text-orange-400", label: "Ticket" },
  system: { icon: Settings, color: "text-muted-foreground", label: "System" },
};

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>(activityEvents);
  const [filterType, setFilterType] = useState<ActivityEventType | "all">("all");
  const [isLive, setIsLive] = useState(true);

  // Simulate live events
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const types: ActivityEventType[] = ["task_update", "agent_action", "heartbeat", "system"];
      const agentPool = agents.filter(a => a.role === "agent");
      const randomAgent = agentPool[Math.floor(Math.random() * agentPool.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const actions = ["updated", "completed", "started", "checked", "synced"];
      const targets = ["Build pipeline", "Test suite", "API endpoint", "Cache layer", "Worker pool"];

      const newEvent: ActivityEvent = {
        id: `ae-live-${Date.now()}`,
        type: randomType,
        actorId: randomAgent.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        detail: "Live system event",
        timestamp: new Date().toISOString(),
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const filtered = useMemo(() =>
    filterType === "all" ? events : events.filter(e => e.type === filterType),
    [events, filterType]
  );

  const stats = useMemo(() => ({
    total: events.length,
    agents: new Set(events.filter(e => e.actorId !== "system").map(e => e.actorId)).size,
    deployments: events.filter(e => e.type === "deployment").length,
    alerts: events.filter(e => e.type === "heartbeat" || e.type === "system").length,
  }), [events]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60000) return "just now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-pixel text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Activity Feed
            </h1>
            <p className="text-muted-foreground font-pixel-body text-sm mt-1">
              Real-time timeline of all system events
            </p>
          </div>
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="font-pixel text-xs gap-2"
          >
            <Radio className={`h-3 w-3 ${isLive ? "animate-pulse" : ""}`} />
            {isLive ? "LIVE" : "PAUSED"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Events", value: stats.total, icon: Activity },
            { label: "Active Agents", value: stats.agents, icon: Bot },
            { label: "Deployments", value: stats.deployments, icon: Rocket },
            { label: "Alerts", value: stats.alerts, icon: Heart },
          ].map(s => (
            <Card key={s.label} className="pixel-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xl font-pixel text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-pixel-body">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
            className="font-pixel text-[10px] h-7"
          >
            All
          </Button>
          {(Object.entries(eventConfig) as [ActivityEventType, typeof eventConfig[ActivityEventType]][]).map(([type, cfg]) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="font-pixel text-[10px] h-7 gap-1"
            >
              <cfg.icon className="h-3 w-3" />
              {cfg.label}
            </Button>
          ))}
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[60vh]">
          <div className="space-y-1">
            {filtered.map((event, i) => {
              const cfg = eventConfig[event.type];
              const Icon = cfg.icon;
              const actor = event.actorId === "system" ? null : getAgentById(event.actorId);

              return (
                <div key={event.id} className="flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-md bg-background border-2 border-border ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {i < filtered.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-pixel text-xs text-foreground">
                        {actor ? `${actor.avatar} ${actor.name}` : "⚙️ System"}
                      </span>
                      <span className="text-muted-foreground font-pixel-body text-xs">{event.action}</span>
                      <span className="font-pixel-body text-xs text-foreground font-medium truncate">{event.target}</span>
                      <Badge variant="outline" className={`text-[9px] font-pixel ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-pixel-body mt-0.5">{event.detail}</p>
                    <span className="text-[10px] text-muted-foreground/70 font-pixel">{formatTime(event.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
