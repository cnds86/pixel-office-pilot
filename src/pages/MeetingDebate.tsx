import { useState, useRef, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { agents, Agent, getAgentById } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Users, Swords, Vote, FileText, Plus, Play, Square, Send,
  ThumbsUp, ThumbsDown, CheckCircle2, Clock, MessageSquare,
  ChevronRight, Sparkles, ArrowLeft, Timer, Pause, RotateCcw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

/* ── Types ── */
interface MeetingRoom {
  id: string;
  title: string;
  members: string[];
  messages: MeetingMsg[];
  status: "waiting" | "active" | "ended";
  summary?: string;
  actionItems?: string[];
  createdAt: string;
  timerDuration: number; // total seconds
  timerRemaining: number; // seconds left
  timerPaused: boolean;
}

interface MeetingMsg {
  sender: string;
  content: string;
  timestamp: string;
  type: "message" | "system";
}

interface Debate {
  id: string;
  topic: string;
  proMembers: string[];
  conMembers: string[];
  rounds: DebateRound[];
  status: "setup" | "active" | "voting" | "ended";
  verdict?: string;
  createdAt: string;
  roundDuration: number; // seconds per round
  timerRemaining: number;
  timerPaused: boolean;
  currentRound: number;
}

interface DebateRound {
  round: number;
  proArg: { agentId: string; content: string };
  conArg: { agentId: string; content: string };
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  voters: string[];
  status: "active" | "ended";
  createdAt: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

/* ── Mock responses ── */
const meetingResponses: Record<string, string[]> = {
  engineering: [
    "I suggest we refactor the auth module first — it blocks 3 other tasks.",
    "We should add retry logic to the API gateway before scaling.",
    "The monorepo migration will save us 40% build time.",
    "Let's adopt trunk-based development for faster iteration.",
  ],
  design: [
    "The current spacing feels cramped — I'd increase padding by 8px.",
    "We need a consistent icon set across all platforms.",
    "I'll prepare high-fi mockups by end of sprint.",
    "The color contrast ratio doesn't meet WCAG AA on mobile.",
  ],
  qa: [
    "We're at 78% coverage — the auth module needs more tests.",
    "I found 3 edge cases in the payment flow that aren't handled.",
    "Let me set up regression tests before the next release.",
    "Flaky tests in CI are mostly timing issues — I'll fix those.",
  ],
  devops: [
    "The staging cluster can handle 2x the current load.",
    "We should move to blue-green deploys to reduce downtime.",
    "I'll set up monitoring alerts for the new endpoints.",
    "Container image sizes can be reduced by 60% with multi-stage builds.",
  ],
  product: [
    "User research shows the onboarding drop-off is at step 3.",
    "We should prioritize the search feature — it's the #1 request.",
    "Let's sync on the Q2 roadmap by Friday.",
    "The NPS score improved 12 points after the last release.",
  ],
  support: [
    "Ticket volume spiked 30% this week — mostly about the login flow.",
    "I suggest we add a self-service password reset page.",
    "The knowledge base article about API keys needs updating.",
    "Response time is down to 4 hours average — below our SLA.",
  ],
};

const debateProArgs: string[] = [
  "This approach significantly improves scalability and reduces tech debt.",
  "Data shows a 40% improvement in performance with this method.",
  "Industry leaders have adopted this pattern with proven success.",
  "It aligns perfectly with our Q2 goals and roadmap vision.",
  "The ROI calculation strongly favors this direction.",
];

const debateConArgs: string[] = [
  "The migration cost outweighs the short-term benefits.",
  "We lack the expertise in-house — training will delay timelines.",
  "Alternative solutions exist that are less disruptive.",
  "The risk profile is too high for our current stability requirements.",
  "User research suggests customers prefer the current approach.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAgentResponse(agent: Agent): string {
  const dept = agent.department;
  const responses = meetingResponses[dept] || meetingResponses.engineering;
  return pickRandom(responses);
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* ── Timer Display Component ── */
function TimerDisplay({ remaining, total, paused, onPause, onResume, onReset, variant = "primary" }: {
  remaining: number; total: number; paused: boolean;
  onPause: () => void; onResume: () => void; onReset: () => void;
  variant?: "primary" | "destructive";
}) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const isLow = remaining <= 30;
  const colorClass = variant === "destructive" ? "text-destructive" : "text-primary";
  const progressColor = isLow ? "bg-destructive" : variant === "destructive" ? "bg-destructive" : "bg-primary";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 font-pixel text-sm ${isLow ? "text-destructive animate-pulse" : colorClass}`}>
        <Timer className="w-3 h-3" />
        <span>{formatTimer(remaining)}</span>
      </div>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${progressColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-0.5">
        {paused ? (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onResume}><Play className="w-3 h-3" /></Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPause}><Pause className="w-3 h-3" /></Button>
        )}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onReset}><RotateCcw className="w-3 h-3" /></Button>
      </div>
    </div>
  );
}

/* ── Timer Duration Selector ── */
function TimerSelector({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const presets = [
    { label: "2m", value: 120 },
    { label: "5m", value: 300 },
    { label: "10m", value: 600 },
    { label: "15m", value: 900 },
    { label: "30m", value: 1800 },
  ];
  return (
    <div>
      <p className="text-sm font-pixel text-muted-foreground mb-1.5 flex items-center gap-1">
        <Timer className="w-3 h-3" /> {label}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map(p => (
          <Button
            key={p.value}
            type="button"
            variant={value === p.value ? "default" : "outline"}
            size="sm"
            className="font-pixel text-[10px] h-7 px-2"
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ── Component ── */
export default function MeetingDebate() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("meetings");

  // Meeting state
  const [meetings, setMeetings] = useState<MeetingRoom[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [meetingInput, setMeetingInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const meetingScrollRef = useRef<HTMLDivElement>(null);
  const [meetingTimerDuration, setMeetingTimerDuration] = useState(600); // default 10min

  // Debate state
  const [debates, setDebates] = useState<Debate[]>([]);
  const [activeDebate, setActiveDebate] = useState<string | null>(null);
  const [showDebateForm, setShowDebateForm] = useState(false);
  const [debateTopic, setDebateTopic] = useState("");
  const [proMembers, setProMembers] = useState<string[]>([]);
  const [conMembers, setConMembers] = useState<string[]>([]);
  const [isDebating, setIsDebating] = useState(false);

  // Poll state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollVoters, setPollVoters] = useState<string[]>([]);

  // Mobile detail view
  const [mobileDetail, setMobileDetail] = useState(false);

  const currentMeeting = meetings.find(m => m.id === activeMeeting);
  const currentDebate = debates.find(d => d.id === activeDebate);

  // auto-scroll meeting
  useEffect(() => {
    meetingScrollRef.current?.scrollTo({ top: meetingScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [currentMeeting?.messages]);

  /* ── Meeting Functions ── */
  const createMeeting = () => {
    if (!newMeetingTitle.trim() || selectedMembers.length === 0) return;
    const m: MeetingRoom = {
      id: `meet-${Date.now()}`,
      title: newMeetingTitle,
      members: selectedMembers,
      messages: [{ sender: "system", content: `Meeting "${newMeetingTitle}" created`, timestamp: now(), type: "system" }],
      status: "waiting",
      createdAt: now(),
    };
    setMeetings(prev => [...prev, m]);
    setActiveMeeting(m.id);
    setShowMeetingForm(false);
    setNewMeetingTitle("");
    setSelectedMembers([]);
    setMobileDetail(true);
    toast({ title: "🏢 Meeting Created", description: newMeetingTitle });
  };

  const startMeeting = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? {
      ...m, status: "active" as const,
      messages: [...m.messages, { sender: "system", content: "Meeting started! All agents are now active.", timestamp: now(), type: "system" as const }]
    } : m));
  };

  const sendMeetingMessage = useCallback(() => {
    if (!meetingInput.trim() || !activeMeeting) return;
    const msg: MeetingMsg = { sender: "user", content: meetingInput, timestamp: now(), type: "message" };
    setMeetings(prev => prev.map(m => m.id === activeMeeting ? { ...m, messages: [...m.messages, msg] } : m));
    setMeetingInput("");
    setIsTyping(true);

    const meeting = meetings.find(m => m.id === activeMeeting);
    if (!meeting) return;

    // Agents respond one by one
    meeting.members.forEach((memberId, i) => {
      setTimeout(() => {
        const agent = getAgentById(memberId);
        if (!agent) return;
        const response: MeetingMsg = { sender: memberId, content: getAgentResponse(agent), timestamp: now(), type: "message" };
        setMeetings(prev => prev.map(m => m.id === activeMeeting ? { ...m, messages: [...m.messages, response] } : m));
        if (i === meeting.members.length - 1) setIsTyping(false);
      }, 800 * (i + 1) + Math.random() * 500);
    });
  }, [meetingInput, activeMeeting, meetings]);

  const endMeeting = (id: string) => {
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;
    const summary = `Meeting "${meeting.title}" concluded with ${meeting.messages.filter(m => m.type === "message").length} messages from ${meeting.members.length} participants.`;
    const actionItems = [
      `${getAgentById(meeting.members[0])?.name || "Agent"}: Follow up on discussed items`,
      "Schedule next sync by end of week",
      "Share meeting notes with the team",
    ];
    setMeetings(prev => prev.map(m => m.id === id ? {
      ...m, status: "ended" as const, summary, actionItems,
      messages: [...m.messages, { sender: "system", content: "Meeting ended. Summary generated.", timestamp: now(), type: "system" as const }]
    } : m));
    toast({ title: "📋 Meeting Ended", description: "Summary and action items generated" });
  };

  /* ── Debate Functions ── */
  const createDebate = () => {
    if (!debateTopic.trim() || proMembers.length === 0 || conMembers.length === 0) return;
    const d: Debate = {
      id: `debate-${Date.now()}`,
      topic: debateTopic,
      proMembers, conMembers,
      rounds: [],
      status: "setup",
      createdAt: now(),
    };
    setDebates(prev => [...prev, d]);
    setActiveDebate(d.id);
    setShowDebateForm(false);
    setDebateTopic("");
    setProMembers([]);
    setConMembers([]);
    setMobileDetail(true);
    toast({ title: "⚔️ Debate Created", description: debateTopic });
  };

  const startDebate = (id: string) => {
    setIsDebating(true);
    const debate = debates.find(d => d.id === id);
    if (!debate) return;

    setDebates(prev => prev.map(d => d.id === id ? { ...d, status: "active" as const } : d));

    // Simulate 3 rounds
    let roundCount = 0;
    const interval = setInterval(() => {
      roundCount++;
      const proAgent = pickRandom(debate.proMembers);
      const conAgent = pickRandom(debate.conMembers);
      const round: DebateRound = {
        round: roundCount,
        proArg: { agentId: proAgent, content: pickRandom(debateProArgs) },
        conArg: { agentId: conAgent, content: pickRandom(debateConArgs) },
      };
      setDebates(prev => prev.map(d => d.id === id ? { ...d, rounds: [...d.rounds, round] } : d));

      if (roundCount >= 3) {
        clearInterval(interval);
        setTimeout(() => {
          setDebates(prev => prev.map(d => d.id === id ? { ...d, status: "voting" as const } : d));
          setIsDebating(false);
        }, 1000);
      }
    }, 2000);
  };

  const concludeDebate = (id: string, verdict: string) => {
    setDebates(prev => prev.map(d => d.id === id ? { ...d, status: "ended" as const, verdict } : d));
    toast({ title: "⚖️ Debate Concluded", description: `Verdict: ${verdict}` });
  };

  /* ── Poll Functions ── */
  const createPoll = () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return;
    const p: Poll = {
      id: `poll-${Date.now()}`,
      question: pollQuestion,
      options: pollOptions.filter(o => o.trim()).map((text, i) => ({ id: `opt-${i}`, text, votes: [] })),
      voters: pollVoters,
      status: "active",
      createdAt: now(),
    };
    setPolls(prev => [...prev, p]);
    setShowPollForm(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollVoters([]);
    toast({ title: "🗳️ Poll Created", description: pollQuestion });

    // Simulate agent voting
    if (pollVoters.length > 0) {
      pollVoters.forEach((voterId, i) => {
        setTimeout(() => {
          const randomOpt = pickRandom(p.options);
          setPolls(prev => prev.map(poll => poll.id === p.id ? {
            ...poll,
            options: poll.options.map(o => o.id === randomOpt.id ? { ...o, votes: [...o.votes, voterId] } : o)
          } : poll));
        }, 500 * (i + 1) + Math.random() * 1000);
      });
    }
  };

  const endPoll = (id: string) => {
    setPolls(prev => prev.map(p => p.id === id ? { ...p, status: "ended" as const } : p));
  };

  const toggleMember = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const AgentSelector = ({ selected, onToggle, label }: { selected: string[]; onToggle: (id: string) => void; label: string }) => (
    <div>
      <p className="text-sm font-pixel text-muted-foreground mb-2">{label}</p>
      <div className="h-48 overflow-y-auto scrollbar-thin border-2 border-border rounded p-2 space-y-1">
        {agents.map(a => (
          <label key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox checked={selected.includes(a.id)} onCheckedChange={() => onToggle(a.id)} />
            <span className="text-base">{a.avatar}</span>
            <span className="text-sm font-pixel-body text-foreground">{a.name}</span>
            <Badge variant="outline" className="ml-auto text-[10px]">{a.department}</Badge>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{selected.length} selected</p>
    </div>
  );

  /* ── Render ── */
  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 border-b-2 border-border">
          <div>
            <h1 className="font-pixel text-sm sm:text-lg text-primary flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" /> MEETING & DEBATE
            </h1>
            <p className="font-pixel-body text-xs text-muted-foreground">Collaborate, debate, and decide with your agents</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-3 mt-2 grid grid-cols-4 bg-muted/50 border-2 border-border">
            <TabsTrigger value="meetings" className="font-pixel text-[9px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
              <Users className="w-3 h-3 hidden sm:block" /> Meetings
            </TabsTrigger>
            <TabsTrigger value="debates" className="font-pixel text-[9px] sm:text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground gap-1">
              <Swords className="w-3 h-3 hidden sm:block" /> Debates
            </TabsTrigger>
            <TabsTrigger value="polls" className="font-pixel text-[9px] sm:text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground gap-1">
              <Vote className="w-3 h-3 hidden sm:block" /> Polls
            </TabsTrigger>
            <TabsTrigger value="summaries" className="font-pixel text-[9px] sm:text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-1">
              <FileText className="w-3 h-3 hidden sm:block" /> Summary
            </TabsTrigger>
          </TabsList>

          {/* ═══ MEETINGS TAB ═══ */}
          <TabsContent value="meetings" className="flex-1 flex min-h-0 m-0 p-3 gap-3">
            {(!isMobile || !mobileDetail) && (
              <div className={`${isMobile ? "w-full" : "w-72"} flex flex-col gap-2`}>
                <Button onClick={() => setShowMeetingForm(true)} className="w-full font-pixel text-xs gap-2">
                  <Plus className="w-3 h-3" /> New Meeting
                </Button>
                <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
                  {meetings.length === 0 && (
                    <div className="text-center text-muted-foreground font-pixel-body text-sm py-8">
                      No meetings yet.<br />Create one to start!
                    </div>
                  )}
                  {meetings.map(m => (
                    <Card
                      key={m.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${activeMeeting === m.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => { setActiveMeeting(m.id); setMobileDetail(true); }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-xs text-foreground truncate">{m.title}</span>
                          <Badge variant={m.status === "active" ? "default" : m.status === "ended" ? "secondary" : "outline"} className="text-[9px]">
                            {m.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          {m.members.slice(0, 4).map(id => {
                            const a = getAgentById(id);
                            return <span key={id} className="text-sm" title={a?.name}>{a?.avatar}</span>;
                          })}
                          {m.members.length > 4 && <span className="text-xs text-muted-foreground">+{m.members.length - 4}</span>}
                          <span className="ml-auto text-[10px] text-muted-foreground">{m.createdAt}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(!isMobile || mobileDetail) && (
              <div className="flex-1 flex flex-col min-h-0 border-2 border-border rounded bg-card/50">
                {currentMeeting ? (
                  <>
                    <div className="flex items-center justify-between p-3 border-b-2 border-border">
                      {isMobile && (
                        <Button variant="ghost" size="sm" onClick={() => setMobileDetail(false)} className="mr-2">
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="flex-1">
                        <h3 className="font-pixel text-xs text-primary">{currentMeeting.title}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          {currentMeeting.members.slice(0, 6).map(id => {
                            const a = getAgentById(id);
                            return <span key={id} className="text-sm">{a?.avatar}</span>;
                          })}
                        </div>
                      </div>
                      {currentMeeting.status === "waiting" && (
                        <Button size="sm" onClick={() => startMeeting(currentMeeting.id)} className="font-pixel text-[10px] gap-1">
                          <Play className="w-3 h-3" /> Start
                        </Button>
                      )}
                      {currentMeeting.status === "active" && (
                        <Button size="sm" variant="destructive" onClick={() => endMeeting(currentMeeting.id)} className="font-pixel text-[10px] gap-1">
                          <Square className="w-3 h-3" /> End
                        </Button>
                      )}
                    </div>

                    <div ref={meetingScrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
                      {currentMeeting.messages.map((msg, i) => {
                        if (msg.type === "system") {
                          return (
                            <div key={i} className="text-center">
                              <Badge variant="outline" className="text-[10px] font-pixel text-muted-foreground">{msg.content}</Badge>
                            </div>
                          );
                        }
                        const agent = msg.sender === "user" ? null : getAgentById(msg.sender);
                        const isUser = msg.sender === "user";
                        return (
                          <div key={i} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                            {!isUser && <span className="text-lg mt-1">{agent?.avatar}</span>}
                            <div className={`max-w-[75%] rounded border-2 p-2 ${isUser ? "bg-primary/20 border-primary/30" : "bg-muted border-border"}`}>
                              {!isUser && <p className="text-[10px] font-pixel text-primary mb-0.5">{agent?.name}</p>}
                              <p className="text-sm font-pixel-body text-foreground">{msg.content}</p>
                              <p className="text-[9px] text-muted-foreground mt-1">{msg.timestamp}</p>
                            </div>
                          </div>
                        );
                      })}
                      {isTyping && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MessageSquare className="w-3 h-3 animate-pulse" />
                          <span className="text-xs font-pixel animate-pulse">agents typing...</span>
                        </div>
                      )}
                    </div>

                    {currentMeeting.status === "active" && (
                      <div className="p-3 border-t-2 border-border flex gap-2">
                        <Input
                          value={meetingInput}
                          onChange={e => setMeetingInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && sendMeetingMessage()}
                          placeholder="Type your message..."
                          className="font-pixel-body text-sm"
                        />
                        <Button onClick={sendMeetingMessage} size="icon"><Send className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground font-pixel text-xs">
                    {isMobile && (
                      <Button variant="ghost" size="sm" onClick={() => setMobileDetail(false)} className="absolute top-3 left-3">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    )}
                    Select or create a meeting
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ═══ DEBATES TAB ═══ */}
          <TabsContent value="debates" className="flex-1 flex min-h-0 m-0 p-3 gap-3">
            {(!isMobile || !mobileDetail) && (
              <div className={`${isMobile ? "w-full" : "w-72"} flex flex-col gap-2`}>
                <Button onClick={() => setShowDebateForm(true)} variant="destructive" className="w-full font-pixel text-xs gap-2">
                  <Plus className="w-3 h-3" /> New Debate
                </Button>
                <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
                  {debates.length === 0 && (
                    <div className="text-center text-muted-foreground font-pixel-body text-sm py-8">
                      No debates yet.<br />Start one!
                    </div>
                  )}
                  {debates.map(d => (
                    <Card
                      key={d.id}
                      className={`cursor-pointer transition-all hover:border-destructive/50 ${activeDebate === d.id ? "border-destructive bg-destructive/5" : ""}`}
                      onClick={() => { setActiveDebate(d.id); setMobileDetail(true); }}
                    >
                      <CardContent className="p-3">
                        <span className="font-pixel text-xs text-foreground block truncate">{d.topic}</span>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-primary" />
                            <span className="text-xs text-muted-foreground">{d.proMembers.length}</span>
                            <span className="text-muted-foreground mx-1">vs</span>
                            <ThumbsDown className="w-3 h-3 text-destructive" />
                            <span className="text-xs text-muted-foreground">{d.conMembers.length}</span>
                          </div>
                          <Badge variant={d.status === "active" ? "destructive" : d.status === "ended" ? "secondary" : "outline"} className="text-[9px]">
                            {d.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(!isMobile || mobileDetail) && (
              <div className="flex-1 flex flex-col min-h-0 border-2 border-border rounded bg-card/50">
                {currentDebate ? (
                  <>
                    <div className="flex items-center justify-between p-3 border-b-2 border-border">
                      {isMobile && (
                        <Button variant="ghost" size="sm" onClick={() => setMobileDetail(false)} className="mr-2">
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="flex-1">
                        <h3 className="font-pixel text-xs text-destructive flex items-center gap-1">
                          <Swords className="w-3 h-3" /> {currentDebate.topic}
                        </h3>
                      </div>
                      {currentDebate.status === "setup" && (
                        <Button size="sm" variant="destructive" onClick={() => startDebate(currentDebate.id)} className="font-pixel text-[10px] gap-1">
                          <Play className="w-3 h-3" /> Start
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
                      {/* Teams */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border-2 border-primary/30 rounded p-2 bg-primary/5">
                          <p className="font-pixel text-[10px] text-primary flex items-center gap-1 mb-1"><ThumbsUp className="w-3 h-3" /> PRO</p>
                          {currentDebate.proMembers.map(id => {
                            const a = getAgentById(id);
                            return <p key={id} className="text-xs font-pixel-body text-foreground">{a?.avatar} {a?.name}</p>;
                          })}
                        </div>
                        <div className="border-2 border-destructive/30 rounded p-2 bg-destructive/5">
                          <p className="font-pixel text-[10px] text-destructive flex items-center gap-1 mb-1"><ThumbsDown className="w-3 h-3" /> CON</p>
                          {currentDebate.conMembers.map(id => {
                            const a = getAgentById(id);
                            return <p key={id} className="text-xs font-pixel-body text-foreground">{a?.avatar} {a?.name}</p>;
                          })}
                        </div>
                      </div>

                      {/* Rounds */}
                      {currentDebate.rounds.map((round, i) => {
                        const proA = getAgentById(round.proArg.agentId);
                        const conA = getAgentById(round.conArg.agentId);
                        return (
                          <div key={i} className="space-y-2">
                            <Badge variant="outline" className="font-pixel text-[10px]">Round {round.round}</Badge>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="border-2 border-primary/20 rounded p-2 bg-primary/5">
                                <p className="text-[10px] font-pixel text-primary">{proA?.avatar} {proA?.name}</p>
                                <p className="text-sm font-pixel-body text-foreground mt-1">{round.proArg.content}</p>
                              </div>
                              <div className="border-2 border-destructive/20 rounded p-2 bg-destructive/5">
                                <p className="text-[10px] font-pixel text-destructive">{conA?.avatar} {conA?.name}</p>
                                <p className="text-sm font-pixel-body text-foreground mt-1">{round.conArg.content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {isDebating && (
                        <div className="flex items-center gap-2 text-muted-foreground justify-center py-4">
                          <Swords className="w-4 h-4 animate-pulse" />
                          <span className="font-pixel text-xs animate-pulse">Debate in progress...</span>
                        </div>
                      )}

                      {currentDebate.status === "voting" && (
                        <div className="border-2 border-accent rounded p-4 bg-accent/10 text-center space-y-2">
                          <p className="font-pixel text-xs text-accent">⚖️ TIME TO DECIDE</p>
                          <div className="flex gap-2 justify-center">
                            <Button onClick={() => concludeDebate(currentDebate.id, "PRO wins")} className="font-pixel text-[10px] gap-1">
                              <ThumbsUp className="w-3 h-3" /> PRO Wins
                            </Button>
                            <Button variant="destructive" onClick={() => concludeDebate(currentDebate.id, "CON wins")} className="font-pixel text-[10px] gap-1">
                              <ThumbsDown className="w-3 h-3" /> CON Wins
                            </Button>
                            <Button variant="secondary" onClick={() => concludeDebate(currentDebate.id, "Draw")} className="font-pixel text-[10px]">
                              Draw
                            </Button>
                          </div>
                        </div>
                      )}

                      {currentDebate.status === "ended" && currentDebate.verdict && (
                        <div className="border-2 border-secondary rounded p-4 bg-secondary/10 text-center">
                          <p className="font-pixel text-sm text-secondary">🏆 Verdict: {currentDebate.verdict}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground font-pixel text-xs">
                    {isMobile && (
                      <Button variant="ghost" size="sm" onClick={() => setMobileDetail(false)} className="absolute top-3 left-3">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    )}
                    Select or create a debate
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ═══ POLLS TAB ═══ */}
          <TabsContent value="polls" className="flex-1 m-0 p-3 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-pixel text-xs text-secondary">🗳️ POLLS & VOTES</h2>
              <Button onClick={() => setShowPollForm(true)} variant="secondary" className="font-pixel text-xs gap-1">
                <Plus className="w-3 h-3" /> New Poll
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {polls.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground font-pixel-body text-sm py-8">No polls yet</div>
              )}
              {polls.map(p => {
                const totalVotes = p.options.reduce((sum, o) => sum + o.votes.length, 0);
                return (
                  <Card key={p.id} className="border-secondary/30">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-pixel text-xs text-foreground">{p.question}</CardTitle>
                        {p.status === "active" && (
                          <Button variant="ghost" size="sm" onClick={() => endPoll(p.id)} className="text-[10px] font-pixel text-destructive">
                            End
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {p.options.map(o => {
                        const pct = totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0;
                        return (
                          <div key={o.id}>
                            <div className="flex items-center justify-between text-xs font-pixel-body text-foreground mb-0.5">
                              <span>{o.text}</span>
                              <span className="text-muted-foreground">{o.votes.length} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex gap-0.5 mt-0.5">
                              {o.votes.map(v => {
                                const a = getAgentById(v);
                                return <span key={v} className="text-xs" title={a?.name}>{a?.avatar}</span>;
                              })}
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground">{totalVotes} total votes</span>
                        <Badge variant={p.status === "active" ? "secondary" : "outline"} className="text-[9px]">{p.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ SUMMARIES TAB ═══ */}
          <TabsContent value="summaries" className="flex-1 m-0 p-3 overflow-y-auto scrollbar-thin">
            <h2 className="font-pixel text-xs text-accent mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> MEETING SUMMARIES & ACTION ITEMS
            </h2>
            <div className="space-y-3">
              {meetings.filter(m => m.status === "ended").length === 0 && debates.filter(d => d.status === "ended").length === 0 && (
                <div className="text-center text-muted-foreground font-pixel-body text-sm py-8">
                  No completed meetings or debates yet
                </div>
              )}
              {meetings.filter(m => m.status === "ended").map(m => (
                <Card key={m.id} className="border-accent/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <h3 className="font-pixel text-xs text-foreground">{m.title}</h3>
                      <Badge variant="outline" className="text-[9px] ml-auto">Meeting</Badge>
                    </div>
                    {m.summary && <p className="text-sm font-pixel-body text-muted-foreground mb-3">{m.summary}</p>}
                    {m.actionItems && (
                      <div>
                        <p className="font-pixel text-[10px] text-accent mb-1">ACTION ITEMS:</p>
                        {m.actionItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm font-pixel-body text-foreground">
                            <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {debates.filter(d => d.status === "ended").map(d => (
                <Card key={d.id} className="border-destructive/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Swords className="w-4 h-4 text-destructive" />
                      <h3 className="font-pixel text-xs text-foreground">{d.topic}</h3>
                      <Badge variant="outline" className="text-[9px] ml-auto">Debate</Badge>
                    </div>
                    <p className="text-sm font-pixel-body text-muted-foreground mb-2">
                      {d.rounds.length} rounds • {d.proMembers.length} PRO vs {d.conMembers.length} CON
                    </p>
                    {d.verdict && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-pixel text-[10px]">🏆 {d.verdict}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ══ DIALOGS ══ */}

      {/* New Meeting Dialog */}
      <Dialog open={showMeetingForm} onOpenChange={setShowMeetingForm}>
        <DialogContent className="border-2 border-primary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm text-primary">🏢 New Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)} placeholder="Meeting title..." className="font-pixel-body" />
            <AgentSelector selected={selectedMembers} onToggle={id => toggleMember(id, selectedMembers, setSelectedMembers)} label="Select Participants" />
          </div>
          <DialogFooter>
            <Button onClick={createMeeting} className="font-pixel text-xs">Create Meeting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Debate Dialog */}
      <Dialog open={showDebateForm} onOpenChange={setShowDebateForm}>
        <DialogContent className="border-2 border-destructive/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm text-destructive">⚔️ New Debate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={debateTopic} onChange={e => setDebateTopic(e.target.value)} placeholder="Debate topic..." className="font-pixel-body" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AgentSelector selected={proMembers} onToggle={id => toggleMember(id, proMembers, setProMembers)} label="👍 PRO Team" />
              <AgentSelector selected={conMembers} onToggle={id => toggleMember(id, conMembers, setConMembers)} label="👎 CON Team" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={createDebate} className="font-pixel text-xs">Start Debate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Poll Dialog */}
      <Dialog open={showPollForm} onOpenChange={setShowPollForm}>
        <DialogContent className="border-2 border-secondary/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-sm text-secondary">🗳️ New Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll question..." className="font-pixel-body" />
            <div className="space-y-2">
              <p className="text-sm font-pixel text-muted-foreground">Options</p>
              {pollOptions.map((opt, i) => (
                <Input
                  key={i}
                  value={opt}
                  onChange={e => { const nv = [...pollOptions]; nv[i] = e.target.value; setPollOptions(nv); }}
                  placeholder={`Option ${i + 1}`}
                  className="font-pixel-body"
                />
              ))}
              {pollOptions.length < 4 && (
                <Button variant="ghost" size="sm" onClick={() => setPollOptions([...pollOptions, ""])} className="font-pixel text-[10px]">
                  + Add Option
                </Button>
              )}
            </div>
            <AgentSelector selected={pollVoters} onToggle={id => toggleMember(id, pollVoters, setPollVoters)} label="Select Voters" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={createPoll} className="font-pixel text-xs">Create Poll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
