"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    Download,
    FileText,
    FileSpreadsheet,
    Filter,
    BarChart3,
    Users,
    Building2,
    TrendingUp,
    Target,
    PoundSterling,
    ExternalLink,
    Calendar,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

// Report Types
type ReportType = "sales-funnel" | "engineer-utilization" | "site-profitability";

const reportConfig: Record<ReportType, { title: string; subtitle: string; icon: React.ElementType }> = {
    "sales-funnel": {
        title: "Sales Funnel Intelligence",
        subtitle: "Conversion optimization and lead velocity metrics",
        icon: BarChart3,
    },
    "engineer-utilization": {
        title: "Force Productivity",
        subtitle: "Engineer billable efficiency and resource allocation",
        icon: Users,
    },
    "site-profitability": {
        title: "Asset Performance",
        subtitle: "Commercial margin analysis and revenue leakage detection",
        icon: Building2,
    },
};

// Mock Data
const salesFunnelData = {
    summary: {
        totalLeads: 145,
        totalValue: 580000,
        conversionRate: 35.9,
        avgDealSize: 4200,
    },
    stages: [
        { stage: "Leads", count: 145, value: 580000, avgTime: "—" },
        { stage: "Quotes", count: 98, value: 425000, avgTime: "3.2 days" },
        { stage: "Jobs", count: 72, value: 312000, avgTime: "5.1 days" },
        { stage: "Completed", count: 58, value: 248000, avgTime: "12.4 days" },
        { stage: "Paid", count: 52, value: 218500, avgTime: "8.7 days" },
    ],
    bySource: [
        { source: "Organic Web", leads: 48, converted: 18, rate: 37.5 },
        { source: "Client Referral", leads: 35, converted: 16, rate: 45.7 },
        { source: "Direct Dial", leads: 28, converted: 10, rate: 35.7 },
        { source: "Trade Partnership", leads: 22, converted: 6, rate: 27.3 },
    ],
};

const utilizationData = {
    summary: {
        totalEngineers: 5,
        avgUtilization: 84.0,
        totalBillableHours: 578,
        totalJobs: 69,
    },
    engineers: [
        { id: "ENG-001", name: "Mike Johnson", hoursAvailable: 160, hoursWorked: 148, billableHours: 132, jobsCompleted: 18, utilization: 92.5 },
        { id: "ENG-002", name: "David Brown", hoursAvailable: 160, hoursWorked: 142, billableHours: 125, jobsCompleted: 15, utilization: 88.8 },
        { id: "ENG-003", name: "Tom Williams", hoursAvailable: 160, hoursWorked: 136, billableHours: 118, jobsCompleted: 14, utilization: 85.0 },
    ],
};

const profitabilityData = {
    summary: {
        totalRevenue: 363500,
        totalCosts: 256200,
        totalProfit: 107300,
        avgMargin: 29.5,
    },
    sites: [
        { id: "P-2024-001", name: "Johnson Residence - Roof Installation", revenue: 45000, labourCost: 18000, materialsCost: 8500, profit: 16500, margin: 36.7 },
        { id: "P-2024-002", name: "Acme HQ - Emergency Repair", revenue: 12500, labourCost: 4200, materialsCost: 2200, profit: 5300, margin: 42.4 },
        { id: "P-2024-003", name: "Heritage Building Restoration", revenue: 85000, labourCost: 38000, materialsCost: 18000, profit: 23000, margin: 27.1 },
    ],
};

// Stat Card Component
function StatCard({ title, value, color }: { title: string; value: string | number; color?: string }) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className={`text-2xl font-black mt-1 ${color || ''}`}>{value}</p>
            </CardContent>
        </Card>
    );
}

