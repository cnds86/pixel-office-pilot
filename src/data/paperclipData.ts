import { agents, type Agent } from "./mockData";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export type GovernanceAction = "hire" | "fire" | "pause" | "resume" | "strategy" | "budget";
export type GovernanceStatus = "pending" | "approved" | "rejected";
export type GoalStatus = "on-track" | "at-risk" | "behind" | "completed";

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
