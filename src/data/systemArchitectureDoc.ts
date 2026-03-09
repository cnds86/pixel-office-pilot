export const SYSTEM_ARCHITECTURE_CONTENT = `# 📎 Paperclip — System Architecture Documentation

> เอกสารสถาปัตยกรรมระบบ Paperclip v0.5.0  
> ระบบบริหารจัดการบริษัท AI อัตโนมัติ (Autonomous AI Company Management)

---

## 📐 ภาพรวมสถาปัตยกรรม (Architecture Overview)

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    App.tsx (Router)                  │
│  ┌───────────────────────────────────────────────┐  │
│  │          CompanyProvider (Context)             │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │      NotificationProvider (Context)      │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │        AppLayout + Sidebar        │  │  │  │
│  │  │  │  ┌─────────────────────────────┐  │  │  │  │
│  │  │  │  │      Page Components        │  │  │  │  │
│  │  │  │  └─────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
\`\`\`

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| State | React useState/useContext (mock data) |
| Build | Vite |

---

## 📁 โครงสร้างไฟล์ข้อมูล (Data Layer)

ข้อมูลทั้งหมดเป็น mock data ในไฟล์ TypeScript — ยังไม่มี backend

### ไฟล์หลัก

| ไฟล์ | หน้าที่ | Types ที่ export |
|------|---------|-----------------|
| \`mockData.ts\` | ข้อมูลฐาน: agents, tasks, milestones, activity logs | \`Agent\`, \`Task\`, \`Milestone\`, \`ActivityLog\` |
| \`paperclipData.ts\` | ข้อมูล Paperclip ทั้งหมด: org chart, budgets, governance, goals, heartbeats, tickets, coordination | \`OrgNode\`, \`BudgetEntry\`, \`GovernanceProposal\`, \`CompanyGoal\`, \`Heartbeat\`, \`Ticket\`, \`AgentMessage\`, \`TaskDelegation\`, \`Company\` |
| \`orgManagementData.ts\` | ข้อมูลจัดการองค์กร: members, roles, invites, permissions | \`Organization\`, \`OrgMember\`, \`OrgInvite\`, \`OrgRole\` |
| \`clawEmpireData.ts\` | Sub-tasks, XP system, workflow packs, task reports, settings | \`SubTask\`, \`AgentXP\`, \`WorkflowPack\`, \`TaskReport\`, \`CompanySettings\` |
| \`missionControlData.ts\` | Activity feed, gateways, skills marketplace, tags | \`ActivityEvent\`, \`Gateway\`, \`Skill\`, \`Tag\`, \`CustomField\` |
| \`chatData.ts\` | ระบบแชท: channels, messages, mock responses | \`ChatChannel\`, \`ChatMsg\` |
| \`projectData.ts\` | โปรเจกต์: project data, status tracking | \`Project\` |

---

## 🏢 Module 1: Organization Management

### ไฟล์ที่เกี่ยวข้อง
- **Page**: \`src/pages/OrgManagement.tsx\`
- **Data**: \`src/data/orgManagementData.ts\`

### Types

\`\`\`typescript
type OrgRole = "owner" | "admin" | "member" | "viewer";

interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  avatar: string;
  joinedAt: string;
}

interface OrgInvite {
  id: string;
  email: string;
  role: OrgRole;
  status: InviteStatus; // "pending" | "accepted" | "expired"
  invitedBy: string;
  invitedAt: string;
}

interface Organization {
  id: string;
  name: string;
  logo: string;
  plan: string;
  members: OrgMember[];
  invites: OrgInvite[];
  createdAt: string;
}
\`\`\`

### Functions

| Function | คำอธิบาย | Input | Output |
|----------|---------|-------|--------|
| \`getOrganization(orgId)\` | ค้นหาองค์กรจาก ID | \`string\` | \`Organization \\| undefined\` |
| \`getMembersByRole(org, role)\` | กรองสมาชิกตาม role | \`Organization, OrgRole\` | \`OrgMember[]\` |
| \`getPermissionsForRole(role)\` | ดึงรายการ permissions ของ role | \`OrgRole\` | \`string[]\` |
| \`canPerformAction(memberRole, action)\` | ตรวจสอบสิทธิ์การทำงาน | \`OrgRole, string\` | \`boolean\` |

### Permission Matrix

| Permission | Owner | Admin | Member | Viewer |
|-----------|-------|-------|--------|--------|
| manage_members | ✅ | ✅ | ❌ | ❌ |
| manage_billing | ✅ | ✅ | ❌ | ❌ |
| manage_agents | ✅ | ✅ | ✅ | ❌ |
| view_analytics | ✅ | ✅ | ✅ | ✅ |
| manage_settings | ✅ | ❌ | ❌ | ❌ |
| invite_members | ✅ | ✅ | ❌ | ❌ |

### Audit Log System

ระบบบันทึกเหตุการณ์สำคัญทุกอย่างภายในองค์กร:

| Action Type | คำอธิบาย |
|------------|---------|
| \`member_added\` | เพิ่มสมาชิกใหม่ |
| \`member_removed\` | ลบสมาชิก |
| \`role_changed\` | เปลี่ยน role สมาชิก |
| \`invite_sent\` | ส่งคำเชิญ |
| \`invite_cancelled\` | ยกเลิกคำเชิญ |
| \`org_created\` | สร้างองค์กร |
| \`org_updated\` | แก้ไขข้อมูลองค์กร |
| \`settings_changed\` | เปลี่ยนการตั้งค่า |

**Export CSV**: รองรับการส่งออก audit log เป็นไฟล์ CSV พร้อมกรองตามประเภทเหตุการณ์

---

## ⚖️ Module 2: Governance & Budget

### ไฟล์ที่เกี่ยวข้อง
- **Pages**: \`src/pages/Governance.tsx\`, \`src/pages/BudgetControl.tsx\`
- **Data**: \`src/data/paperclipData.ts\`

### Governance Types

\`\`\`typescript
type GovernanceAction = "hire" | "fire" | "pause" | "resume" | "strategy" | "budget";
type GovernanceStatus = "pending" | "approved" | "rejected";

interface GovernanceProposal {
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
\`\`\`

### Budget Types

\`\`\`typescript
interface BudgetEntry {
  agentId: string;
  monthlyBudget: number;
  spent: number;
  currency: string;
  paused: boolean;
  history: { month: string; spent: number }[];
}
\`\`\`

### Data Flow — Governance

\`\`\`
User สร้าง Proposal → กำหนด action + target agent + reason
        ↓
Members ลงคะแนน (approve/reject)
        ↓
Status เปลี่ยน: pending → approved/rejected
        ↓
ถ้า approved → ดำเนินการ (เช่น pause agent, เปลี่ยนงบ)
\`\`\`

### Functions

| Function | คำอธิบาย | Input | Output |
|----------|---------|-------|--------|
| \`getAgentBudget(agentId)\` | ดึงงบประมาณของ agent | \`string\` | \`BudgetEntry \\| undefined\` |
| \`getSubordinates(agentId)\` | ดึงรายชื่อผู้ใต้บังคับบัญชา | \`string\` | \`OrgNode[]\` |
| \`getOrgNode(agentId)\` | ดึงข้อมูลตำแหน่งใน org chart | \`string\` | \`OrgNode \\| undefined\` |

### Org Chart Structure

\`\`\`
CEO (h1)
├── VP Product (h15)
│   ├── Product Strategist (a16)
│   └── Technical Writer (h16)
├── CTO (a8)
│   ├── Lead Engineer (a1) → 5 reports
│   ├── Design Lead (a2) → 4 reports
│   ├── DevOps Lead (a5) → 3 reports
│   └── QA Lead (a3) → 4 reports
└── Support Lead (a17)
    ├── Ticket Triage (a18)
    ├── Support Eng (h17)
    └── Customer Success (h18)
\`\`\`

---

## 🎯 Module 3: Goals & Heartbeats

### ไฟล์ที่เกี่ยวข้อง
- **Pages**: \`src/pages/GoalAlignment.tsx\`, \`src/pages/HeartbeatMonitor.tsx\`
- **Data**: \`src/data/paperclipData.ts\`

### Goal Types

\`\`\`typescript
type GoalStatus = "on-track" | "at-risk" | "behind" | "completed";

interface CompanyGoal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number;          // 0-100
  parentGoalId: string | null; // สำหรับ goal hierarchy
  assignedAgentIds: string[];
  linkedTaskIds: string[];
  deadline: string;
}

interface CompanyMission {
  name: string;
  mission: string;
  vision: string;
  goals: CompanyGoal[];
}
\`\`\`

### Goal Hierarchy

\`\`\`
Company Mission
  └── Goal: Ship v1.0 by June (g1) — 62%
        ├── Goal: 100% Test Coverage (g2) — 47% [at-risk]
        ├── Goal: Design System Complete (g3) — 75%
        ├── Goal: Zero Downtime Deploys (g4) — 30% [behind]
        └── Goal: Customer Onboarding (g6) — 40%
  └── Goal: Agent Cost < $2K/mo (g5) — 55% [at-risk]
\`\`\`

### Heartbeat Types

\`\`\`typescript
type HeartbeatStatus = "alive" | "warning" | "dead";

interface Heartbeat {
  agentId: string;
  lastBeat: string;       // ISO timestamp
  nextScheduled: string;
  status: HeartbeatStatus;
  responseTimeMs: number;
  uptimePercent: number;
  beatHistory: { time: string; ok: boolean }[];
}
\`\`\`

### Functions

| Function | คำอธิบาย | Input | Output |
|----------|---------|-------|--------|
| \`getHeartbeat(agentId)\` | ดึงสถานะ heartbeat ของ agent | \`string\` | \`Heartbeat \\| undefined\` |

### Heartbeat Status Logic

| Agent Status | → Heartbeat Status | คำอธิบาย |
|-------------|-------------------|---------|
| \`online\` | \`alive\` | ตอบสนองปกติ, uptime > 99% |
| \`busy\` | \`warning\` | ตอบช้า, uptime 85-95% |
| \`offline\` | \`dead\` | ไม่ตอบสนอง, uptime < 80% |

---

## 🎫 Module 4: Tickets & Agent Coordination

### ไฟล์ที่เกี่ยวข้อง
- **Pages**: \`src/pages/TicketSystem.tsx\`, \`src/pages/AgentCoordination.tsx\`
- **Data**: \`src/data/paperclipData.ts\`

### Ticket Types

\`\`\`typescript
type TicketStatus = "open" | "in-progress" | "resolved" | "escalated";
type TicketPriority = "critical" | "high" | "medium" | "low";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string;      // agentId or "user"
  assignedTo: string;      // agentId
  createdAt: string;
  updatedAt: string;
  conversation: {
    role: "user" | "agent";
    agentId?: string;
    content: string;
    timestamp: string;
  }[];
  toolCalls: ToolCall[];   // การเรียกใช้เครื่องมือของ agent
  decision?: string;
  resolution?: string;
}

interface ToolCall {
  id: string;
  tool: string;           // ชื่อเครื่องมือ เช่น "query_analyzer", "code_edit"
  input: string;
  output: string;
  timestamp: string;
  durationMs: number;
}
\`\`\`

### Agent Coordination Types

\`\`\`typescript
interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  timestamp: string;
  type: "request" | "response" | "delegation" | "notification";
}

interface TaskDelegation {
  id: string;
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected" | "completed";
}
\`\`\`

### Functions

| Function | คำอธิบาย | Input | Output |
|----------|---------|-------|--------|
| \`getAgentTickets(agentId)\` | ดึง tickets ที่ assign ให้ agent | \`string\` | \`Ticket[]\` |
| \`getAgentMessages(agentId)\` | ดึงข้อความที่ agent ส่ง/รับ | \`string\` | \`AgentMessage[]\` |

### Ticket Lifecycle

\`\`\`
open → in-progress → resolved
  │                      ↑
  └──→ escalated ────────┘
\`\`\`

### Message Flow Types

| Type | คำอธิบาย | ตัวอย่าง |
|------|---------|---------|
| \`request\` | ขอให้ทำงาน | "Review the new API design doc" |
| \`response\` | ตอบกลับคำขอ | "Done. Left comments on section 3." |
| \`delegation\` | มอบหมายงานต่อ | "Delegate icon set creation to you" |
| \`notification\` | แจ้งเตือนข้อมูล | "5 new support tickets need triage" |

---

## 🌐 Multi-Company System

### Context Provider

\`\`\`typescript
// CompanyContext.tsx
interface CompanyContextType {
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
  companies: Company[];
}
\`\`\`

### Company Data

\`\`\`typescript
interface Company {
  id: string;
  name: string;
  logo: string;          // emoji
  mission: string;
  agentCount: number;
  activeTickets: number;
  monthlyBudget: number;
}
\`\`\`

เมื่อเปลี่ยนบริษัท → UI ทั้งหมด (sidebar, header, data) จะอัปเดตตามบริษัทที่เลือก

---

## 🔔 Notification System

### Context Provider

\`\`\`typescript
interface GlobalNotification {
  id: string;
  type: NotificationType;
  message: string;
  agentId?: string;
  read: boolean;
  timestamp: string;
}
\`\`\`

### Functions

| Function | คำอธิบาย |
|----------|---------|
| \`push(notification)\` | เพิ่ม notification ใหม่ |
| \`dismiss(id)\` | ลบ notification |
| \`markRead(id)\` | อ่านแล้ว |
| \`markAllRead()\` | อ่านทั้งหมด |
| \`clearAll()\` | ล้างทั้งหมด |

มี simulated events ที่สร้าง notification อัตโนมัติทุก interval

---

## 📊 Base Data: Agents & Tasks

### Agent Classification

| Prefix | ประเภท | จำนวน | ตัวอย่าง |
|--------|-------|-------|---------|
| \`a\` | AI Agent | 16 ตัว | ClawBot-α, SyntaxAI, ByteCrunch |
| \`h\` | Human Member | 14 คน | Alex Chen, Mika Tanaka, Sam Rivera |

### Departments (6)

| Department | Agent Count | Icon |
|-----------|------------|------|
| Engineering | 8 | ⚡ |
| Design | 5 | 🎨 |
| QA | 5 | 🧪 |
| DevOps | 4 | 🚀 |
| Product | 4 | 📋 |
| Support | 4 | 🛟 |

### Global Helper

\`\`\`typescript
function getAgentById(id: string): Agent | undefined
// ค้นหา agent จาก agents array ด้วย ID
\`\`\`

---

## 🗺️ Route Map

| Path | Page Component | Module |
|------|---------------|--------|
| \`/\` | Index (Mission Control) | Core |
| \`/tasks\` | TaskBoard | Core |
| \`/projects\` | Projects | Core |
| \`/analytics\` | AnalyticsDashboard | Core |
| \`/chat\` | ChatHub | Core |
| \`/meetings\` | MeetingDebate | Core |
| \`/pixel-office\` | PixelOffice | Core |
| \`/org-chart\` | OrgChart | Paperclip |
| \`/budget\` | BudgetControl | Paperclip |
| \`/governance\` | Governance | Paperclip |
| \`/goals\` | GoalAlignment | Paperclip |
| \`/heartbeat\` | HeartbeatMonitor | Paperclip |
| \`/tickets\` | TicketSystem | Paperclip |
| \`/agent-coordination\` | AgentCoordination | Paperclip |
| \`/org-management\` | OrgManagement | Paperclip |
| \`/activity-feed\` | ActivityFeed | Paperclip |
| \`/gateways\` | GatewayManagement | Paperclip |
| \`/skills\` | SkillsMarketplace | Paperclip |
| \`/subtasks-xp\` | SubTasksXP | Paperclip |
| \`/workflow-packs\` | WorkflowPacks | Paperclip |
| \`/task-reports\` | TaskReports | Paperclip |
| \`/tags-fields\` | TagsCustomFields | Paperclip |
| \`/department-stats\` | DepartmentStats | Paperclip |
| \`/company-settings\` | CompanySettings | Paperclip |

---

*เอกสารนี้สร้างอัตโนมัติจากซอร์สโค้ด — อัปเดตล่าสุด: 2026-03-08*
`;
