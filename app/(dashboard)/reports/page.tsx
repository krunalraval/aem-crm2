"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Download,
    FileText,
    FileSpreadsheet,
    TrendingUp,
    Users,
    Building2,
    Filter,
    ArrowRight,
    BarChart3,
    Target,
    Clock,
    PoundSterling,
} from "lucide-react";

// Mock Data
const mockData = {
    salesFunnel: {
        leads: { count: 145, value: 580000 },
        quotes: { count: 98, value: 425000 },
        jobs: { count: 72, value: 312000 },
        completed: { count: 58, value: 248000 },
        paid: { count: 52, value: 218500 },
    },
    engineerUtilization: [
        { id: "ENG-001", name: "Mike Johnson", hoursAvailable: 160, hoursWorked: 148, utilization: 92.5 },
        { id: "ENG-002", name: "David Brown", hoursAvailable: 160, hoursWorked: 142, utilization: 88.8 },
        { id: "ENG-003", name: "Tom Williams", hoursAvailable: 160, hoursWorked: 136, utilization: 85.0 },
        { id: "ENG-004", name: "James Taylor", hoursAvailable: 160, hoursWorked: 128, utilization: 80.0 },
    ],
    siteProfitability: [
        { id: "P-2024-001", siteName: "Johnson Residence - Roof Installation", revenue: 45000, profit: 16500, margin: 36.7 },
        { id: "P-2024-002", siteName: "Acme HQ - Emergency Repair", revenue: 12500, profit: 5300, margin: 42.4 },
        { id: "P-2024-003", siteName: "Heritage Building Restoration", revenue: 85000, profit: 23000, margin: 27.1 },
    ],
    summary: {
        totalRevenue: 363500,
        totalProfit: 107300,
        avgMargin: 29.5,
        avgUtilization: 84.0,
        conversionRate: 35.9,
    },
};

const customers = [
    { id: "all", name: "All Customers" },
    { id: "ACC-001", name: "Johnson Roofing LLC" },
    { id: "ACC-002", name: "Acme Construction" },
];

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subValue }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subValue?: string;
}) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <p className={`text-2xl font-black mt-1.5 ${color || ''}`}>{value}</p>
                        {subValue && <p className="text-[11px] text-muted-foreground mt-1 font-medium">{subValue}</p>}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Funnel Stage Component
