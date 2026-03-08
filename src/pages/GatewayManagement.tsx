import { useState, useMemo } from "react";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Plus, Trash2, ExternalLink, Server, Clock, Zap } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gateways as initialGateways, type Gateway, type GatewayStatus } from "@/data/missionControlData";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<GatewayStatus, { icon: typeof Wifi; color: string; label: string; bg: string }> = {
  connected: { icon: Wifi, color: "text-emerald-400", label: "Connected", bg: "bg-emerald-500/20" },
  disconnected: { icon: WifiOff, color: "text-muted-foreground", label: "Disconnected", bg: "bg-muted/50" },
  error: { icon: AlertTriangle, color: "text-red-400", label: "Error", bg: "bg-red-500/20" },
  syncing: { icon: RefreshCw, color: "text-amber-400", label: "Syncing", bg: "bg-amber-500/20" },
};

export default function GatewayManagement() {
  const [gatewayList, setGatewayList] = useState<Gateway[]>(initialGateways);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formWorkspace, setFormWorkspace] = useState("");
  const { toast } = useToast();

  const stats = useMemo(() => ({
    total: gatewayList.length,
    connected: gatewayList.filter(g => g.status === "connected").length,
    agents: gatewayList.reduce((s, g) => s + g.agentCount, 0),
    avgLatency: Math.round(gatewayList.filter(g => g.status === "connected").reduce((s, g) => s + g.latencyMs, 0) / Math.max(1, gatewayList.filter(g => g.status === "connected").length)),
  }), [gatewayList]);

  const addGateway = () => {
    if (!formName || !formUrl) return;
    const newGw: Gateway = {
      id: `gw-${Date.now()}`,
      name: formName,
      url: formUrl,
      status: "disconnected",
      workspaceRoot: formWorkspace || "/workspace",
      token: `gw_tok_${Date.now().toString(36)}_***`,
      agentCount: 0,
      boardCount: 0,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      latencyMs: 0,
      version: "1.4.2",
    };
    setGatewayList(prev => [...prev, newGw]);
    setFormOpen(false);
    setFormName("");
    setFormUrl("");
    setFormWorkspace("");
    toast({ title: "Gateway added", description: `${formName} has been registered` });
  };

  const deleteGateway = (id: string) => {
    setGatewayList(prev => prev.filter(g => g.id !== id));
    setSelectedGateway(null);
    toast({ title: "Gateway removed" });
  };

  const reconnect = (gw: Gateway) => {
    setGatewayList(prev => prev.map(g =>
      g.id === gw.id ? { ...g, status: "syncing" as GatewayStatus } : g
    ));
    setTimeout(() => {
      setGatewayList(prev => prev.map(g =>
        g.id === gw.id ? { ...g, status: "connected" as GatewayStatus, lastSeen: new Date().toISOString(), latencyMs: Math.floor(Math.random() * 100 + 20) } : g
      ));
      toast({ title: "Reconnected", description: `${gw.name} is back online` });
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-pixel text-foreground flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              Gateway Management
            </h1>
            <p className="text-muted-foreground font-pixel-body text-sm mt-1">
              Manage remote execution environments
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="font-pixel text-xs gap-2">
            <Plus className="h-4 w-4" /> Add Gateway
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Server },
            { label: "Connected", value: stats.connected, icon: Wifi },
            { label: "Total Agents", value: stats.agents, icon: Zap },
            { label: "Avg Latency", value: `${stats.avgLatency}ms`, icon: Clock },
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

        {/* Gateway List */}
        <ScrollArea className="h-[55vh]">
          <div className="grid gap-3">
            {gatewayList.map(gw => {
              const cfg = statusConfig[gw.status];
              const Icon = cfg.icon;
              return (
                <Card
                  key={gw.id}
                  className={`pixel-border cursor-pointer hover:border-primary/50 transition-colors ${cfg.bg}`}
                  onClick={() => setSelectedGateway(gw)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border-2 border-border ${cfg.color}`}>
                          <Icon className={`h-5 w-5 ${gw.status === "syncing" ? "animate-spin" : ""}`} />
                        </div>
                        <div>
                          <div className="font-pixel text-sm text-foreground">{gw.name}</div>
                          <div className="text-xs text-muted-foreground font-pixel-body flex items-center gap-2">
                            <span>{gw.url}</span>
                            <Badge variant="outline" className={`text-[9px] font-pixel ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-pixel-body">
                        <span>{gw.agentCount} agents</span>
                        <span>{gw.boardCount} boards</span>
                        <span>{gw.latencyMs}ms</span>
                        <span>v{gw.version}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Detail Dialog */}
        <Dialog open={!!selectedGateway} onOpenChange={() => setSelectedGateway(null)}>
          <DialogContent className="max-w-lg">
            {selectedGateway && (() => {
              const cfg = statusConfig[selectedGateway.status];
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-pixel flex items-center gap-2">
                      <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                      {selectedGateway.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm font-pixel-body">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">URL:</span> <span className="text-foreground">{selectedGateway.url}</span></div>
                      <div><span className="text-muted-foreground">Status:</span> <Badge className={`${cfg.color} text-[10px] font-pixel`}>{cfg.label}</Badge></div>
                      <div><span className="text-muted-foreground">Workspace:</span> <span className="text-foreground">{selectedGateway.workspaceRoot}</span></div>
                      <div><span className="text-muted-foreground">Version:</span> <span className="text-foreground">v{selectedGateway.version}</span></div>
                      <div><span className="text-muted-foreground">Agents:</span> <span className="text-foreground">{selectedGateway.agentCount}</span></div>
                      <div><span className="text-muted-foreground">Boards:</span> <span className="text-foreground">{selectedGateway.boardCount}</span></div>
                      <div><span className="text-muted-foreground">Latency:</span> <span className="text-foreground">{selectedGateway.latencyMs}ms</span></div>
                      <div><span className="text-muted-foreground">Last Seen:</span> <span className="text-foreground">{new Date(selectedGateway.lastSeen).toLocaleString()}</span></div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" size="sm" className="font-pixel text-xs gap-1" onClick={() => reconnect(selectedGateway)}>
                      <RefreshCw className="h-3 w-3" /> Reconnect
                    </Button>
                    <Button variant="destructive" size="sm" className="font-pixel text-xs gap-1" onClick={() => deleteGateway(selectedGateway.id)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Add Gateway Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-pixel">Add Gateway</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-pixel text-xs">Name</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="My Gateway" />
              </div>
              <div>
                <Label className="font-pixel text-xs">URL</Label>
                <Input value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://gw.example.com" />
              </div>
              <div>
                <Label className="font-pixel text-xs">Workspace Root</Label>
                <Input value={formWorkspace} onChange={e => setFormWorkspace(e.target.value)} placeholder="/workspace" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addGateway} className="font-pixel text-xs">Create Gateway</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
