import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, Users, Shield, Plus, Mail, MoreVertical, Crown, UserCog,
  User, Eye, Trash2, UserMinus, RefreshCw, Copy, Check, X, Clock,
  Bot, CreditCard, Settings, ChevronRight, Search, ScrollText,
  ArrowRightLeft, UserPlus, UserX, ShieldAlert
} from "lucide-react";
} from "lucide-react";
import {
  organizations as initialOrgs,
  rolePermissions, roleBadgeClass,
  type Organization, type OrgMember, type OrgInvite, type OrgRole
} from "@/data/orgManagementData";

const roleIcons: Record<OrgRole, typeof Crown> = {
  owner: Crown,
  admin: UserCog,
  member: User,
  viewer: Eye,
};

const planBadge: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary/20 text-primary border-primary/40",
  enterprise: "bg-accent/20 text-accent border-accent/40",
};

type AuditAction = "role_changed" | "member_invited" | "member_removed" | "invite_cancelled" | "org_created" | "org_deleted" | "org_edited";

interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor: string;
  target: string;
  details: string;
  timestamp: string;
  orgId: string;
}

const auditActionMeta: Record<AuditAction, { icon: typeof Crown; color: string; label: string }> = {
  role_changed: { icon: ArrowRightLeft, color: "text-secondary", label: "Role Changed" },
  member_invited: { icon: UserPlus, color: "text-primary", label: "Member Invited" },
  member_removed: { icon: UserX, color: "text-destructive", label: "Member Removed" },
  invite_cancelled: { icon: X, color: "text-muted-foreground", label: "Invite Cancelled" },
  org_created: { icon: Building2, color: "text-accent", label: "Org Created" },
  org_deleted: { icon: Trash2, color: "text-destructive", label: "Org Deleted" },
  org_edited: { icon: Settings, color: "text-accent", label: "Org Edited" },
};

const seedAuditLogs: AuditLogEntry[] = [
  { id: "al1", action: "org_created", actor: "Alex Chen", target: "OpenClaw Corp", details: "Organization created", timestamp: "2025-09-15T10:00:00", orgId: "org1" },
  { id: "al2", action: "member_invited", actor: "Alex Chen", target: "sarah@openclaw.ai", details: "Invited as admin", timestamp: "2025-09-20T14:00:00", orgId: "org1" },
  { id: "al3", action: "role_changed", actor: "Alex Chen", target: "Mike Torres", details: "member → admin", timestamp: "2025-11-05T09:30:00", orgId: "org1" },
  { id: "al4", action: "member_invited", actor: "Sarah Kim", target: "yuki@openclaw.ai", details: "Invited as member", timestamp: "2025-11-01T11:00:00", orgId: "org1" },
  { id: "al5", action: "member_removed", actor: "Alex Chen", target: "Former Employee", details: "Removed from organization", timestamp: "2026-01-15T16:00:00", orgId: "org1" },
  { id: "al6", action: "member_invited", actor: "Alex Chen", target: "lisa@openclaw.ai", details: "Invited as viewer", timestamp: "2026-02-20T08:00:00", orgId: "org1" },
  { id: "al7", action: "invite_cancelled", actor: "Sarah Kim", target: "temp@external.com", details: "Pending invite cancelled", timestamp: "2026-03-01T13:00:00", orgId: "org1" },
  { id: "al8", action: "role_changed", actor: "Alex Chen", target: "Lisa Wang", details: "member → viewer", timestamp: "2026-03-05T10:00:00", orgId: "org1" },
];

