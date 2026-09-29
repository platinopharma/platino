"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Search,
  RefreshCw,
  Lock,
  UserX,
  UserCheck,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, TableSkeleton } from "@/components/data-states";
import { fromNow, initials } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import {
  useAdminUsers,
  useAdminInvitations,
  useInviteAdminMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useUpdateAdminStatusMutation,
  useUpdateAdminRoleMutation,
  useRevokeAdminSessionsMutation,
  useAdminAuditLogs,
  AdminUserItem,
  AdminInvitationItem,
} from "@/hooks/useAdminUsersQueries";

const ADMIN_ROLES = [
  { value: "superadmin", label: "Super Admin (Full Access)" },
  { value: "operations", label: "Operations Team" },
  { value: "verification", label: "Verification Team" },
  { value: "support", label: "Support Team" },
  { value: "finance", label: "Finance Team" },
];

export default function AdminsManagementPage() {
  const { user } = useAuthStore();
  const currentRole = (user?.role || "").toLowerCase();
  const isSuperAdmin = currentRole === "superadmin" || currentRole === "super admin";

  const [activeTab, setActiveTab] = useState<"users" | "invitations" | "audit">("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUserItem | null>(null);
  const [newRoleValue, setNewRoleValue] = useState("");

  // Form State
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "operations" });
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);
  const [activeInvitationTarget, setActiveInvitationTarget] = useState<{ email: string; name: string; role: string } | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [approvalEmailNotice, setApprovalEmailNotice] = useState("awaisn.offi@gmail.com");

  // Queries & Mutations
  const { data: usersData, isLoading: loadingUsers, isError: isErrorUsers, refetch: refetchUsers } = useAdminUsers();
  const { data: invitationsData, isLoading: loadingInvitations, isError: isErrorInvitations, refetch: refetchInvitations } = useAdminInvitations();
  const { data: auditData, isLoading: loadingAudit, isError: isErrorAudit } = useAdminAuditLogs();

  const inviteMutation = useInviteAdminMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const updateStatusMutation = useUpdateAdminStatusMutation();
  const updateRoleMutation = useUpdateAdminRoleMutation();
  const revokeSessionsMutation = useRevokeAdminSessionsMutation();

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center shadow-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Super Admin Access Required</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Administrative User Management and OTP Approval controls are restricted exclusively to Super Admins.
            Your authenticated role (<span className="font-semibold text-primary">{user?.role || "Admin"}</span>) does not have permission to view or manage platform administrators.
          </p>
        </Card>
      </div>
    );
  }

  const usersList = usersData?.data || [];
  const invitationsList = invitationsData?.data || [];
  const auditLogsList = auditData?.data || [];

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvitations = invitationsList.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.requestedRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingInvitationsCount = invitationsList.filter((i) => i.status === "pending").length;

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await inviteMutation.mutateAsync(inviteForm);
      if (res.success) {
        toast.success(res.message || "Admin invitation created successfully!");
        setActiveInvitationId(res.invitationId);
        setActiveInvitationTarget({
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
        });
        if (res.approvalEmail) setApprovalEmailNotice(res.approvalEmail);
        setCreateModalOpen(false);
        setOtpModalOpen(true);
        setOtpCode("");
        setInviteForm({ name: "", email: "", role: "operations" });
      }
    } catch (err: any) {
      // Error handled by handleResponse/toast
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvitationId || !otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }

    try {
      const res = await verifyOtpMutation.mutateAsync({
        invitationId: activeInvitationId,
        otp: otpCode,
      });
      if (res.success) {
        toast.success(res.message || "Admin account verified and activated successfully!");
        setOtpModalOpen(false);
        setActiveInvitationId(null);
        setActiveInvitationTarget(null);
        setOtpCode("");
        refetchUsers();
        refetchInvitations();
      }
    } catch (err: any) {
      // Handled by API error handler
    }
  };

  const handleResendOtp = async (invitationId: string) => {
    try {
      const res = await resendOtpMutation.mutateAsync(invitationId);
      if (res.success) {
        toast.success(res.message || "New OTP dispatched to Super Admin email.");
      }
    } catch (err: any) {}
  };

  const handleStatusChange = async (id: string, status: "active" | "suspended" | "deactivated") => {
    try {
      const res = await updateStatusMutation.mutateAsync({ id, status });
      toast.success(res.message || `Admin status updated to ${status}.`);
    } catch (err: any) {}
  };

  const handleRoleChangeSubmit = async () => {
    if (!selectedUserForRole || !newRoleValue) return;
    try {
      const res = await updateRoleMutation.mutateAsync({
        id: selectedUserForRole.id,
        role: newRoleValue,
      });
      toast.success(res.message || "Admin role updated successfully.");
      setRoleModalOpen(false);
      setSelectedUserForRole(null);
    } catch (err: any) {}
  };

  const handleRevokeSessions = async (id: string, name: string) => {
    try {
      const res = await revokeSessionsMutation.mutateAsync(id);
      toast.success(res.message || `All active sessions revoked for ${name}.`);
    } catch (err: any) {}
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "superadmin":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "operations":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "verification":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "support":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "finance":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>;
      case "suspended":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Suspended</Badge>;
      case "deactivated":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">Deactivated</Badge>;
      case "pending":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Pending OTP</Badge>;
      case "approved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>;
      case "expired":
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control & Security Center"
        subtitle="Super Admin authoritative management for platform administrators, roles, pending OTP invitations, and security audit telemetry."
        actions={
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Create Admin
          </Button>
        }
      />

      {(isErrorUsers || isErrorInvitations || isErrorAudit) && (
        <Card className="p-4 border-destructive/30 bg-destructive/5 text-destructive flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-sm">Failed to load administrative data</div>
              <div className="text-xs text-muted-foreground">
                Your Super Admin session may have expired or network authentication failed. Please verify your session.
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchUsers();
              refetchInvitations();
            }}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Request
          </Button>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Active Admins ({loadingUsers ? "..." : usersList.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending Invitations ({loadingInvitations ? "..." : pendingInvitationsCount})
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="h-4 w-4" />
              Audit Telemetry ({loadingAudit ? "..." : auditLogsList.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="pl-9"
          />
        </div>
      </div>

      {activeTab === "users" && (
        <Card className="overflow-hidden p-0">
          {loadingUsers ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title={searchQuery ? "No matching admin accounts" : "No registered admin users"}
              description="Platform administrators created by Super Admin will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(admin.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {admin.name}
                            {admin.isSuperAdmin && (
                              <Badge className="bg-rose-500/10 text-rose-600 text-[10px] py-0 px-1.5 border-rose-500/20">
                                Super
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{admin.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeVariant(admin.role)} variant="outline">
                        {admin.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(admin.adminStatus)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {fromNow(admin.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {admin.lastLoginAt ? fromNow(admin.lastLoginAt) : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage Admin</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserForRole(admin);
                              setNewRoleValue(admin.role);
                              setRoleModalOpen(true);
                            }}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>

                          {admin.adminStatus === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(admin.id, "suspended")}
                              className="text-amber-600 focus:text-amber-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(admin.id, "active")}
                              className="text-emerald-600 focus:text-emerald-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Reactivate Account
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => handleRevokeSessions(admin.id, admin.name)}
                            className="text-rose-600 focus:text-rose-600"
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Revoke Active Sessions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === "invitations" && (
        <Card className="overflow-hidden p-0">
          {loadingInvitations ? (
            <TableSkeleton rows={4} cols={5} />
          ) : filteredInvitations.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No pending admin invitations"
              description="Admin account invitations waiting for Super Admin OTP verification will be shown here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invited Admin</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-foreground">{inv.name}</div>
                        <div className="text-xs text-muted-foreground">{inv.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeVariant(inv.requestedRole)} variant="outline">
                        {inv.requestedRole.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {inv.createdBy?.name} ({inv.createdBy?.email})
                    </TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {fromNow(inv.expiresAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendOtp(inv.id)}
                            className="gap-1.5"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Resend OTP
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveInvitationId(inv.id);
                              setActiveInvitationTarget({
                                email: inv.email,
                                name: inv.name,
                                role: inv.requestedRole,
                              });
                              setOtpModalOpen(true);
                              setOtpCode("");
                            }}
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Enter OTP
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {activeTab === "audit" && (
        <Card className="overflow-hidden p-0">
          {loadingAudit ? (
            <TableSkeleton rows={8} cols={5} />
          ) : auditLogsList.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No security audit events recorded"
              description="Sensitive administrative actions and login attempts will be logged here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogsList.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {log.actorEmail || log.actorId || "System"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{log.actorRole || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-primary">{log.action}</span>
                      {log.failureReason && (
                        <div className="text-[11px] text-rose-500 font-medium">{log.failureReason}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip || "127.0.0.1"}</TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Success</Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fromNow(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* CREATE ADMIN INVITATION MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite New Administrator
            </DialogTitle>
            <DialogDescription>
              Initiate an admin invitation. After creation, a single-use 6-digit OTP will be dispatched to the Super Admin address for verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvite} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <Input
                required
                placeholder="e.g. Rahul Sharma"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <Input
                type="email"
                required
                placeholder="admin@platinopharma.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Administrative Role</label>
              <Select
                value={inviteForm.role}
                onValueChange={(val) => setInviteForm({ ...inviteForm, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select administrative role" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                Security Approval Requirement
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                Creating an administrator does NOT immediately grant access. A secure 6-digit OTP will be sent to{" "}
                <span className="font-mono font-bold underline">awaisn.offi@gmail.com</span>. You must enter this OTP to complete activation.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Generating Invitation..." : "Send Invitation & Generate OTP"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP VERIFICATION MODAL */}
      <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <KeyRound className="h-5 w-5" />
              Super Admin OTP Verification
            </DialogTitle>
            <DialogDescription>
              Enter the single-use 6-digit OTP sent to <span className="font-mono font-bold text-foreground">{approvalEmailNotice}</span> to approve and activate this admin account.
            </DialogDescription>
          </DialogHeader>

          {activeInvitationTarget && (
            <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Target Admin:</span>{" "}
                <span className="font-semibold text-foreground">{activeInvitationTarget.name}</span> ({activeInvitationTarget.email})
              </div>
              <div>
                <span className="text-muted-foreground">Assigned Role:</span>{" "}
                <Badge className={getRoleBadgeVariant(activeInvitationTarget.role)} variant="outline">
                  {activeInvitationTarget.role.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">6-Digit Verification Code</label>
              <Input
                required
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="font-mono text-center text-lg tracking-[0.5em]"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">OTP expires in 10 minutes</span>
              <button
                type="button"
                onClick={() => activeInvitationId && handleResendOtp(activeInvitationId)}
                className="text-primary hover:underline font-medium"
              >
                Resend OTP
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOtpModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Activate Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CHANGE ROLE MODAL */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Admin Role</DialogTitle>
            <DialogDescription>
              Select a new administrative role for <span className="font-semibold text-foreground">{selectedUserForRole?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">New Role</label>
              <Select value={newRoleValue} onValueChange={setNewRoleValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChangeSubmit} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
