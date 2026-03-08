import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Pause, ArrowRight, Users, Layers } from "lucide-react";
import { workflowPacks, type WorkflowPack } from "@/data/clawEmpireData";
import { departmentInfo } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function WorkflowPacks() {
  const [packs, setPacks] = useState(workflowPacks);
  const [selectedPack, setSelectedPack] = useState<WorkflowPack | null>(null);
  const { toast } = useToast();

  const togglePack = (id: string) => {
    setPacks(prev => prev.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
    const pack = packs.find(p => p.id === id);
    toast({
      title: pack?.isActive ? "Workflow Deactivated" : "Workflow Activated",
      description: `${pack?.name} is now ${pack?.isActive ? "paused" : "running"}`,
    });
  };

  const activeCount = packs.filter(p => p.isActive).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-lg text-primary">🔄 Workflow Packs</h1>
            <p className="font-pixel-body text-lg text-muted-foreground">
              6 routing profiles for different task types
            </p>
          </div>
          <Badge variant="outline" className="font-pixel text-[9px]">
            {activeCount} active
          </Badge>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map(pack => {
            const dept = departmentInfo[pack.defaultDepartment];
            return (
              <Card
                key={pack.id}
                className={`pixel-border cursor-pointer transition-all hover:scale-[1.02] ${pack.isActive ? "pixel-border-glow" : "opacity-70"}`}
                onClick={() => setSelectedPack(pack)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pack.icon}</span>
                      <div>
                        <CardTitle className="font-pixel text-[10px]">{pack.name}</CardTitle>
                        <Badge variant="outline" className="font-pixel-body text-xs mt-1">
                          {dept.icon} {dept.label}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={pack.isActive}
                      onCheckedChange={(e) => {
                        e; // prevent card click
                        togglePack(pack.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="font-pixel-body text-sm text-muted-foreground">{pack.description}</p>

                  {/* Steps flow */}
                  <div className="bg-muted/30 border border-border p-2">
                    <p className="font-pixel-body text-xs text-primary">{pack.steps[0]}</p>
                  </div>

                  {/* Roles */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {pack.agentRoles.map(role => (
                      <Badge key={role} variant="secondary" className="font-pixel-body text-xs">{role}</Badge>
                    ))}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {pack.isActive ? (
                      <span className="flex items-center gap-1 font-pixel text-[8px] text-primary">
                        <Play className="h-3 w-3" /> ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-pixel text-[8px] text-muted-foreground">
                        <Pause className="h-3 w-3" /> PAUSED
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
          <DialogContent className="pixel-border bg-card max-w-lg">
            {selectedPack && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-pixel text-sm flex items-center gap-2">
                    <span className="text-2xl">{selectedPack.icon}</span>
                    {selectedPack.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="font-pixel-body text-base text-muted-foreground">{selectedPack.description}</p>

                  <div>
                    <p className="font-pixel text-[9px] text-muted-foreground mb-2">WORKFLOW STEPS</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedPack.steps[0].split(" → ").map((step, i, arr) => (
                        <span key={i} className="flex items-center gap-1">
                          <Badge className="bg-primary/20 text-primary font-pixel-body text-sm">{step}</Badge>
                          {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-pixel text-[9px] text-muted-foreground mb-2">AGENT ROLES</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPack.agentRoles.map(role => (
                        <Badge key={role} variant="outline" className="font-pixel-body text-sm">{role}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-pixel text-[9px] text-muted-foreground mb-2">DEFAULT DEPARTMENT</p>
                    <Badge variant="secondary" className="font-pixel-body text-sm">
                      {departmentInfo[selectedPack.defaultDepartment].icon} {departmentInfo[selectedPack.defaultDepartment].label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-pixel text-[9px] text-muted-foreground">
                      Type: {selectedPack.type.toUpperCase()}
                    </span>
                    <Button
                      variant={selectedPack.isActive ? "destructive" : "default"}
                      className="font-pixel text-[9px]"
                      onClick={() => {
                        togglePack(selectedPack.id);
                        setSelectedPack({ ...selectedPack, isActive: !selectedPack.isActive });
                      }}
                    >
                      {selectedPack.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
