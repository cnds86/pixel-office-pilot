import { agents } from "./mockData";

// ═══════════════════════════════════════
// Activity Feed Types
// ═══════════════════════════════════════

export type ActivityEventType = "task_update" | "agent_action" | "approval" | "deployment" | "governance" | "heartbeat" | "ticket" | "system";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actorId: string; // agentId or "system"
  action: string;
  target: string;
  detail: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// ═══════════════════════════════════════
// Gateway Types
// ═══════════════════════════════════════

export type GatewayStatus = "connected" | "disconnected" | "error" | "syncing";

export interface Gateway {
  id: string;
  name: string;
  url: string;
  status: GatewayStatus;
  workspaceRoot: string;
  token: string;
  agentCount: number;
  boardCount: number;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  latencyMs: number;
  version: string;
}

// ═══════════════════════════════════════
// Skills Marketplace Types
// ═══════════════════════════════════════

export type SkillCategory = "code" | "data" | "design" | "ops" | "communication" | "analysis" | "security";

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  installed: boolean;
  installedByAgentIds: string[];
  tags: string[];
  icon: string;
}

// ═══════════════════════════════════════
// Tags & Custom Fields Types
// ═══════════════════════════════════════

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

export type CustomFieldType = "text" | "number" | "select" | "date" | "checkbox" | "url";

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // for select type
  description: string;
  createdAt: string;
  usageCount: number;
}

// ═══════════════════════════════════════
// Mock: Activity Events
// ═══════════════════════════════════════

export const activityEvents: ActivityEvent[] = [
  { id: "ae1", type: "task_update", actorId: "a1", action: "completed", target: "Task: Optimize DB queries", detail: "Marked as done after implementing eager loading", timestamp: "2026-03-08T14:30:00" },
  { id: "ae2", type: "agent_action", actorId: "a8", action: "reviewed", target: "PR #127: Auth module refactor", detail: "Left 3 comments, approved with suggestions", timestamp: "2026-03-08T14:15:00" },
  { id: "ae3", type: "approval", actorId: "h1", action: "approved", target: "Governance: Hire new code gen agent", detail: "Budget approved for Q2 expansion", timestamp: "2026-03-08T14:00:00" },
  { id: "ae4", type: "deployment", actorId: "a5", action: "deployed", target: "Staging v0.3.12", detail: "Rolling deployment completed, zero downtime", timestamp: "2026-03-08T13:45:00" },
  { id: "ae5", type: "heartbeat", actorId: "a7", action: "warning", target: "Agent: ByteCrunch", detail: "Response time exceeded 500ms threshold", timestamp: "2026-03-08T13:30:00" },
  { id: "ae6", type: "ticket", actorId: "a12", action: "escalated", target: "Ticket: Auth token leak", detail: "Critical security issue escalated to CTO", timestamp: "2026-03-08T13:15:00" },
  { id: "ae7", type: "governance", actorId: "h15", action: "proposed", target: "Strategy: Mobile-first approach", detail: "Shift Q2 roadmap focus to mobile", timestamp: "2026-03-08T13:00:00" },
  { id: "ae8", type: "system", actorId: "system", action: "backup", target: "Database backup", detail: "Daily backup completed successfully (2.3 GB)", timestamp: "2026-03-08T12:00:00" },
  { id: "ae9", type: "agent_action", actorId: "a2", action: "created", target: "Design: Login page mockup", detail: "Pixel-art style login form design completed", timestamp: "2026-03-08T11:30:00" },
  { id: "ae10", type: "task_update", actorId: "a3", action: "assigned", target: "Task: Integration tests for auth", detail: "Delegated to BugHunter for testing", timestamp: "2026-03-08T11:00:00" },
  { id: "ae11", type: "deployment", actorId: "a14", action: "rolled_back", target: "Production v0.3.11", detail: "Rollback due to memory leak in worker pool", timestamp: "2026-03-08T10:30:00" },
  { id: "ae12", type: "agent_action", actorId: "a6", action: "reviewed", target: "PR #125: Dashboard redesign", detail: "Approved with no changes needed", timestamp: "2026-03-08T10:00:00" },
  { id: "ae13", type: "system", actorId: "system", action: "alert", target: "Cost threshold", detail: "Monthly agent spend reached 80% of budget ($1,600/$2,000)", timestamp: "2026-03-08T09:00:00" },
  { id: "ae14", type: "heartbeat", actorId: "a15", action: "recovered", target: "Agent: WatchDog", detail: "Back online after 12 minute outage", timestamp: "2026-03-08T08:45:00" },
  { id: "ae15", type: "task_update", actorId: "h2", action: "started", target: "Task: Responsive navbar", detail: "Frontend development in progress", timestamp: "2026-03-08T08:30:00" },
];

// ═══════════════════════════════════════
// Mock: Gateways
// ═══════════════════════════════════════

