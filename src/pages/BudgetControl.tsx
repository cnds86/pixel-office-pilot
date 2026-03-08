import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { budgets, type BudgetEntry } from "@/data/paperclipData";
import { getAgentById } from "@/data/mockData";
import { DollarSign, AlertTriangle, TrendingUp, Pause, Play, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function BudgetControl() {
  const [budgetList, setBudgetList] = useState<BudgetEntry[]>(budgets);
  const [selectedBudget, setSelectedBudget] = useState<BudgetEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "over" | "paused">("all");

  const togglePause = (agentId: string) => {
    setBudgetList(prev => prev.map(b =>
      b.agentId === agentId ? { ...b, paused: !b.paused } : b
    ));
  };

  const filtered = useMemo(() => {
    if (filter === "over") return budgetList.filter(b => b.spent > b.monthlyBudget);
    if (filter === "paused") return budgetList.filter(b => b.paused);
    return budgetList;
  }, [budgetList, filter]);

  const stats = useMemo(() => ({
    totalBudget: budgetList.reduce((s, b) => s + b.monthlyBudget, 0),
    totalSpent: budgetList.reduce((s, b) => s + b.spent, 0),
    overBudget: budgetList.filter(b => b.spent > b.monthlyBudget).length,
    paused: budgetList.filter(b => b.paused).length,
  }), [budgetList]);

  const chartData = filtered.map(b => {
    const agent = getAgentById(b.agentId);
    return {
      name: agent?.name?.slice(0, 8) || b.agentId,
      budget: b.monthlyBudget,
      spent: b.spent,
      over: b.spent > b.monthlyBudget,
    };
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-xl text-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Budget & Cost Control
          </h1>
          <p className="font-pixel-body text-sm text-muted-foreground">
            งบประมาณรายเดือนต่อ Agent — ควบคุมต้นทุน ไม่มี runaway costs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Budget", value: `$${stats.totalBudget}`, icon: DollarSign, color: "text-primary" },
            { label: "Total Spent", value: `$${stats.totalSpent}`, icon: TrendingUp, color: stats.totalSpent > stats.totalBudget ? "text-destructive" : "text-primary" },
            { label: "Over Budget", value: stats.overBudget, icon: AlertTriangle, color: "text-destructive" },
            { label: "Paused", value: stats.paused, icon: Pause, color: "text-accent" },
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

        {/* Filter */}
        <div className="flex gap-2">
          {(["all", "over", "paused"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
              onClick={() => setFilter(f)} className="font-pixel text-[10px] capitalize">
              {f === "over" ? "⚠️ Over Budget" : f === "paused" ? "⏸ Paused" : "All"}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card className="border-2 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-pixel text-xs text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Budget vs Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={2}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: "monospace" }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "2px solid hsl(var(--border))", fontFamily: "monospace", fontSize: 11 }}
                  />
                  <Bar dataKey="budget" fill="hsl(var(--muted-foreground))" opacity={0.3} />
                  <Bar dataKey="spent">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.over ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Budget List */}
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(b => {
            const agent = getAgentById(b.agentId);
            if (!agent) return null;
            const pct = Math.min((b.spent / b.monthlyBudget) * 100, 100);
            const over = b.spent > b.monthlyBudget;

            return (
              <Card key={b.agentId} className={`border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                b.paused ? "border-accent/50 opacity-70" : over ? "border-destructive/50" : "border-border"
              }`} onClick={() => { setSelectedBudget(b); setDetailOpen(true); }}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agent.avatar}</span>
                      <div>
                        <p className="font-pixel text-[10px]">{agent.name}</p>
                        <p className="font-pixel-body text-xs text-muted-foreground">{agent.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.paused && <Badge variant="outline" className="font-pixel text-[8px] text-accent border-accent">⏸ PAUSED</Badge>}
                      {over && !b.paused && <Badge variant="destructive" className="font-pixel text-[8px]">OVER</Badge>}
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); togglePause(b.agentId); }}>
                        {b.paused ? <Play className="h-3 w-3 text-primary" /> : <Pause className="h-3 w-3 text-accent" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-pixel text-[9px] mb-1">
                      <span>${b.spent} / ${b.monthlyBudget}</span>
                      <span className={over ? "text-destructive" : "text-primary"}>{Math.round((b.spent / b.monthlyBudget) * 100)}%</span>
                    </div>
                    <Progress value={pct} className={`h-2 ${over ? "[&>div]:bg-destructive" : ""}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="border-2 border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-primary">
                {selectedBudget && getAgentById(selectedBudget.agentId)?.avatar}{" "}
                {selectedBudget && getAgentById(selectedBudget.agentId)?.name} — Budget
              </DialogTitle>
            </DialogHeader>
            {selectedBudget && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 font-pixel-body text-sm">
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs">Monthly Budget</p>
                    <p className="text-primary font-pixel">${selectedBudget.monthlyBudget}</p>
                  </div>
                  <div className="bg-muted p-3 border border-border">
                    <p className="text-muted-foreground text-xs">Spent</p>
                    <p className={`font-pixel ${selectedBudget.spent > selectedBudget.monthlyBudget ? "text-destructive" : "text-primary"}`}>
                      ${selectedBudget.spent}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-pixel text-[9px] text-muted-foreground mb-2">Spending History</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedBudget.history}>
                        <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                        <Bar dataKey="spent" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