// Sales Funnel Detail Component
function SalesFunnelDetail() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Pipeline Depth" value={salesFunnelData.summary.totalLeads} />
                <StatCard title="Capital Exposure" value={`£${(salesFunnelData.summary.totalValue / 1000).toFixed(0)}k`} />
                <StatCard title="Win Probability" value={`${salesFunnelData.summary.conversionRate}%`} color="text-emerald-600" />
                <StatCard title="Unit Economics" value={`£${salesFunnelData.summary.avgDealSize.toLocaleString()}`} />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Lifecycle Phase</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Volume</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Estimated Value</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Step Retention</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Mean Dwell Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salesFunnelData.stages.map((stage, idx) => (
                            <TableRow key={stage.stage} className="group">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        <span className="text-sm font-bold">{stage.stage}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">{stage.count}</TableCell>
                                <TableCell className="text-right text-sm font-bold">£{stage.value.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    {idx > 0 ? (
                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest h-5 bg-muted/50">
                                            {((stage.count / salesFunnelData.stages[idx - 1].count) * 100).toFixed(0)}% Yield
                                        </Badge>
                                    ) : <span className="text-muted-foreground text-xs">—</span>}
                                </TableCell>
                                <TableCell className="text-right text-xs font-medium text-muted-foreground pr-6">{stage.avgTime}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Source Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {salesFunnelData.bySource.map((s) => (
                            <div key={s.source} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                    <span>{s.source}</span>
                                    <span className="text-emerald-600">{s.rate}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${s.rate}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col justify-center text-center space-y-2">
                    <Target className="h-8 w-8 text-primary mx-auto mb-2 opacity-50" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Opportunity Score</p>
                    <p className="text-3xl font-black text-primary">A- / Optimal</p>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto font-medium">Conversion velocity is 14% higher than industry benchmark for professional roofing services.</p>
                </div>
            </div>
        </div>
    );
}

// Engineer Utilization Detail Component
function EngineerUtilizationDetail() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Active Force" value={utilizationData.summary.totalEngineers} />
                <StatCard title="Mean Utilization" value={`${utilizationData.summary.avgUtilization}%`} color="text-primary" />
                <StatCard title="Total Billable" value={`${utilizationData.summary.totalBillableHours}h`} />
                <StatCard title="Throughput" value={utilizationData.summary.totalJobs} />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Technical Resource</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Commitment</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Billable</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Job Yield</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 pr-6">Efficiency Profile</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {utilizationData.engineers.map((eng) => (
                            <TableRow key={eng.id}>
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-[11px] font-black">
                                            {eng.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">{eng.name}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{eng.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                    <span className="font-bold">{eng.hoursWorked}</span>
                                    <span className="text-muted-foreground">/{eng.hoursAvailable}h</span>
                                </TableCell>
                                <TableCell className="text-right text-sm font-black text-emerald-600">{eng.billableHours}h</TableCell>
                                <TableCell className="text-right text-sm font-medium">{eng.jobsCompleted}</TableCell>
                                <TableCell className="pr-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[100px]">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${eng.utilization}%` }} />
                                        </div>
                                        <span className="text-xs font-black">{eng.utilization}%</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// Site Profitability Detail Component
function SiteProfitabilityDetail() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard title="Gross Takings" value={`£${profitabilityData.summary.totalRevenue.toLocaleString()}`} color="text-emerald-600" />
                <StatCard title="Direct Costs" value={`£${profitabilityData.summary.totalCosts.toLocaleString()}`} color="text-red-600" />
                <StatCard title="Net Surplus" value={`£${profitabilityData.summary.totalProfit.toLocaleString()}`} />
                <StatCard title="Realised Margin" value={`${profitabilityData.summary.avgMargin}%`} />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Project Entity</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Revenue</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Ops Cost</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Net Return</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Commercial Margin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profitabilityData.sites.map((site) => (
                            <TableRow key={site.id}>
                                <TableCell className="pl-6 py-4">
                                    <div className="max-w-[280px]">
                                        <p className="text-sm font-bold truncate tracking-tight">{site.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{site.id}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">£{site.revenue.toLocaleString()}</TableCell>
                                <TableCell className="text-right text-sm text-red-600 font-medium">£{(site.labourCost + site.materialsCost).toLocaleString()}</TableCell>
                                <TableCell className="text-right text-sm font-black text-emerald-600">£{site.profit.toLocaleString()}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase tracking-widest h-5">
                                        {site.margin}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

export default function ReportDetailPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = use(params);
    const [dateRange, setDateRange] = useState("month");

    const reportType = (type as ReportType) || "sales-funnel";
    const config = reportConfig[reportType] || reportConfig["sales-funnel"];
    const Icon = config.icon;

    return (
        <>
            <Topbar title="Operational Intelligence" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Navigation */}
                <div className="mb-4">
                    <Link href="/reports">
                        <Button variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Hub
                        </Button>
                    </Link>
                </div>

                {/* Report Header Card */}
                <Card className="mb-8 border-none shadow-sm">
                    <CardContent className="py-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-xl font-black tracking-tight">{config.title}</h1>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{config.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={dateRange} onValueChange={setDateRange}>
                                    <SelectTrigger className="w-[160px] h-9 bg-background shadow-sm border-none">
                                        <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="month">Current Month</SelectItem>
                                        <SelectItem value="quarter">Q1 2024</SelectItem>
                                        <SelectItem value="year">FY 2024</SelectItem>
                                    </SelectContent>
                                </Select>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9 bg-background shadow-sm border-none">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuItem>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Analyst Report (PDF)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Audit Trail (XLSX)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Intelligent Content */}
                {reportType === "sales-funnel" && <SalesFunnelDetail />}
                {reportType === "engineer-utilization" && <EngineerUtilizationDetail />}
                {reportType === "site-profitability" && <SiteProfitabilityDetail />}
            </main>
        </>
    );
}
