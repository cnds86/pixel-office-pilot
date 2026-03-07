import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { agents, type Agent } from "@/data/mockData";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  generateDmChannels,
  initialGroupChannels,
  initialTopicChannels,
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
import { NotificationPopup, useNotifications } from "@/components/NotificationPopup";

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
  const [groupList, setGroupList] = useState<ChatChannel[]>(initialGroupChannels);
  const [topicList, setTopicList] = useState<ChatChannel[]>(initialTopicChannels);
  const dmList = useMemo(() => generateDmChannels(), []);

  const allChannelsList = useMemo(() => [...dmList, ...groupList, ...topicList], [dmList, groupList, topicList]);

  const [activeChannelId, setActiveChannelId] = useState<string>(dmList[0]?.id ?? "");
  const [messageStore, setMessageStore] = useState<Record<string, ChatMsg[]>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<QuickTask[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // CRUD state
  const [channelFormOpen, setChannelFormOpen] = useState(false);
  const [channelFormType, setChannelFormType] = useState<"group" | "topic">("group");
  const [editingChannel, setEditingChannel] = useState<ChatChannel | null>(null);
  const [cfName, setCfName] = useState("");
  const [cfDesc, setCfDesc] = useState("");
  const [cfIcon, setCfIcon] = useState("💬");
  const [cfMembers, setCfMembers] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showChannelList, setShowChannelList] = useState(true);
  const { notifications, push: pushNotif, dismiss: dismissNotif, clearAll: clearNotifs } = useNotifications();

  const activeChannel = useMemo(
    () => allChannelsList.find((c) => c.id === activeChannelId),
    [activeChannelId, allChannelsList]
  );

  const messages = useMemo(() => {
    if (messageStore[activeChannelId]) return messageStore[activeChannelId];
    return getInitialMessages(activeChannelId, allChannelsList);
  }, [activeChannelId, messageStore, allChannelsList]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [activeChannelId]);

  const channelsByTab: Record<ChannelType, ChatChannel[]> = {
    dm: dmList,
    group: groupList,
    topic: topicList,
  };

  // ─── CRUD Handlers ───────────────────────────────────────────────
  function openNewChannel(type: "group" | "topic") {
    setEditingChannel(null);
    setChannelFormType(type);
    setCfName("");
    setCfDesc("");
    setCfIcon(type === "group" ? "💬" : "#️⃣");
    setCfMembers([]);
    setChannelFormOpen(true);
  }

  function openEditChannel(ch: ChatChannel) {
    setEditingChannel(ch);
    setChannelFormType(ch.type as "group" | "topic");
    setCfName(ch.name);
    setCfDesc(ch.description ?? "");
    setCfIcon(ch.icon);
    setCfMembers([...ch.memberIds]);
    setChannelFormOpen(true);
  }

  function saveChannel() {
    if (!cfName.trim()) return;
    const setter = channelFormType === "group" ? setGroupList : setTopicList;

    if (editingChannel) {
      setter((prev) =>
        prev.map((ch) =>
          ch.id === editingChannel.id
            ? { ...ch, name: cfName, description: cfDesc, icon: cfIcon, memberIds: cfMembers }
            : ch
        )
      );
      toast({ title: "✅ Updated!", description: `"${cfName}" has been updated.` });
    } else {
      const prefix = channelFormType === "group" ? "grp" : "top";
      const newCh: ChatChannel = {
        id: `${prefix}-${Date.now()}`,
        type: channelFormType,
        name: cfName,
        icon: cfIcon,
        description: cfDesc,
        memberIds: cfMembers,
        unread: 0,
      };
      setter((prev) => [...prev, newCh]);
      setActiveChannelId(newCh.id);
      toast({ title: "✅ Created!", description: `"${cfName}" has been created.` });
    }
    setChannelFormOpen(false);
  }

  function deleteChannel(id: string) {
    setGroupList((prev) => prev.filter((ch) => ch.id !== id));
    setTopicList((prev) => prev.filter((ch) => ch.id !== id));
    if (activeChannelId === id) setActiveChannelId(dmList[0]?.id ?? "");
    setChannelFormOpen(false);
    toast({ title: "🗑️ Deleted", description: "Channel removed." });
  }

  // ─── Send Message ────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping || !activeChannel) return;

    const taskTitle = parseTaskCommand(text);
    if (taskTitle) {
      const assignee = activeChannel.memberIds[0];
      const newTask: QuickTask = { title: taskTitle, assigneeId: assignee, channelId: activeChannelId };
      setCreatedTasks((prev) => [...prev, newTask]);

      const agent = agents.find((a) => a.id === assignee);
      const taskMsg: ChatMsg = {
        id: `task-${Date.now()}`, channelId: activeChannelId, senderId: "user",
        content: text, timestamp: new Date(), isTask: true, taskTitle,
      };

      setMessageStore((prev) => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || getInitialMessages(activeChannelId, allChannelsList)), taskMsg],
      }));
      setInput("");
      toast({ title: "📋 Task Created!", description: `"${taskTitle}" assigned to ${agent?.name ?? "agent"}` });

      setIsTyping(true);
      setTimeout(() => {
        const ackContent = `Got it! I'll work on "${taskTitle}" right away. 💪`;
        const ackMsg: ChatMsg = {
          id: `ack-${Date.now()}`, channelId: activeChannelId, senderId: assignee,
          content: ackContent, timestamp: new Date(),
        };
        setMessageStore((prev) => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), ackMsg] }));
        setIsTyping(false);
        pushNotif({ agentId: assignee, channelId: activeChannelId, message: ackContent, type: "task-done" });
      }, 800);
      return;
    }

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`, channelId: activeChannelId, senderId: "user",
      content: text, timestamp: new Date(),
    };
    setMessageStore((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || getInitialMessages(activeChannelId, allChannelsList)), userMsg],
    }));
    setInput("");
    setIsTyping(true);

    const responderIds = activeChannel.memberIds;
    const responderId = responderIds[Math.floor(Math.random() * responderIds.length)];
    const delay = 700 + Math.random() * 1200;

    setTimeout(() => {
      const response = getMockResponse(activeChannelId, responderId);
      const agentMsg: ChatMsg = {
        id: `a-${Date.now()}`, channelId: activeChannelId, senderId: responderId,
        content: response, timestamp: new Date(),
      };
      setMessageStore((prev) => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), agentMsg] }));
      setIsTyping(false);
      pushNotif({ agentId: responderId, channelId: activeChannelId, message: response, type: "reply" });

      if (activeChannel.type !== "dm" && Math.random() > 0.5 && responderIds.length > 1) {
        const secondId = responderIds.filter((id) => id !== responderId)[
          Math.floor(Math.random() * (responderIds.length - 1))
        ];
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const secondResponse = getMockResponse(activeChannelId, secondId);
            const secondMsg: ChatMsg = {
              id: `a2-${Date.now()}`, channelId: activeChannelId, senderId: secondId,
              content: secondResponse, timestamp: new Date(),
            };
            setMessageStore((prev) => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), secondMsg] }));
            setIsTyping(false);
            pushNotif({ agentId: secondId, channelId: activeChannelId, message: secondResponse, type: "reply" });
          }, 600 + Math.random() * 800);
        }, 300);
      }
    }, delay);
  }, [input, isTyping, activeChannel, activeChannelId, allChannelsList, toast, pushNotif]);

  const getAgent = (id: string): Agent | undefined => agents.find((a) => a.id === id);

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-5rem)] sm:h-[calc(100vh-2rem)] gap-0 sm:m-4">
        {/* ─── Sidebar ──────────────────────────────── */}
        <div className={`${isMobile ? (showChannelList ? 'w-full' : 'hidden') : 'w-80 shrink-0'} pixel-border bg-card flex flex-col`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-pixel text-sm text-primary">💬 CHAT HUB</h2>
            <p className="font-pixel text-[10px] text-muted-foreground mt-1">DMs · Groups · Topics</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as ChannelType)} className="px-3 pt-3">
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="dm" className="font-pixel text-[10px] h-8">DM</TabsTrigger>
              <TabsTrigger value="group" className="font-pixel text-[10px] h-8">GROUP</TabsTrigger>
              <TabsTrigger value="topic" className="font-pixel text-[10px] h-8">TOPIC</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* New button for group/topic */}
          {(tab === "group" || tab === "topic") && (
            <div className="px-3 pt-2">
              <Button
                className="w-full font-pixel text-[10px] h-8"
                onClick={() => openNewChannel(tab)}
              >
                + NEW {tab === "group" ? "GROUP" : "TOPIC"}
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {channelsByTab[tab].map((ch) => (
                <button
                  key={ch.id}
                  className={`w-full text-left px-3 py-3 transition-colors flex items-center gap-3 ${
                    activeChannelId === ch.id
                      ? "bg-primary/10 text-primary pixel-border-glow"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                  style={{ borderWidth: activeChannelId === ch.id ? 2 : 0 }}
                  onClick={() => {
                    setActiveChannelId(ch.id);
                    if (isMobile) setShowChannelList(false);
                  }}
                >
                  <span className="text-lg">{ch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[11px] truncate">{ch.name}</div>
                    {ch.lastMessage && (
                      <div className="font-pixel-body text-sm text-muted-foreground truncate">{ch.lastMessage}</div>
                    )}
                  </div>
                  {ch.unread > 0 && (
                    <Badge className="font-pixel text-[9px] h-5 min-w-5 justify-center bg-primary text-primary-foreground">
                      {ch.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          {createdTasks.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => setTaskDialogOpen(true)}
                className="w-full font-pixel text-[10px] text-accent hover:text-primary transition-colors text-left"
              >
                📋 {createdTasks.length} task(s) created
              </button>
            </div>
          )}
        </div>

        {/* ─── Chat Area ────────────────────────────── */}
        <div className={`${isMobile ? (showChannelList ? 'hidden' : 'w-full') : 'flex-1'} flex flex-col pixel-border ${isMobile ? '' : 'border-l-0'} bg-background`}>
          {activeChannel ? (
            <>
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex items-center gap-2 sm:gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-pixel text-[10px] h-8 px-2 shrink-0"
                    onClick={() => setShowChannelList(true)}
                  >
                    ← BACK
                  </Button>
                )}
                <span className="text-xl sm:text-2xl">{activeChannel.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-pixel text-sm text-primary truncate">{activeChannel.name}</div>
                  {activeChannel.description && (
                    <div className="font-pixel text-[10px] text-muted-foreground">{activeChannel.description}</div>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  {activeChannel.memberIds.slice(0, 5).map((mid) => {
                    const a = getAgent(mid);
                    return a ? <span key={mid} className="text-base" title={a.name}>{a.avatar}</span> : null;
                  })}
                  {activeChannel.memberIds.length > 5 && (
                    <span className="font-pixel text-[10px] text-muted-foreground">+{activeChannel.memberIds.length - 5}</span>
                  )}
                </div>
                {activeChannel.type !== "dm" && (
                  <Button
                    variant="outline"
                    className="font-pixel text-[9px] h-7 px-3"
                    onClick={() => openEditChannel(activeChannel)}
                  >
                    ✏️ EDIT
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg) => {
                  const isUser = msg.senderId === "user";
                  const agent = !isUser ? getAgent(msg.senderId) : null;
                  return (
                    <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-3 pixel-border ${
                          msg.isTask ? "bg-accent/20 border-accent"
                            : isUser ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                        style={{ borderWidth: 2 }}
                      >
                        {!isUser && agent && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{agent.avatar}</span>
                            <span className="font-pixel text-[10px] text-primary">{agent.name}</span>
                          </div>
                        )}
                        {msg.isTask && (
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="font-pixel text-[9px] bg-accent text-accent-foreground">📋 TASK</Badge>
                            <span className="font-pixel text-[10px] text-accent">{msg.taskTitle}</span>
                          </div>
                        )}
                        <span className="font-pixel-body text-base leading-relaxed">
                          {msg.isTask ? msg.content.replace(/^\/task\s+/i, "") : msg.content}
                        </span>
                        <div className={`font-pixel text-[9px] mt-1.5 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-3 pixel-border" style={{ borderWidth: 2 }}>
                      <span className="font-pixel-body text-base text-muted-foreground animate-pulse">typing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-muted/20">
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
                    className="font-pixel-body text-base h-10 bg-background"
                    disabled={isTyping}
                  />
                  <Button
                    size="sm"
                    className="font-pixel text-[11px] h-10 px-5"
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                  >
                    SEND
                  </Button>
                </div>
                <div className="font-pixel text-[9px] text-muted-foreground mt-2">
                  💡 Use <span className="text-primary">/task [title]</span> to create a task
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl">💬</span>
                <p className="font-pixel text-sm text-muted-foreground mt-3">Select a channel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="pixel-border bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm text-primary">📋 Created Tasks</DialogTitle>
            <DialogDescription className="font-pixel text-[11px] text-muted-foreground">
              Tasks created from chat this session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {createdTasks.map((t, i) => {
              const agent = getAgent(t.assigneeId);
              return (
                <div key={i} className="px-3 py-3 bg-muted pixel-border" style={{ borderWidth: 2 }}>
                  <div className="font-pixel text-[11px] text-foreground">{t.title}</div>
                  <div className="font-pixel text-[9px] text-muted-foreground mt-1">
                    → {agent?.avatar} {agent?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Channel CRUD Dialog (Group / Topic) */}
      <Dialog open={channelFormOpen} onOpenChange={setChannelFormOpen}>
        <DialogContent className="pixel-border bg-card max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm text-primary">
              {editingChannel ? "✏️ Edit" : "➕ New"} {channelFormType === "group" ? "Group" : "Topic"}
            </DialogTitle>
            <DialogDescription className="font-pixel text-[10px] text-muted-foreground">
              {editingChannel ? "Update channel details and members" : "Create a new channel"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">NAME</label>
                <Input
                  value={cfName}
                  onChange={(e) => setCfName(e.target.value)}
                  className="font-pixel-body text-sm h-10"
                  placeholder={channelFormType === "group" ? "Group name..." : "# topic-name"}
                />
              </div>
              <div>
                <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">ICON</label>
                <Input
                  value={cfIcon}
                  onChange={(e) => setCfIcon(e.target.value)}
                  className="font-pixel-body text-lg h-10 w-16 text-center"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="font-pixel text-[10px] text-muted-foreground mb-1 block">DESCRIPTION</label>
              <Textarea
                value={cfDesc}
                onChange={(e) => setCfDesc(e.target.value)}
                className="font-pixel-body text-sm"
                placeholder="What's this channel about?"
                rows={2}
              />
            </div>

            <div>
              <label className="font-pixel text-[10px] text-muted-foreground mb-2 block">
                👥 MEMBERS ({cfMembers.length} selected)
              </label>
              <div
                className="h-64 overflow-y-auto pixel-border p-2 scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent"
                style={{ borderWidth: 1 }}
              >
                <div className="space-y-1">
                  {agents.map((a) => {
                    const checked = cfMembers.includes(a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            if (v) setCfMembers((prev) => [...prev, a.id]);
                            else setCfMembers((prev) => prev.filter((id) => id !== a.id));
                          }}
                        />
                        <span className="text-base">{a.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-pixel text-[10px] truncate">{a.name}</div>
                          <div className="font-pixel text-[8px] text-muted-foreground truncate">{a.specialty} · {a.department}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1 font-pixel text-[11px] h-10" onClick={saveChannel} disabled={!cfName.trim()}>
                {editingChannel ? "💾 SAVE CHANGES" : "🚀 CREATE"}
              </Button>
              {editingChannel && (
                <Button
                  variant="destructive"
                  className="font-pixel text-[10px] h-10 px-4"
                  onClick={() => deleteChannel(editingChannel.id)}
                >
                  🗑️ DELETE
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NotificationPopup
        notifications={notifications}
        onDismiss={dismissNotif}
        onClearAll={clearNotifs}
      />
    </AppLayout>
  );
}
