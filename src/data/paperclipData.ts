import { agents, type Agent } from "./mockData";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export type GovernanceAction = "hire" | "fire" | "pause" | "resume" | "strategy" | "budget";
export type GovernanceStatus = "pending" | "approved" | "rejected";
export type GoalStatus = "on-track" | "at-risk" | "behind" | "completed";
export type HeartbeatStatus = "alive" | "warning" | "dead";
export type TicketStatus = "open" | "in-progress" | "resolved" | "escalated";
export type TicketPriority = "critical" | "high" | "medium" | "low";

export interface OrgNode {
  agentId: string;
  title: string;
  reportsTo: string | null;
  level: number;
  children: string[];
}

export interface BudgetEntry {
  agentId: string;
  monthlyBudget: number;
  spent: number;
  currency: string;
  paused: boolean;
  history: { month: string; spent: number }[];
}

export interface GovernanceProposal {
  id: string;
  action: GovernanceAction;
  targetAgentId: string;
  proposedBy: string;
  reason: string;
  status: GovernanceStatus;
  createdAt: string;
  decidedAt?: string;
  votes: { agentId: string; vote: "approve" | "reject" }[];
}

export interface CompanyGoal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number;
  parentGoalId: string | null;
  assignedAgentIds: string[];
  linkedTaskIds: string[];
  deadline: string;
}

export interface CompanyMission {
  name: string;
  mission: string;
  vision: string;
  goals: CompanyGoal[];
}

// ═══════════════════════════════════════
// Heartbeat Types
// ═══════════════════════════════════════

export interface Heartbeat {
  agentId: string;
  lastBeat: string; // ISO timestamp
  nextScheduled: string; // ISO timestamp
  status: HeartbeatStatus;
  responseTimeMs: number;
  uptimePercent: number;
  beatHistory: { time: string; ok: boolean }[];
}

// ═══════════════════════════════════════
// Ticket Types
// ═══════════════════════════════════════

export interface ToolCall {
  id: string;
  tool: string;
  input: string;
  output: string;
  timestamp: string;
  durationMs: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string; // agentId or "user"
  assignedTo: string; // agentId
  createdAt: string;
  updatedAt: string;
  conversation: { role: "user" | "agent"; agentId?: string; content: string; timestamp: string }[];
  toolCalls: ToolCall[];
  decision?: string;
  resolution?: string;
}

// ═══════════════════════════════════════
// Agent Coordination Types
// ═══════════════════════════════════════

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  timestamp: string;
  type: "request" | "response" | "delegation" | "notification";
}

export interface TaskDelegation {
  id: string;
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected" | "completed";
}

// ═══════════════════════════════════════
// Multi-Company Types
// ═══════════════════════════════════════

export interface Company {
  id: string;
  name: string;
  logo: string;
  mission: string;
  agentCount: number;
  activeTickets: number;
  monthlyBudget: number;
}

// ═══════════════════════════════════════
// Mock: Companies
// ═══════════════════════════════════════

export const companies: Company[] = [
  { id: "c1", name: "OpenClaw Corp", logo: "🦀", mission: "Build the most effective autonomous AI dev team", agentCount: 18, activeTickets: 12, monthlyBudget: 5000 },
  { id: "c2", name: "PixelForge Studios", logo: "🎨", mission: "AI-powered design automation", agentCount: 8, activeTickets: 5, monthlyBudget: 2500 },
  { id: "c3", name: "CloudNine AI", logo: "☁️", mission: "Autonomous infrastructure management", agentCount: 12, activeTickets: 8, monthlyBudget: 4000 },
];

// ═══════════════════════════════════════
// Mock: Org Chart
// ═══════════════════════════════════════

