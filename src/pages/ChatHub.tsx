import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agents, type Agent } from "@/data/mockData";
import {
  allChannels,
  dmChannels,
  groupChannels,
  topicChannels,
  getInitialMessages,
  getMockResponse,
  type ChatChannel,
  type ChatMsg,
  type ChannelType,
} from "@/data/chatData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ─── Task quick-create from /task command ──────────────────────────
interface QuickTask {
  title: string;
  assigneeId: string;
  channelId: string;
}

function parseTaskCommand(text: string): string | null {
  const match = text.match(/^\/task\s+(.+)/i);
  return match ? match[1].trim() : null;
}

// ─── Chat Hub Page ─────────────────────────────────────────────────
export default function ChatHub() {
  const [tab, setTab] = useState<ChannelType>("dm");
  const [activeChannelId, setActiveChannelId] = useState<string>(dmChannels[0]?.id ?? "");
  const [messageStore, setMessageStore] = useState<Record<string, ChatMsg[]>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<QuickTask[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const activeChannel = useMemo(
    () => allChannels.find((c) => c.id === activeChannelId),
    [activeChannelId]
  );

  // Load initial messages lazily
  const messages = useMemo(() => {
    if (messageStore[activeChannelId]) return messageStore[activeChannelId];
    const init = getInitialMessages(activeChannelId);
    return init;
  }, [activeChannelId, messageStore]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on channel switch
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [activeChannelId]);

  const channelsByTab: Record<ChannelType, ChatChannel[]> = {
    dm: dmChannels,
    group: groupChannels,
    topic: topicChannels,
  };

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping || !activeChannel) return;

    // Check /task command
    const taskTitle = parseTaskCommand(text);
    if (taskTitle) {
      const assignee = activeChannel.memberIds[0];
      const newTask: QuickTask = {
        title: taskTitle,
        assigneeId: assignee,
        channelId: activeChannelId,
      };
      setCreatedTasks((prev) => [...prev, newTask]);

      const agent = agents.find((a) => a.id === assignee);
      const taskMsg: ChatMsg = {
        id: `task-${Date.now()}`,
        channelId: activeChannelId,
        senderId: "user",
        content: text,
        timestamp: new Date(),
        isTask: true,
        taskTitle,
      };

      setMessageStore((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || getInitialMessages(activeChannelId)), taskMsg],
      }));
      setInput("");

      toast({
        title: "📋 Task Created!",
        description: `"${taskTitle}" assigned to ${agent?.name ?? "agent"}`,
      });

      // Agent acknowledges
      setIsTyping(true);
      setTimeout(() => {
        const ackMsg: ChatMsg = {
          id: `ack-${Date.now()}`,
          channelId: activeChannelId,
          senderId: assignee,
          content: `Got it! I'll work on "${taskTitle}" right away. 💪`,
          timestamp: new Date(),
        };
        setMessageStore((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), ackMsg],
        }));
        setIsTyping(false);
      }, 800);
      return;
    }

    // Normal message
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      channelId: activeChannelId,
      senderId: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessageStore((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || getInitialMessages(activeChannelId)), userMsg],
    }));
    setInput("");
    setIsTyping(true);

    // Pick a random agent from the channel to respond
    const responderIds = activeChannel.memberIds;
    const responderId = responderIds[Math.floor(Math.random() * responderIds.length)];
    const delay = 700 + Math.random() * 1200;

    setTimeout(() => {
      const response = getMockResponse(activeChannelId, responderId);
      const agentMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        channelId: activeChannelId,
        senderId: responderId,
        content: response,
        timestamp: new Date(),
      };
      setMessageStore((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), agentMsg],
      }));
      setIsTyping(false);

      // In group/topic channels, sometimes a second agent chimes in
      if (activeChannel.type !== "dm" && Math.random() > 0.5 && responderIds.length > 1) {
        const secondId = responderIds.filter((id) => id !== responderId)[
          Math.floor(Math.random() * (responderIds.length - 1))
        ];
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const secondMsg: ChatMsg = {
              id: `a2-${Date.now()}`,
              channelId: activeChannelId,
              senderId: secondId,
              content: getMockResponse(activeChannelId, secondId),
              timestamp: new Date(),
            };
            setMessageStore((prev) => ({
              ...prev,
              [activeChannelId]: [...(prev[activeChannelId] || []), secondMsg],
            }));
            setIsTyping(false);
          }, 600 + Math.random() * 800);
        }, 300);
      }
    }, delay);
  }, [input, isTyping, activeChannel, activeChannelId, toast]);

  const getAgent = (id: string): Agent | undefined => agents.find((a) => a.id === id);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-2rem)] gap-0 m-4">
        {/* ─── Sidebar ──────────────────────────────── */}
        <div className="w-72 shrink-0 pixel-border bg-card flex flex-col">
          <div className="p-3 border-b border-border">
            <h2 className="font-pixel text-[10px] text-primary">💬 CHAT HUB</h2>
            <p className="font-pixel text-[6px] text-muted-foreground mt-1">
              DMs · Groups · Topics
            </p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as ChannelType)} className="px-2 pt-2">
            <TabsList className="w-full grid grid-cols-3 h-7">
              <TabsTrigger value="dm" className="font-pixel text-[6px] h-6">DM</TabsTrigger>
              <TabsTrigger value="group" className="font-pixel text-[6px] h-6">GROUP</TabsTrigger>
              <TabsTrigger value="topic" className="font-pixel text-[6px] h-6">TOPIC</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {channelsByTab[tab].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 ${
                    activeChannelId === ch.id
                      ? "bg-primary/10 text-primary pixel-border-glow"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                  style={{ borderWidth: activeChannelId === ch.id ? 2 : 0 }}
                >
                  <span className="text-sm">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[7px] truncate">{ch.name}</div>
                    {ch.lastMessage && (
                      <div className="font-pixel-body text-[10px] text-muted-foreground truncate">
                        {ch.lastMessage}
                      </div>
                    )}
                  </div>
                  {ch.unread > 0 && (
                    <Badge className="font-pixel text-[5px] h-4 min-w-4 justify-center bg-primary text-primary-foreground">
                      {ch.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Created tasks */}
          {createdTasks.length > 0 && (
            <div className="p-2 border-t border-border">
              <button
                onClick={() => setTaskDialogOpen(true)}
                className="w-full font-pixel text-[6px] text-accent hover:text-primary transition-colors text-left"
              >
                📋 {createdTasks.length} task(s) created
              </button>
            </div>
          )}
        </div>

        {/* ─── Chat Area ────────────────────────────── */}
        <div className="flex-1 flex flex-col pixel-border border-l-0 bg-background">
          {activeChannel ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border bg-muted/20 flex items-center gap-3">
                <span className="text-lg">{activeChannel.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-[9px] text-primary truncate">
                    {activeChannel.name}
                  </div>
                  {activeChannel.description && (
                    <div className="font-pixel text-[6px] text-muted-foreground">
                      {activeChannel.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {activeChannel.memberIds.slice(0, 5).map((mid) => {
                    const a = getAgent(mid);
                    return a ? (
                      <span key={mid} className="text-xs" title={a.name}>
                        {a.avatar}
                      </span>
                    ) : null;
                  })}
                  {activeChannel.memberIds.length > 5 && (
                    <span className="font-pixel text-[6px] text-muted-foreground">
                      +{activeChannel.memberIds.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg) => {
                  const isUser = msg.senderId === "user";
                  const agent = !isUser ? getAgent(msg.senderId) : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 pixel-border ${
                          msg.isTask
                            ? "bg-accent/20 border-accent"
                            : isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                        style={{ borderWidth: 2 }}
                      >
                        {!isUser && agent && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs">{agent.avatar}</span>
                            <span className="font-pixel text-[6px] text-primary">
                              {agent.name}
                            </span>
                          </div>
                        )}
                        {msg.isTask && (
                          <div className="flex items-center gap-1 mb-1">
                            <Badge className="font-pixel text-[5px] bg-accent text-accent-foreground">
                              📋 TASK
                            </Badge>
                            <span className="font-pixel text-[6px] text-accent">
                              {msg.taskTitle}
                            </span>
                          </div>
                        )}
                        <span className="font-pixel-body text-xs leading-relaxed">
                          {msg.isTask ? msg.content.replace(/^\/task\s+/i, "") : msg.content}
                        </span>
                        <div
                          className={`font-pixel text-[5px] mt-1 ${
                            isUser ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && activeChannel && (
                  <div className="flex justify-start">
                    <div
                      className="bg-muted px-3 py-2 pixel-border"
                      style={{ borderWidth: 2 }}
                    >
                      <span className="font-pixel-body text-xs text-muted-foreground animate-pulse">
                        typing...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={
                      activeChannel.type === "dm"
                        ? `Message ${activeChannel.name}...`
                        : `Message ${activeChannel.name}... (use /task to create task)`
                    }
                    className="font-pixel-body text-xs h-8 bg-background"
                    disabled={isTyping}
                  />
                  <Button
                    size="sm"
                    className="font-pixel text-[7px] h-8 px-4"
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                  >
                    SEND
                  </Button>
                </div>
                <div className="font-pixel text-[5px] text-muted-foreground mt-1">
                  💡 Use <span className="text-primary">/task [title]</span> to create a task
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl">💬</span>
                <p className="font-pixel text-[8px] text-muted-foreground mt-2">
                  Select a channel to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="pixel-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-[10px] text-primary">
              📋 Created Tasks
            </DialogTitle>
            <DialogDescription className="font-pixel text-[7px] text-muted-foreground">
              Tasks created from chat this session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {createdTasks.map((t, i) => {
              const agent = getAgent(t.assigneeId);
              return (
                <div key={i} className="px-3 py-2 bg-muted pixel-border" style={{ borderWidth: 2 }}>
                  <div className="font-pixel text-[7px] text-foreground">{t.title}</div>
                  <div className="font-pixel text-[5px] text-muted-foreground mt-1">
                    → {agent?.avatar} {agent?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
