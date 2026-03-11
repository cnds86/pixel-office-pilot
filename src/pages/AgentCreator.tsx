import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { departmentInfo } from "@/data/mockData";
import type { Department, MemberRole, AgentStatus } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentContext";
import { Bot, Plus, Trash2, Pencil, Zap, Shield, User, Cpu } from "lucide-react";

const avatarOptions = ["🤖", "🧠", "💾", "🔀", "⚙️", "🧪", "🚀", "📝", "🎨", "📐", "🐛", "💪", "☁️", "📡", "🗺️", "🤝", "🎫", "⚡", "🔮", "🦾", "🛸", "🌐", "🔥", "💎"];

// IDs of the original mock agents (not created by user)
const INITIAL_AGENT_IDS = new Set([
  "a1","a2","a3","a4","a5","a6","a7","a8","a10","a11","a12","a13","a14","a15","a16","a17","a18",
  "h1","h2","h3","h9","h10","h11","h12","h13","h14","h15","h16","h17","h18",
]);

const roleConfig: Record<MemberRole, { label: string; icon: React.ReactNode; color: string }> = {
  agent: { label: "AI Agent", icon: <Cpu className="h-3.5 w-3.5" />, color: "bg-primary/20 text-primary border-primary/30" },
  dev: { label: "Developer", icon: <User className="h-3.5 w-3.5" />, color: "bg-accent/20 text-accent-foreground border-accent/30" },
  lead: { label: "Team Lead", icon: <Shield className="h-3.5 w-3.5" />, color: "bg-destructive/20 text-destructive border-destructive/30" },
};

const statusConfig: Record<AgentStatus, { label: string; color: string }> = {
  online: { label: "Online", color: "bg-primary" },
  busy: { label: "Busy", color: "bg-accent" },
  offline: { label: "Offline", color: "bg-muted-foreground" },
};

interface NewAgentForm {
  name: string;
  role: MemberRole;
  avatar: string;
  status: AgentStatus;
  specialty: string;
  department: Department;
  description: string;
  provider: string;
  model: string;
}

const emptyForm: NewAgentForm = {
  name: "",
  role: "agent",
  avatar: "🤖",
  status: "offline",
  specialty: "",
  department: "engineering",
  description: "",
  provider: "",
  model: "",
};