export const orgChart: OrgNode[] = [
  { agentId: "h1", title: "CEO / Project Lead", reportsTo: null, level: 0, children: ["h15", "a8"] },
  { agentId: "h15", title: "VP Product", reportsTo: "h1", level: 1, children: ["a16", "h16"] },
  { agentId: "a8", title: "CTO / Architect", reportsTo: "h1", level: 1, children: ["a1", "a2", "a5", "a3"] },
  { agentId: "a1", title: "Lead Engineer", reportsTo: "a8", level: 2, children: ["h2", "h3", "h9", "a6", "a7"] },
  { agentId: "a2", title: "Design Lead", reportsTo: "a8", level: 2, children: ["a10", "a11", "h10", "h11"] },
  { agentId: "a5", title: "DevOps Lead", reportsTo: "a8", level: 2, children: ["a14", "a15", "h14"] },
  { agentId: "a3", title: "QA Lead", reportsTo: "a8", level: 2, children: ["a12", "a13", "h12", "h13"] },
  { agentId: "a16", title: "Product Strategist", reportsTo: "h15", level: 2, children: [] },
  { agentId: "h16", title: "Technical Writer", reportsTo: "h15", level: 2, children: [] },
  { agentId: "h2", title: "Frontend Dev", reportsTo: "a1", level: 3, children: [] },
  { agentId: "h3", title: "Backend Dev", reportsTo: "a1", level: 3, children: [] },
  { agentId: "h9", title: "Full Stack Dev", reportsTo: "a1", level: 3, children: [] },
  { agentId: "a6", title: "Code Reviewer", reportsTo: "a1", level: 3, children: [] },
  { agentId: "a7", title: "Optimizer", reportsTo: "a1", level: 3, children: [] },
  { agentId: "a10", title: "Visual Designer", reportsTo: "a2", level: 3, children: [] },
  { agentId: "a11", title: "Layout Engineer", reportsTo: "a2", level: 3, children: [] },
  { agentId: "h10", title: "UX Researcher", reportsTo: "a2", level: 3, children: [] },
  { agentId: "h11", title: "Motion Designer", reportsTo: "a2", level: 3, children: [] },
  { agentId: "a14", title: "Cloud Architect", reportsTo: "a5", level: 3, children: [] },
  { agentId: "a15", title: "Monitoring Eng", reportsTo: "a5", level: 3, children: [] },
  { agentId: "h14", title: "SRE", reportsTo: "a5", level: 3, children: [] },
  { agentId: "a12", title: "Bug Hunter", reportsTo: "a3", level: 3, children: [] },
  { agentId: "a13", title: "Load Tester", reportsTo: "a3", level: 3, children: [] },
  { agentId: "h12", title: "QA Engineer", reportsTo: "a3", level: 3, children: [] },
  { agentId: "h13", title: "Automation Eng", reportsTo: "a3", level: 3, children: [] },
  { agentId: "a17", title: "Support Lead", reportsTo: "h1", level: 1, children: ["a18", "h17", "h18"] },
  { agentId: "a18", title: "Ticket Triage", reportsTo: "a17", level: 2, children: [] },
  { agentId: "h17", title: "Support Eng", reportsTo: "a17", level: 2, children: [] },
  { agentId: "h18", title: "Customer Success", reportsTo: "a17", level: 2, children: [] },
];

// ═══════════════════════════════════════
// Mock: Budgets
// ═══════════════════════════════════════

const budgetAgents = ["a1","a2","a3","a5","a6","a7","a8","a10","a11","a12","a13","a14","a15","a16","a17","a18"];

export const budgets: BudgetEntry[] = budgetAgents.map(id => {
  const budget = Math.floor(Math.random() * 400 + 100);
  const spent = Math.floor(Math.random() * budget * 1.1);
  return {
    agentId: id,
    monthlyBudget: budget,
    spent,
    currency: "USD",
    paused: spent > budget,
    history: [
      { month: "Jan", spent: Math.floor(Math.random() * budget) },
      { month: "Feb", spent: Math.floor(Math.random() * budget) },
      { month: "Mar", spent },
    ],
  };
});

// ═══════════════════════════════════════
// Mock: Governance
// ═══════════════════════════════════════

