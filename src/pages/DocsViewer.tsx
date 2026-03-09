import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { BookOpen } from "lucide-react";

const SYSTEM_ARCHITECTURE = `# 📎 Paperclip — System Architecture Documentation

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
| \`paperclipData.ts\` | ข้อมูล Paperclip ทั้งหมด | \`OrgNode\`, \`BudgetEntry\`, \`GovernanceProposal\`, \`CompanyGoal\`, \`Heartbeat\`, \`Ticket\`, \`AgentMessage\`, \`TaskDelegation\`, \`Company\` |
| \`orgManagementData.ts\` | ข้อมูลจัดการองค์กร | \`Organization\`, \`OrgMember\`, \`OrgInvite\`, \`OrgRole\` |
| \`clawEmpireData.ts\` | Sub-tasks, XP system, workflow packs | \`SubTask\`, \`AgentXP\`, \`WorkflowPack\`, \`TaskReport\`, \`CompanySettings\` |
| \`missionControlData.ts\` | Activity feed, gateways, skills marketplace | \`ActivityEvent\`, \`Gateway\`, \`Skill\`, \`Tag\`, \`CustomField\` |
| \`chatData.ts\` | ระบบแชท | \`ChatChannel\`, \`ChatMsg\` |
| \`projectData.ts\` | โปรเจกต์ | \`Project\` |

---

## 🏢 Module 1: Organization Management

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
  status: "pending" | "accepted" | "expired";
  invitedBy: string;
  invitedAt: string;
}
\`\`\`

### Permission Matrix

| Permission | Owner | Admin | Member | Viewer |
|-----------|-------|-------|--------|--------|
| manage_members | ✅ | ✅ | ❌ | ❌ |
| manage_billing | ✅ | ✅ | ❌ | ❌ |
| manage_agents | ✅ | ✅ | ✅ | ❌ |
| view_analytics | ✅ | ✅ | ✅ | ✅ |
| manage_settings | ✅ | ❌ | ❌ | ❌ |
| invite_members | ✅ | ✅ | ❌ | ❌ |

### Audit Log Actions

| Action | คำอธิบาย |
|--------|---------|
| \`member_added\` | เพิ่มสมาชิกใหม่ |
| \`member_removed\` | ลบสมาชิก |
| \`role_changed\` | เปลี่ยน role สมาชิก |
| \`invite_sent\` | ส่งคำเชิญ |
| \`invite_cancelled\` | ยกเลิกคำเชิญ |
| \`settings_changed\` | เปลี่ยนการตั้งค่า |

---

## ⚖️ Module 2: Governance & Budget

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

### Goal Types

\`\`\`typescript
type GoalStatus = "on-track" | "at-risk" | "behind" | "completed";

interface CompanyGoal {
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
\`\`\`

### Goal Hierarchy

\`\`\`
Company Mission
  └── Ship v1.0 by June (g1) — 62%
        ├── 100% Test Coverage (g2) — 47% [at-risk]
        ├── Design System Complete (g3) — 75%
        ├── Zero Downtime Deploys (g4) — 30% [behind]
        └── Customer Onboarding (g6) — 40%
  └── Agent Cost < $2K/mo (g5) — 55% [at-risk]
\`\`\`

### Heartbeat Types

\`\`\`typescript
type HeartbeatStatus = "alive" | "warning" | "dead";

interface Heartbeat {
  agentId: string;
  lastBeat: string;
  nextScheduled: string;
  status: HeartbeatStatus;
  responseTimeMs: number;
  uptimePercent: number;
  beatHistory: { time: string; ok: boolean }[];
}
\`\`\`

### Heartbeat Status Logic

| Agent Status | → Heartbeat Status | คำอธิบาย |
|-------------|-------------------|---------|
| \`online\` | \`alive\` | ตอบสนองปกติ, uptime > 99% |
| \`busy\` | \`warning\` | ตอบช้า, uptime 85-95% |
| \`offline\` | \`dead\` | ไม่ตอบสนอง, uptime < 80% |

---

## 🎫 Module 4: Tickets & Agent Coordination

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
  assignedTo: string;
  conversation: {
    role: "user" | "agent";
    agentId?: string;
    content: string;
    timestamp: string;
  }[];
  toolCalls: ToolCall[];
}
\`\`\`

### Ticket Lifecycle

\`\`\`
open → in-progress → resolved
  │                      ↑
  └──→ escalated ────────┘
\`\`\`

### Agent Coordination Types

\`\`\`typescript
interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  type: "request" | "response" | "delegation" | "notification";
}

interface TaskDelegation {
  id: string;
  taskId: string;
  fromAgentId: string;
  toAgentId: string;
  reason: string;
  status: "pending" | "accepted" | "rejected" | "completed";
}
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

\`\`\`typescript
interface Company {
  id: string;
  name: string;
  logo: string;
  mission: string;
  agentCount: number;
  activeTickets: number;
  monthlyBudget: number;
}
\`\`\`

เมื่อเปลี่ยนบริษัท → UI ทั้งหมดจะอัปเดตตามบริษัทที่เลือก

---

## 🔔 Notification System

| Function | คำอธิบาย |
|----------|---------|
| \`push(notification)\` | เพิ่ม notification ใหม่ |
| \`dismiss(id)\` | ลบ notification |
| \`markRead(id)\` | อ่านแล้ว |
| \`markAllRead()\` | อ่านทั้งหมด |
| \`clearAll()\` | ล้างทั้งหมด |

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
| \`/org-chart\` | OrgChart | Paperclip |
| \`/budget\` | BudgetControl | Paperclip |
| \`/governance\` | Governance | Paperclip |
| \`/goals\` | GoalAlignment | Paperclip |
| \`/heartbeat\` | HeartbeatMonitor | Paperclip |
| \`/tickets\` | TicketSystem | Paperclip |
| \`/coordination\` | AgentCoordination | Paperclip |
| \`/org-management\` | OrgManagement | Paperclip |
| \`/docs\` | DocsViewer | Paperclip |

---

*เอกสารนี้สร้างอัตโนมัติจากซอร์สโค้ด — อัปเดตล่าสุด: 2026-03-09*
`;

const DocsViewer = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-pixel text-foreground">Documentation</h1>
            <p className="text-sm text-muted-foreground">System Architecture & Technical Reference</p>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <article className="prose prose-invert max-w-none p-6 md:p-10
                prose-headings:font-pixel prose-headings:text-foreground
                prose-h1:text-2xl prose-h1:border-b prose-h1:border-border prose-h1:pb-4
                prose-h2:text-xl prose-h2:text-primary prose-h2:mt-10
                prose-h3:text-lg prose-h3:text-accent-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-pixel-body
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
                prose-table:border-collapse
                prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-foreground prose-th:text-sm
                prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-td:text-muted-foreground prose-td:text-sm
                prose-strong:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                prose-li:text-muted-foreground
                prose-hr:border-border
              ">
                <ReactMarkdown>{SYSTEM_ARCHITECTURE}</ReactMarkdown>
              </article>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DocsViewer;