export const gateways: Gateway[] = [
  { id: "gw1", name: "Production Gateway", url: "https://gw.openclaw.io", status: "connected", workspaceRoot: "/app/production", token: "gw_tok_prod_***", agentCount: 12, boardCount: 5, lastSeen: "2026-03-08T14:29:00", createdAt: "2026-01-15T10:00:00", updatedAt: "2026-03-08T14:29:00", latencyMs: 45, version: "1.4.2" },
  { id: "gw2", name: "Staging Gateway", url: "https://staging-gw.openclaw.io", status: "connected", workspaceRoot: "/app/staging", token: "gw_tok_stg_***", agentCount: 6, boardCount: 3, lastSeen: "2026-03-08T14:25:00", createdAt: "2026-02-01T10:00:00", updatedAt: "2026-03-08T14:25:00", latencyMs: 78, version: "1.4.2" },
  { id: "gw3", name: "Dev Local", url: "http://localhost:8080", status: "disconnected", workspaceRoot: "/home/dev/workspace", token: "gw_tok_dev_***", agentCount: 2, boardCount: 1, lastSeen: "2026-03-07T18:00:00", createdAt: "2026-02-20T10:00:00", updatedAt: "2026-03-07T18:00:00", latencyMs: 12, version: "1.4.1" },
  { id: "gw4", name: "CI/CD Runner", url: "https://ci-gw.openclaw.io", status: "syncing", workspaceRoot: "/runner/workspace", token: "gw_tok_ci_***", agentCount: 4, boardCount: 2, lastSeen: "2026-03-08T14:20:00", createdAt: "2026-03-01T10:00:00", updatedAt: "2026-03-08T14:20:00", latencyMs: 120, version: "1.4.0" },
  { id: "gw5", name: "GPU Cluster", url: "https://gpu-gw.openclaw.io", status: "error", workspaceRoot: "/cluster/shared", token: "gw_tok_gpu_***", agentCount: 0, boardCount: 0, lastSeen: "2026-03-06T10:00:00", createdAt: "2026-02-15T10:00:00", updatedAt: "2026-03-06T10:00:00", latencyMs: 999, version: "1.3.8" },
];

// ═══════════════════════════════════════
// Mock: Skills
// ═══════════════════════════════════════

const skillCategories: Record<SkillCategory, { icon: string; label: string }> = {
  code: { icon: "💻", label: "Code" },
  data: { icon: "📊", label: "Data" },
  design: { icon: "🎨", label: "Design" },
  ops: { icon: "🚀", label: "Ops" },
  communication: { icon: "💬", label: "Communication" },
  analysis: { icon: "🔍", label: "Analysis" },
  security: { icon: "🔐", label: "Security" },
};

export { skillCategories };

export const skills: Skill[] = [
  { id: "sk1", name: "TypeScript Expert", description: "Advanced TypeScript patterns, generics, type inference, and best practices", category: "code", version: "3.2.0", author: "OpenClaw Team", downloads: 12400, rating: 4.9, installed: true, installedByAgentIds: ["a1", "a6", "a7"], tags: ["typescript", "types", "generics"], icon: "💻" },
  { id: "sk2", name: "React Architect", description: "Component patterns, hooks mastery, performance optimization, and state management", category: "code", version: "2.8.1", author: "OpenClaw Team", downloads: 9800, rating: 4.8, installed: true, installedByAgentIds: ["a1", "h2"], tags: ["react", "frontend", "hooks"], icon: "⚛️" },
  { id: "sk3", name: "SQL Optimizer", description: "Query optimization, indexing strategies, N+1 detection, and database tuning", category: "data", version: "1.5.0", author: "DataCrew", downloads: 7200, rating: 4.7, installed: true, installedByAgentIds: ["a1", "h3"], tags: ["sql", "database", "performance"], icon: "🗄️" },
  { id: "sk4", name: "Figma-to-Code", description: "Convert Figma designs to pixel-perfect React components with Tailwind", category: "design", version: "2.1.0", author: "DesignBridge", downloads: 5600, rating: 4.5, installed: true, installedByAgentIds: ["a2", "a10", "a11"], tags: ["figma", "design", "css"], icon: "🎨" },
  { id: "sk5", name: "Docker & K8s", description: "Container orchestration, Kubernetes deployments, and infrastructure as code", category: "ops", version: "4.0.2", author: "CloudForge", downloads: 8900, rating: 4.8, installed: true, installedByAgentIds: ["a5", "a14"], tags: ["docker", "kubernetes", "infra"], icon: "🐳" },
  { id: "sk6", name: "Penetration Tester", description: "Security vulnerability scanning, OWASP top 10, and penetration testing techniques", category: "security", version: "1.9.0", author: "SecureStack", downloads: 4200, rating: 4.6, installed: false, installedByAgentIds: [], tags: ["security", "pentest", "owasp"], icon: "🔐" },
  { id: "sk7", name: "API Design", description: "RESTful API design, OpenAPI specs, versioning, and rate limiting patterns", category: "code", version: "2.3.0", author: "OpenClaw Team", downloads: 6100, rating: 4.7, installed: false, installedByAgentIds: [], tags: ["api", "rest", "openapi"], icon: "🔌" },
  { id: "sk8", name: "Data Pipeline", description: "ETL workflows, streaming data processing, and data quality monitoring", category: "data", version: "1.2.0", author: "DataCrew", downloads: 3800, rating: 4.4, installed: false, installedByAgentIds: [], tags: ["etl", "streaming", "data"], icon: "🔄" },
  { id: "sk9", name: "Technical Writer", description: "Documentation generation, README creation, API docs, and changelog management", category: "communication", version: "1.7.0", author: "DocForge", downloads: 5100, rating: 4.3, installed: true, installedByAgentIds: ["h16"], tags: ["docs", "readme", "changelog"], icon: "📝" },
  { id: "sk10", name: "Code Reviewer", description: "Automated code review with best practices, pattern detection, and security checks", category: "analysis", version: "3.0.1", author: "OpenClaw Team", downloads: 11200, rating: 4.9, installed: true, installedByAgentIds: ["a6"], tags: ["review", "quality", "patterns"], icon: "🔍" },
  { id: "sk11", name: "Load Tester", description: "Performance testing, stress testing, and benchmarking with detailed reports", category: "ops", version: "2.0.0", author: "PerfLab", downloads: 3200, rating: 4.5, installed: true, installedByAgentIds: ["a13"], tags: ["testing", "performance", "benchmark"], icon: "📈" },
  { id: "sk12", name: "UX Researcher", description: "User research methods, A/B testing, heatmap analysis, and usability testing", category: "analysis", version: "1.4.0", author: "UXLab", downloads: 2900, rating: 4.2, installed: false, installedByAgentIds: [], tags: ["ux", "research", "testing"], icon: "🧪" },
];