export const proposals: GovernanceProposal[] = [
  {
    id: "gov1", action: "hire", targetAgentId: "a1", proposedBy: "h1",
    reason: "Need additional code generation capacity for Q2 sprint",
    status: "pending", createdAt: "2026-03-06T10:00:00",
    votes: [{ agentId: "h15", vote: "approve" }],
  },
  {
    id: "gov2", action: "pause", targetAgentId: "a7", proposedBy: "a8",
    reason: "ByteCrunch exceeded budget by 40% — pausing until review",
    status: "approved", createdAt: "2026-03-04T14:30:00", decidedAt: "2026-03-05T09:00:00",
    votes: [{ agentId: "h1", vote: "approve" }, { agentId: "h15", vote: "approve" }],
  },
  {
    id: "gov3", action: "strategy", targetAgentId: "a16", proposedBy: "h15",
    reason: "Shift Q2 roadmap focus to mobile-first approach",
    status: "pending", createdAt: "2026-03-07T08:00:00",
    votes: [],
  },
  {
    id: "gov4", action: "fire", targetAgentId: "a4", proposedBy: "a8",
    reason: "DocWriter has been offline for 2 weeks — recommend termination",
    status: "rejected", createdAt: "2026-03-02T11:00:00", decidedAt: "2026-03-03T16:00:00",
    votes: [{ agentId: "h1", vote: "reject" }, { agentId: "h15", vote: "reject" }],
  },
  {
    id: "gov5", action: "budget", targetAgentId: "a14", proposedBy: "a5",
    reason: "Request budget increase for CloudGuard — cloud costs rising",
    status: "pending", createdAt: "2026-03-08T07:00:00",
    votes: [{ agentId: "a8", vote: "approve" }],
  },
];

// ═══════════════════════════════════════
// Mock: Goals & Mission
// ═══════════════════════════════════════

export const companyMission: CompanyMission = {
  name: "OpenClaw Corp",
  mission: "Build the most effective autonomous AI development team",
  vision: "A world where AI agents and humans collaborate seamlessly to ship great software",
  goals: [
    {
      id: "g1", title: "Ship v1.0 by June", description: "Complete all core features and stabilize for launch",
      status: "on-track", progress: 62, parentGoalId: null,
      assignedAgentIds: ["h1", "a8"], linkedTaskIds: ["t1", "t2", "t5", "t8"],
      deadline: "2026-06-01",
    },
    {
      id: "g2", title: "100% Test Coverage", description: "All modules covered by unit + integration tests",
      status: "at-risk", progress: 47, parentGoalId: "g1",
      assignedAgentIds: ["a3", "a12", "h12"], linkedTaskIds: ["t3", "t10", "t12"],
      deadline: "2026-05-01",
    },
    {
      id: "g3", title: "Design System Complete", description: "Finalize all tokens, components, and documentation",
      status: "on-track", progress: 75, parentGoalId: "g1",
      assignedAgentIds: ["a2", "a10", "a11"], linkedTaskIds: ["t2", "t11"],
      deadline: "2026-04-15",
    },
    {
      id: "g4", title: "Zero Downtime Deploys", description: "Achieve rolling deployments with zero downtime",
      status: "behind", progress: 30, parentGoalId: "g1",
      assignedAgentIds: ["a5", "a14", "h14"], linkedTaskIds: ["t5", "t13"],
      deadline: "2026-04-30",
    },
    {
      id: "g5", title: "Agent Cost < $2K/mo", description: "Keep total agent operational cost under $2,000/month",
      status: "at-risk", progress: 55, parentGoalId: null,
      assignedAgentIds: ["h1", "h15"], linkedTaskIds: [],
      deadline: "2026-03-31",
    },
    {
      id: "g6", title: "Customer Onboarding Flow", description: "Build smooth self-serve onboarding experience",
      status: "on-track", progress: 40, parentGoalId: "g1",
      assignedAgentIds: ["a17", "h10", "h18"], linkedTaskIds: ["t7", "t14"],
      deadline: "2026-05-15",
    },
  ],
};

// ═══════════════════════════════════════
// Mock: Heartbeats
// ═══════════════════════════════════════

const now = new Date();
const agentIds = agents.filter(a => a.role === "agent").map(a => a.id);

