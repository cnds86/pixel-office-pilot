import { useState, useEffect, useRef } from "react";
import { agents, tasks, departmentInfo } from "@/data/mockData";
import type { Agent, Task, Department } from "@/data/mockData";
import { CoffeeSteam, DustInLight, MonitorGlow, AmbientSparkles } from "./OfficeParticles";
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

// ─── Department Room Layout ───
// The office is a wide scrollable canvas (1600x700 virtual px)
// Each department has its own room/zone

interface RoomDef {
  department: Department;
  x: number; y: number; w: number; h: number;
  floorColor: string;
  desks: { x: number; y: number }[];
}

const rooms: RoomDef[] = [
  {
    department: "engineering",
    x: 0, y: 0, w: 380, h: 320,
    floorColor: "hsl(220 18% 13%)",
    desks: [
      { x: 50, y: 80 }, { x: 140, y: 80 }, { x: 230, y: 80 }, { x: 320, y: 80 },
      { x: 50, y: 180 }, { x: 140, y: 180 }, { x: 230, y: 180 }, { x: 320, y: 180 },
    ],
  },
  {
    department: "design",
    x: 400, y: 0, w: 300, h: 320,
    floorColor: "hsl(320 15% 12%)",
    desks: [
      { x: 50, y: 80 }, { x: 150, y: 80 }, { x: 250, y: 80 },
      { x: 50, y: 180 }, { x: 150, y: 180 },
    ],
  },
  {
    department: "qa",
    x: 720, y: 0, w: 280, h: 320,
    floorColor: "hsl(140 12% 12%)",
    desks: [
      { x: 50, y: 80 }, { x: 150, y: 80 },
      { x: 50, y: 180 }, { x: 150, y: 180 }, { x: 230, y: 180 },
    ],
  },
  {
    department: "devops",
    x: 0, y: 340, w: 300, h: 320,
    floorColor: "hsl(30 15% 12%)",
    desks: [
      { x: 50, y: 80 }, { x: 150, y: 80 },
      { x: 50, y: 180 }, { x: 150, y: 180 },
    ],
  },
  {
    department: "product",
    x: 320, y: 340, w: 300, h: 320,
    floorColor: "hsl(270 12% 12%)",
    desks: [
      { x: 50, y: 80 }, { x: 150, y: 80 },
      { x: 50, y: 180 }, { x: 150, y: 180 },
    ],
  },
  {
    department: "support",
    x: 640, y: 340, w: 280, h: 320,
    floorColor: "hsl(50 12% 12%)",
    desks: [
      { x: 50, y: 80 }, { x: 150, y: 80 },
      { x: 50, y: 180 }, { x: 150, y: 180 },
    ],
  },
];

// Shared spaces
const pantry = { x: 940, y: 340, w: 220, h: 320 };
const meetingRoom = { x: 1020, y: 0, w: 220, h: 320 };

const CANVAS_W = 1260;
const CANVAS_H = 680;

type AgentAction = "working" | "walking" | "coffee" | "meeting" | "idle" | "printing" | "chatting" | "snacking" | "calling" | "gone-home" | "panicking" | "celebrating";

// ─── Random Office Events ───
type OfficeEventType = "fire-drill" | "pizza-party" | "server-down" | "birthday" | "surprise-meeting" | "power-outage";

interface OfficeEvent {
  type: OfficeEventType;
  label: string;
  icon: string;
  color: string;
  duration: number; // seconds
  description: string;
  affectedDept?: Department; // if undefined, affects all
}

const officeEvents: OfficeEvent[] = [
  { type: "fire-drill", label: "🔥 FIRE DRILL!", icon: "🚨", color: "hsl(0 85% 55%)", duration: 20, description: "Everyone evacuate! Head to the exit!" },
  { type: "pizza-party", label: "🍕 PIZZA PARTY!", icon: "🎉", color: "hsl(45 100% 60%)", duration: 25, description: "Free pizza in the pantry! Everyone come!" },
  { type: "server-down", label: "💥 SERVER DOWN!", icon: "🔴", color: "hsl(0 80% 45%)", duration: 18, description: "Production servers are down! DevOps to the rescue!", affectedDept: "devops" },
  { type: "birthday", label: "🎂 BIRTHDAY PARTY!", icon: "🎈", color: "hsl(320 70% 55%)", duration: 22, description: "Happy birthday! Cake in the pantry!" },
  { type: "surprise-meeting", label: "📢 ALL-HANDS MEETING!", icon: "📋", color: "hsl(270 60% 55%)", duration: 15, description: "Surprise all-hands! Everyone to the meeting room!" },
  { type: "power-outage", label: "⚡ POWER OUTAGE!", icon: "🔌", color: "hsl(240 20% 30%)", duration: 12, description: "Lights are flickering! Backup power in 10 seconds..." },
];

