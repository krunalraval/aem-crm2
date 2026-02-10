"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TargetDial } from "@/components/dashboard/target-dial";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Briefcase,
    FileText,
    Calendar,
    ChevronRight,
    Phone,
    Mail,
    Plus,
    Building2,
    TrendingUp,
    TrendingDown,
    Package,
    Settings,
    MoreHorizontal,
    LayoutDashboard,
    Bell,
} from "lucide-react";

// --- Mock Data & Helpers ---
import { useAuth } from "@/context/auth-context";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";

type Role = "BDM" | "Admin/Accounts" | "Engineer" | "Super Admin";

const TODAY = new Date().toISOString().split("T")[0];

const mockTasks = [
    { id: "T1", title: "Follow up with Acme Corp", priority: "high", dueDate: TODAY, site: "Acme HQ" },
    { id: "T2", title: "Review site drawings", priority: "medium", dueDate: TODAY, site: "Riverside" },
    { id: "T3", title: "Call John Doe", priority: "high", dueDate: TODAY, site: "Tech Park" },
    { id: "T4", title: "Update CRM leads", priority: "low", dueDate: TODAY, site: "N/A" },
    { id: "T5", title: "Prepare quote for Johnson Roofing", priority: "high", dueDate: TODAY, site: "Johnson HQ" },
];

const pipelineStages = [
    { name: "Initial Contact", count: 12, color: "bg-blue-400" },
    { name: "Site Survey", count: 8, color: "bg-purple-400" },
    { name: "Proposal Sent", count: 15, color: "bg-amber-400" },
    { name: "Negotiation", count: 5, color: "bg-green-400" },
];

const activeQuotes = [
    { ref: "Q-1001", company: "Johnson Roofing", value: 4500, status: "Awaiting Client", days: 3 },
    { ref: "Q-1003", company: "Acme Construction", value: 12500, status: "Urgent", days: 7 },
    { ref: "Q-1005", company: "Prime Builders", value: 3200, status: "Under Review", days: 2 },
];

const weekSchedule = [
    { day: "Mon", tasks: [{ time: "09:00", title: "Initial Meeting - Acme" }] },
    { day: "Tue", tasks: [{ time: "11:00", title: "Site Visit - Johnson" }, { time: "14:30", title: "Proposal Review" }] },
    { day: "Wed", tasks: [{ time: "10:00", title: "Team Call" }] },
    { day: "Thu", tasks: [{ time: "09:30", title: "Site Survey - Tech Park" }] },
    { day: "Fri", tasks: [{ time: "16:00", title: "Weekly Roundup" }] },
];

const pendingInvoices = [
    { id: "INV-881", company: "Metro Dev", amount: 4500, period: "Jan 2024" },
    { id: "INV-882", company: "City Council", amount: 12800, period: "Jan 2024" },
    { id: "INV-883", company: "Skyline Partners", amount: 3200, period: "Feb 2024" },
];

const overdueInvoices = [
    { id: "INV-750", company: "Acme Construction", amount: 8500, status: "Overdue 15d" },
    { id: "INV-720", company: "Riverside Ltd", amount: 4200, status: "Overdue 7d" },
    { id: "INV-710", company: "Johnson Roofing", amount: 2100, status: "Overdue 3d" },
];

const recentConversions = [
    { company: "Prime Builders", site: "Central Office", bdm: "David Brown", date: "2 days ago" },
    { company: "Acme Corp", site: "West Wing", bdm: "Tom Williams", date: "4 days ago" },
];

const engineerJobs = [
    { site: "Johnson Roofing HQ", address: "123 Business Way, London", type: "Installation", time: "08:30" },
    { site: "Acme Construction Site", address: "45 Industrial Ave, Reading", type: "Maintenance", time: "13:00" },
];

const stockAlerts = [
    { name: "8MP Dome Camera", available: 2, threshold: 10 },
    { name: "CAT6 Cable 305m", available: 1, threshold: 5 },
];

const teamRevenueData = [
    { name: "Dec", amount: 85000 },
    { name: "Jan", amount: 105000 },
];

const formatCurrency = (amount: number) => `£${amount.toLocaleString()}`;

