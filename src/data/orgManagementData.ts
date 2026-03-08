// ═══════════════════════════════════════
// Organization Management Mock Data
// ═══════════════════════════════════════

export type OrgRole = "owner" | "admin" | "member" | "viewer";
export type InviteStatus = "pending" | "accepted" | "expired";

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: OrgRole;
  joinedAt: string;
  lastActive: string;
  status: "active" | "inactive";
}

export interface OrgInvite {
  id: string;
  email: string;
  role: OrgRole;
  invitedBy: string;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  description: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
  memberCount: number;
  agentCount: number;
  members: OrgMember[];
  invites: OrgInvite[];
}

export const rolePermissions: Record<OrgRole, string[]> = {
  owner: ["manage_org", "manage_members", "manage_roles", "manage_billing", "manage_agents", "view_analytics", "manage_settings", "delete_org"],
  admin: ["manage_members", "manage_roles", "manage_agents", "view_analytics", "manage_settings"],
  member: ["manage_agents", "view_analytics"],
  viewer: ["view_analytics"],
};

export const roleColors: Record<OrgRole, string> = {
  owner: "hsl(var(--pixel-yellow))",
  admin: "hsl(var(--pixel-purple))",
  member: "hsl(var(--primary))",
  viewer: "hsl(var(--muted-foreground))",
};

export const roleBadgeClass: Record<OrgRole, string> = {
  owner: "bg-accent/20 text-accent border-accent/40",
  admin: "bg-secondary/20 text-secondary border-secondary/40",
  member: "bg-primary/20 text-primary border-primary/40",
  viewer: "bg-muted text-muted-foreground border-border",
};

export const organizations: Organization[] = [
  {
    id: "org1",
    name: "OpenClaw Corp",
    logo: "🦀",
    description: "Build the most effective autonomous AI dev team",
    plan: "enterprise",
    createdAt: "2025-09-15",
    memberCount: 6,
    agentCount: 18,
    members: [
      { id: "m1", name: "Alex Chen", email: "alex@openclaw.ai", avatar: "🧑‍💻", role: "owner", joinedAt: "2025-09-15", lastActive: "2026-03-08T14:00:00", status: "active" },
      { id: "m2", name: "Sarah Kim", email: "sarah@openclaw.ai", avatar: "👩‍🔬", role: "admin", joinedAt: "2025-10-01", lastActive: "2026-03-08T12:30:00", status: "active" },
      { id: "m3", name: "Mike Torres", email: "mike@openclaw.ai", avatar: "👨‍🎨", role: "admin", joinedAt: "2025-10-15", lastActive: "2026-03-07T18:00:00", status: "active" },
      { id: "m4", name: "Yuki Tanaka", email: "yuki@openclaw.ai", avatar: "👩‍💼", role: "member", joinedAt: "2025-11-01", lastActive: "2026-03-08T10:00:00", status: "active" },
      { id: "m5", name: "James Park", email: "james@openclaw.ai", avatar: "🧑‍🔧", role: "member", joinedAt: "2026-01-10", lastActive: "2026-03-06T09:00:00", status: "inactive" },
      { id: "m6", name: "Lisa Wang", email: "lisa@openclaw.ai", avatar: "👩‍🏫", role: "viewer", joinedAt: "2026-02-20", lastActive: "2026-03-08T08:00:00", status: "active" },
    ],
    invites: [
      { id: "inv1", email: "new.dev@gmail.com", role: "member", invitedBy: "m1", status: "pending", createdAt: "2026-03-07", expiresAt: "2026-03-14" },
      { id: "inv2", email: "consultant@external.io", role: "viewer", invitedBy: "m2", status: "pending", createdAt: "2026-03-06", expiresAt: "2026-03-13" },
    ],
  },
  {
    id: "org2",
    name: "PixelForge Studios",
    logo: "🎨",
    description: "AI-powered design automation",
    plan: "pro",
    createdAt: "2025-12-01",
    memberCount: 3,
    agentCount: 8,
    members: [
      { id: "m7", name: "Emma Davis", email: "emma@pixelforge.io", avatar: "👩‍🎨", role: "owner", joinedAt: "2025-12-01", lastActive: "2026-03-08T13:00:00", status: "active" },
      { id: "m8", name: "Ryan Lee", email: "ryan@pixelforge.io", avatar: "🧑‍💻", role: "admin", joinedAt: "2026-01-05", lastActive: "2026-03-08T11:00:00", status: "active" },
      { id: "m9", name: "Nina Patel", email: "nina@pixelforge.io", avatar: "👩‍🔬", role: "member", joinedAt: "2026-02-01", lastActive: "2026-03-07T16:00:00", status: "active" },
    ],
    invites: [],
  },
  {
    id: "org3",
    name: "CloudNine AI",
    logo: "☁️",
    description: "Autonomous infrastructure management",
    plan: "pro",
    createdAt: "2026-01-10",
    memberCount: 4,
    agentCount: 12,
    members: [
      { id: "m10", name: "David Wilson", email: "david@cloudnine.ai", avatar: "🧑‍🚀", role: "owner", joinedAt: "2026-01-10", lastActive: "2026-03-08T15:00:00", status: "active" },
      { id: "m11", name: "Anna Martinez", email: "anna@cloudnine.ai", avatar: "👩‍💻", role: "admin", joinedAt: "2026-01-20", lastActive: "2026-03-08T09:00:00", status: "active" },
      { id: "m12", name: "Tom Brown", email: "tom@cloudnine.ai", avatar: "🧑‍🔧", role: "member", joinedAt: "2026-02-15", lastActive: "2026-03-05T14:00:00", status: "inactive" },
      { id: "m13", name: "Sophie Chen", email: "sophie@cloudnine.ai", avatar: "👩‍🎓", role: "viewer", joinedAt: "2026-03-01", lastActive: "2026-03-08T07:00:00", status: "active" },
    ],
    invites: [
      { id: "inv3", email: "devops@contractor.com", role: "member", invitedBy: "m10", status: "pending", createdAt: "2026-03-08", expiresAt: "2026-03-15" },
    ],
  },
];

export function getOrganization(orgId: string): Organization | undefined {
  return organizations.find(o => o.id === orgId);
}

export function getMembersByRole(org: Organization, role: OrgRole): OrgMember[] {
  return org.members.filter(m => m.role === role);
}

export function getPermissionsForRole(role: OrgRole): string[] {
  return rolePermissions[role] || [];
}

export function canPerformAction(memberRole: OrgRole, action: string): boolean {
  return rolePermissions[memberRole]?.includes(action) ?? false;
}