export default function AgentCreator() {
  const { toast } = useToast();
  const { agents, addAgent, updateAgent, removeAgent } = useAgents();
  const [form, setForm] = useState<NewAgentForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const update = <K extends keyof NewAgentForm>(key: K, value: NewAgentForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const isValid = form.name.trim() && form.specialty.trim();

  const handleSubmit = () => {
    if (!isValid) return;

    if (editingId) {
      updateAgent(editingId, {
        name: form.name,
        role: form.role,
        avatar: form.avatar,
        status: form.status,
        specialty: form.specialty,
        department: form.department,
      });
      toast({ title: "Agent Updated", description: `${form.name} has been reconfigured.` });
      setEditingId(null);
    } else {
      addAgent({
        id: `new-${Date.now()}`,
        name: form.name,
        role: form.role,
        avatar: form.avatar,
        status: form.status,
        specialty: form.specialty,
        department: form.department,
      });
      toast({ title: "Agent Created", description: `${form.name} is ready to deploy.` });
    }

    setForm({ ...emptyForm });
  };

  const startEdit = (agent: typeof agents[0]) => {
    setForm({
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      status: agent.status,
      specialty: agent.specialty,
      department: agent.department,
      description: "",
      provider: "",
      model: "",
    });
    setEditingId(agent.id);
  };

  const confirmDelete = () => {
    if (!deleteDialog) return;
    const agent = agents.find(a => a.id === deleteDialog);
    removeAgent(deleteDialog);
    setDeleteDialog(null);
    toast({ title: "Agent Removed", description: `${agent?.name} has been decommissioned.`, variant: "destructive" });
  };

  const newAgentCount = agents.filter(a => !INITIAL_AGENT_IDS.has(a.id)).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-pixel text-sm md:text-base text-primary flex items-center gap-2">
            <Bot className="h-5 w-5" /> AGENT FACTORY
          </h1>
          <p className="font-pixel-body text-lg text-muted-foreground mt-1">
            Create and configure new AI agents or human members
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Creation Form */}
          <Card className="xl:col-span-1 pixel-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-pixel text-[10px] text-accent flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {editingId ? "EDIT AGENT" : "NEW AGENT"}
              </CardTitle>
              <CardDescription className="font-pixel-body text-sm">
                {editingId ? "Reconfigure agent parameters" : "Configure a new agent to join the team"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar picker */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">AVATAR</Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="w-14 h-14 pixel-border bg-muted flex items-center justify-center text-3xl hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    {form.avatar}
                  </button>
                  <span className="font-pixel-body text-sm text-muted-foreground">Click to change</span>
                </div>
                {showAvatarPicker && (
                  <div className="grid grid-cols-8 gap-1 p-2 pixel-border bg-muted/50">
                    {avatarOptions.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { update("avatar", emoji); setShowAvatarPicker(false); }}
                        className={`w-8 h-8 flex items-center justify-center text-lg hover:bg-primary/20 transition-colors cursor-pointer ${form.avatar === emoji ? "bg-primary/30 pixel-border" : ""}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">NAME *</Label>
                <Input
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g. CodeNinja-X"
                  className="font-pixel-body"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">ROLE</Label>
                <Select value={form.role} onValueChange={v => update("role", v as MemberRole)}>
                  <SelectTrigger className="font-pixel-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key} className="font-pixel-body">
                        <span className="flex items-center gap-2">{cfg.icon} {cfg.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">DEPARTMENT</Label>
                <Select value={form.department} onValueChange={v => update("department", v as Department)}>
                  <SelectTrigger className="font-pixel-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(departmentInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="font-pixel-body">
                        <span className="flex items-center gap-2">{info.icon} {info.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">SPECIALTY *</Label>
                <Input
                  value={form.specialty}
                  onChange={e => update("specialty", e.target.value)}
                  placeholder="e.g. Code Generation, Bug Fixing"
                  className="font-pixel-body"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">INITIAL STATUS</Label>
                <Select value={form.status} onValueChange={v => update("status", v as AgentStatus)}>
                  <SelectTrigger className="font-pixel-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key} className="font-pixel-body">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                          {cfg.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider & Model (for AI agents) */}
              {form.role === "agent" && (
                <>
                  <Separator />
                  <p className="font-pixel text-[8px] text-muted-foreground">AI CONFIGURATION</p>
                  <div className="space-y-2">
                    <Label className="font-pixel text-[8px] text-muted-foreground">PROVIDER</Label>
                    <Select value={form.provider} onValueChange={v => update("provider", v)}>
                      <SelectTrigger className="font-pixel-body">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google AI</SelectItem>
                        <SelectItem value="local">Local / Self-hosted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-pixel text-[8px] text-muted-foreground">MODEL</Label>
                    <Input
                      value={form.model}
                      onChange={e => update("model", e.target.value)}
                      placeholder="e.g. gpt-4o, claude-sonnet-4"
                      className="font-pixel-body"
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label className="font-pixel text-[8px] text-muted-foreground">DESCRIPTION</Label>
                <Textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="What does this agent do?"
                  className="font-pixel-body min-h-[60px]"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmit} disabled={!isValid} className="flex-1 font-pixel text-[9px]">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {editingId ? "SAVE CHANGES" : "CREATE AGENT"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={() => { setEditingId(null); setForm({ ...emptyForm }); }} className="font-pixel text-[9px]">
                    CANCEL
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agent Roster */}
          <Card className="xl:col-span-2 pixel-border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-pixel text-[10px] text-accent flex items-center gap-2">
                👥 AGENT ROSTER
              </CardTitle>
              <CardDescription className="font-pixel-body text-sm">
                {newAgentCount} new • {agents.length - newAgentCount} existing — {agents.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {agents.map(agent => {
                    const deptInfo = departmentInfo[agent.department];
                    const role = roleConfig[agent.role];
                    const status = statusConfig[agent.status];
                    const isNew = !INITIAL_AGENT_IDS.has(agent.id);
                    return (
                      <div
                        key={agent.id}
                        className={`flex items-center gap-3 p-3 pixel-border transition-colors ${
                          isNew ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                        } hover:bg-muted/50`}
                      >
                        <span className="text-2xl w-10 text-center">{agent.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-pixel text-[9px] text-foreground">{agent.name}</span>
                            {isNew && (
                              <Badge variant="outline" className="font-pixel text-[6px] border-primary/40 text-primary px-1 py-0">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-pixel-body text-xs text-muted-foreground">{agent.specialty}</span>
                            <Badge variant="outline" className={`font-pixel text-[6px] px-1 py-0 ${role.color}`}>
                              {role.label}
                            </Badge>
                            <span className="font-pixel-body text-xs text-muted-foreground">
                              {deptInfo.icon} {deptInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 ${status.color} ${agent.status === "online" ? "animate-pixel-pulse" : ""}`} />
                            <span className="font-pixel text-[7px] text-muted-foreground uppercase">{agent.status}</span>
                          </div>
                          {isNew && (
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => startEdit(agent)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteDialog(agent.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-pixel text-[10px]">DECOMMISSION AGENT</DialogTitle>
            <DialogDescription className="font-pixel-body">
              This will permanently remove the agent. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Decommission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
