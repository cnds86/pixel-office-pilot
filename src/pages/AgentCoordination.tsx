import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { agentMessages, taskDelegations, type AgentMessage, type TaskDelegation } from "@/data/paperclipData";
import { getAgentById, tasks } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ArrowRight, Send, CheckCircle, Clock, XCircle, Users } from "lucide-react";

const messageTypeConfig: Record<AgentMessage["type"], { label: string; color: string; icon: typeof Send }> = {
  request: { label: "Request", color: "bg-blue-500/20 text-blue-400", icon: Send },
  response: { label: "Response", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  delegation: { label: "Delegation", color: "bg-purple-500/20 text-purple-400", icon: ArrowRight },
  notification: { label: "Notification", color: "bg-yellow-500/20 text-yellow-400", icon: MessageSquare },
};

const delegationStatusConfig: Record<TaskDelegation["status"], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle },
  completed: { label: "Completed", color: "bg-primary/20 text-primary", icon: CheckCircle },
};

export default function AgentCoordination() {
  const [messages] = useState<AgentMessage[]>(agentMessages);
  const [delegations] = useState<TaskDelegation[]>(taskDelegations);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Get unique agents from messages
  const involvedAgents = Array.from(
    new Set([...messages.map(m => m.fromAgentId), ...messages.map(m => m.toAgentId)])
  ).map(id => getAgentById(id)).filter(Boolean);

  const filteredMessages = selectedAgent
    ? messages.filter(m => m.fromAgentId === selectedAgent || m.toAgentId === selectedAgent)
    : messages;

  const filteredDelegations = selectedAgent
    ? delegations.filter(d => d.fromAgentId === selectedAgent || d.toAgentId === selectedAgent)
    : delegations;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-sm md:text-base text-primary flex items-center gap-2">
            <Users className="h-5 w-5" />
            AGENT COORDINATION
          </h1>
          <p className="font-pixel-body text-lg text-muted-foreground mt-1">
            Communication logs & task delegation flow
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-primary">{messages.length}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">MESSAGES</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-purple-400">{delegations.length}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">DELEGATIONS</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-green-400">
              {delegations.filter(d => d.status === "completed").length}
            </span>
            <span className="font-pixel text-[8px] text-muted-foreground">COMPLETED</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-yellow-400">
              {delegations.filter(d => d.status === "pending").length}
            </span>
            <span className="font-pixel text-[8px] text-muted-foreground">PENDING</span>
          </div>
        </div>

        {/* Agent Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`px-3 py-1.5 font-pixel text-[8px] pixel-border transition-colors ${
              !selectedAgent ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            }`}
          >
            ALL AGENTS
          </button>
          {involvedAgents.map(agent => agent && (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`px-3 py-1.5 font-pixel text-[8px] pixel-border transition-colors flex items-center gap-1 ${
                selectedAgent === agent.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
            >
              <span>{agent.avatar}</span>
              <span className="hidden md:inline">{agent.name}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="messages">
          <TabsList className="pixel-border">
            <TabsTrigger value="messages" className="font-pixel text-[8px]">
              <MessageSquare className="h-3 w-3 mr-1" /> Messages ({filteredMessages.length})
            </TabsTrigger>
            <TabsTrigger value="delegations" className="font-pixel text-[8px]">
              <ArrowRight className="h-3 w-3 mr-1" /> Delegations ({filteredDelegations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <ScrollArea className="h-[calc(100vh-480px)]">
              <div className="space-y-3 mt-4">
                {filteredMessages.map(msg => {
                  const from = getAgentById(msg.fromAgentId);
                  const to = getAgentById(msg.toAgentId);
                  const config = messageTypeConfig[msg.type];
                  const TypeIcon = config.icon;

                  return (
                    <div key={msg.id} className="pixel-border bg-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${config.color} font-pixel text-[7px]`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="font-pixel text-[7px] text-muted-foreground ml-auto">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{from?.avatar}</span>
                          <span className="font-pixel text-[8px] text-foreground">{from?.name}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{to?.avatar}</span>
                          <span className="font-pixel text-[8px] text-foreground">{to?.name}</span>
                        </div>
                      </div>
                      <p className="font-pixel-body text-sm text-foreground bg-muted/50 p-2 pixel-border">
                        {msg.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="delegations">
            <ScrollArea className="h-[calc(100vh-480px)]">
              <div className="space-y-3 mt-4">
                {filteredDelegations.map(del => {
                  const from = getAgentById(del.fromAgentId);
                  const to = getAgentById(del.toAgentId);
                  const task = tasks.find(t => t.id === del.taskId);
                  const config = delegationStatusConfig[del.status];
                  const StatusIcon = config.icon;

                  return (
                    <div key={del.id} className="pixel-border bg-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${config.color} font-pixel text-[7px]`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="font-pixel text-[7px] text-muted-foreground">
                          {new Date(del.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {/* Task Info */}
                      {task && (
                        <div className="mb-3 p-2 bg-muted/50 pixel-border">
                          <span className="font-pixel text-[7px] text-muted-foreground">TASK:</span>
                          <p className="font-pixel text-[9px] text-foreground">{task.title}</p>
                        </div>
                      )}

                      {/* Delegation Flow */}
                      <div className="flex items-center justify-center gap-4 py-3">
                        <div className="text-center">
                          <span className="text-2xl block">{from?.avatar}</span>
                          <span className="font-pixel text-[8px] text-foreground">{from?.name}</span>
                          <span className="font-pixel text-[7px] text-muted-foreground block">{from?.specialty}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="h-6 w-6 text-primary" />
                          <span className="font-pixel text-[7px] text-primary">DELEGATE</span>
                        </div>
                        <div className="text-center">
                          <span className="text-2xl block">{to?.avatar}</span>
                          <span className="font-pixel text-[8px] text-foreground">{to?.name}</span>
                          <span className="font-pixel text-[7px] text-muted-foreground block">{to?.specialty}</span>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mt-2 p-2 bg-primary/10 pixel-border">
                        <span className="font-pixel text-[7px] text-primary">REASON:</span>
                        <p className="font-pixel-body text-sm text-foreground">{del.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