// --- Dashboard Layout Container ---

function DashboardWidget({ title, children, footerLink, footerLabel }: { title: string; children: React.ReactNode; footerLink?: string; footerLabel?: string }) {
    return (
        <Card className="border-none shadow-sm flex flex-col h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                {footerLink && (
                    <Link href={footerLink} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                        {footerLabel || "View All"}
                    </Link>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                {children}
            </CardContent>
        </Card>
    );
}

// --- Specific Dashboard Variants ---

function BDMDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Widget 1 - My Tasks Today */}
            <DashboardWidget title={`My Tasks Today (5)`} footerLink="/tasks">
                <div className="space-y-3">
                    {mockTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-muted">
                            <div className={cn("h-2 w-2 rounded-full", task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-slate-300")} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{task.site !== "N/A" ? <Link href="/sites" className="hover:underline">{task.site}</Link> : task.site}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                </div>
            </DashboardWidget>

            {/* Widget 2 - My Pipeline Summary */}
            <DashboardWidget title="My Pipeline Summary" footerLink="/leads">
                <div className="space-y-4 pt-2">
                    <div className="h-4 w-full flex rounded-full overflow-hidden bg-muted">
                        {pipelineStages.map(stage => (
                            <div key={stage.name} className={cn("h-full", stage.color)} style={{ width: `${(stage.count / 40) * 100}%` }} />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-y-2">
                        {pipelineStages.map(stage => (
                            <div key={stage.name} className="flex items-center gap-2">
                                <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                                <span className="text-xs text-muted-foreground">{stage.name}: <span className="font-bold text-foreground">{stage.count}</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 3 - Monthly Target Dial */}
            <DashboardWidget title="Monthly Target Progress">
                <div className="flex flex-col items-center justify-center pt-2">
                    <TargetDial value={3} target={4} stretchTarget={10} />
                    <p className="mt-4 text-xs font-medium text-green-600">On Track for Period</p>
                </div>
            </DashboardWidget>

            {/* Widget 4 - My Quotes */}
            <DashboardWidget title="My Quotes" footerLink="/quotes">
                <div className="space-y-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="h-8 text-[10px] uppercase font-bold">Ref</TableHead>
                                <TableHead className="h-8 text-[10px] uppercase font-bold text-right">Value</TableHead>
                                <TableHead className="h-8 text-[10px] uppercase font-bold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeQuotes.map(quote => (
                                <TableRow key={quote.ref} className="group cursor-pointer">
                                    <TableCell className="py-2">
                                        <Link href={`/quotes?search=${quote.ref}`} className="text-xs font-bold hover:underline text-primary">{quote.ref}</Link>
                                        <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                                            <Link href="/accounts" className="hover:underline">{quote.company}</Link>
                                        </p>
                                    </TableCell>
                                    <TableCell className="py-2 text-right text-xs font-bold">{formatCurrency(quote.value)}</TableCell>
                                    <TableCell className="py-2">
                                        <Badge className={cn("text-[8px] h-4 uppercase font-bold border-none",
                                            quote.status === "Urgent" ? STATUS_COLORS.semantic.error : STATUS_COLORS.semantic.pending
                                        )}>
                                            {quote.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DashboardWidget>

            {/* Widget 5 - This Week's Calendar */}
            <DashboardWidget title="This Week's Calendar" footerLink="/scheduling">
                <div className="space-y-2">
                    {weekSchedule.map(day => (
                        <div key={day.day} className="flex gap-3">
                            <span className="text-[10px] font-black uppercase text-muted-foreground w-8 pt-1">{day.day}</span>
                            <div className="flex-1 space-y-1">
                                {day.tasks.map((task, i) => (
                                    <div key={i} className="p-1 px-2 bg-primary/5 border-l-2 border-primary rounded text-[10px]">
                                        <span className="font-bold mr-2">{task.time}</span> {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardWidget>

            {/* Widget 6 - My Map */}
            <DashboardWidget title="My Map" footerLink="/regions">
                <div className="aspect-video bg-muted/40 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted">
                    <MapPin className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground/50">Mini Map View</p>
                </div>
            </DashboardWidget>
        </div>
    );
}

function AdminDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget 1 - Invoice Approval Queue */}
            <DashboardWidget title={`Approval Queue (3)`} footerLink="/finance">
                <div className="space-y-3">
                    {pendingInvoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm tracking-tight">{inv.id}</p>
                                    <Badge className={cn("text-[10px] h-4 border-none font-bold uppercase", STATUS_COLORS.pipeline.follow_up)}>{inv.period}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <Link href="/accounts" className="hover:underline">{inv.company}</Link>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sm">{formatCurrency(inv.amount)}</p>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase text-amber-700 hover:bg-amber-100">Review</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardWidget>

            {/* Widget 2 - Overdue Invoices */}
            <DashboardWidget title="Overdue Invoices" footerLink="/finance">
                <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-3">
                        <p className="text-[10px] font-bold uppercase text-red-600 tracking-wider">Total Overdue Debt</p>
                        <p className="text-2xl font-black text-red-700">{formatCurrency(14800)}</p>
                    </div>
                    {overdueInvoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between py-2 border-b border-muted/50 last:border-0 hover:bg-muted/30 px-2 rounded transition-colors">
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate">
                                    <Link href="/accounts" className="hover:underline">{inv.company}</Link>
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase">{inv.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-red-600">{formatCurrency(inv.amount)}</p>
                                <Badge className={cn("border-none text-[8px] h-4", STATUS_COLORS.semantic.overdue)}>
                                    {inv.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardWidget>

            {/* Widget 3 - Recent Conversions */}
            <DashboardWidget title="Recent Conversions" footerLink="/accounts">
                <div className="space-y-4 pt-2">
                    {recentConversions.map((conv, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-muted/40 hover:border-primary/20 hover:bg-primary/5 transition-all">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold">{conv.company}</p>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{conv.date}</span>
                                </div>
                                <p className="text-xs text-muted-foreground italic">Converted {conv.site} site by <span className="font-bold text-foreground">{conv.bdm}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardWidget>

            {/* Widget 4 - Site P&L Summary */}
            <DashboardWidget title="Site Profitability" footerLink="/finance">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-8 text-[10px] uppercase font-bold">Site</TableHead>
                            <TableHead className="h-8 text-[10px] uppercase font-bold text-right">Revenue</TableHead>
                            <TableHead className="h-8 text-[10px] uppercase font-bold text-right">Margin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[
                            { name: "Johnson Roofing HQ", rev: 45000, margin: 42, color: "bg-green-500" },
                            { name: "Acme Construction", rev: 12400, margin: 18, color: "bg-amber-500" },
                            { name: "Riverside Center", rev: 8200, margin: -12, color: "bg-red-500" },
                        ].map(site => (
                            <TableRow key={site.name} className="group">
                                <TableCell className="py-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", site.color)} />
                                        <span className="text-xs font-medium truncate max-w-[120px]">{site.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2 text-right text-xs font-bold">{formatCurrency(site.rev)}</TableCell>
                                <TableCell className="py-2 text-right">
                                    <Badge className={cn("text-[9px] h-4 font-bold border-none uppercase",
                                        site.margin > 20 ? STATUS_COLORS.semantic.healthy :
                                            site.margin > 0 ? STATUS_COLORS.semantic.warning : STATUS_COLORS.semantic.error
                                    )}>
                                        {site.margin}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DashboardWidget>
        </div>
    );
}

function EngineerDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Widget 1 - Today's Jobs */}
            <DashboardWidget title="Today's Scheduled Jobs" footerLink="/jobs">
                <div className="space-y-4">
                    {engineerJobs.map((job, i) => (
                        <div key={i} className="flex flex-col gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer active:scale-[0.98]">
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <p className="font-black text-sm uppercase tracking-tight">{job.site}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{job.address}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary">{job.time}</p>
                                    <Badge className={cn("border-none text-[8px] h-4", STATUS_COLORS.job.scheduled)}>
                                        {job.type}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 h-10 font-bold bg-white">Navigate</Button>
                                <Button size="sm" className="flex-1 h-10 font-bold">Start Transit</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardWidget>

            {/* Widget 2 - This Week's Schedule */}
            <DashboardWidget title="Weekly Job Strip" footerLink="/scheduling">
                <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                        <div key={day} className={cn("flex-1 min-w-[60px] p-2 rounded-xl text-center border", i === 0 ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-muted/30 border-muted")}>
                            <p className="text-[10px] font-black uppercase opacity-60">{day}</p>
                            <p className="text-xl font-black mt-1">{i === 1 ? 3 : i === 3 ? 2 : 1}</p>
                            <p className="text-[8px] font-bold uppercase mt-1">Jobs</p>
                        </div>
                    ))}
                </div>
                <div className="pt-4 space-y-2">
                    <p className="text-xs font-bold border-b pb-1">Upcoming Jobs</p>
                    <div className="flex items-center justify-between text-[11px] py-1">
                        <span className="font-medium text-muted-foreground">Tue 09:00</span>
                        <span>Acme Maintenance</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] py-1">
                        <span className="font-medium text-muted-foreground">Tue 13:00</span>
                        <span>Service Call - Apex</span>
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 3 - Map View */}
            <DashboardWidget title="Route Optimizer" footerLink="/rms">
                <div className="aspect-square bg-muted/40 rounded-xl relative overflow-hidden">
                    {/* Mock Map */}
                    <div className="absolute top-1/4 left-1/3 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                    <div className="absolute top-1/2 left-2/3 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                    <div className="absolute bottom-1/3 left-1/2 h-3 w-3 rounded-full bg-white ring-4 ring-slate-200" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <MapPin className="h-16 w-16" />
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 4 & 5 - Alerts */}
            <div className="space-y-6">
                <DashboardWidget title="Outstanding Sign-Offs" footerLink="/jobs">
                    <div className="space-y-2">
                        {[
                            { id: "JOB-910", site: "Heritage Court", date: "Yesterday" },
                            { id: "JOB-905", site: "South Station", date: "2 days ago" },
                        ].map(job => (
                            <div key={job.id} className="flex items-center justify-between p-2 px-3 rounded-lg bg-red-50 border border-red-100 text-red-700">
                                <div>
                                    <p className="text-xs font-bold">{job.id}</p>
                                    <p className="text-[10px] uppercase font-bold opacity-70">{job.site}</p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold uppercase hover:bg-red-100">Sign Now</Button>
                            </div>
                        ))}
                    </div>
                </DashboardWidget>

                <DashboardWidget title="Stock Alerts" footerLink="/inventory">
                    <div className="space-y-2">
                        {stockAlerts.map(item => (
                            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs font-medium">{item.name}</span>
                                </div>
                                <Badge className={cn("h-4 text-[9px] font-black border-none", STATUS_COLORS.semantic.error)}>{item.available} Left</Badge>
                            </div>
                        ))}
                    </div>
                </DashboardWidget>
            </div>
        </div>
    );
}

function ManagementDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Widget 1 - Team Pipeline */}
            <DashboardWidget title="Consolidated Pipeline" footerLink="/leads">
                <div className="space-y-5 pt-2">
                    <div className="h-5 w-full flex rounded-full overflow-hidden shadow-inner bg-muted">
                        <div className="bg-blue-500 h-full w-[35%]" />
                        <div className="bg-purple-500 h-full w-[20%]" />
                        <div className="bg-amber-500 h-full w-[25%]" />
                        <div className="bg-green-500 h-full w-[20%]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Value</p>
                            <p className="text-xl font-black">{formatCurrency(1850000)}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Active Leads</p>
                            <p className="text-xl font-black">142</p>
                        </div>
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 2 - Team Target */}
            <DashboardWidget title="Team Sales Target">
                <div className="flex flex-col items-center justify-center py-2">
                    <TargetDial value={18} target={24} stretchTarget={40} label="sites team-wide" size={180} />
                    <div className="mt-4 flex gap-4">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg Progress</p>
                            <p className="text-sm font-bold">75%</p>
                        </div>
                        <div className="text-center border-l pl-4">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Days Left</p>
                            <p className="text-sm font-bold">12</p>
                        </div>
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 3 - Revenue Overview */}
            <DashboardWidget title="Revenue Momentum" footerLink="/finance">
                <div className="flex items-baseline gap-2 mb-4">
                    <h3 className="text-2xl font-black">{formatCurrency(105000)}</h3>
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> 18% vs PM
                    </span>
                </div>
                <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={teamRevenueData}>
                            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </DashboardWidget>

            {/* Widget 4 - P&L Summary */}
            <DashboardWidget title="Profitability Hotspots" footerLink="/finance">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-green-600 flex items-center justify-between">Top Performers <ArrowUpRight className="h-3 w-3" /></p>
                        {[
                            { name: "Acme HQ", margin: 42 },
                            { name: "Tech Park Expansion", margin: 38 },
                        ].map(s => (
                            <div key={s.name} className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-xs">
                                <span className="font-medium">{s.name}</span>
                                <span className="font-bold text-green-700">{s.margin}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                        <p className="text-[10px] font-black uppercase text-red-600 flex items-center justify-between">Critical Review <ArrowDownRight className="h-3 w-3" /></p>
                        {[
                            { name: "Harbor Reno", margin: -15 },
                            { name: "City West Depot", margin: -8 },
                        ].map(s => (
                            <div key={s.name} className="flex justify-between items-center p-2 bg-red-50 rounded-lg text-xs">
                                <span className="font-medium">{s.name}</span>
                                <span className="font-bold text-red-700">{s.margin}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 5 - Team Calendars */}
            <DashboardWidget title="Field Utilization" footerLink="/scheduling">
                <div className="space-y-4 pt-2">
                    {[
                        { name: "Engineering Team", load: 85, color: "bg-blue-500" },
                        { name: "Sales Team", load: 62, color: "bg-purple-500" },
                    ].map(team => (
                        <div key={team.name} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold">{team.name}</span>
                                <span className="text-[10px] font-black text-muted-foreground uppercase">{team.load}% Load</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className={cn("h-full", team.color)} style={{ width: `${team.load}%` }} />
                            </div>
                        </div>
                    ))}
                    <div className="pt-2">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Ongoing This Week</p>
                        <div className="flex gap-2">
                            <div className="flex-1 p-2 bg-muted/30 rounded-lg text-center">
                                <p className="text-lg font-black">24</p>
                                <p className="text-[8px] font-bold text-muted-foreground">Meetings</p>
                            </div>
                            <div className="flex-1 p-2 bg-muted/30 rounded-lg text-center">
                                <p className="text-lg font-black">38</p>
                                <p className="text-[8px] font-bold text-muted-foreground">Jobs</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardWidget>

            {/* Widget 6 - Alerts Panel */}
            <DashboardWidget title="System Pulse">
                <div className="space-y-3">
                    {[
                        { type: "inventory", msg: "3 items critically low on stock", time: "12m ago" },
                        { type: "finance", msg: "8 overdue invoices require retry", time: "43m ago" },
                        { type: "leads", msg: "12 leads untouched for >48h", time: "2h ago" },
                    ].map((alert, i) => (
                        <div key={i} className="flex gap-3 p-2 rounded-xl border border-muted/50 hover:bg-muted/10 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <Bell className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium leading-tight">{alert.msg}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardWidget>
        </div>
    );
}

// --- Main Page Component ---

export default function DashboardPage() {
    const { role } = useAuth();

    return (
        <PermissionGuard permission="/dashboard">
            <Topbar
                title={`${role} Dashboard`}
                subtitle={`Overview for ${role} role`}
            >
                <div className="flex items-center gap-3">
                    <Button id="dashboard-quick-action-btn" size="sm" className="h-9 font-bold px-4 shadow-sm transition-all active:scale-95">
                        <Plus className="h-4 w-4 mr-2" /> Quick Action
                    </Button>
                </div>
            </Topbar>
            <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
                {role === "BDM" && <BDMDashboard />}
                {role === "Admin/Accounts" && <AdminDashboard />}
                {role === "Engineer" && <EngineerDashboard />}
                {role === "Super Admin" && <ManagementDashboard />}
            </main>
        </PermissionGuard>
    );
}
