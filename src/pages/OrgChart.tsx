import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { orgChart, getOrgNode, getSubordinates, type OrgNode } from "@/data/paperclipData";
import { useAgents } from "@/contexts/AgentContext";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { ChevronDown, ChevronRight, User, Users, Network, Shield } from "lucide-react";

const levelColors = [
  "bg-primary/20 border-primary text-primary",
  "bg-secondary/20 border-secondary text-secondary",
  "bg-accent/20 border-accent text-accent-foreground",
  "bg-muted border-border text-foreground",
];

const roleIcon: Record<string, string> = {
  lead: "👑", dev: "💻", agent: "🤖",
};

function OrgNodeCard({
  node,
  onSelect,
  expanded,
  onToggle,
}: {
  node: OrgNode;
  onSelect: (id: string) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { getAgentById } = useAgents();
  const agent = getAgentById(node.agentId);
  if (!agent) return null;

  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.agentId);
  const colorClass = levelColors[Math.min(node.level, levelColors.length - 1)];

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        className={`relative border-2 px-4 py-3 cursor-pointer transition-all hover:scale-105 ${colorClass} min-w-[160px]`}
        onClick={() => onSelect(node.agentId)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{agent.avatar}</span>
          <div className="text-left">
            <p className="font-pixel text-[10px] leading-tight">{agent.name}</p>
            <p className="font-pixel-body text-xs text-muted-foreground">{node.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs">{roleIcon[agent.role] || "👤"}</span>
          <span className={`inline-block w-2 h-2 rounded-full ${
            agent.status === "online" ? "bg-primary" : agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
          }`} />
          <span className="font-pixel text-[8px] text-muted-foreground">{agent.status}</span>
        </div>
        {hasChildren && (
          <button
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full p-0.5 hover:bg-muted z-10"
            onClick={(e) => { e.stopPropagation(); onToggle(node.agentId); }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-6 relative">
          {/* Vertical connector */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
          {/* Horizontal connector */}
          {node.children.length > 1 && (
            <div className="absolute top-4 left-0 right-0 h-px bg-border mx-8" />
          )}
          <div className="flex gap-4 pt-4 items-start justify-center flex-wrap">
            {node.children.map(childId => {
              const childNode = getOrgNode(childId);
              if (!childNode) return null;
              return (
                <div key={childId} className="relative flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <OrgNodeCard node={childNode} onSelect={onSelect} expanded={expanded} onToggle={onToggle} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const { getAgentById } = useAgents();
  const { xpData, workflowRuns } = useWorkflow();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["h1", "a8", "a1", "a17", "h15"]));
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const rootNodes = useMemo(() => orgChart.filter(n => n.reportsTo === null), []);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(orgChart.map(n => n.agentId)));
  const collapseAll = () => setExpanded(new Set());

  const selectAgent = (id: string) => {
    setSelectedAgentId(id);
    setDetailOpen(true);
  };

  const selectedAgent = selectedAgentId ? getAgentById(selectedAgentId) : null;
  const selectedNode = selectedAgentId ? getOrgNode(selectedAgentId) : null;
  const subordinates = selectedAgentId ? getSubordinates(selectedAgentId) : [];
  const supervisor = selectedNode?.reportsTo ? getAgentById(selectedNode.reportsTo) : null;

  const stats = useMemo(() => ({
    total: orgChart.length,
    agents: orgChart.filter(n => getAgentById(n.agentId)?.role === "agent").length,
    humans: orgChart.filter(n => getAgentById(n.agentId)?.role !== "agent").length,
    levels: Math.max(...orgChart.map(n => n.level)) + 1,
  }), []);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-pixel text-xl text-primary flex items-center gap-2">
              <Network className="h-5 w-5" /> Org Chart
            </h1>
            <p className="font-pixel-body text-sm text-muted-foreground">
              โครงสร้างองค์กร — hierarchies, roles & reporting lines
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="font-pixel text-[10px]">
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="font-pixel text-[10px]">
              Collapse
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: stats.total, icon: Users },
            { label: "AI Agents", value: stats.agents, icon: Shield },
            { label: "Humans", value: stats.humans, icon: User },
            { label: "Levels", value: stats.levels, icon: Network },
          ].map(s => (
            <Card key={s.label} className="border-2 border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-pixel text-lg text-primary">{s.value}</p>
                  <p className="font-pixel text-[8px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Org Tree */}
        <Card className="border-2 border-border overflow-x-auto">
          <CardContent className="p-6 min-w-[600px]">
            <div className="flex justify-center">
              {rootNodes.map(node => (
                <OrgNodeCard key={node.agentId} node={node} onSelect={selectAgent} expanded={expanded} onToggle={toggleExpand} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="border-2 border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-2">
                {selectedAgent?.avatar} {selectedAgent?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedAgent && selectedNode && (
              <div className="space-y-4 font-pixel-body text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs">Title</p>
                    <p>{selectedNode.title}</p>
                  </div>
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs">Department</p>
                    <p className="capitalize">{selectedAgent.department}</p>
                  </div>
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs">Role</p>
                    <p>{roleIcon[selectedAgent.role]} {selectedAgent.role}</p>
                  </div>
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="flex items-center gap-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        selectedAgent.status === "online" ? "bg-primary" : selectedAgent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                      }`} />
                      {selectedAgent.status}
                    </p>
                  </div>
                </div>

                {supervisor && (
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs mb-1">Reports To</p>
                    <p className="flex items-center gap-2">
                      <span>{supervisor.avatar}</span> {supervisor.name}
                    </p>
                  </div>
                )}

                {subordinates.length > 0 && (
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs mb-2">Direct Reports ({subordinates.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {subordinates.map(sub => {
                        const a = getAgentById(sub.agentId);
                        return a ? (
                          <Badge key={sub.agentId} variant="outline" className="font-pixel text-[8px] cursor-pointer hover:bg-primary/10"
                            onClick={() => selectAgent(sub.agentId)}>
                            {a.avatar} {a.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <p className="text-muted-foreground text-xs">Specialty: {selectedAgent.specialty}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
