import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { heartbeats, type Heartbeat, type HeartbeatStatus } from "@/data/paperclipData";
import { agents, getAgentById } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Clock, Activity, Wifi, WifiOff, AlertTriangle } from "lucide-react";

const statusConfig: Record<HeartbeatStatus, { label: string; color: string; icon: typeof Heart; bgClass: string }> = {
  alive: { label: "ALIVE", color: "text-green-400", icon: Wifi, bgClass: "bg-green-500/20" },
  warning: { label: "WARNING", color: "text-yellow-400", icon: AlertTriangle, bgClass: "bg-yellow-500/20" },
  dead: { label: "DEAD", color: "text-red-400", icon: WifiOff, bgClass: "bg-red-500/20" },
};

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function formatTimeUntil(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "now";
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `in ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `in ${minutes}m`;
}

export default function HeartbeatMonitor() {
  const [beats, setBeats] = useState<Heartbeat[]>(heartbeats);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<HeartbeatStatus | "all">("all");

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      // Randomly update some heartbeats
      setBeats(prev => prev.map(b => {
        if (Math.random() > 0.9 && b.status === "alive") {
          return { ...b, lastBeat: new Date().toISOString(), responseTimeMs: Math.floor(Math.random() * 200 + 50) };
        }
        return b;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "all" ? beats : beats.filter(b => b.status === filter);
  const aliveCount = beats.filter(b => b.status === "alive").length;
  const warningCount = beats.filter(b => b.status === "warning").length;
  const deadCount = beats.filter(b => b.status === "dead").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-sm md:text-base text-primary flex items-center gap-2">
            <Heart className="h-5 w-5 animate-pulse" />
            HEARTBEAT MONITOR
          </h1>
          <p className="font-pixel-body text-lg text-muted-foreground mt-1">
            Real-time agent health monitoring
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <Wifi className="h-6 w-6 text-green-400 mb-2" />
            <span className="font-pixel text-lg text-green-400">{aliveCount}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">ALIVE</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mb-2" />
            <span className="font-pixel text-lg text-yellow-400">{warningCount}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">WARNING</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <WifiOff className="h-6 w-6 text-red-400 mb-2" />
            <span className="font-pixel text-lg text-red-400">{deadCount}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">DEAD</span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "alive", "warning", "dead"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-pixel text-[8px] pixel-border transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Agent Grid */}
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(beat => {
              const agent = getAgentById(beat.agentId);
              if (!agent) return null;
              const config = statusConfig[beat.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={beat.agentId}
                  className={`pixel-border bg-card p-4 ${config.bgClass} transition-all hover:scale-[1.02]`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.avatar}</span>
                      <div>
                        <p className="font-pixel text-[9px] text-foreground">{agent.name}</p>
                        <p className="font-pixel-body text-xs text-muted-foreground">{agent.specialty}</p>
                      </div>
                    </div>
                    <Badge className={`${config.color} bg-transparent border-current font-pixel text-[7px]`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-pixel text-[7px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last Beat
                      </span>
                      <span className="font-pixel text-[8px] text-foreground">{formatTimeAgo(beat.lastBeat)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-pixel text-[7px] text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Next
                      </span>
                      <span className="font-pixel text-[8px] text-foreground">{formatTimeUntil(beat.nextScheduled)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-pixel text-[7px] text-muted-foreground">Response</span>
                      <span className="font-pixel text-[8px] text-foreground">{beat.responseTimeMs}ms</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-pixel text-[7px] text-muted-foreground">Uptime</span>
                        <span className="font-pixel text-[8px] text-foreground">{beat.uptimePercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={beat.uptimePercent} className="h-2" />
                    </div>

                    {/* Beat History */}
                    <div className="mt-3">
                      <span className="font-pixel text-[7px] text-muted-foreground">Last 10 beats:</span>
                      <div className="flex gap-1 mt-1">
                        {beat.beatHistory.map((h, i) => (
                          <div
                            key={i}
                            className={`w-2 h-4 ${h.ok ? "bg-green-500" : "bg-red-500"}`}
                            title={new Date(h.time).toLocaleTimeString()}
                          />
                        ))}
                      </div>
                    </div>
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
