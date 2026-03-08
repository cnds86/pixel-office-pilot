import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { proposals, type GovernanceProposal, type GovernanceStatus } from "@/data/paperclipData";
import { getAgentById } from "@/data/mockData";
import { Shield, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown, Gavel } from "lucide-react";

const actionConfig: Record<string, { label: string; icon: string; color: string }> = {
  hire: { label: "Hire Agent", icon: "➕", color: "text-primary" },
  fire: { label: "Terminate Agent", icon: "🔥", color: "text-destructive" },
  pause: { label: "Pause Agent", icon: "⏸", color: "text-accent" },
  resume: { label: "Resume Agent", icon: "▶️", color: "text-primary" },
  strategy: { label: "Strategy Change", icon: "🗺️", color: "text-secondary" },
  budget: { label: "Budget Change", icon: "💰", color: "text-accent" },
};

const statusConfig: Record<GovernanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "border-accent text-accent", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Approved", color: "border-primary text-primary", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: "Rejected", color: "border-destructive text-destructive", icon: <XCircle className="h-3 w-3" /> },
};

export default function Governance() {
  const [proposalList, setProposalList] = useState<GovernanceProposal[]>(proposals);
  const [selected, setSelected] = useState<GovernanceProposal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tab, setTab] = useState("pending");

  const filtered = useMemo(() => {
    if (tab === "all") return proposalList;
    return proposalList.filter(p => p.status === tab);
  }, [proposalList, tab]);

  const stats = useMemo(() => ({
    total: proposalList.length,
    pending: proposalList.filter(p => p.status === "pending").length,
    approved: proposalList.filter(p => p.status === "approved").length,
    rejected: proposalList.filter(p => p.status === "rejected").length,
  }), [proposalList]);

  const voteOnProposal = (id: string, decision: "approved" | "rejected") => {
    setProposalList(prev => prev.map(p =>
      p.id === id ? { ...p, status: decision, decidedAt: new Date().toISOString() } : p
    ));
    setDetailOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-xl text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" /> Governance Board
          </h1>
          <p className="font-pixel-body text-sm text-muted-foreground">
            คุณคือ Board — Approve hires, override strategy, pause/terminate agents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Proposals", value: stats.total, icon: Gavel, color: "text-foreground" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-accent" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-primary" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="border-2 border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className={`font-pixel text-lg ${s.color}`}>{s.value}</p>
                  <p className="font-pixel text-[8px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="font-pixel text-[10px]">
            <TabsTrigger value="pending">⏳ Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">✅ Approved</TabsTrigger>
            <TabsTrigger value="rejected">❌ Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Proposals */}
        <div className="grid gap-3">
          {filtered.map(p => {
            const target = getAgentById(p.targetAgentId);
            const proposer = getAgentById(p.proposedBy);
            const ac = actionConfig[p.action];
            const sc = statusConfig[p.status];

            return (
              <Card key={p.id} className={`border-2 cursor-pointer transition-all hover:scale-[1.005] ${
                p.status === "pending" ? "border-accent/40" : "border-border"
              }`} onClick={() => { setSelected(p); setDetailOpen(true); }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{ac.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-pixel text-[11px] ${ac.color}`}>{ac.label}</span>
                          <Badge variant="outline" className={`font-pixel text-[8px] ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </Badge>
                        </div>
                        <p className="font-pixel-body text-sm mt-1">{p.reason}</p>
                        <div className="flex items-center gap-3 mt-2 text-muted-foreground font-pixel text-[8px]">
                          <span>Target: {target?.avatar} {target?.name}</span>
                          <span>By: {proposer?.avatar} {proposer?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <ThumbsUp className="h-3 w-3 text-primary" />
                      <span className="font-pixel text-[9px] text-primary">{p.votes.filter(v => v.vote === "approve").length}</span>
                      <ThumbsDown className="h-3 w-3 text-destructive ml-1" />
                      <span className="font-pixel text-[9px] text-destructive">{p.votes.filter(v => v.vote === "reject").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground font-pixel text-xs py-12">No proposals</p>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="border-2 border-border max-w-md">
            {selected && (() => {
              const target = getAgentById(selected.targetAgentId);
              const proposer = getAgentById(selected.proposedBy);
              const ac = actionConfig[selected.action];
              const sc = statusConfig[selected.status];

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-2">
                      {ac.icon} {ac.label}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 font-pixel-body text-sm">
                    <Badge variant="outline" className={`font-pixel text-[9px] ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </Badge>

                    <p className="bg-muted p-3 border border-border">{selected.reason}</p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted p-3 border border-border">
                        <p className="text-muted-foreground text-xs">Target Agent</p>
                        <p>{target?.avatar} {target?.name}</p>
                        <p className="text-xs text-muted-foreground">{target?.specialty}</p>
                      </div>
                      <div className="bg-muted p-3 border border-border">
                        <p className="text-muted-foreground text-xs">Proposed By</p>
                        <p>{proposer?.avatar} {proposer?.name}</p>
                      </div>
                    </div>

                    {/* Votes */}
                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Votes ({selected.votes.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.votes.map((v, i) => {
                          const voter = getAgentById(v.agentId);
                          return (
                            <Badge key={i} variant="outline" className={`font-pixel text-[8px] ${
                              v.vote === "approve" ? "border-primary text-primary" : "border-destructive text-destructive"
                            }`}>
                              {voter?.avatar} {voter?.name} — {v.vote === "approve" ? "✓" : "✗"}
                            </Badge>
                          );
                        })}
                        {selected.votes.length === 0 && <p className="text-muted-foreground text-xs">No votes yet</p>}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-xs">
                      Created: {new Date(selected.createdAt).toLocaleDateString()}
                      {selected.decidedAt && ` · Decided: ${new Date(selected.decidedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  {selected.status === "pending" && (
                    <DialogFooter className="gap-2">
                      <Button variant="outline" size="sm" className="font-pixel text-[10px] border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => voteOnProposal(selected.id, "rejected")}>
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                      <Button size="sm" className="font-pixel text-[10px]"
                        onClick={() => voteOnProposal(selected.id, "approved")}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                    </DialogFooter>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
