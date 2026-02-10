"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    CheckCircle,
    Inbox,
    Phone,
    Mail,
    MapPin,
    FileText,
    Clock,
    LayoutGrid,
    Calendar,
    Building2,
    AlertCircle,
    User,
} from "lucide-react";

// Types
interface Task {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    dueDate: string;
    assignee: string;
    siteId: string | null;
    siteName: string | null;
    quoteId: string | null;
    contactName: string | null;
    createdAt: string;
    chaseCount?: number;
}

// Mock Data
const mockTasks: Task[] = [
    { id: "TASK-001", title: "Follow up on quote Q-2024-002", description: "Client requested updated pricing.", type: "sales_followup", status: "new", priority: "high", dueDate: "2024-01-29", assignee: "John Smith", siteId: "SITE-001", siteName: "Main Office", quoteId: "Q-2024-002", contactName: "Sarah Chen", createdAt: "2024-01-28", chaseCount: 1 },
    { id: "TASK-002", title: "Schedule site visit - Acme Construction", description: "Initial assessment for new roof installation project.", type: "site_visit", status: "callback_arranged", priority: "medium", dueDate: "2024-01-30", assignee: "John Smith", siteId: "SITE-004", siteName: "Headquarters", quoteId: null, contactName: "Tom Williams", createdAt: "2024-01-25" },
    { id: "TASK-003", title: "Send revised quote to Premier Builders", description: "Update quote with new material costs.", type: "email", status: "attempted", priority: "high", dueDate: "2024-01-28", assignee: "John Smith", siteId: "SITE-003", siteName: "Branch Office - North", quoteId: "Q-2024-003", contactName: "Tom Williams", createdAt: "2024-01-26", chaseCount: 2 },
    { id: "TASK-004", title: "Callback - Downtown Office Complex query", description: "Client had questions about warranty terms.", type: "callback", status: "waiting_response", priority: "medium", dueDate: "2024-01-29", assignee: "Jane Wilson", siteId: "SITE-005", siteName: "Distribution Centre", quoteId: "Q-2024-005", contactName: "James Wilson", createdAt: "2024-01-27" },
    { id: "TASK-005", title: "Process PO for Metro Apartments", description: "Admin task: process purchase order.", type: "admin", status: "new", priority: "low", dueDate: "2024-01-31", assignee: "John Smith", siteId: null, siteName: null, quoteId: null, contactName: null, createdAt: "2024-01-28" },
    { id: "TASK-006", title: "Invoice approval reminder", description: "Internal reminder: check pending invoice approvals.", type: "internal_reminder", status: "new", priority: "medium", dueDate: "2024-01-29", assignee: "John Smith", siteId: null, siteName: null, quoteId: null, contactName: null, createdAt: "2024-01-29" },
    { id: "TASK-007", title: "Follow up on Greenfield Estates completion", description: "Project completed. Call for feedback.", type: "sales_followup", status: "completed", priority: "low", dueDate: "2024-01-24", assignee: "John Smith", siteId: "SITE-002", siteName: "Warehouse Facility", quoteId: "Q-2024-006", contactName: "Lisa Park", createdAt: "2024-01-20" },
    { id: "TASK-008", title: "Review contract terms for new enterprise deal", description: "Big deal: review contract before sending to legal.", type: "admin", status: "new", priority: "high", dueDate: "2024-01-27", assignee: "Jane Wilson", siteId: "SITE-004", siteName: "Headquarters", quoteId: "Q-2024-005", contactName: "James Wilson", createdAt: "2024-01-26" },
    { id: "TASK-009", title: "Site survey - Sunrise Commercial", description: "Measure roof area for quote preparation.", type: "site_visit", status: "new", priority: "medium", dueDate: "2024-02-01", assignee: "Mike Johnson", siteId: "SITE-001", siteName: "Main Office", quoteId: null, contactName: "Rachel Green", createdAt: "2024-01-29" },
    { id: "TASK-010", title: "Chase payment - Invoice INV-2024-003", description: "Payment overdue by 7 days.", type: "callback", status: "attempted", priority: "high", dueDate: "2024-01-26", assignee: "John Smith", siteId: "SITE-004", siteName: "Headquarters", quoteId: null, contactName: "Tom Williams", createdAt: "2024-01-22", chaseCount: 3 },
];

const TODAY = "2024-01-29";

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "new", label: "New" },
    { value: "attempted", label: "Attempted" },
    { value: "callback_arranged", label: "Callback Arranged" },
    { value: "waiting_response", label: "Waiting Response" },
    { value: "completed", label: "Completed" },
];

