import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { tickets, type Ticket, type TicketStatus, type TicketPriority } from "@/data/paperclipData";
import { getAgentById } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket as TicketIcon, MessageSquare, Wrench, AlertCircle, CheckCircle, Clock, ChevronRight } from "lucide-react";

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof TicketIcon }> = {
  open: { label: "Open", color: "bg-blue-500/20 text-blue-400 border-blue-500", icon: Clock },
  "in-progress": { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-green-500/20 text-green-400 border-green-500", icon: CheckCircle },
  escalated: { label: "Escalated", color: "bg-red-500/20 text-red-400 border-red-500", icon: AlertCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  critical: { label: "CRITICAL", color: "bg-red-600 text-white" },
  high: { label: "HIGH", color: "bg-orange-500 text-white" },
  medium: { label: "MEDIUM", color: "bg-yellow-500 text-black" },
  low: { label: "LOW", color: "bg-muted text-muted-foreground" },
};

export default function TicketSystem() {
  const [ticketList] = useState<Ticket[]>(tickets);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = statusFilter === "all" ? ticketList : ticketList.filter(t => t.status === statusFilter);

  const openCount = ticketList.filter(t => t.status === "open").length;
  const inProgressCount = ticketList.filter(t => t.status === "in-progress").length;
  const escalatedCount = ticketList.filter(t => t.status === "escalated").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-pixel text-sm md:text-base text-primary flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            TICKET SYSTEM
          </h1>
          <p className="font-pixel-body text-lg text-muted-foreground mt-1">
            Full audit trail & tool-call tracing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-blue-400">{openCount}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">OPEN</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-yellow-400">{inProgressCount}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">IN PROGRESS</span>
          </div>
          <div className="pixel-border bg-card p-4 flex flex-col items-center">
            <span className="font-pixel text-xl text-red-400">{escalatedCount}</span>
            <span className="font-pixel text-[8px] text-muted-foreground">ESCALATED</span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "open", "in-progress", "resolved", "escalated"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 font-pixel text-[8px] pixel-border transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
              }`}
            >
              {s.toUpperCase().replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-3">
            {filtered.map(ticket => {
              const assignee = getAgentById(ticket.assignedTo);
              const sConfig = statusConfig[ticket.status];
              const pConfig = priorityConfig[ticket.priority];
              const StatusIcon = sConfig.icon;

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="pixel-border bg-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${pConfig.color} font-pixel text-[7px]`}>{pConfig.label}</Badge>
                        <Badge className={`${sConfig.color} border font-pixel text-[7px]`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {sConfig.label}
                        </Badge>
                      </div>
                      <h3 className="font-pixel text-[9px] text-foreground truncate">{ticket.title}</h3>
                      <p className="font-pixel-body text-sm text-muted-foreground truncate">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-2 font-pixel text-[7px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.conversation.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {ticket.toolCalls.length}
                        </span>
                        {assignee && (
                          <span className="flex items-center gap-1">
                            {assignee.avatar} {assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden pixel-border">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="font-pixel text-[10px] text-primary flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" />
                  {selectedTicket.title}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="conversation" className="mt-4">
                <TabsList className="pixel-border">
                  <TabsTrigger value="conversation" className="font-pixel text-[8px]">
                    <MessageSquare className="h-3 w-3 mr-1" /> Conversation
                  </TabsTrigger>
                  <TabsTrigger value="toolcalls" className="font-pixel text-[8px]">
                    <Wrench className="h-3 w-3 mr-1" /> Tool Calls
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="conversation">
                  <ScrollArea className="h-[300px] mt-4">
                    <div className="space-y-3">
                      {selectedTicket.conversation.map((msg, i) => {
                        const agent = msg.agentId ? getAgentById(msg.agentId) : null;
                        return (
                          <div
                            key={i}
                            className={`p-3 pixel-border ${msg.role === "user" ? "bg-muted" : "bg-primary/10"}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{msg.role === "user" ? "👤" : agent?.avatar || "🤖"}</span>
                              <span className="font-pixel text-[8px] text-foreground">
                                {msg.role === "user" ? "User" : agent?.name || "Agent"}
                              </span>
                              <span className="font-pixel text-[7px] text-muted-foreground ml-auto">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-pixel-body text-sm text-foreground">{msg.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="toolcalls">
                  <ScrollArea className="h-[300px] mt-4">
                    <div className="space-y-3">
                      {selectedTicket.toolCalls.length === 0 ? (
                        <p className="font-pixel-body text-sm text-muted-foreground text-center py-8">
                          No tool calls recorded
                        </p>
                      ) : (
                        selectedTicket.toolCalls.map(tc => (
                          <div key={tc.id} className="p-3 pixel-border bg-card">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-accent text-accent-foreground font-pixel text-[7px]">
                                {tc.tool}
                              </Badge>
                              <span className="font-pixel text-[7px] text-muted-foreground">{tc.durationMs}ms</span>
                            </div>
                            <div className="space-y-1 font-mono text-xs">
                              <p className="text-muted-foreground">
                                <span className="text-primary">INPUT:</span> {tc.input}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="text-green-400">OUTPUT:</span> {tc.output}
                              </p>
                            </div>
                            <p className="font-pixel text-[7px] text-muted-foreground mt-2">
                              {new Date(tc.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              {selectedTicket.decision && (
                <div className="mt-4 p-3 pixel-border bg-primary/10">
                  <span className="font-pixel text-[8px] text-primary">DECISION:</span>
                  <p className="font-pixel-body text-sm text-foreground">{selectedTicket.decision}</p>
                </div>
              )}

              {selectedTicket.resolution && (
                <div className="mt-2 p-3 pixel-border bg-green-500/10">
                  <span className="font-pixel text-[8px] text-green-400">RESOLUTION:</span>
                  <p className="font-pixel-body text-sm text-foreground">{selectedTicket.resolution}</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
