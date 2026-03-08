import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Clock, Star, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { taskReports, type TaskReport } from "@/data/clawEmpireData";
import { tasks, getAgentById } from "@/data/mockData";

const reportStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: "Pending", color: "bg-accent/20 text-accent", icon: Clock },
  submitted: { label: "Submitted", color: "bg-primary/20 text-primary", icon: FileText },
  reviewed: { label: "Reviewed", color: "bg-primary text-primary-foreground", icon: CheckCircle },
};

export default function TaskReports() {
  const [reports] = useState(taskReports);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<TaskReport | null>(null);

  const filtered = useMemo(() =>
    filterStatus === "all" ? reports : reports.filter(r => r.status === filterStatus),
    [reports, filterStatus]
  );

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    submitted: reports.filter(r => r.status === "submitted").length,
    reviewed: reports.filter(r => r.status === "reviewed").length,
    totalXP: reports.reduce((s, r) => s + r.xpEarned, 0),
  }), [reports]);

  const getTask = (id: string) => tasks.find(t => t.id === id);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-pixel text-lg text-primary">📄 Task Reports</h1>
          <p className="font-pixel-body text-lg text-muted-foreground">
            Completion reports • History • Team performance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <FileText className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{stats.total}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Total Reports</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="font-pixel text-lg text-accent">{stats.pending}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-pixel text-lg text-primary">{stats.reviewed}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Reviewed</p>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="font-pixel text-lg text-accent">{stats.totalXP}</p>
              <p className="font-pixel-body text-sm text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "submitted", "reviewed"].map(s => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "outline"}
              className="font-pixel text-[9px]"
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : reportStatusConfig[s].label}
            </Button>
          ))}
        </div>

        {/* Reports list */}
        <ScrollArea className="h-[55vh]">
          <div className="space-y-3">
            {filtered.map(report => {
              const agent = getAgentById(report.agentId);
              const task = getTask(report.taskId);
              const cfg = reportStatusConfig[report.status];
              const StatusIcon = cfg.icon;

              return (
                <Card key={report.id} className="pixel-border hover:pixel-border-glow transition-all cursor-pointer" onClick={() => setSelectedReport(report)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-2xl mt-1">{agent?.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-pixel text-[10px] truncate">{task?.title || report.taskId}</p>
                            <Badge className={`${cfg.color} font-pixel text-[7px]`}>
                              <StatusIcon className="h-3 w-3 mr-1" />{cfg.label}
                            </Badge>
                          </div>
                          <p className="font-pixel-body text-sm text-muted-foreground truncate">{report.summary}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="font-pixel-body text-xs text-muted-foreground">{agent?.name}</span>
                            <span className="font-pixel-body text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {report.timeSpent}
                            </span>
                            <span className="font-pixel-body text-xs text-accent flex items-center gap-1">
                              <Star className="h-3 w-3" /> +{report.xpEarned} XP
                            </span>
                            <span className="font-pixel-body text-xs text-muted-foreground">{report.completedAt}</span>
                          </div>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Detail dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="pixel-border bg-card max-w-lg">
            {selectedReport && (() => {
              const agent = getAgentById(selectedReport.agentId);
              const task = getTask(selectedReport.taskId);
              const cfg = reportStatusConfig[selectedReport.status];
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-pixel text-sm flex items-center gap-2">
                      <span className="text-xl">{agent?.avatar}</span>
                      Report: {task?.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`${cfg.color} font-pixel text-[8px]`}>{cfg.label}</Badge>
                      <Badge variant="outline" className="font-pixel-body text-xs">{selectedReport.completedAt}</Badge>
                      <Badge variant="outline" className="font-pixel-body text-xs">
                        <Clock className="h-3 w-3 mr-1" /> {selectedReport.timeSpent}
                      </Badge>
                      <Badge className="bg-accent/20 text-accent font-pixel-body text-xs">
                        <Star className="h-3 w-3 mr-1" /> +{selectedReport.xpEarned} XP
                      </Badge>
                    </div>

                    <div>
                      <p className="font-pixel text-[9px] text-muted-foreground mb-1">SUMMARY</p>
                      <p className="font-pixel-body text-base">{selectedReport.summary}</p>
                    </div>

                    {selectedReport.blockers && (
                      <div>
                        <p className="font-pixel text-[9px] text-destructive mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> BLOCKERS
                        </p>
                        <p className="font-pixel-body text-sm text-destructive/80">{selectedReport.blockers}</p>
                      </div>
                    )}

                    {selectedReport.nextSteps && (
                      <div>
                        <p className="font-pixel text-[9px] text-primary mb-1">NEXT STEPS</p>
                        <p className="font-pixel-body text-sm">{selectedReport.nextSteps}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <p className="font-pixel-body text-sm text-muted-foreground">
                        Agent: {agent?.name} • {agent?.specialty} • {agent?.department}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