export const heartbeats: Heartbeat[] = agentIds.map(id => {
  const agent = agents.find(a => a.id === id)!;
  const isOnline = agent.status === "online";
  const isBusy = agent.status === "busy";
  const lastBeatOffset = isOnline ? Math.floor(Math.random() * 60) : (isBusy ? Math.floor(Math.random() * 300) : Math.floor(Math.random() * 3600));
  const lastBeat = new Date(now.getTime() - lastBeatOffset * 1000);
  const nextScheduled = new Date(lastBeat.getTime() + 60000);
  const status: HeartbeatStatus = isOnline ? "alive" : (isBusy ? "warning" : "dead");
  
  return {
    agentId: id,
    lastBeat: lastBeat.toISOString(),
    nextScheduled: nextScheduled.toISOString(),
    status,
    responseTimeMs: Math.floor(Math.random() * 200 + 50),
    uptimePercent: status === "alive" ? 99 + Math.random() : (status === "warning" ? 85 + Math.random() * 10 : 50 + Math.random() * 30),
    beatHistory: Array.from({ length: 10 }, (_, i) => ({
      time: new Date(now.getTime() - (i + 1) * 60000).toISOString(),
      ok: status !== "dead" || i < 5,
    })),
  };
});

// ═══════════════════════════════════════
// Mock: Tickets
// ═══════════════════════════════════════

export const tickets: Ticket[] = [
  {
    id: "tkt1",
    title: "Optimize database queries",
    description: "Several API endpoints are slow due to N+1 queries",
    status: "in-progress",
    priority: "high",
    createdBy: "user",
    assignedTo: "a1",
    createdAt: "2026-03-07T09:00:00",
    updatedAt: "2026-03-08T14:30:00",
    conversation: [
      { role: "user", content: "API response times are over 2 seconds", timestamp: "2026-03-07T09:00:00" },
      { role: "agent", agentId: "a1", content: "I'll analyze the query patterns. Found 3 N+1 issues.", timestamp: "2026-03-07T09:05:00" },
      { role: "agent", agentId: "a1", content: "Implementing eager loading for user relations.", timestamp: "2026-03-08T14:30:00" },
    ],
    toolCalls: [
      { id: "tc1", tool: "query_analyzer", input: "SELECT * FROM users", output: "N+1 detected: 47 additional queries", timestamp: "2026-03-07T09:02:00", durationMs: 150 },
      { id: "tc2", tool: "code_edit", input: "user.repository.ts:45", output: "Added .include({ relations: true })", timestamp: "2026-03-08T14:28:00", durationMs: 320 },
    ],
    decision: "Implement eager loading pattern",
  },
  {
    id: "tkt2",
    title: "Design login page",
    description: "Create pixel-art style login form",
    status: "resolved",
    priority: "medium",
    createdBy: "h15",
    assignedTo: "a2",
    createdAt: "2026-03-05T10:00:00",
    updatedAt: "2026-03-06T16:00:00",
    conversation: [
      { role: "user", content: "Need a retro pixel-art login page", timestamp: "2026-03-05T10:00:00" },
      { role: "agent", agentId: "a2", content: "Creating mockup with 8-bit aesthetic", timestamp: "2026-03-05T10:15:00" },
      { role: "agent", agentId: "a2", content: "Design complete. Ready for review.", timestamp: "2026-03-06T16:00:00" },
    ],
    toolCalls: [
      { id: "tc3", tool: "figma_export", input: "login-page-v1", output: "Exported to /designs/login.png", timestamp: "2026-03-06T15:55:00", durationMs: 1200 },
    ],
    decision: "Approved pixel-art style",
    resolution: "Design delivered and approved",
  },
  {
    id: "tkt3",
    title: "Critical: Auth token leak",
    description: "Tokens exposed in client-side logs",
    status: "escalated",
    priority: "critical",
    createdBy: "a12",
    assignedTo: "a8",
    createdAt: "2026-03-08T08:00:00",
    updatedAt: "2026-03-08T08:30:00",
    conversation: [
      { role: "agent", agentId: "a12", content: "Found auth tokens in browser console logs", timestamp: "2026-03-08T08:00:00" },
      { role: "agent", agentId: "a8", content: "Escalating to security review. Pausing deployment.", timestamp: "2026-03-08T08:15:00" },
    ],
    toolCalls: [
      { id: "tc4", tool: "security_scan", input: "auth-module", output: "CRITICAL: Token exposure in debug logs", timestamp: "2026-03-08T08:05:00", durationMs: 450 },
    ],
  },
  {
    id: "tkt4",
    title: "Add dark mode toggle",
    description: "User requested dark/light mode switch",
    status: "open",
    priority: "low",
    createdBy: "user",
    assignedTo: "a10",
    createdAt: "2026-03-08T11:00:00",
    updatedAt: "2026-03-08T11:00:00",
    conversation: [
      { role: "user", content: "Please add a dark mode toggle in settings", timestamp: "2026-03-08T11:00:00" },
    ],
    toolCalls: [],
  },
];