// ═══════════════════════════════════════
// Mock: Tags
// ═══════════════════════════════════════

export const tags: Tag[] = [
  { id: "tag1", name: "bug", color: "hsl(0 70% 50%)", usageCount: 24, createdAt: "2026-01-10T10:00:00" },
  { id: "tag2", name: "feature", color: "hsl(210 70% 50%)", usageCount: 38, createdAt: "2026-01-10T10:00:00" },
  { id: "tag3", name: "urgent", color: "hsl(30 90% 50%)", usageCount: 12, createdAt: "2026-01-15T10:00:00" },
  { id: "tag4", name: "security", color: "hsl(0 80% 40%)", usageCount: 8, createdAt: "2026-01-20T10:00:00" },
  { id: "tag5", name: "performance", color: "hsl(150 60% 45%)", usageCount: 15, createdAt: "2026-02-01T10:00:00" },
  { id: "tag6", name: "design", color: "hsl(280 60% 55%)", usageCount: 20, createdAt: "2026-02-05T10:00:00" },
  { id: "tag7", name: "documentation", color: "hsl(50 70% 45%)", usageCount: 10, createdAt: "2026-02-10T10:00:00" },
  { id: "tag8", name: "refactor", color: "hsl(180 50% 45%)", usageCount: 18, createdAt: "2026-02-15T10:00:00" },
  { id: "tag9", name: "devops", color: "hsl(30 70% 50%)", usageCount: 14, createdAt: "2026-02-20T10:00:00" },
  { id: "tag10", name: "blocked", color: "hsl(0 0% 50%)", usageCount: 5, createdAt: "2026-03-01T10:00:00" },
];

// ═══════════════════════════════════════
// Mock: Custom Fields
// ═══════════════════════════════════════

export const customFields: CustomField[] = [
  { id: "cf1", name: "Story Points", type: "number", required: false, description: "Estimation points for task complexity", createdAt: "2026-01-15T10:00:00", usageCount: 45 },
  { id: "cf2", name: "Sprint", type: "select", required: true, options: ["Sprint 1", "Sprint 2", "Sprint 3", "Backlog"], description: "Current sprint assignment", createdAt: "2026-01-15T10:00:00", usageCount: 52 },
  { id: "cf3", name: "Due Date", type: "date", required: false, description: "Expected completion date", createdAt: "2026-01-20T10:00:00", usageCount: 40 },
  { id: "cf4", name: "External Link", type: "url", required: false, description: "Link to external resource or PR", createdAt: "2026-02-01T10:00:00", usageCount: 28 },
  { id: "cf5", name: "Reviewed", type: "checkbox", required: false, description: "Whether the task has been peer reviewed", createdAt: "2026-02-10T10:00:00", usageCount: 35 },
  { id: "cf6", name: "Notes", type: "text", required: false, description: "Additional context or notes for the task", createdAt: "2026-02-15T10:00:00", usageCount: 22 },
];

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

export function getAgentById(id: string) {
  return agents.find(a => a.id === id);
}
