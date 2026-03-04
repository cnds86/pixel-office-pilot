import { useState, useEffect } from "react";
import { agents, tasks } from "@/data/mockData";
import type { Agent, Task } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Furniture positions
const desks = [
  { x: 14, y: 28, label: "Desk 1" },
  { x: 30, y: 28, label: "Desk 2" },
  { x: 46, y: 28, label: "Desk 3" },
  { x: 14, y: 48, label: "Desk 4" },
  { x: 30, y: 48, label: "Desk 5" },
  { x: 46, y: 48, label: "Desk 6" },
];

const meetingTable = { x: 82, y: 18 };
const coffeeMachine = { x: 10, y: 80 };
const waterCooler = { x: 20, y: 80 };
const printer = { x: 58, y: 65 };
const sofa = { x: 35, y: 82 };
const whiteboard = { x: 82, y: 48 };
const bookshelf = { x: 3, y: 18 };
const door = { x: 96, y: 90 };
const receptionDesk = { x: 78, y: 72 };

// New furniture
const fridge = { x: 10, y: 90 };
const microwave = { x: 20, y: 90 };
const sink = { x: 30, y: 90 };
const vendingMachine = { x: 48, y: 90 };
const phoneBooth = { x: 62, y: 18 };
const serverRack = { x: 62, y: 38 };
const filingCabinet = { x: 3, y: 38 };
const filingCabinet2 = { x: 3, y: 55 };
const acUnit = { x: 55, y: 6 };
const fireExtinguisher = { x: 68, y: 60 };
const corkBoard = { x: 38, y: 6 };
const standingDesk = { x: 55, y: 55 };

const meetingChairs = [
  { x: 77, y: 13 }, { x: 87, y: 13 },
  { x: 77, y: 23 }, { x: 87, y: 23 },
];

type AgentAction = "working" | "walking" | "coffee" | "meeting" | "idle" | "printing" | "chatting" | "snacking" | "calling";

interface OfficeAgent {
  agent: Agent;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  action: AgentAction;
  deskIdx: number | null;
  speechBubble: string | null;
  direction: "left" | "right";
  frame: number;
}

const speechOptions: Record<AgentAction, string[]> = {
  working: ["💻 coding...", "🔧 fixing bug", "📝 writing docs", "🧪 testing...", "⚙️ building...", "📊 analyzing...", "🎯 focusing..."],
  coffee: ["☕ need caffeine!", "☕ brb coffee", "☕ espresso time", "☕ latte art!"],
  meeting: ["📊 reviewing PR", "🗣️ standup!", "📋 sprint planning", "💡 brainstorming", "🤝 syncing up"],
  walking: [],
  idle: ["🤔 thinking...", "💭 ...", "📱 checking slack", "🎧 vibing..."],
  printing: ["🖨️ printing...", "📄 grabbing docs"],
  chatting: ["😄 haha nice!", "👋 hey!", "🍕 lunch plans?", "🎉 ship it!"],
  snacking: ["🍪 cookie time!", "🥤 slurp...", "🍎 healthy snack", "🌮 taco break"],
  calling: ["📞 on a call...", "🎙️ presenting...", "📱 quick sync"],
};

const actionLabel: Record<AgentAction, string> = {
  working: "Working at desk",
  walking: "Walking",
  coffee: "Coffee break",
  meeting: "In a meeting",
  idle: "Idle",
  printing: "Printing",
  chatting: "Chatting",
  snacking: "Snacking",
  calling: "On a call",
};