type TimePhase = "morning" | "day" | "evening" | "night";

function getTimePhase(hour: number): TimePhase {
  if (hour >= 6 && hour < 9) return "morning";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

const phaseOverlay: Record<TimePhase, { bg: string; opacity: number; skyIcon: string; lightIntensity: number }> = {
  morning: { bg: "hsl(30 60% 50%)", opacity: 0.05, skyIcon: "🌅", lightIntensity: 0.04 },
  day: { bg: "transparent", opacity: 0, skyIcon: "☀️", lightIntensity: 0.03 },
  evening: { bg: "hsl(25 80% 30%)", opacity: 0.12, skyIcon: "🌇", lightIntensity: 0.08 },
  night: { bg: "hsl(230 60% 10%)", opacity: 0.25, skyIcon: "🌙", lightIntensity: 0.15 },
};

interface OfficeAgent {
  agent: Agent;
  x: number; y: number;
  targetX: number; targetY: number;
  action: AgentAction;
  deskX: number; deskY: number;
  speechBubble: string | null;
  direction: "left" | "right";
  frame: number;
}

const speechOptions: Record<AgentAction, string[]> = {
  working: ["💻 coding...", "🔧 fixing bug", "📝 writing docs", "🧪 testing...", "⚙️ building...", "📊 analyzing...", "🎯 focusing..."],
  coffee: ["☕ need caffeine!", "☕ brb coffee", "☕ espresso time"],
  meeting: ["📊 reviewing PR", "🗣️ standup!", "📋 sprint planning", "💡 brainstorming"],
  walking: [],
  idle: ["🤔 thinking...", "💭 ...", "📱 checking slack"],
  printing: ["🖨️ printing...", "📄 grabbing docs"],
  chatting: ["😄 haha nice!", "👋 hey!", "🍕 lunch plans?"],
  snacking: ["🍪 cookie time!", "🥤 slurp...", "🌮 taco break"],
  calling: ["📞 on a call...", "🎙️ presenting..."],
  "gone-home": ["🏠 left for today", "👋 bye!"],
  panicking: ["😱 RUN!!", "🚨 EVACUATE!", "😰 oh no!!", "🏃 hurry!"],
  celebrating: ["🎉 woohoo!", "🥳 party!", "🍕 yummy!", "🎊 amazing!", "🎂 cake time!"],
};

const actionLabel: Record<AgentAction, string> = {
  working: "Working", walking: "Walking", coffee: "Coffee break", meeting: "In meeting",
  idle: "Idle", printing: "Printing", chatting: "Chatting", snacking: "Snacking", calling: "On a call",
  "gone-home": "Gone home",
  panicking: "Panicking!",
  celebrating: "Celebrating!",
};

const priorityColor: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function PixelOffice() {
  const [officeAgents, setOfficeAgents] = useState<OfficeAgent[]>([]);
  const [clock, setClock] = useState("09:00");
  const clockHour = parseInt(clock.split(":")[0]);
  const timePhase = getTimePhase(clockHour);
  const phaseInfo = phaseOverlay[timePhase];
  const [selectedAgent, setSelectedAgent] = useState<OfficeAgent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [assignTaskId, setAssignTaskId] = useState<string>("");
  const [activeDept, setActiveDept] = useState<Department | "all">("all");
  const [activeEvent, setActiveEvent] = useState<OfficeEvent | null>(null);
  const [eventTimer, setEventTimer] = useState(0);
  const [eventParticles, setEventParticles] = useState<{ id: number; x: number; y: number; emoji: string; delay: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize agents
  useEffect(() => {
    const initial: OfficeAgent[] = [];
    const deptAgents: Record<string, Agent[]> = {};
    agents.forEach(a => {
      if (a.status === "offline") return;
      if (!deptAgents[a.department]) deptAgents[a.department] = [];
      deptAgents[a.department].push(a);
    });

    for (const room of rooms) {
      const da = deptAgents[room.department] || [];
      da.forEach((agent, i) => {
        const desk = room.desks[i % room.desks.length];
        const ax = room.x + desk.x;
        const ay = room.y + desk.y;
        initial.push({
          agent, x: ax, y: ay, targetX: ax, targetY: ay,
          action: "working", deskX: ax, deskY: ay,
          speechBubble: pickRandom(speechOptions.working),
          direction: "right", frame: 0,
        });
      });
    }
    setOfficeAgents(initial);
  }, []);

  // Clock
  useEffect(() => {
    let h = 9, m = 0;
    const interval = setInterval(() => {
      m += 5;
      if (m >= 60) { m = 0; h++; }
      if (h >= 24) { h = 6; m = 0; }
      setClock(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Agent AI — responds to time of day
  useEffect(() => {
    const interval = setInterval(() => {
      const h = parseInt(clock.split(":")[0]);
      const phase = getTimePhase(h);

      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action === "walking") return oa;

        // Night: all agents gone home
        if (phase === "night") {
          if (oa.action !== "gone-home") {
            return { ...oa, action: "gone-home", speechBubble: pickRandom(speechOptions["gone-home"]) };
          }
          return oa;
        }

        // Morning: agents returning to work
        if (phase === "morning" && oa.action === "gone-home") {
          return { ...oa, action: "walking", targetX: oa.deskX, targetY: oa.deskY, speechBubble: "☕ good morning!", direction: "right" };
        }

        // Evening: some agents start leaving (random chance)
        if (phase === "evening" && oa.action !== "gone-home") {
          const leaveChance = Math.random();
          if (leaveChance < 0.08) {
            return { ...oa, action: "gone-home", speechBubble: pickRandom(speechOptions["gone-home"]) };
          }
        }

        const roll = Math.random();
        const room = rooms.find(r => r.department === oa.agent.department);
        if (!room) return oa;

        // Stay working
        if (roll < 0.25) {
          return { ...oa, action: "working", speechBubble: pickRandom(speechOptions.working) };
        }
        // Go to pantry
        if (roll < 0.35) {
          const tx = pantry.x + randomBetween(30, 180);
          const ty = pantry.y + randomBetween(60, 260);
          return { ...oa, action: "walking", targetX: tx, targetY: ty, speechBubble: pickRandom(speechOptions.coffee), direction: tx > oa.x ? "right" : "left" };
        }
        // Go to meeting room
        if (roll < 0.45) {
          const tx = meetingRoom.x + randomBetween(40, 180);
          const ty = meetingRoom.y + randomBetween(60, 260);
          return { ...oa, action: "walking", targetX: tx, targetY: ty, speechBubble: pickRandom(speechOptions.meeting), direction: tx > oa.x ? "right" : "left" };
        }
        // Walk within own room
        if (roll < 0.55) {
          const tx = room.x + randomBetween(20, room.w - 20);
          const ty = room.y + randomBetween(40, room.h - 20);
          return { ...oa, action: "walking", targetX: tx, targetY: ty, speechBubble: pickRandom(speechOptions.chatting), direction: tx > oa.x ? "right" : "left" };
        }
        // Visit another department
        if (roll < 0.62) {
          const otherRoom = pickRandom(rooms.filter(r => r.department !== oa.agent.department));
          const tx = otherRoom.x + randomBetween(30, otherRoom.w - 30);
          const ty = otherRoom.y + randomBetween(50, otherRoom.h - 30);
          return { ...oa, action: "walking", targetX: tx, targetY: ty, speechBubble: "🚶 visiting...", direction: tx > oa.x ? "right" : "left" };
        }
        // Return to desk
        if (roll < 0.80) {
          return { ...oa, action: "walking", targetX: oa.deskX, targetY: oa.deskY, speechBubble: null, direction: oa.deskX > oa.x ? "right" : "left" };
        }
        return { ...oa, speechBubble: pickRandom(speechOptions.idle) };
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [clock]);

  // Movement
  useEffect(() => {
    const tick = setInterval(() => {
      setOfficeAgents(prev => prev.map(oa => {
        if (oa.action !== "walking") return { ...oa, frame: oa.frame + 1 };
        const dx = oa.targetX - oa.x;
        const dy = oa.targetY - oa.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
          const atDesk = Math.abs(oa.targetX - oa.deskX) < 10 && Math.abs(oa.targetY - oa.deskY) < 10;
          const atPantry = oa.targetX >= pantry.x && oa.targetX <= pantry.x + pantry.w;
          const atMeeting = oa.targetX >= meetingRoom.x && oa.targetX <= meetingRoom.x + meetingRoom.w && oa.targetY < meetingRoom.h;

          let newAction: AgentAction = "idle";
          let bubble: string | null = null;
          if (atDesk) { newAction = "working"; bubble = pickRandom(speechOptions.working); }
          else if (atPantry) { newAction = "coffee"; bubble = pickRandom(speechOptions.snacking); }
          else if (atMeeting) { newAction = "meeting"; bubble = pickRandom(speechOptions.meeting); }
          else { newAction = "chatting"; bubble = pickRandom(speechOptions.chatting); }
          return { ...oa, x: oa.targetX, y: oa.targetY, action: newAction, speechBubble: bubble, frame: 0 };
        }

        const speed = 1.8;
        return { ...oa, x: oa.x + (dx / dist) * speed, y: oa.y + (dy / dist) * speed, direction: dx > 0 ? "right" : "left", frame: oa.frame + 1 };
      }));
    }, 50);
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
      prev.map(t => t.id === assignTaskId ? { ...t, assigneeId: selectedAgent.agent.id, status: "in-progress" as const } : t)
    );
    setAssignTaskId("");
  };

  const sendTo = (tx: number, ty: number, bubble: string) => {
    if (!selectedAgent) return;
    setOfficeAgents(prev => prev.map(oa =>
      oa.agent.id === selectedAgent.agent.id
        ? { ...oa, action: "walking" as const, targetX: tx, targetY: ty, speechBubble: bubble, direction: tx > oa.x ? "right" : "left" }
        : oa
    ));
    setDialogOpen(false);
  };

  const agentTasks = selectedAgent ? taskList.filter(t => t.assigneeId === selectedAgent.agent.id) : [];
  const unassignedTasks = taskList.filter(t => t.status === "todo");

  // Filter for department nav
  const scrollToDept = (dept: Department) => {
    setActiveDept(dept);
    const room = rooms.find(r => r.department === dept);
    if (room && containerRef.current) {
      containerRef.current.scrollTo({ left: room.x - 20, top: room.y - 10, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Department Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => { setActiveDept("all"); containerRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" }); }}
          className={`px-2 py-1 font-pixel text-[7px] pixel-border transition-colors ${activeDept === "all" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
        >
          🏢 ALL
        </button>
        {Object.entries(departmentInfo).map(([dept, info]) => {
          const count = agents.filter(a => a.department === dept && a.status !== "offline").length;
          return (
            <button
              key={dept}
              onClick={() => scrollToDept(dept as Department)}
              className={`px-2 py-1 font-pixel text-[7px] pixel-border transition-colors flex items-center gap-1 ${activeDept === dept ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            >
              {info.icon} {info.label.toUpperCase()}
              <span className="font-pixel text-[6px] opacity-60">({count})</span>
            </button>
          );
        })}
        <div className="ml-auto font-pixel text-[8px] text-primary/80 flex items-center gap-1">
          <span>{phaseInfo.skyIcon}</span> {clock}
          <span className="text-[6px] text-muted-foreground ml-1">
            {timePhase === "morning" ? "MORNING" : timePhase === "day" ? "DAYTIME" : timePhase === "evening" ? "EVENING" : "NIGHT"}
          </span>
        </div>
        <div className="font-pixel text-[7px] text-muted-foreground">
          👥 {officeAgents.filter(a => a.action !== "gone-home").length}/{agents.length} in office
        </div>
      </div>

      {/* Office Canvas Wrapper */}
      <div className="relative" style={{ height: 520 }}>
      {/* Office Canvas */}
      <div
        ref={containerRef}
        className="pixel-border bg-card relative overflow-auto select-none h-full"
      >
        <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H, minWidth: CANVAS_W }}>
          {/* Background */}
          <div className="absolute inset-0" style={{ backgroundColor: "hsl(0 0% 8%)" }} />

          {/* Department Rooms */}
          {rooms.map(room => {
            const info = departmentInfo[room.department];
            return (
              <div key={room.department}>
                {/* Floor */}
                <div
                  className="absolute"
                  style={{
                    left: room.x, top: room.y, width: room.w, height: room.h,
                    backgroundColor: room.floorColor,
                    backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 39px, hsl(0 0% 100% / 0.02) 39px, hsl(0 0% 100% / 0.02) 40px), repeating-linear-gradient(0deg, transparent, transparent 39px, hsl(0 0% 100% / 0.02) 39px, hsl(0 0% 100% / 0.02) 40px)",
                  }}
                />
                {/* Walls */}
                <div className="absolute bg-border" style={{ left: room.x, top: room.y, width: room.w, height: 2 }} />
                <div className="absolute bg-border" style={{ left: room.x, top: room.y, width: 2, height: room.h }} />
                <div className="absolute bg-border" style={{ left: room.x + room.w - 2, top: room.y, width: 2, height: room.h }} />
                <div className="absolute bg-border" style={{ left: room.x, top: room.y + room.h - 2, width: room.w, height: 2 }} />
                {/* Door gap */}
                <div className="absolute" style={{ left: room.x + room.w - 2, top: room.y + room.h / 2 - 25, width: 4, height: 50, backgroundColor: room.floorColor }} />

                {/* Room label */}
                <div className="absolute z-10 flex items-center gap-1.5" style={{ left: room.x + 10, top: room.y + 8 }}>
                  <span className="text-sm">{info.icon}</span>
                  <span className="font-pixel text-[7px]" style={{ color: info.color }}>{info.label.toUpperCase()}</span>
                  <span className="font-pixel text-[6px] text-muted-foreground">
                    ({agents.filter(a => a.department === room.department && a.status !== "offline").length})
                  </span>
                </div>

                {/* Ceiling lights */}
                {[0.3, 0.7].map((pct, li) => {
                  const isLightOn = timePhase === "evening" || timePhase === "night";
                  return (
                    <div key={li} className="absolute" style={{ left: room.x + room.w * pct - 16, top: room.y + 4, width: 32, height: 6 }}>
                      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: isLightOn ? "hsl(45 80% 70% / 0.6)" : "hsl(0 0% 40% / 0.3)" }} />
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-48 rounded-full" style={{ opacity: isLightOn ? phaseInfo.lightIntensity : 0.03, background: `radial-gradient(ellipse, hsl(45 100% 85%), transparent)`, transition: "opacity 1s" }} />
                    </div>
                  );
                })}
                {/* Desks */}
                {room.desks.map((desk, di) => (
                  <div key={di} className="absolute" style={{ left: room.x + desk.x - 22, top: room.y + desk.y - 14 }}>
                    <div className="w-[44px] h-[28px] bg-muted pixel-border flex items-center justify-center relative" style={{ borderWidth: 2 }}>
                      <span className="text-[10px]">🖥️</span>
                      <div className="absolute -top-1 w-8 h-5 opacity-[0.06] rounded-full" style={{ background: "radial-gradient(ellipse, hsl(200 80% 70%), transparent)" }} />
                    </div>
                    <div className="w-[44px] h-[10px] bg-muted/50 pixel-border mt-0.5" style={{ borderWidth: 1 }} />
                  </div>
                ))}

                {/* Whiteboard per room */}
                <div className="absolute" style={{ left: room.x + room.w - 60, top: room.y + 30 }}>
                  <div className="w-[50px] h-[30px] bg-foreground/5 pixel-border flex flex-col items-center justify-center gap-px p-1" style={{ borderWidth: 2 }}>
                    <div className="w-8 h-px" style={{ backgroundColor: info.color, opacity: 0.4 }} />
                    <div className="w-6 h-px bg-muted-foreground/20" />
                    <div className="w-9 h-px" style={{ backgroundColor: info.color, opacity: 0.3 }} />
                  </div>
                </div>

                {/* Plant per room */}
                <div className="absolute" style={{ left: room.x + 8, top: room.y + room.h - 35 }}>
                  <span className="text-lg">🪴</span>
                </div>
              </div>
            );
          })}

          {/* Meeting Room */}
          <div className="absolute" style={{ left: meetingRoom.x, top: meetingRoom.y, width: meetingRoom.w, height: meetingRoom.h, backgroundColor: "hsl(210 20% 14%)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, hsl(0 0% 100% / 0.01) 4px, hsl(0 0% 100% / 0.01) 5px)" }} />
          <div className="absolute bg-border" style={{ left: meetingRoom.x, top: meetingRoom.y, width: meetingRoom.w, height: 2 }} />
          <div className="absolute bg-border" style={{ left: meetingRoom.x, top: meetingRoom.y, width: 2, height: meetingRoom.h }} />
          <div className="absolute bg-border" style={{ left: meetingRoom.x + meetingRoom.w - 2, top: meetingRoom.y, width: 2, height: meetingRoom.h }} />
          <div className="absolute bg-border" style={{ left: meetingRoom.x, top: meetingRoom.y + meetingRoom.h - 2, width: meetingRoom.w, height: 2 }} />
          <div className="absolute" style={{ left: meetingRoom.x - 1, top: meetingRoom.y + 120, width: 4, height: 50, backgroundColor: "hsl(210 20% 14%)" }} />
          <div className="absolute z-10 flex items-center gap-1" style={{ left: meetingRoom.x + 10, top: meetingRoom.y + 8 }}>
            <span className="text-sm">📋</span>
            <span className="font-pixel text-[7px] text-secondary/80">MEETING ROOM</span>
          </div>
          {/* Meeting table */}
          <div className="absolute" style={{ left: meetingRoom.x + 55, top: meetingRoom.y + 100 }}>
            <div className="w-[110px] h-[70px] bg-muted/60 pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
              <span className="text-xl">📊</span>
            </div>
          </div>
          {/* TV */}
          <div className="absolute" style={{ left: meetingRoom.x + 70, top: meetingRoom.y + 20 }}>
            <div className="w-[80px] h-[40px] bg-card pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
              <span className="font-pixel text-[5px] text-primary/50 animate-pixel-pulse">LIVE</span>
            </div>
          </div>

          {/* Pantry */}
          <div className="absolute" style={{ left: pantry.x, top: pantry.y, width: pantry.w, height: pantry.h, backgroundColor: "hsl(25 15% 11%)", backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 23px, hsl(0 0% 100% / 0.02) 23px, hsl(0 0% 100% / 0.02) 24px), repeating-linear-gradient(0deg, transparent, transparent 23px, hsl(0 0% 100% / 0.02) 23px, hsl(0 0% 100% / 0.02) 24px)" }} />
          <div className="absolute bg-border" style={{ left: pantry.x, top: pantry.y, width: pantry.w, height: 2 }} />
          <div className="absolute bg-border" style={{ left: pantry.x, top: pantry.y, width: 2, height: pantry.h }} />
          <div className="absolute bg-border" style={{ left: pantry.x + pantry.w - 2, top: pantry.y, width: 2, height: pantry.h }} />
          <div className="absolute bg-border" style={{ left: pantry.x, top: pantry.y + pantry.h - 2, width: pantry.w, height: 2 }} />
          <div className="absolute" style={{ left: pantry.x - 1, top: pantry.y + 80, width: 4, height: 50, backgroundColor: "hsl(25 15% 11%)" }} />
          <div className="absolute z-10 flex items-center gap-1" style={{ left: pantry.x + 10, top: pantry.y + 8 }}>
            <span className="text-sm">🍳</span>
            <span className="font-pixel text-[7px] text-accent/70">PANTRY & BREAK</span>
          </div>
          {/* Coffee machine */}
          <div className="absolute flex flex-col items-center" style={{ left: pantry.x + 30, top: pantry.y + 60 }}>
            <div className="w-[30px] h-[36px] bg-muted pixel-border flex flex-col items-center justify-center" style={{ borderWidth: 2 }}>
              <span className="text-sm">☕</span>
              <div className="w-4 h-px bg-accent/40 animate-pixel-pulse" />
            </div>
            <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">COFFEE</span>
          </div>
          {/* Vending */}
          <div className="absolute flex flex-col items-center" style={{ left: pantry.x + 80, top: pantry.y + 60 }}>
            <div className="w-[34px] h-[44px] bg-muted pixel-border flex flex-col items-center justify-center gap-0.5" style={{ borderWidth: 2 }}>
              <div className="flex gap-px">
                <div className="w-2 h-2 bg-destructive/20 rounded-sm" />
                <div className="w-2 h-2 bg-accent/20 rounded-sm" />
                <div className="w-2 h-2 bg-primary/20 rounded-sm" />
              </div>
              <div className="w-5 h-2 bg-card/30 rounded-sm" />
            </div>
            <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">SNACKS</span>
          </div>
          {/* Fridge */}
          <div className="absolute flex flex-col items-center" style={{ left: pantry.x + 140, top: pantry.y + 60 }}>
            <div className="w-[28px] h-[40px] bg-muted pixel-border flex items-center justify-center" style={{ borderWidth: 2 }}>
              <span className="text-[8px]">🧊</span>
            </div>
            <span className="font-pixel text-[5px] text-muted-foreground mt-0.5">FRIDGE</span>
          </div>
          {/* Sofa */}
          <div className="absolute" style={{ left: pantry.x + 40, top: pantry.y + 180 }}>
            <div className="w-[120px] h-[28px] bg-secondary/15 pixel-border flex items-center justify-center gap-1" style={{ borderWidth: 2 }}>
              <div className="w-3 h-5 bg-secondary/10 rounded-sm" />
              <div className="w-5 h-3 bg-secondary/8 rounded-sm" />
              <div className="w-5 h-3 bg-secondary/8 rounded-sm" />
              <div className="w-3 h-5 bg-secondary/10 rounded-sm" />
            </div>
            <span className="font-pixel text-[5px] text-muted-foreground mt-0.5 block text-center">LOUNGE</span>
          </div>

          {/* Hallway label */}
          <div className="absolute font-pixel text-[6px] text-muted-foreground/30 z-10" style={{ left: 500, top: 330 }}>
            ─── HALLWAY ───
          </div>

          {/* ===== AMBIENT PARTICLES ===== */}
          {/* Coffee steam from pantry coffee machine */}
          <CoffeeSteam originX={pantry.x + 45} originY={pantry.y + 55} />

          {/* Dust in ceiling light beams */}
          {rooms.map((room, ri) =>
            [0.3, 0.7].map((pct, li) => (
              <DustInLight
                key={`dust-${ri}-${li}`}
                originX={room.x + room.w * pct - 20}
                originY={room.y + 12}
                width={40}
                height={80}
              />
            ))
          )}

          {/* Monitor glow flicker on desks */}
          {rooms.map(room => {
            const info = departmentInfo[room.department];
            return room.desks.map((desk, di) => (
              <MonitorGlow
                key={`glow-${room.department}-${di}`}
                originX={room.x + desk.x}
                originY={room.y + desk.y - 6}
                color={info.color}
              />
            ));
          })}

          {/* General ambient sparkles */}
          <AmbientSparkles canvasW={CANVAS_W} canvasH={CANVAS_H} />

          {/* ===== AGENTS ===== */}
          {officeAgents.filter(oa => oa.action !== "gone-home").map((oa) => {
            const isWalking = oa.action === "walking";
            const walkFrame = isWalking ? Math.floor(oa.frame / 4) % 2 : 0;
            return (
              <div
                key={oa.agent.id}
                className="absolute z-20 flex flex-col items-center cursor-pointer group"
                style={{
                  left: oa.x,
                  top: oa.y,
                  transform: `translate(-50%, -50%) scaleX(${oa.direction === "left" ? -1 : 1})`,
                  transition: isWalking ? "none" : "left 0.05s, top 0.05s",
                }}
                onClick={() => handleAgentClick(oa)}
              >
                {/* Shadow */}
                <div className="absolute bottom-0 w-5 h-1 rounded-full" style={{ transform: "translateY(8px)", backgroundColor: "hsl(0 0% 0% / 0.3)" }} />

                {/* Hover ring */}
                <div className="absolute inset-0 -m-2 rounded-full border-2 border-primary/0 group-hover:border-primary/50 transition-colors" style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }} />

                {/* Speech bubble */}
                {oa.speechBubble && (
                  <div
                    className="absolute -top-8 left-1/2 whitespace-nowrap px-1.5 py-0.5 bg-card pixel-border font-pixel text-[5px] text-foreground z-30"
                    style={{ transform: `translateX(-50%) scaleX(${oa.direction === "left" ? -1 : 1})`, borderWidth: 2 }}
                  >
                    {oa.speechBubble}
                  </div>
                )}

                {/* Character */}
                <div className="relative flex flex-col items-center" style={{ transform: isWalking ? `translateY(${walkFrame * -2}px)` : "none" }}>
                  <span className="text-xl leading-none group-hover:scale-110 transition-transform">
                    {oa.agent.avatar}
                  </span>
                  <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    oa.agent.status === "online" ? "bg-primary" : oa.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                  }`} />
                </div>

                {/* Name tag */}
                <span
                  className="font-pixel text-[4px] text-primary/70 mt-0.5 whitespace-nowrap bg-card/80 px-0.5 rounded-sm"
                  style={{ transform: `scaleX(${oa.direction === "left" ? -1 : 1})` }}
                >
                  {oa.agent.name}
                </span>
              </div>
            );
          })}

          {/* Offline agents */}
          {agents.filter(a => a.status === "offline").map((agent, i) => {
            const room = rooms.find(r => r.department === agent.department);
            if (!room) return null;
            return (
              <div
                key={agent.id}
                className="absolute z-10 flex flex-col items-center opacity-20 cursor-pointer hover:opacity-40 transition-opacity"
                style={{ left: room.x + room.w - 30, top: room.y + room.h - 40 - i * 30 }}
                onClick={() => {
                  setSelectedAgent({
                    agent, x: room.x + room.w - 30, y: room.y + room.h - 40,
                    targetX: room.x + room.w - 30, targetY: room.y + room.h - 40,
                    action: "idle", deskX: room.x + 50, deskY: room.y + 80,
                    speechBubble: null, direction: "right", frame: 0,
                  });
                  setAssignTaskId("");
                  setDialogOpen(true);
                }}
              >
                <span className="text-sm grayscale">{agent.avatar}</span>
                <span className="font-pixel text-[4px] text-muted-foreground">{agent.name}</span>
              </div>
            );
          })}

          {/* Day/Night overlay */}
          {phaseInfo.opacity > 0 && (
            <div
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                backgroundColor: phaseInfo.bg,
                opacity: phaseInfo.opacity,
                transition: "background-color 2s, opacity 2s",
                mixBlendMode: "multiply",
              }}
            />
          )}

          {/* Stars at night */}
          {timePhase === "night" && (
            <div className="absolute inset-0 pointer-events-none z-35">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-sparkle"
                  style={{
                    left: `${5 + (i * 47) % 90}%`,
                    top: `${3 + (i * 31) % 15}%`,
                    width: 2,
                    height: 2,
                    backgroundColor: "hsl(45 80% 90% / 0.4)",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Mini Map - inside wrapper, outside scroll */}
        <div
          className="absolute bottom-4 right-4 z-50 pixel-border bg-card/90 backdrop-blur-sm p-1.5 cursor-pointer"
          style={{ width: 180, height: 100 }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left - 6) / (180 - 12)) * CANVAS_W;
            const clickY = ((e.clientY - rect.top - 6) / (100 - 12)) * CANVAS_H;
            containerRef.current?.scrollTo({
              left: clickX - containerRef.current.clientWidth / 2,
              top: clickY - containerRef.current.clientHeight / 2,
              behavior: "smooth",
            });
          }}
        >
          <div className="font-pixel text-[5px] text-muted-foreground mb-0.5">🗺️ MINIMAP</div>
          <div className="relative w-full" style={{ height: 82 }}>
            {rooms.map(room => {
              const info = departmentInfo[room.department];
              const scaleX = (180 - 12) / CANVAS_W;
              const scaleY = 82 / CANVAS_H;
              return (
                <div
                  key={room.department}
                  className="absolute border border-border/50"
                  style={{
                    left: room.x * scaleX,
                    top: room.y * scaleY,
                    width: room.w * scaleX,
                    height: room.h * scaleY,
                    backgroundColor: room.floorColor,
                    opacity: 0.7,
                  }}
                >
                  <span className="font-pixel text-[3px] absolute top-px left-px" style={{ color: info.color }}>
                    {info.icon}
                  </span>
                </div>
              );
            })}
            {[meetingRoom, pantry].map((space, i) => {
              const scaleX = (180 - 12) / CANVAS_W;
              const scaleY = 82 / CANVAS_H;
              return (
                <div
                  key={i}
                  className="absolute border border-border/30"
                  style={{
                    left: space.x * scaleX,
                    top: space.y * scaleY,
                    width: space.w * scaleX,
                    height: space.h * scaleY,
                    backgroundColor: "hsl(210 15% 15%)",
                    opacity: 0.5,
                  }}
                />
              );
            })}
            {officeAgents.map(oa => {
              const scaleX = (180 - 12) / CANVAS_W;
              const scaleY = 82 / CANVAS_H;
              const dotColor = oa.agent.status === "online" ? "hsl(var(--primary))" : "hsl(var(--accent))";
              return (
                <div
                  key={oa.agent.id}
                  className={`absolute rounded-full ${oa.action === "walking" ? "animate-pixel-pulse" : ""}`}
                  style={{
                    left: oa.x * scaleX - 1.5,
                    top: oa.y * scaleY - 1.5,
                    width: 3,
                    height: 3,
                    backgroundColor: dotColor,
                    transition: "left 0.05s, top 0.05s",
                  }}
                />
              );
            })}
            {containerRef.current && (() => {
              const scaleX = (180 - 12) / CANVAS_W;
              const scaleY = 82 / CANVAS_H;
              const el = containerRef.current!;
              return (
                <div
                  className="absolute border border-primary/60 rounded-sm pointer-events-none"
                  style={{
                    left: el.scrollLeft * scaleX,
                    top: el.scrollTop * scaleY,
                    width: el.clientWidth * scaleX,
                    height: el.clientHeight * scaleY,
                  }}
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* Agent Dialog */}
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
                      {selectedAgent.agent.specialty} • {departmentInfo[selectedAgent.agent.department].icon} {departmentInfo[selectedAgent.agent.department].label}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">Agent details and task management</DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="font-pixel text-[7px] gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedAgent.agent.status === "online" ? "bg-primary" :
                    selectedAgent.agent.status === "busy" ? "bg-accent" : "bg-muted-foreground"
                  }`} />
                  {selectedAgent.agent.status.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="font-pixel text-[7px]">
                  {actionLabel[selectedAgent.action]}
                </Badge>
                <Badge variant="outline" className="font-pixel text-[7px]">
                  {selectedAgent.agent.role.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-3">
                <h3 className="font-pixel text-[7px] text-accent mb-2">⚡ QUICK COMMANDS</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                    onClick={() => sendTo(selectedAgent.deskX, selectedAgent.deskY, "🫡 on it!")}>
                    🖥️ Desk
                  </Button>
                  <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                    onClick={() => sendTo(pantry.x + randomBetween(30, 150), pantry.y + randomBetween(60, 200), "☕ coffee time!")}>
                    ☕ Pantry
                  </Button>
                  <Button size="sm" variant="outline" className="font-pixel text-[7px] h-6"
                    onClick={() => sendTo(meetingRoom.x + randomBetween(50, 150), meetingRoom.y + randomBetween(80, 200), "📋 meeting!")}>
                    📋 Meeting
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-pixel text-[7px] text-accent mb-2">📋 TASKS ({agentTasks.length})</h3>
                <ScrollArea className="max-h-[120px]">
                  {agentTasks.length === 0 ? (
                    <p className="font-pixel-body text-xs text-muted-foreground">No tasks assigned</p>
                  ) : (
                    <div className="space-y-1">
                      {agentTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-1.5 bg-muted/50 pixel-border" style={{ borderWidth: 2 }}>
                          <Badge className={`font-pixel text-[5px] ${priorityColor[task.priority]}`}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-pixel text-[6px] text-foreground truncate">{task.title}</p>
                            <p className="font-pixel text-[5px] text-muted-foreground">{task.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {unassignedTasks.length > 0 && (
                <div className="mt-3">
                  <h3 className="font-pixel text-[7px] text-accent mb-1">📌 ASSIGN TASK</h3>
                  <div className="flex gap-2">
                    <Select value={assignTaskId} onValueChange={setAssignTaskId}>
                      <SelectTrigger className="font-pixel text-[7px] h-7 flex-1">
                        <SelectValue placeholder="Select task..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedTasks.map(t => (
                          <SelectItem key={t.id} value={t.id} className="font-pixel text-[7px]">{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="font-pixel text-[7px] h-7" disabled={!assignTaskId} onClick={handleAssignTask}>
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
