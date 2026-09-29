"use client";

import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  Play,
  XCircle,
  Activity,
  Layers,
  ShieldAlert,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AutomationJob {
  jobId: string;
  jobType: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "RETRYING" | "DEAD_LETTER" | "CANCELLED";
  attempt: number;
  maxAttempts: number;
  scheduledAt: string;
  lastError?: string;
  errorCategory?: string;
  correlationId?: string;
}

const MOCK_JOBS: AutomationJob[] = [
  {
    jobId: "JOB_1092_ORDER_STUCK",
    jobType: "ORDER_STUCK_ESCALATION",
    status: "COMPLETED",
    attempt: 1,
    maxAttempts: 3,
    scheduledAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    correlationId: "CORR_ORD_881",
  },
  {
    jobId: "JOB_1093_LOT_EXPIRY",
    jobType: "INVENTORY_LOT_EXPIRY",
    status: "COMPLETED",
    attempt: 1,
    maxAttempts: 3,
    scheduledAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    correlationId: "CORR_INV_902",
  },
  {
    jobId: "JOB_1094_SETTLEMENT_RETRY",
    jobType: "RETRY_FAILED_SETTLEMENT",
    status: "DEAD_LETTER",
    attempt: 3,
    maxAttempts: 3,
    scheduledAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastError: "Payout provider timeout after 3 attempts",
    errorCategory: "DEPENDENCY",
    correlationId: "CORR_FIN_401",
  },
  {
    jobId: "JOB_1095_CART_ABANDONED",
    jobType: "CUSTOMER_CART_ABANDONED",
    status: "RUNNING",
    attempt: 1,
    maxAttempts: 3,
    scheduledAt: new Date().toISOString(),
    correlationId: "CORR_CUST_12",
  },
];

export function AutomationControlCenter() {
  const [jobs, setJobs] = useState<AutomationJob[]>(MOCK_JOBS);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [isReconciling, setIsReconciling] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = `${job.jobId} ${job.jobType} ${job.correlationId || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    if (selectedTab === "dead_letter") return matchesSearch && job.status === "DEAD_LETTER";
    if (selectedTab === "running") return matchesSearch && (job.status === "RUNNING" || job.status === "PENDING");
    return matchesSearch;
  });

  const handleRetryJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.jobId === jobId ? { ...j, status: "PENDING", attempt: 0, lastError: undefined } : j
      )
    );
    toast.success(`Job ${jobId} scheduled for retry`);
  };

  const handleCancelJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.jobId === jobId ? { ...j, status: "CANCELLED" } : j))
    );
    toast.info(`Job ${jobId} cancelled`);
  };

  const handleTriggerReconciliation = async () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      toast.success("Automated financial and inventory reconciliation triggered successfully");
    }, 1200);
  };

  const getStatusBadge = (status: AutomationJob["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">COMPLETED</Badge>;
      case "RUNNING":
        return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 animate-pulse">RUNNING</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600">PENDING</Badge>;
      case "RETRYING":
        return <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600">RETRYING</Badge>;
      case "DEAD_LETTER":
        return <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600">DEAD LETTER</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Control Center"
        subtitle="Operational workflow engine, lease locking, backoff retries, and dead letter queues."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isReconciling}
              onClick={handleTriggerReconciliation}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isReconciling ? "animate-spin" : ""}`} />
              Run Reconciliation
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Engine Status</p>
            <p className="text-xl font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-5 w-5" /> ACTIVE
            </p>
          </div>
          <Activity className="h-8 w-8 text-emerald-500/30" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Queued / Running</p>
            <p className="text-xl font-bold mt-1">
              {jobs.filter((j) => j.status === "PENDING" || j.status === "RUNNING").length}
            </p>
          </div>
          <Clock className="h-8 w-8 text-blue-500/30" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Dead Letter Queue</p>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {jobs.filter((j) => j.status === "DEAD_LETTER").length}
            </p>
          </div>
          <ShieldAlert className="h-8 w-8 text-rose-500/30" />
        </Card>

        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Distributed Locks</p>
            <p className="text-xl font-bold mt-1">1 Active Lease</p>
          </div>
          <Layers className="h-8 w-8 text-purple-500/30" />
        </Card>
      </div>

      {/* Filter and Job Table */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="running">Queued / Active</TabsTrigger>
              <TabsTrigger value="dead_letter">Dead Letter ({jobs.filter((j) => j.status === "DEAD_LETTER").length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by Job ID or type..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Correlation ID</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.jobId}>
                  <TableCell className="font-mono text-xs font-semibold">{job.jobId}</TableCell>
                  <TableCell className="font-medium text-sm">{job.jobType}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="text-sm">{job.attempt} / {job.maxAttempts}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{job.correlationId || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(job.scheduledAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {job.status === "DEAD_LETTER" || job.status === "FAILED" ? (
                      <Button size="sm" variant="outline" onClick={() => handleRetryJob(job.jobId)}>
                        <Play className="mr-1 h-3 w-3" /> Retry
                      </Button>
                    ) : null}
                    {job.status === "PENDING" || job.status === "RUNNING" ? (
                      <Button size="sm" variant="ghost" onClick={() => handleCancelJob(job.jobId)} className="text-rose-600">
                        <XCircle className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