function FunnelStage({
    label,
    count,
    value,
    width,
    color,
    nextRate
}: {
    label: string;
    count: number;
    value: number;
    width: string;
    color: string;
    nextRate?: number;
}) {
    return (
        <div className="group space-y-2">
            <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                <span className="text-xs font-black">{count}</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                    <div
                        className={`h-full ${color} rounded-full transition-all duration-500 group-hover:opacity-80`}
                        style={{ width }}
                    />
                </div>
                <div className="w-16 text-right">
                    <span className="text-xs font-bold text-foreground">£{(value / 1000).toFixed(0)}k</span>
                </div>
            </div>
            {nextRate !== undefined && (
                <div className="flex justify-center -mb-1">
                    <div className="px-2 py-0.5 rounded-full bg-muted/50 border border-muted-foreground/10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                        {nextRate.toFixed(0)}% Conversion
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState("month");

    const formatCurrency = (amount: number) => {
        return `£${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    // Calculate conversion rates
    const leadToQuote = (mockData.salesFunnel.quotes.count / mockData.salesFunnel.leads.count) * 100;
    const quoteToJob = (mockData.salesFunnel.jobs.count / mockData.salesFunnel.quotes.count) * 100;
    const jobToComplete = (mockData.salesFunnel.completed.count / mockData.salesFunnel.jobs.count) * 100;
    const completeToPaid = (mockData.salesFunnel.paid.count / mockData.salesFunnel.completed.count) * 100;

    return (
        <>
            <Topbar title="Intelligence Hub" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Header Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[160px] h-9 bg-background shadow-sm border-none">
                                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="quarter">This Quarter</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px] h-9 bg-background shadow-sm border-none">
                                <Building2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entities</SelectItem>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 bg-background shadow-sm border-none">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Insight
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Executive Summary (PDF)
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Data Set (CSV)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <StatCard
                        title="Aggregated Revenue"
                        value={formatCurrency(mockData.summary.totalRevenue)}
                        icon={PoundSterling}
                        color="text-emerald-600"
                        subValue="+12.5% from last period"
                    />
                    <StatCard
                        title="Gross Profitability"
                        value={formatCurrency(mockData.summary.totalProfit)}
                        icon={TrendingUp}
                        subValue="29.5% average margin"
                    />
                    <StatCard
                        title="Success Velocity"
                        value={`${mockData.summary.conversionRate.toFixed(1)}%`}
                        icon={Target}
                        subValue="Leads to settlement"
                    />
                    <StatCard
                        title="Resource Efficiency"
                        value={`${mockData.summary.avgUtilization.toFixed(1)}%`}
                        icon={Users}
                        subValue="Billable engineer hours"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Sales Funnel Visualization */}
                    <Card className="lg:col-span-1 border-none shadow-sm flex flex-col">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    Acquisition Pipeline
                                </CardTitle>
                                <Link href="/reports/sales-funnel">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50 rounded-lg">
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6 pt-2">
                            <FunnelStage
                                label="Inbound Leads"
                                count={mockData.salesFunnel.leads.count}
                                value={mockData.salesFunnel.leads.value}
                                width="100%"
                                color="bg-blue-500"
                                nextRate={leadToQuote}
                            />
                            <FunnelStage
                                label="Qualified Quotes"
                                count={mockData.salesFunnel.quotes.count}
                                value={mockData.salesFunnel.quotes.value}
                                width="85%"
                                color="bg-indigo-500"
                                nextRate={quoteToJob}
                            />
                            <FunnelStage
                                label="Committed Jobs"
                                count={mockData.salesFunnel.jobs.count}
                                value={mockData.salesFunnel.jobs.value}
                                width="70%"
                                color="bg-purple-500"
                                nextRate={jobToComplete}
                            />
                            <FunnelStage
                                label="Project Completions"
                                count={mockData.salesFunnel.completed.count}
                                value={mockData.salesFunnel.completed.value}
                                width="55%"
                                color="bg-green-500"
                                nextRate={completeToPaid}
                            />
                            <FunnelStage
                                label="Settled Revenue"
                                count={mockData.salesFunnel.paid.count}
                                value={mockData.salesFunnel.paid.value}
                                width="40%"
                                color="bg-emerald-600"
                            />
                        </CardContent>
                    </Card>

                    {/* Operational Performance */}
                    <Card className="lg:col-span-2 border-none shadow-sm h-full">
                        <div className="grid md:grid-cols-2 h-full divide-x divide-muted/50">
                            {/* Engineer Column */}
                            <div className="flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />
                                            Force Utilization
                                        </CardTitle>
                                        <Link href="/reports/engineer-utilization">
                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-primary">View All</Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="space-y-1">
                                        {mockData.engineerUtilization.map((eng) => (
                                            <div key={eng.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-all">
                                                        {eng.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold tracking-tight">{eng.name}</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{eng.hoursWorked}h Worked</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${eng.utilization >= 90 ? 'text-emerald-600' : 'text-foreground'}`}>{eng.utilization}%</p>
                                                    <div className="w-16 h-1 mt-1 bg-muted rounded-full overflow-hidden">
                                                        <div className={`h-full ${eng.utilization >= 90 ? 'bg-emerald-500' : 'bg-primary'} rounded-full`} style={{ width: `${eng.utilization}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </div>

                            {/* Profitability Column */}
                            <div className="flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <TrendingUp className="h-3.5 w-3.5" />
                                            Asset Performance
                                        </CardTitle>
                                        <Link href="/reports/site-profitability">
                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-primary">Details</Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="space-y-1">
                                        {mockData.siteProfitability.map((site) => (
                                            <div key={site.id} className="p-3 rounded-xl hover:bg-muted/30 transition-colors group space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="max-w-[140px]">
                                                        <p className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">{site.siteName}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{site.id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-emerald-600">+{formatCurrency(site.profit)}</p>
                                                        <Badge variant="outline" className="text-[9px] font-bold h-4 border-none bg-emerald-50 text-emerald-700 uppercase tracking-widest">{site.margin}%</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </>
    );
}