const priorityColor: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function PixelOffice() {
  const [officeAgents, setOfficeAgents] = useState<OfficeAgent[]>([]);
  const [clock, setClock] = useState("09:00");
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [assignTaskId, setAssignTaskId] = useState<string>("");
  const [lightFlicker, setLightFlicker] = useState(false);

  // Initialize agents at desks
  useEffect(() => {
    const onlineAgents = agents.filter(a => a.status !== "offline");
    const initial: OfficeAgent[] = onlineAgents.map((agent, i) => {
      const deskIdx = i < desks.length ? i : null;
      const pos = deskIdx !== null ? desks[deskIdx] : { x: randomBetween(20, 55), y: randomBetween(25, 60) };
      return {
        agent,
        x: pos.x, y: pos.y,
        targetX: pos.x, targetY: pos.y,
        action: deskIdx !== null ? "working" : "idle",
        deskIdx,
        speechBubble: deskIdx !== null ? pickRandom(speechOptions.working) : null,
        direction: "right",
        frame: 0,
      };
    });
    setOfficeAgents(initial);
  }, []);

  // Clock
  useEffect(() => {
    let h = 9, m = 0;
    const interval = setInterval(() => {
      m += 5;
      if (m >= 60) { m = 0; h++; }
      if (h > 18) { h = 9; m = 0; }
      setClock(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Light flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        setLightFlicker(true);
        setTimeout(() => setLightFlicker(false), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Agent AI
  useEffect(() => {
    const interval = setInterval(() => {
      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action === "walking") return oa;
        const roll = Math.random();

        if (roll < 0.20 && oa.deskIdx !== null) {
          return { ...oa, action: "working", speechBubble: pickRandom(speechOptions.working) };
        }
        if (roll < 0.30) {
          return { ...oa, action: "walking", targetX: coffeeMachine.x + randomBetween(-2, 2), targetY: coffeeMachine.y, speechBubble: pickRandom(speechOptions.coffee), direction: coffeeMachine.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.40) {
          const chair = pickRandom(meetingChairs);
          return { ...oa, action: "walking", targetX: chair.x, targetY: chair.y, speechBubble: pickRandom(speechOptions.meeting), direction: chair.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.47) {
          return { ...oa, action: "walking", targetX: printer.x, targetY: printer.y, speechBubble: pickRandom(speechOptions.printing), direction: printer.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.54) {
          return { ...oa, action: "walking", targetX: vendingMachine.x + randomBetween(-1, 1), targetY: vendingMachine.y, speechBubble: pickRandom(speechOptions.snacking), direction: vendingMachine.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.60) {
          return { ...oa, action: "walking", targetX: phoneBooth.x, targetY: phoneBooth.y + 2, speechBubble: pickRandom(speechOptions.calling), direction: phoneBooth.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.67) {
          return { ...oa, action: "walking", targetX: waterCooler.x + randomBetween(-2, 2), targetY: waterCooler.y, speechBubble: pickRandom(speechOptions.chatting), direction: waterCooler.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.74) {
          return { ...oa, action: "walking", targetX: whiteboard.x, targetY: whiteboard.y + randomBetween(-3, 3), speechBubble: pickRandom(speechOptions.meeting), direction: whiteboard.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.80) {
          return { ...oa, action: "walking", targetX: sofa.x + randomBetween(-3, 3), targetY: sofa.y, speechBubble: pickRandom(speechOptions.idle), direction: sofa.x > oa.x ? "right" : "left" };
        }
        if (roll < 0.90 && oa.deskIdx !== null) {
          const desk = desks[oa.deskIdx];
          return { ...oa, action: "walking", targetX: desk.x, targetY: desk.y, speechBubble: null, direction: desk.x > oa.x ? "right" : "left" };
        }
        return { ...oa, speechBubble: oa.action === "working" ? pickRandom(speechOptions.working) : pickRandom(speechOptions.idle) };
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Movement tick
  useEffect(() => {
    const tick = setInterval(() => {
      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action !== "walking") return { ...oa, frame: oa.frame + 1 };
        const dx = oa.targetX - oa.x;
        const dy = oa.targetY - oa.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.5) {
          const atDesk = oa.deskIdx !== null && desks[oa.deskIdx] &&
            Math.abs(oa.targetX - desks[oa.deskIdx].x) < 3 && Math.abs(oa.targetY - desks[oa.deskIdx].y) < 3;
          const atCoffee = Math.abs(oa.targetX - coffeeMachine.x) < 5 && Math.abs(oa.targetY - coffeeMachine.y) < 5;
          const atMeeting = meetingChairs.some(c => Math.abs(oa.targetX - c.x) < 4 && Math.abs(oa.targetY - c.y) < 4);
          const atBoard = Math.abs(oa.targetX - whiteboard.x) < 6 && Math.abs(oa.targetY - whiteboard.y) < 6;
          const atVending = Math.abs(oa.targetX - vendingMachine.x) < 4 && Math.abs(oa.targetY - vendingMachine.y) < 5;
          const atPhone = Math.abs(oa.targetX - phoneBooth.x) < 4 && Math.abs(oa.targetY - phoneBooth.y) < 5;
          const atSofa = Math.abs(oa.targetX - sofa.x) < 6 && Math.abs(oa.targetY - sofa.y) < 5;

          let newAction: AgentAction = "idle";
          let bubble: string | null = null;
          if (atDesk) { newAction = "working"; bubble = pickRandom(speechOptions.working); }
          else if (atCoffee) { newAction = "coffee"; bubble = "☕ sipping..."; }
          else if (atMeeting) { newAction = "meeting"; bubble = pickRandom(speechOptions.meeting); }
          else if (atBoard) { newAction = "meeting"; bubble = pickRandom(speechOptions.meeting); }
          else if (atVending) { newAction = "snacking"; bubble = pickRandom(speechOptions.snacking); }
          else if (atPhone) { newAction = "calling"; bubble = pickRandom(speechOptions.calling); }
          else if (atSofa) { newAction = "idle"; bubble = "😌 resting..."; }
          else { bubble = pickRandom(speechOptions.chatting); newAction = "chatting"; }

          return { ...oa, x: oa.targetX, y: oa.targetY, action: newAction, speechBubble: bubble, frame: 0 };
        }

        const speed = 1.1;
        return { ...oa, x: oa.x + (dx / dist) * speed, y: oa.y + (dy / dist) * speed, direction: dx > 0 ? "right" : "left", frame: oa.frame + 1 };
      }));
    }, 60);
    return () => clearInterval(tick);
  }, []);

  const handleAgentClick = (oa: OfficeAgent) => {
    setSelectedAgent(oa);
    setAssignTaskId("");
    setDialogOpen(true);
  };

  const handleAssignTask = () => {
    if (!assignTaskId || !selectedAgent) return;
    setTaskList(prev =>
      prev.map(t =>
        t.id === assignTaskId ? { ...t, assigneeId: selectedAgent.agent.id, status: "in-progress" as const } : t
      )
    );
    setAssignTaskId("");
  };

  const handleSendToDesk = () => {
    if (!selectedAgent) return;
    setOfficeAgents(prev => prev.map(oa => {
      if (oa.agent.id !== selectedAgent.agent.id) return oa;
      if (oa.deskIdx !== null) {
        const desk = desks[oa.deskIdx];
        return { ...oa, action: "walking" as const, targetX: desk.x, targetY: desk.y, speechBubble: "🫡 on it!", direction: desk.x > oa.x ? "right" : "left" };
      }
      return oa;
    }));
    setDialogOpen(false);
  };

  const handleSendToCoffee = () => {
    if (!selectedAgent) return;
    setOfficeAgents(prev => prev.map(oa => {
      if (oa.agent.id !== selectedAgent.agent.id) return oa;
      return { ...oa, action: "walking" as const, targetX: coffeeMachine.x, targetY: coffeeMachine.y, speechBubble: "☕ coffee time!", direction: coffeeMachine.x > oa.x ? "right" : "left" };
    }));
    setDialogOpen(false);
  };

  const handleSendToMeeting = () => {
    if (!selectedAgent) return;
    const chair = pickRandom(meetingChairs);
    setOfficeAgents(prev => prev.map(oa => {
      if (oa.agent.id !== selectedAgent.agent.id) return oa;
      return { ...oa, action: "walking" as const, targetX: chair.x, targetY: chair.y, speechBubble: "📋 heading to meeting", direction: chair.x > oa.x ? "right" : "left" };
    }));
    setDialogOpen(false);
  };

  const agentTasks = selectedAgent
    ? taskList.filter(t => t.assigneeId === selectedAgent.agent.id)
    : [];

  const unassignedTasks = taskList.filter(t => t.status === "todo");

  return (
    <>
      <div className="pixel-border bg-card relative overflow-hidden select-none" style={{ height: 480 }}>
        {/* ===== FLOOR LAYERS ===== */}
        {/* Main floor — wooden tile */}
        <div className="absolute inset-0" style={{
          backgroundColor: "hsl(30 20% 12%)",
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 47px, hsl(30 15% 15%) 47px, hsl(30 15% 15%) 48px),
            repeating-linear-gradient(0deg, transparent, transparent 47px, hsl(30 15% 16%) 47px, hsl(30 15% 16%) 48px)
          `,
        }} />

        {/* Meeting room floor — blue carpet */}
        <div className="absolute" style={{ left: "68%", top: 0, width: "32%", height: "35%", backgroundColor: "hsl(220 20% 14%)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, hsl(220 15% 16%) 4px, hsl(220 15% 16%) 5px)" }} />

        {/* Phone booth floor — dark */}
        <div className="absolute" style={{ left: "57%", top: "8%", width: "10%", height: "18%", backgroundColor: "hsl(240 18% 11%)" }} />

        {/* Pantry/break area floor — warm tile */}
        <div className="absolute" style={{ left: 0, top: "70%", width: "55%", height: "30%", backgroundColor: "hsl(25 15% 11%)", backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 23px, hsl(25 10% 14%) 23px, hsl(25 10% 14%) 24px), repeating-linear-gradient(0deg, transparent, transparent 23px, hsl(25 10% 14%) 23px, hsl(25 10% 14%) 24px)" }} />

        {/* Server room floor — cold */}
        <div className="absolute" style={{ left: "57%", top: "28%", width: "10%", height: "18%", backgroundColor: "hsl(200 20% 10%)" }} />

        {/* Lounge carpet (under sofa) */}
        <div className="absolute rounded-sm" style={{ left: "28%", top: "75%", width: "18%", height: "16%", backgroundColor: "hsl(270 15% 13%)", border: "1px solid hsl(270 10% 18%)" }} />

        {/* ===== WALLS ===== */}
        {/* Meeting room walls */}
        <div className="absolute bg-border" style={{ left: "68%", top: 0, width: "3px", height: "35%" }} />
        <div className="absolute bg-border" style={{ left: "68%", top: "35%", width: "32%", height: "3px" }} />
        {/* Meeting room door gap */}
        <div className="absolute" style={{ left: "68%", top: "24%", width: "3px", height: "8%", backgroundColor: "hsl(30 20% 12%)" }} />

        {/* Phone booth walls */}
        <div className="absolute bg-border" style={{ left: "57%", top: "8%", width: "3px", height: "18%" }} />
        <div className="absolute bg-border" style={{ left: "57%", top: "8%", width: "10%", height: "2px" }} />
        <div className="absolute bg-border" style={{ left: "57%", top: "26%", width: "10%", height: "2px" }} />
        {/* Phone booth door gap */}
        <div className="absolute" style={{ left: "57%", top: "18%", width: "3px", height: "6%", backgroundColor: "hsl(30 20% 12%)" }} />

        {/* Server room walls */}
        <div className="absolute bg-border" style={{ left: "57%", top: "28%", width: "3px", height: "18%" }} />
        <div className="absolute bg-border" style={{ left: "57%", top: "46%", width: "10%", height: "2px" }} />
        {/* Server room door gap */}
        <div className="absolute" style={{ left: "57%", top: "38%", width: "3px", height: "6%", backgroundColor: "hsl(200 20% 10%)" }} />

        {/* Pantry divider */}
        <div className="absolute bg-border" style={{ left: 0, top: "70%", width: "55%", height: "2px" }} />
        {/* Pantry entrance gap */}
        <div className="absolute" style={{ left: "22%", top: "70%", width: "10%", height: "2px", backgroundColor: "hsl(25 15% 11%)" }} />

        {/* Top wall / ceiling gradient */}
        <div className="absolute" style={{ left: 0, top: 0, width: "100%", height: "10%", background: "linear-gradient(180deg, hsl(240 18% 8%), transparent)" }} />
        {/* Bottom baseboard */}
        <div className="absolute bg-border" style={{ left: 0, bottom: 0, width: "100%", height: "3px" }} />

        {/* ===== CEILING LIGHTS ===== */}
        {[15, 35, 55, 82].map((lx, i) => (
          <div key={`light-${i}`} className="absolute flex flex-col items-center" style={{ left: `${lx}%`, top: "1.5%", opacity: lightFlicker && i === 2 ? 0.3 : 1, transition: "opacity 0.1s" }}>
            <div className="w-10 h-1.5 bg-muted-foreground/50 rounded-full" />
            <div className="w-6 h-0.5 bg-accent/30 rounded-full mt-0.5" />
            {/* Light cone on floor */}
            <div className="absolute top-6 w-24 h-40 opacity-[0.05] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(45 100% 85%), transparent)" }} />
          </div>
        ))}

        {/* Pantry lights (warm) */}
        {[12, 38].map((lx, i) => (
          <div key={`pantry-light-${i}`} className="absolute flex flex-col items-center" style={{ left: `${lx}%`, top: "71%" }}>
            <div className="w-8 h-1 bg-accent/30 rounded-full" />
            <div className="absolute top-4 w-16 h-20 opacity-[0.04] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(35 80% 70%), transparent)" }} />
          </div>
        ))}

        {/* ===== ROOM LABELS ===== */}
        <div className="absolute top-2 left-3 font-pixel text-[7px] text-accent/70 z-10">🏢 WORKSPACE</div>
        <div className="absolute top-2 font-pixel text-[7px] text-secondary/70 z-10" style={{ left: "70%" }}>📋 MEETING ROOM</div>
        <div className="absolute font-pixel text-[6px] text-muted-foreground/50 z-10" style={{ left: "58%", top: "9%" }}>📞 BOOTH</div>
        <div className="absolute font-pixel text-[6px] text-primary/40 z-10" style={{ left: "58%", top: "29%" }}>🖥️ SERVER</div>
        <div className="absolute font-pixel text-[7px] text-accent/50 z-10" style={{ left: "3%", top: "71.5%" }}>🍳 PANTRY</div>

        {/* Clock */}
        <div className="absolute top-2 right-3 font-pixel text-[8px] text-primary/80 z-10">
          🕐 {clock}
        </div>

        {/* ===== WORK DESKS ===== */}
        {desks.map((desk, i) => (
          <div key={`desk-${i}`} className="absolute flex flex-col items-center" style={{ left: `${desk.x}%`, top: `${desk.y}%`, transform: "translate(-50%, -50%)" }}>
            {/* Monitor glow */}
            <div className="absolute -top-1 w-8 h-6 opacity-[0.08] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(200 80% 70%), transparent)" }} />
            <div className="w-14 h-7 bg-muted pixel-border flex items-center justify-center relative">
              <span className="text-[10px]">🖥️</span>
              <div className="absolute -bottom-1 w-5 h-1 bg-muted-foreground/30 rounded-sm" />
            </div>
            <div className="flex justify-between w-12 mt-0.5">
              <div className="w-1 h-2 bg-muted-foreground/20" />
              <div className="w-1 h-2 bg-muted-foreground/20" />
            </div>
            {/* Desk lamp */}
            {i % 2 === 0 && (
              <div className="absolute -top-2 -right-2">
                <div className="w-2 h-3 bg-accent/20 rounded-t-sm" />
                <div className="absolute -top-1 w-4 h-2 opacity-[0.15] rounded-full" style={{ background: "radial-gradient(circle, hsl(45 100% 80%), transparent)" }} />
              </div>
            )}
            <div className="absolute -bottom-5 w-5 h-3 bg-secondary/30 pixel-border" style={{ borderWidth: "2px" }} />
          </div>
        ))}

        {/* ===== STANDING DESK ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${standingDesk.x}%`, top: `${standingDesk.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-10 h-12 bg-muted/70 pixel-border flex flex-col items-center justify-start pt-1 relative">
            <span className="text-[8px]">🖥️</span>
            <div className="w-6 h-0.5 bg-muted-foreground/20 mt-1" />
            <div className="absolute -top-2 w-6 h-4 opacity-[0.06] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(200 80% 70%), transparent)" }} />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">STAND</span>
        </div>

        {/* ===== MEETING TABLE ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${meetingTable.x}%`, top: `${meetingTable.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-20 h-14 bg-muted/80 pixel-border flex items-center justify-center relative">
            <span className="text-xs">📊</span>
            {/* Table lamp glow */}
            <div className="absolute w-12 h-8 opacity-[0.06] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(45 80% 75%), transparent)" }} />
          </div>
          {meetingChairs.map((ch, ci) => (
            <div key={`mch-${ci}`} className="absolute w-4 h-4 bg-secondary/20 pixel-border"
              style={{ left: `${(ch.x - meetingTable.x) * 3 + 30}px`, top: `${(ch.y - meetingTable.y) * 3 + 20}px`, borderWidth: "2px" }} />
          ))}
        </div>

        {/* ===== WHITEBOARD ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${whiteboard.x}%`, top: `${whiteboard.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-16 h-10 bg-foreground/10 pixel-border flex flex-col items-center justify-center gap-0.5 p-1">
            <div className="w-10 h-0.5 bg-primary/30" />
            <div className="w-8 h-0.5 bg-accent/30" />
            <div className="w-10 h-0.5 bg-secondary/30" />
            <div className="w-6 h-0.5 bg-primary/20" />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-1">WHITEBOARD</span>
        </div>

        {/* ===== PHONE BOOTH ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${phoneBooth.x}%`, top: `${phoneBooth.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-10 h-14 bg-muted/60 pixel-border flex flex-col items-center justify-center gap-1 relative">
            <span className="text-sm">📞</span>
            <div className="w-5 h-3 bg-card/50 pixel-border flex items-center justify-center" style={{ borderWidth: "1px" }}>
              <span className="text-[6px]">🖥️</span>
            </div>
            {/* Booth light */}
            <div className="absolute -top-1 w-6 h-3 opacity-[0.1]" style={{ background: "radial-gradient(ellipse, hsl(45 60% 70%), transparent)" }} />
          </div>
        </div>

        {/* ===== SERVER RACK ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${serverRack.x}%`, top: `${serverRack.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-10 h-14 bg-muted pixel-border flex flex-col items-center justify-center gap-0.5 relative">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pixel-pulse" />
              <div className="w-1.5 h-1.5 bg-accent/50 rounded-full" />
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pixel-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="w-6 h-1 bg-muted-foreground/20 mt-0.5" />
            <div className="flex gap-0.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pixel-pulse" style={{ animationDelay: "1s" }} />
              <div className="w-1.5 h-1.5 bg-destructive/40 rounded-full" />
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pixel-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
            <div className="w-6 h-1 bg-muted-foreground/20 mt-0.5" />
            {/* Server glow */}
            <div className="absolute w-14 h-18 opacity-[0.04] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(160 80% 60%), transparent)" }} />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">SERVER</span>
        </div>

        {/* ===== PANTRY AREA ===== */}
        {/* Coffee Machine */}
        <div className="absolute flex flex-col items-center" style={{ left: `${coffeeMachine.x}%`, top: `${coffeeMachine.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-10 bg-muted pixel-border flex flex-col items-center justify-center relative">
            <span className="text-sm">☕</span>
            <div className="w-4 h-0.5 bg-accent/40 mt-0.5 animate-pixel-pulse" />
            {/* Steam */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-30">
              <div className="w-0.5 h-2 bg-foreground/20 rounded-full animate-pixel-pulse" />
              <div className="w-0.5 h-3 bg-foreground/15 rounded-full animate-pixel-pulse" style={{ animationDelay: "0.5s" }} />
              <div className="w-0.5 h-2 bg-foreground/20 rounded-full animate-pixel-pulse" style={{ animationDelay: "1s" }} />
            </div>
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">COFFEE</span>
        </div>

        {/* Water Cooler */}
        <div className="absolute flex flex-col items-center" style={{ left: `${waterCooler.x}%`, top: `${waterCooler.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-6 h-9 bg-muted pixel-border flex flex-col items-center justify-center">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "hsl(200 40% 25%)" }} />
            <span className="text-[8px] mt-0.5">💧</span>
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">WATER</span>
        </div>

        {/* Fridge */}
        <div className="absolute flex flex-col items-center" style={{ left: `${fridge.x}%`, top: `${fridge.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-12 bg-muted pixel-border flex flex-col items-center justify-center gap-0.5 relative">
            <div className="w-5 h-4 bg-muted-foreground/10 rounded-sm" />
            <div className="w-0.5 h-5 bg-muted-foreground/20 absolute right-1 top-2" />
            <div className="w-5 h-3 bg-muted-foreground/10 rounded-sm" />
            <span className="text-[6px]">🧊</span>
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">FRIDGE</span>
        </div>

        {/* Microwave */}
        <div className="absolute flex flex-col items-center" style={{ left: `${microwave.x}%`, top: `${microwave.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-6 bg-muted pixel-border flex items-center justify-center relative">
            <div className="w-4 h-3 bg-accent/10 rounded-sm" />
            <div className="absolute right-0.5 flex flex-col gap-0.5">
              <div className="w-1 h-1 bg-primary/30 rounded-full" />
              <div className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
            </div>
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">MICRO</span>
        </div>

        {/* Sink */}
        <div className="absolute flex flex-col items-center" style={{ left: `${sink.x}%`, top: `${sink.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-6 bg-muted pixel-border flex items-center justify-center relative">
            <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: "hsl(200 15% 20%)" }} />
            <div className="absolute -top-2 w-1 h-2 bg-muted-foreground/30 rounded-t-sm" />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">SINK</span>
        </div>

        {/* Vending Machine */}
        <div className="absolute flex flex-col items-center" style={{ left: `${vendingMachine.x}%`, top: `${vendingMachine.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-10 h-14 bg-muted pixel-border flex flex-col items-center justify-center gap-0.5 relative">
            <div className="w-7 h-5 bg-primary/10 pixel-border flex flex-wrap gap-px p-0.5 justify-center" style={{ borderWidth: "1px" }}>
              <div className="w-1.5 h-1.5 bg-destructive/30 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-accent/30 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-primary/30 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-secondary/30 rounded-sm" />
            </div>
            <div className="w-5 h-2 bg-card/30 rounded-sm" />
            {/* Vending light */}
            <div className="absolute w-12 h-16 opacity-[0.04] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(160 60% 60%), transparent)" }} />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">SNACKS</span>
        </div>

        {/* Sofa (larger, more detailed) */}
        <div className="absolute flex flex-col items-center" style={{ left: `${sofa.x}%`, top: `${sofa.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-20 h-7 bg-secondary/20 pixel-border flex items-center justify-center gap-1" style={{ borderWidth: "2px" }}>
            <div className="w-3 h-5 bg-secondary/15 rounded-sm" />
            <div className="w-5 h-3 bg-secondary/10 rounded-sm" />
            <div className="w-5 h-3 bg-secondary/10 rounded-sm" />
            <div className="w-3 h-5 bg-secondary/15 rounded-sm" />
          </div>
          {/* Throw pillows */}
          <div className="absolute -top-1 left-2 w-3 h-2 bg-accent/15 rounded-sm" />
          <div className="absolute -top-1 right-2 w-3 h-2 bg-primary/15 rounded-sm" />
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">LOUNGE</span>
        </div>

        {/* Coffee table */}
        <div className="absolute" style={{ left: `${sofa.x}%`, top: `${sofa.y - 6}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-10 h-4 bg-muted/60 pixel-border flex items-center justify-center" style={{ borderWidth: "1px" }}>
            <span className="text-[6px]">📰</span>
          </div>
        </div>

        {/* ===== PRINTER ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${printer.x}%`, top: `${printer.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-6 bg-muted pixel-border flex items-center justify-center relative">
            <span className="text-xs">🖨️</span>
            <div className="absolute -bottom-1 w-3 h-1 bg-foreground/5" />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">PRINT</span>
        </div>

        {/* ===== FILING CABINETS ===== */}
        {[filingCabinet, filingCabinet2].map((fc, i) => (
          <div key={`fc-${i}`} className="absolute flex flex-col items-center" style={{ left: `${fc.x}%`, top: `${fc.y}%`, transform: "translate(-50%, -50%)" }}>
            <div className="w-6 h-10 bg-muted pixel-border flex flex-col items-center justify-center gap-0.5">
              <div className="w-4 h-2 bg-muted-foreground/10 rounded-sm" />
              <div className="w-1 h-0.5 bg-muted-foreground/30 rounded-full" />
              <div className="w-4 h-2 bg-muted-foreground/10 rounded-sm" />
              <div className="w-1 h-0.5 bg-muted-foreground/30 rounded-full" />
            </div>
            <span className="font-pixel text-[4px] text-muted-foreground mt-0.5">FILES</span>
          </div>
        ))}

        {/* ===== BOOKSHELF ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${bookshelf.x}%`, top: `${bookshelf.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-6 h-16 bg-muted pixel-border flex flex-col items-center justify-center gap-0.5 p-0.5">
            <div className="w-4 h-2 bg-accent/30" />
            <div className="w-4 h-2 bg-primary/20" />
            <div className="w-4 h-2 bg-secondary/30" />
            <div className="w-4 h-2 bg-destructive/15" />
            <div className="w-4 h-2 bg-accent/20" />
          </div>
          <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">📚</span>
        </div>

        {/* ===== RECEPTION ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${receptionDesk.x}%`, top: `${receptionDesk.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-16 h-8 bg-muted pixel-border flex items-center justify-center gap-2 relative">
            <span className="font-pixel text-[5px] text-accent">RECEPTION</span>
            <span className="text-[8px]">🖥️</span>
            {/* Desk lamp */}
            <div className="absolute -top-2 right-1 w-2 h-2 bg-accent/20 rounded-full" />
          </div>
        </div>

        {/* ===== DOOR ===== */}
        <div className="absolute flex flex-col items-center" style={{ left: `${door.x}%`, top: `${door.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-14 bg-muted pixel-border flex flex-col items-center justify-center relative">
            <span className="text-sm">🚪</span>
            <div className="absolute right-1 top-1/2 w-1.5 h-1.5 bg-accent/50 rounded-full" />
            {/* Exit sign glow */}
            <div className="absolute -top-4 w-10 h-3 bg-destructive/10 flex items-center justify-center pixel-border" style={{ borderWidth: "1px" }}>
              <span className="font-pixel text-[4px] text-destructive/60">EXIT</span>
            </div>
          </div>
        </div>

        {/* ===== CORK BOARD ===== */}
        <div className="absolute" style={{ left: `${corkBoard.x}%`, top: `${corkBoard.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-14 h-8 pixel-border flex flex-wrap gap-0.5 p-1 items-start" style={{ backgroundColor: "hsl(30 30% 18%)", borderWidth: "2px" }}>
            <div className="w-3 h-2 bg-accent/30 rounded-sm" />
            <div className="w-4 h-3 bg-primary/20 rounded-sm" />
            <div className="w-3 h-2 bg-secondary/25 rounded-sm" />
            <div className="w-2 h-2 bg-destructive/20 rounded-sm" />
          </div>
        </div>

        {/* ===== AC UNIT ===== */}
        <div className="absolute" style={{ left: `${acUnit.x}%`, top: `${acUnit.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-12 h-4 bg-muted pixel-border flex items-center justify-center relative" style={{ borderWidth: "2px" }}>
            <div className="flex gap-0.5">
              <div className="w-6 h-0.5 bg-muted-foreground/20 rounded-full" />
            </div>
            {/* Cold air effect */}
            <div className="absolute -bottom-4 w-10 h-4 opacity-[0.04]" style={{ background: "linear-gradient(180deg, hsl(200 60% 70%), transparent)" }} />
          </div>
          <span className="font-pixel text-[4px] text-muted-foreground text-center block mt-0.5">A/C</span>
        </div>

        {/* ===== FIRE EXTINGUISHER ===== */}
        <div className="absolute" style={{ left: `${fireExtinguisher.x}%`, top: `${fireExtinguisher.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-3 h-6 bg-destructive/30 pixel-border flex items-center justify-center" style={{ borderWidth: "1px" }}>
            <span className="text-[6px]">🧯</span>
          </div>
        </div>

        {/* ===== PLANTS (more) ===== */}
        {[
          { x: 3, y: 30, emoji: "🌿", size: "text-lg" },
          { x: 3, y: 65, emoji: "🪴", size: "text-lg" },
          { x: 66, y: 12, emoji: "🌱", size: "text-sm" },
          { x: 66, y: 50, emoji: "🌿", size: "text-base" },
          { x: 97, y: 40, emoji: "🪴", size: "text-lg" },
          { x: 97, y: 60, emoji: "🌿", size: "text-base" },
          { x: 50, y: 72, emoji: "🌵", size: "text-lg" },
          { x: 68, y: 90, emoji: "🌴", size: "text-xl" },
        ].map((p, i) => (
          <div key={`plant-${i}`} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}>
            <span className={p.size}>{p.emoji}</span>
          </div>
        ))}

        {/* ===== WALL ART ===== */}
        <div className="absolute" style={{ left: "20%", top: "7%", transform: "translate(-50%, -50%)" }}>
          <div className="w-8 h-6 bg-accent/10 pixel-border flex items-center justify-center" style={{ borderWidth: "2px" }}>
            <span className="text-[8px]">🖼️</span>
          </div>
        </div>
        <div className="absolute" style={{ left: "40%", top: "7%", transform: "translate(-50%, -50%)" }}>
          <div className="w-12 h-5 bg-primary/10 pixel-border flex items-center justify-center" style={{ borderWidth: "2px" }}>
            <span className="font-pixel text-[5px] text-primary/50">OPENCLAW</span>
          </div>
        </div>
        {/* Wall clock */}
        <div className="absolute" style={{ left: "10%", top: "7%", transform: "translate(-50%, -50%)" }}>
          <div className="w-6 h-6 bg-muted pixel-border rounded-full flex items-center justify-center" style={{ borderWidth: "2px" }}>
            <span className="text-[8px]">🕐</span>
          </div>
        </div>

        {/* ===== TV in meeting room ===== */}
        <div className="absolute" style={{ left: "82%", top: "4%", transform: "translate(-50%, 0)" }}>
          <div className="w-14 h-8 bg-card pixel-border flex items-center justify-center relative" style={{ borderColor: "hsl(var(--muted-foreground) / 0.3)" }}>
            <div className="w-10 h-5 bg-primary/10 flex items-center justify-center">
              <span className="font-pixel text-[4px] text-primary/60 animate-pixel-pulse">LIVE</span>
            </div>
            {/* Screen glow */}
            <div className="absolute w-16 h-10 opacity-[0.04] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(200 80% 60%), transparent)" }} />
          </div>
          <div className="w-1 h-2 bg-muted-foreground/20 mx-auto" />
        </div>

        {/* ===== AGENTS ===== */}
        {officeAgents.map((oa) => {
          const isWalking = oa.action === "walking";
          const walkFrame = isWalking ? Math.floor(oa.frame / 4) % 2 : 0;
          return (
            <div
              key={oa.agent.id}
              className="absolute z-20 flex flex-col items-center cursor-pointer group"
              style={{
                left: `${oa.x}%`,
                top: `${oa.y}%`,
                transform: `translate(-50%, -50%) scaleX(${oa.direction === "left" ? -1 : 1})`,
                transition: isWalking ? "none" : "left 0.1s, top 0.1s",
              }}
              onClick={() => handleAgentClick(oa)}
            >
              {/* Shadow */}
              <div className="absolute bottom-0 w-6 h-1.5 rounded-full" style={{ transform: "translateY(8px)", backgroundColor: "hsl(0 0% 0% / 0.2)" }} />

              {/* Hover ring */}
              <div className="absolute inset-0 -m-2 rounded-full border-2 border-primary/0 group-hover:border-primary/50 transition-colors" style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }} />

              {/* Speech bubble */}
              {oa.speechBubble && (
                <div
                  className="absolute -top-9 left-1/2 whitespace-nowrap px-2 py-1 bg-card pixel-border font-pixel text-[6px] text-foreground z-30"
                  style={{ transform: `translateX(-50%) scaleX(${oa.direction === "left" ? -1 : 1})`, borderWidth: "2px" }}
                >
                  <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-card border-r-2 border-b-2 border-border" style={{ transform: "translateX(-50%) rotate(45deg)" }} />
                  {oa.speechBubble}
                </div>
              )}

              {/* Character */}
              <div className="relative flex flex-col items-center" style={{ transform: isWalking ? `translateY(${walkFrame * -2}px)` : "none" }}>
                <span className="text-2xl leading-none group-hover:scale-110 transition-transform" style={{ filter: oa.agent.status === "busy" ? "saturate(0.7)" : "none" }}>
                  {oa.agent.avatar}
                </span>
                <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                  oa.agent.status === "online" ? "bg-primary" : oa.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                } ${oa.agent.status === "online" ? "animate-pixel-pulse" : ""}`} />
              </div>

              {/* Name tag */}
              <span
                className="font-pixel text-[5px] text-primary/80 mt-0.5 whitespace-nowrap bg-card/80 px-1 rounded-sm"
                style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }}
              >
                {oa.agent.name}
              </span>
            </div>
          );
        })}

        {/* Offline agents near door */}
        {agents.filter(a => a.status === "offline").map((agent, i) => (
          <div
            key={agent.id}
            className="absolute z-10 flex flex-col items-center opacity-25 cursor-pointer hover:opacity-40 transition-opacity"
            style={{ left: `${door.x - 8}%`, top: `${door.y - 3 + i * 5}%`, transform: "translate(-50%, -50%)" }}
            onClick={() => {
              setSelectedAgent({
                agent, x: door.x - 8, y: door.y - 3 + i * 5,
                targetX: door.x, targetY: door.y,
                action: "idle", deskIdx: null, speechBubble: null, direction: "right", frame: 0,
              });
              setAssignTaskId("");
              setDialogOpen(true);
            }}
          >
            <span className="text-lg grayscale">{agent.avatar}</span>
            <span className="font-pixel text-[5px] text-muted-foreground">{agent.name}</span>
          </div>
        ))}
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="pixel-border max-w-md bg-card border-border">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-pixel text-sm text-primary flex items-center gap-3">
                  <span className="text-3xl">{selectedAgent.agent.avatar}</span>
                  <div>
                    <div>{selectedAgent.agent.name}</div>
                    <div className="font-pixel-body text-xs text-muted-foreground font-normal mt-0.5">
                      {selectedAgent.agent.specialty}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">Agent details and task management</DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="font-pixel text-[8px] gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedAgent.agent.status === "online" ? "bg-primary" :
                    selectedAgent.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                  }`} />
                  {selectedAgent.agent.status.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="font-pixel text-[8px]">
                  {actionLabel[selectedAgent.action]}
                </Badge>
                <Badge variant="outline" className="font-pixel text-[8px]">
                  {selectedAgent.agent.role.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-4">
                <h3 className="font-pixel text-[8px] text-accent mb-2">⚡ QUICK COMMANDS</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="font-pixel text-[8px] h-7" onClick={handleSendToDesk}>
                    🖥️ Go to Desk
                  </Button>
                  <Button size="sm" variant="outline" className="font-pixel text-[8px] h-7" onClick={handleSendToCoffee}>
                    ☕ Coffee Break
                  </Button>
                  <Button size="sm" variant="outline" className="font-pixel text-[8px] h-7" onClick={handleSendToMeeting}>
                    📋 Join Meeting
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-pixel text-[8px] text-accent mb-2">📋 ASSIGNED TASKS ({agentTasks.length})</h3>
                <ScrollArea className="max-h-[140px]">
                  {agentTasks.length === 0 ? (
                    <p className="font-pixel-body text-xs text-muted-foreground">No tasks assigned</p>
                  ) : (
                    <div className="space-y-1.5">
                      {agentTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 pixel-border" style={{ borderWidth: "2px" }}>
                          <Badge className={`font-pixel text-[6px] ${priorityColor[task.priority]}`}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[7px] text-foreground truncate">{task.title}</p>
                            <p className="font-pixel text-[6px] text-muted-foreground">{task.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {unassignedTasks.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-pixel text-[8px] text-accent mb-2">📌 ASSIGN NEW TASK</h3>
                  <div className="flex gap-2">
                    <Select value={assignTaskId} onValueChange={setAssignTaskId}>
                      <SelectTrigger className="font-pixel text-[8px] h-8 flex-1">
                        <SelectValue placeholder="Select a task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedTasks.map(t => (
                          <SelectItem key={t.id} value={t.id} className="font-pixel text-[8px]">
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="font-pixel text-[8px] h-8"
                      disabled={!assignTaskId}
                      onClick={handleAssignTask}
                    >
                      ASSIGN
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
