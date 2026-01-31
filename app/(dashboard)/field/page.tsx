"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    MoreHorizontal,
    Eye,
    PlayCircle,
    CheckCircle2,
    MapPin,
    Clock,
    Calendar,
    Building2,
    ClipboardList,
    AlertTriangle,
    Inbox,
    WifiOff,
} from "lucide-react";

// Types
interface FieldJob {
    id: string;
    projectId: string;
    customerName: string;
    title: string;
    address: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    priority: string;
    checklistTotal: number;
    checklistCompleted: number;
    assignedTo: string;
}

// Mock Data
const mockFieldJobs: FieldJob[] = [
    { id: "J-001", projectId: "P-2024-001", customerName: "Johnson Roofing LLC", title: "Roof Inspection", address: "123 Oak Street, London", date: "2024-01-29", startTime: "09:00", endTime: "11:00", status: "in_progress", priority: "normal", checklistTotal: 6, checklistCompleted: 2, assignedTo: "Mike Johnson" },
    { id: "J-002", projectId: "P-2024-001", customerName: "Johnson Roofing LLC", title: "Tile Replacement", address: "123 Oak Street, London", date: "2024-01-29", startTime: "13:00", endTime: "17:00", status: "scheduled", priority: "normal", checklistTotal: 8, checklistCompleted: 0, assignedTo: "Mike Johnson" },
    { id: "J-003", projectId: "P-2024-004", customerName: "Acme Construction", title: "Emergency Leak Repair", address: "456 Main Avenue, Manchester", date: "2024-01-29", startTime: "08:00", endTime: "12:00", status: "in_progress", priority: "urgent", checklistTotal: 5, checklistCompleted: 2, assignedTo: "Tom Williams" },
    { id: "J-004", projectId: "P-2024-005", customerName: "Acme Construction", title: "Flat Roof Membrane", address: "100 Logistics Way, London", date: "2024-01-30", startTime: "07:00", endTime: "15:00", status: "scheduled", priority: "high", checklistTotal: 12, checklistCompleted: 0, assignedTo: "Mike Johnson" },
    { id: "J-005", projectId: "P-2024-002", customerName: "Johnson Roofing LLC", title: "Final Inspection", address: "456 Industrial Blvd, Birmingham", date: "2024-01-28", startTime: "10:00", endTime: "11:30", status: "completed", priority: "normal", checklistTotal: 4, checklistCompleted: 4, assignedTo: "David Brown" },
];

const allEngineers = ["Mike Johnson", "David Brown", "Tom Williams"];

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    in_progress: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    cancelled: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const priorityStyles: Record<string, string> = {
    urgent: "bg-red-50 text-red-700 border-red-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    normal: "bg-muted text-muted-foreground border-transparent",
};

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className={`text-2xl font-semibold mt-1.5 ${color || ''}`}>{value}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function FieldOperationsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [engineerFilter, setEngineerFilter] = useState("all");

    // Filter jobs
    const filteredJobs = useMemo(() => {
        return mockFieldJobs.filter((job) => {
            const matchesSearch =
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || job.status === statusFilter;
            const matchesEngineer = engineerFilter === "all" || job.assignedTo === engineerFilter;
            return matchesSearch && matchesStatus && matchesEngineer;
        });
    }, [searchQuery, statusFilter, engineerFilter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };

    return (
        <>
            <Topbar title="Field Operations" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Connection Status */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Online & Syncing</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <WifiOff className="mr-1.5 h-3.5 w-3.5" />
                        Offline Mode
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Active Jobs" value={mockFieldJobs.filter(j => j.status === 'in_progress').length} icon={PlayCircle} color="text-purple-600" />
                    <StatCard title="Due Today" value={mockFieldJobs.filter(j => j.date === "2024-01-29").length} icon={Calendar} />
                    <StatCard title="Checks Pending" value={14} icon={ClipboardList} color="text-amber-600" />
                    <StatCard title="Completed Today" value={mockFieldJobs.filter(j => j.status === 'completed').length} icon={CheckCircle2} color="text-green-600" />
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search jobs, sites..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Engineer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Engineers</SelectItem>
                                {allEngineers.map((eng) => (
                                    <SelectItem key={eng} value={eng}>{eng}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Jobs Table */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base font-medium">Daily Schedule</CardTitle>
                            <CardDescription className="text-xs">Manage field assignments and task progress</CardDescription>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{filteredJobs.length} active tasks</span>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredJobs.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Job</TableHead>
                                            <TableHead className="font-medium">Location</TableHead>
                                            <TableHead className="font-medium">Time</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium">Priority</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Checklist</TableHead>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredJobs.map((job) => (
                                            <TableRow key={job.id} className="group">
                                                <TableCell>
                                                    <Link href={`/field/${job.id}`} className="font-medium text-sm hover:underline block">
                                                        {job.title}
                                                    </Link>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{job.id}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate max-w-[150px]">{job.address}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{formatDate(job.date)}</span>
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {job.startTime}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`${statusStyles[job.status]} font-normal h-5`}>
                                                        {job.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${priorityStyles[job.priority]} h-5 font-normal`}>
                                                        {job.priority.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${(job.checklistCompleted / job.checklistTotal) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-medium text-muted-foreground">{job.checklistCompleted}/{job.checklistTotal}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/field/${job.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Briefing
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {job.status === "scheduled" && (
                                                                <DropdownMenuItem className="text-primary focus:text-primary">
                                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                                    Start Work
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                                Report Issue
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <Inbox className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <h3 className="text-sm font-medium">No fieldwork found</h3>
                                <p className="text-sm text-muted-foreground mt-1">Adjust your filters to see more tasks.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