export default function OrgManagement() {
  const { toast } = useToast();
  const [orgs, setOrgs] = useState<Organization[]>(initialOrgs);
  const [selectedOrg, setSelectedOrg] = useState<Organization>(orgs[0]);
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(seedAuditLogs);
  const [auditFilter, setAuditFilter] = useState<AuditAction | "all">("all");

  const addAuditLog = (action: AuditAction, target: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `al${Date.now()}`,
      action,
      actor: "You",
      target,
      details,
      timestamp: new Date().toISOString(),
      orgId: selectedOrg.id,
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Dialogs
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);

  // Forms
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDesc, setNewOrgDesc] = useState("");
  const [newOrgLogo, setNewOrgLogo] = useState("🏢");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");
  const [newRole, setNewRole] = useState<OrgRole>("member");

  const filteredMembers = selectedOrg.members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    const newOrg: Organization = {
      id: `org${Date.now()}`,
      name: newOrgName,
      logo: newOrgLogo,
      description: newOrgDesc,
      plan: "free",
      createdAt: new Date().toISOString().split("T")[0],
      memberCount: 1,
      agentCount: 0,
      members: [{ id: `m${Date.now()}`, name: "You", email: "you@example.com", avatar: "🧑‍💻", role: "owner", joinedAt: new Date().toISOString(), lastActive: new Date().toISOString(), status: "active" }],
      invites: [],
    };
    setOrgs(prev => [...prev, newOrg]);
    setSelectedOrg(newOrg);
    setCreateOrgOpen(false);
    setNewOrgName(""); setNewOrgDesc(""); setNewOrgLogo("🏢");
    addAuditLog("org_created", newOrg.name, "Organization created");
    toast({ title: "Organization created", description: `${newOrg.name} is ready to go!` });
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const invite: OrgInvite = {
      id: `inv${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      invitedBy: selectedOrg.members[0].id,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    };
    const updated = { ...selectedOrg, invites: [...selectedOrg.invites, invite] };
    setSelectedOrg(updated);
    setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
    setInviteOpen(false);
    setInviteEmail(""); setInviteRole("member");
    toast({ title: "Invite sent", description: `Invitation sent to ${invite.email}` });
  };

  const handleChangeRole = () => {
    if (!selectedMember) return;
    const updated = {
      ...selectedOrg,
      members: selectedOrg.members.map(m => m.id === selectedMember.id ? { ...m, role: newRole } : m),
    };
    setSelectedOrg(updated);
    setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
    setRoleDialogOpen(false);
    toast({ title: "Role updated", description: `${selectedMember.name} is now ${newRole}` });
  };

  const handleRemoveMember = (member: OrgMember) => {
    if (member.role === "owner") return;
    const updated = {
      ...selectedOrg,
      members: selectedOrg.members.filter(m => m.id !== member.id),
      memberCount: selectedOrg.memberCount - 1,
    };
    setSelectedOrg(updated);
    setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
    toast({ title: "Member removed", description: `${member.name} has been removed` });
  };

  const handleCancelInvite = (inviteId: string) => {
    const updated = {
      ...selectedOrg,
      invites: selectedOrg.invites.filter(i => i.id !== inviteId),
    };
    setSelectedOrg(updated);
    setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
    toast({ title: "Invite cancelled" });
  };

  const handleDeleteOrg = (orgId: string) => {
    const remaining = orgs.filter(o => o.id !== orgId);
    setOrgs(remaining);
    if (selectedOrg.id === orgId && remaining.length > 0) setSelectedOrg(remaining[0]);
    toast({ title: "Organization deleted", variant: "destructive" });
  };

  return (
    <AppLayout>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-pixel text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Organization Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage organizations, members, and access control
              </p>
            </div>
            <Button onClick={() => setCreateOrgOpen(true)} className="font-pixel text-xs gap-2">
              <Plus className="h-4 w-4" /> New Org
            </Button>
          </div>

          {/* Org selector cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orgs.map(org => (
              <Card
                key={org.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${selectedOrg.id === org.id ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setSelectedOrg(org)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{org.logo}</span>
                      <div>
                        <h3 className="font-pixel text-sm text-foreground">{org.name}</h3>
                        <p className="text-xs text-muted-foreground">{org.description}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${planBadge[org.plan]}`}>{org.plan}</Badge>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {org.members.length}</span>
                    <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {org.agentCount}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {org.invites.filter(i => i.status === "pending").length} pending</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Org Detail */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedOrg.logo}</span>
                  <div>
                    <CardTitle className="font-pixel text-lg">{selectedOrg.name}</CardTitle>
                    <CardDescription>{selectedOrg.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditOrgOpen(true)}>
                    <Settings className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteOrg(selectedOrg.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="members" className="gap-1.5 font-pixel text-xs">
                    <Users className="h-3.5 w-3.5" /> Members ({selectedOrg.members.length})
                  </TabsTrigger>
                  <TabsTrigger value="invites" className="gap-1.5 font-pixel text-xs">
                    <Mail className="h-3.5 w-3.5" /> Invites ({selectedOrg.invites.filter(i => i.status === "pending").length})
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="gap-1.5 font-pixel text-xs">
                    <Shield className="h-3.5 w-3.5" /> Roles & Permissions
                  </TabsTrigger>
                </TabsList>

                {/* Members Tab */}
                <TabsContent value="members" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Button size="sm" onClick={() => setInviteOpen(true)} className="font-pixel text-xs gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Invite
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map(member => {
                        const RoleIcon = roleIcons[member.role];
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{member.avatar}</span>
                                <div>
                                  <p className="font-medium text-foreground">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`gap-1 text-[10px] ${roleBadgeClass[member.role]}`}>
                                <RoleIcon className="h-3 w-3" /> {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`flex items-center gap-1.5 text-xs ${member.status === "active" ? "text-primary" : "text-muted-foreground"}`}>
                                <span className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-primary" : "bg-muted-foreground"}`} />
                                {member.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(member.lastActive).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setSelectedMember(member); setNewRole(member.role); setRoleDialogOpen(true); }}>
                                    <Shield className="h-4 w-4 mr-2" /> Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" disabled={member.role === "owner"} onClick={() => handleRemoveMember(member)}>
                                    <UserMinus className="h-4 w-4 mr-2" /> Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Invites Tab */}
                <TabsContent value="invites" className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setInviteOpen(true)} className="font-pixel text-xs gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Send Invite
                    </Button>
                  </div>

                  {selectedOrg.invites.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="font-pixel text-xs">No pending invites</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="w-[100px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrg.invites.map(invite => (
                          <TableRow key={invite.id}>
                            <TableCell className="font-medium">{invite.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${roleBadgeClass[invite.role]}`}>{invite.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5 text-xs">
                                <Clock className="h-3 w-3 text-accent" /> {invite.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{invite.expiresAt}</TableCell>
                            <TableCell className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`https://app.openclaw.ai/invite/${invite.id}`); toast({ title: "Link copied!" }); }}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleCancelInvite(invite.id)}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* Roles & Permissions Tab */}
                <TabsContent value="roles" className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Role-based access control determines what actions each member can perform.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.entries(rolePermissions) as [OrgRole, string[]][]).map(([role, perms]) => {
                      const RoleIcon = roleIcons[role];
                      const count = selectedOrg.members.filter(m => m.role === role).length;
                      return (
                        <Card key={role} className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`gap-1 ${roleBadgeClass[role]}`}>
                                  <RoleIcon className="h-3.5 w-3.5" /> {role}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{count} member{count !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                            <Separator className="mb-3" />
                            <div className="space-y-1.5">
                              {perms.map(perm => (
                                <div key={perm} className="flex items-center gap-2 text-xs">
                                  <Check className="h-3 w-3 text-primary" />
                                  <span className="text-foreground">{perm.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Create Org Dialog */}
      <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-pixel">Create Organization</DialogTitle>
            <DialogDescription>Set up a new organization for your AI agent team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div>
                <Label className="text-xs">Logo</Label>
                <Input value={newOrgLogo} onChange={e => setNewOrgLogo(e.target.value)} className="w-16 text-center text-2xl" maxLength={2} />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Name</Label>
                <Input value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="My AI Company" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input value={newOrgDesc} onChange={e => setNewOrgDesc(e.target.value)} placeholder="What does this org do?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOrgOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrg} disabled={!newOrgName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-pixel">Invite Member</DialogTitle>
            <DialogDescription>Send an invitation to join {selectedOrg.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={inviteRole} onValueChange={v => setInviteRole(v as OrgRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
              <Mail className="h-4 w-4 mr-1" /> Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-pixel">Change Role</DialogTitle>
            <DialogDescription>Update role for {selectedMember?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs">New Role</Label>
            <Select value={newRole} onValueChange={v => setNewRole(v as OrgRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {newRole && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-2">Permissions:</p>
                {rolePermissions[newRole].map(p => (
                  <span key={p} className="inline-flex items-center gap-1 text-[10px] text-foreground mr-2 mb-1">
                    <Check className="h-2.5 w-2.5 text-primary" /> {p.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Org Dialog */}
      <Dialog open={editOrgOpen} onOpenChange={setEditOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-pixel">Edit Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div>
                <Label className="text-xs">Logo</Label>
                <Input value={selectedOrg.logo} onChange={e => { const updated = { ...selectedOrg, logo: e.target.value }; setSelectedOrg(updated); setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o)); }} className="w-16 text-center text-2xl" maxLength={2} />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Name</Label>
                <Input value={selectedOrg.name} onChange={e => { const updated = { ...selectedOrg, name: e.target.value }; setSelectedOrg(updated); setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o)); }} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input value={selectedOrg.description} onChange={e => { const updated = { ...selectedOrg, description: e.target.value }; setSelectedOrg(updated); setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o)); }} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEditOrgOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