const assigneeOptions = [
    { value: "all", label: "All Assignees" },
    { value: "John Smith", label: "John Smith" },
    { value: "Jane Wilson", label: "Jane Wilson" },
    { value: "Mike Johnson", label: "Mike Johnson" },
];

const typeIcons: Record<string, React.ElementType> = {
    sales_followup: Phone,
    callback: Phone,
    email: Mail,
    site_visit: MapPin,
    admin: FileText,
    internal_reminder: Clock,
};

const typeColors: Record<string, string> = {
    sales_followup: STATUS_COLORS.pipeline.follow_up,
    callback: STATUS_COLORS.pipeline.contacted,
    email: STATUS_COLORS.pipeline.new,
    site_visit: STATUS_COLORS.pipeline.site_visit_booked,
    admin: STATUS_COLORS.semantic.draft,
    internal_reminder: STATUS_COLORS.semantic.warning,
};

const statusStyles: Record<string, string> = {
    new: STATUS_COLORS.semantic.draft,
    attempted: STATUS_COLORS.pipeline.contacted,
    callback_arranged: STATUS_COLORS.pipeline.site_visit_booked,
    waiting_response: STATUS_COLORS.semantic.warning,
    completed: STATUS_COLORS.semantic.healthy,
};

const priorityStyles: Record<string, string> = {
    high: STATUS_COLORS.priority.high,
    medium: STATUS_COLORS.priority.medium,
    low: STATUS_COLORS.priority.low,
};

function getUrgencyBadge(dueDate: string, status: string) {
    if (status === "completed") return null;
    const due = new Date(dueDate);
    const today = new Date(TODAY);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return <Badge className="bg-red-100 text-red-700 border-none text-[9px] font-black ml-2">OVERDUE</Badge>;
    } else if (diffDays <= 1) {
        return <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-black ml-2">DUE SOON</Badge>;
    }
    return null;
}

function EmptyState() {
    return (
        <SharedEmptyState
            icon={Inbox}
            title="No tasks found"
            description="No tasks match your current filters."
        />
    );
}

export default function AllTasksPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [assigneeFilter, setAssigneeFilter] = useState("all");

    const filteredTasks = useMemo(() => {
        return mockTasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || task.status === statusFilter;
            const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter;
            return matchesSearch && matchesStatus && matchesAssignee;
        });
    }, [searchQuery, statusFilter, assigneeFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };

    return (
        <>
            <Topbar title="All Tasks" subtitle={`${filteredTasks.length} tasks`} />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                {assigneeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/tasks">
                            <Button variant="outline" size="sm" className="h-9 font-bold text-xs">
                                <LayoutGrid className="mr-1.5 h-4 w-4" />
                                My Tasks
                            </Button>
                        </Link>
                        <Button id="create-task-all-btn" size="sm" className="h-9 transition-all active:scale-95 shadow-sm">
                            <Plus className="mr-1.5 h-4 w-4" />
                            New Task
                        </Button>
                    </div>
                </div>

                {/* Tasks Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">All Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredTasks.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Task</TableHead>
                                            <TableHead className="font-medium">Type</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Site</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Assignee</TableHead>
                                            <TableHead className="font-medium">Due Date</TableHead>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTasks.map((task) => {
                                            const TypeIcon = typeIcons[task.type] || FileText;
                                            return (
                                                <TableRow key={task.id} className="group">
                                                    <TableCell>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeColors[task.type]}`}>
                                                                <TypeIcon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium text-sm line-clamp-1">{task.title}</p>
                                                                    {getUrgencyBadge(task.dueDate, task.status) && (
                                                                        <AlertCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <p className="text-xs text-muted-foreground">{task.id}</p>
                                                                    {task.chaseCount !== undefined && task.chaseCount > 0 && (
                                                                        <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-amber-200 text-amber-700 bg-amber-50">
                                                                            Attempt {task.chaseCount}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", typeColors[task.type])}>
                                                            {task.type.replace("_", " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[task.status])}>
                                                            {task.status.replace("_", " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {task.siteName ? (
                                                            <Link href={`/sites/${task.siteId}`} className="text-sm hover:underline flex items-center gap-1">
                                                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                                                {task.siteName}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                                                                {task.assignee.split(" ").map(n => n[0]).join("")}
                                                            </div>
                                                            <span className="text-sm">{task.assignee}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <span className="text-sm">{formatDate(task.dueDate)}</span>
                                                            {getUrgencyBadge(task.dueDate, task.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Mark Complete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