// ═══════════════════════════════════════
// Mock: Agent Messages
// ═══════════════════════════════════════

export const agentMessages: AgentMessage[] = [
  { id: "am1", fromAgentId: "a8", toAgentId: "a1", content: "Review the new API design doc before standup", timestamp: "2026-03-08T09:00:00", type: "request" },
  { id: "am2", fromAgentId: "a1", toAgentId: "a8", content: "Done. Left comments on section 3.", timestamp: "2026-03-08T09:30:00", type: "response" },
  { id: "am3", fromAgentId: "a1", toAgentId: "a6", content: "Please review PR #127 for auth module", timestamp: "2026-03-08T10:00:00", type: "delegation" },
  { id: "am4", fromAgentId: "a3", toAgentId: "a12", content: "New test coverage report ready", timestamp: "2026-03-08T10:15:00", type: "notification" },
  { id: "am5", fromAgentId: "a5", toAgentId: "a14", content: "Staging deployment failed. Need infra review.", timestamp: "2026-03-08T10:30:00", type: "request" },
  { id: "am6", fromAgentId: "a14", toAgentId: "a5", content: "On it. Checking CloudWatch logs.", timestamp: "2026-03-08T10:35:00", type: "response" },
  { id: "am7", fromAgentId: "a2", toAgentId: "a10", content: "Delegate icon set creation to you", timestamp: "2026-03-08T11:00:00", type: "delegation" },
  { id: "am8", fromAgentId: "a17", toAgentId: "a18", content: "5 new support tickets need triage", timestamp: "2026-03-08T11:15:00", type: "notification" },
];

// ═══════════════════════════════════════
// Mock: Task Delegations
// ═══════════════════════════════════════

export const taskDelegations: TaskDelegation[] = [
  { id: "td1", taskId: "t3", fromAgentId: "a3", toAgentId: "a12", reason: "BugHunter has capacity", timestamp: "2026-03-07T14:00:00", status: "completed" },
  { id: "td2", taskId: "t11", fromAgentId: "a2", toAgentId: "a10", reason: "Visual design expertise needed", timestamp: "2026-03-08T09:00:00", status: "accepted" },
  { id: "td3", taskId: "t13", fromAgentId: "a5", toAgentId: "a14", reason: "Cloud infrastructure task", timestamp: "2026-03-08T10:00:00", status: "pending" },
];

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

export function getOrgNode(agentId: string): OrgNode | undefined {
  return orgChart.find(n => n.agentId === agentId);
}

export function getAgentBudget(agentId: string): BudgetEntry | undefined {
  return budgets.find(b => b.agentId === agentId);
}

export function getSubordinates(agentId: string): OrgNode[] {
  const node = getOrgNode(agentId);
  if (!node) return [];
  return node.children.map(id => getOrgNode(id)).filter(Boolean) as OrgNode[];
}

export function getHeartbeat(agentId: string): Heartbeat | undefined {
  return heartbeats.find(h => h.agentId === agentId);
}

export function getAgentTickets(agentId: string): Ticket[] {
  return tickets.filter(t => t.assignedTo === agentId);
}

export function getAgentMessages(agentId: string): AgentMessage[] {
  return agentMessages.filter(m => m.fromAgentId === agentId || m.toAgentId === agentId);
}
