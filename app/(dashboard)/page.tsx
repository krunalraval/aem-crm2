"use client";

import { Topbar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  PoundSterling,
  Briefcase,
  HardHat,
  AlertTriangle,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox,
} from "lucide-react";
import Link from "next/link";

// Mock Data
const kpiData = {
  leads: { value: 142, change: "+12", trend: "up" },
  revenue: { value: "£1.2M", change: "+18%", trend: "up" },
  jobsToday: { value: 8, completed: 3, trend: "neutral" },
  engineersActive: { value: 6, total: 10, trend: "neutral" },
};

const pipelineData = [
  { stage: "New Leads", count: 24, value: 480000, percent: 100 },
  { stage: "Contacted", count: 18, value: 360000, percent: 75 },
  { stage: "Qualified", count: 12, value: 540000, percent: 50 },
  { stage: "Proposal", count: 8, value: 720000, percent: 33 },
  { stage: "Negotiation", count: 5, value: 450000, percent: 21 },
];

const upcomingJobs = [
  { id: "J-001", title: "Roof Inspection", customer: "Johnson Roofing LLC", time: "9:00 AM", engineer: "MJ", status: "scheduled" },
  { id: "J-002", title: "Material Delivery", customer: "Acme Construction", time: "11:00 AM", engineer: "TB", status: "in_progress" },
  { id: "J-003", title: "Installation - Phase 2", customer: "Premier Builders", time: "1:00 PM", engineer: "SW", status: "scheduled" },
  { id: "J-004", title: "Emergency Repair", customer: "Downtown Office", time: "3:00 PM", engineer: "JD", status: "urgent" },
];

const inventoryAlerts = [
  { id: "MAT-002", name: "Aluminium Flashing", currentQty: 150, reorderPoint: 200, unit: "ft", severity: "warning" },
  { id: "MAT-004", name: "Ice & Water Shield", currentQty: 0, reorderPoint: 50, unit: "rolls", severity: "critical" },
  { id: "MAT-008", name: "Roof Sealant", currentQty: 12, reorderPoint: 25, unit: "tubes", severity: "warning" },
];

const jobStatusStyles: Record<string, string> = {
  scheduled: "bg-muted text-muted-foreground",
  in_progress: "bg-green-500/10 text-green-600",
  urgent: "bg-red-500/10 text-red-600",
  completed: "bg-muted text-muted-foreground",
};

// Empty State Component
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">{description}</p>
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1 leading-none">{value}</p>
            <p className={`text-sm mt-2 ${trend === "up" ? "text-green-600" : "text-muted-foreground"}`}>
              {trend === "up" && <TrendingUp className="inline h-3 w-3 mr-1" />}
              {subtitle}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const hasJobs = upcomingJobs.length > 0;
  const hasAlerts = inventoryAlerts.length > 0;

  const formatCurrency = (value: number) => {
    return `£${(value / 1000).toFixed(0)}K`;
  };

  return (
    <>
      <Topbar title="Dashboard" subtitle="Welcome back, John" />
      <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Active Leads"
            value={kpiData.leads.value}
            subtitle={`${kpiData.leads.change} this week`}
            icon={Users}
            trend="up"
          />
          <KPICard
            title="Monthly Revenue"
            value={kpiData.revenue.value}
            subtitle={`${kpiData.revenue.change} from last month`}
            icon={PoundSterling}
            trend="up"
          />
          <KPICard
            title="Jobs Today"
            value={kpiData.jobsToday.value}
            subtitle={`${kpiData.jobsToday.completed} completed`}
            icon={Briefcase}
          />
          <KPICard
            title="Engineers Active"
            value={`${kpiData.engineersActive.value}/${kpiData.engineersActive.total}`}
            subtitle="In the field now"
            icon={HardHat}
          />
        </div>

        {/* Pipeline Summary */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">Pipeline Summary</CardTitle>
            <Link href="/leads">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {pipelineData.map((stage) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">{stage.count}</span>
                    </div>
                    <span className="text-muted-foreground">{formatCurrency(stage.value)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary/60 transition-all duration-300"
                      style={{ width: `${stage.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total Pipeline Value</span>
              <span className="text-lg font-semibold">£2.55M</span>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Upcoming Jobs */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-medium">Today&apos;s Jobs</CardTitle>
              <Link href="/scheduling">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8">
                  View Schedule <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {hasJobs ? (
                <div className="space-y-3">
                  {upcomingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {job.engineer}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{job.customer}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {job.time}
                          </p>
                        </div>
                        <Badge variant="secondary" className={jobStatusStyles[job.status]}>
                          {job.status === "in_progress" ? "In Progress" :
                            job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No jobs scheduled"
                  description="There are no jobs scheduled for today."
                />
              )}
            </CardContent>
          </Card>

          {/* Low Inventory Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-medium">Low Inventory</CardTitle>
                {hasAlerts && (
                  <Badge variant="secondary" className="bg-red-500/10 text-red-600 h-5 px-1.5">
                    {inventoryAlerts.length}
                  </Badge>
                )}
              </div>
              <Link href="/inventory">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {hasAlerts ? (
                <div className="space-y-2">
                  {inventoryAlerts.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${item.severity === "critical"
                          ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                          : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.severity === "critical" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        ) : (
                          <Package className="h-4 w-4 text-amber-600 shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">{item.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-medium ${item.severity === "critical" ? "text-red-600" : "text-amber-600"
                          }`}>
                          {item.currentQty} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-3" size="sm">
                    Create Purchase Order
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="All stocked up"
                  description="No inventory items require attention."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
