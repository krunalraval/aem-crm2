"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
    ArrowLeft,
    Edit,
    Trash2,
    MoreHorizontal,
    Calendar,
    Clock,
    MapPin,
    User,
    Users,
    Building2,
    Phone,
    Mail,
    ExternalLink,
    UserPlus,
    CalendarClock,
    CheckCircle2,
    Circle,
    PlayCircle,
    MessageSquare,
    FileText,
    Wrench,
    AlertCircle,
    Plus,
    Inbox,
} from "lucide-react";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

// Types
interface ScheduledJob {
    id: string;
    projectId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    title: string;
    description: string;
    address: string;
    date: string;
    startTime: string;
    endTime: string;
    engineers: Engineer[];
    status: string;
    priority: string;
    notes: string;
    checklist: ChecklistItem[];
    timeline: TimelineEvent[];
    equipment: string[];
}

interface Engineer {
    id: string;
    name: string;
    role: string;
    phone: string;
    status: string;
}

interface ChecklistItem {
    id: string;
    task: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
}

interface TimelineEvent {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
}

// Mock Data
const mockJobs: Record<string, ScheduledJob> = {
    "J-001": {
        id: "J-001",
        projectId: "P-2024-001",
        customerId: "ACC-001",
        customerName: "Johnson Roofing LLC",
        customerEmail: "mike@johnsonroofing.com",
        customerPhone: "(555) 123-4567",
        title: "Roof Inspection",
        description: "Annual comprehensive roof inspection including assessment of tiles, guttering, and underlayment condition. Check for any damage from recent weather.",
        address: "123 Oak Street, Austin, TX 78701",
        date: "2024-01-29",
        startTime: "09:00",
        endTime: "11:00",
        engineers: [
            { id: "ENG-001", name: "Mike Johnson", role: "Lead Roofer", phone: "(555) 111-2222", status: "confirmed" },
        ],
        status: "scheduled",
        priority: "normal",
        notes: "Customer will be on site. Access via side gate.",
        checklist: [
            { id: "1", task: "Initial site assessment", completed: true, completedBy: "Mike Johnson", completedAt: "2024-01-29 09:15" },
            { id: "2", task: "Photograph existing condition", completed: true, completedBy: "Mike Johnson", completedAt: "2024-01-29 09:30" },
            { id: "3", task: "Check tile integrity", completed: false },
            { id: "4", task: "Inspect guttering", completed: false },
            { id: "5", task: "Check for leaks/water damage", completed: false },
            { id: "6", task: "Complete inspection report", completed: false },
        ],
        timeline: [
            { id: "1", type: "created", description: "Job created", timestamp: "2024-01-25 10:00", user: "John Doe" },
            { id: "2", type: "assigned", description: "Mike Johnson assigned", timestamp: "2024-01-25 10:15", user: "John Doe" },
            { id: "3", type: "confirmed", description: "Engineer confirmed", timestamp: "2024-01-26 09:00", user: "Mike Johnson" },
            { id: "4", type: "reminder", description: "Reminder sent to customer", timestamp: "2024-01-28 08:00", user: "System" },
            { id: "5", type: "started", description: "Job started", timestamp: "2024-01-29 09:05", user: "Mike Johnson" },
        ],
        equipment: ["Ladder", "Safety harness", "Inspection camera", "Moisture meter", "Clipboard & forms"],
    },
    "J-003": {
        id: "J-003",
        projectId: "P-2024-004",
        customerId: "ACC-002",
        customerName: "Acme Construction",
        customerEmail: "sarah@acme.com",
        customerPhone: "(555) 234-5678",
        title: "Emergency Leak Repair",
        description: "Urgent repair needed for active leak in commercial building. Water damage reported in conference room ceiling.",
        address: "456 Main Avenue, Dallas, TX 75201",
        date: "2024-01-29",
        startTime: "08:00",
        endTime: "12:00",
        engineers: [
            { id: "ENG-003", name: "Tom Williams", role: "Roofer", phone: "(555) 555-6666", status: "on_site" },
        ],
        status: "in_progress",
        priority: "urgent",
        notes: "Building manager will provide access. Report to reception on arrival.",
        checklist: [
            { id: "1", task: "Locate source of leak", completed: true, completedBy: "Tom Williams", completedAt: "2024-01-29 08:30" },
            { id: "2", task: "Temporary waterproofing", completed: true, completedBy: "Tom Williams", completedAt: "2024-01-29 09:15" },
            { id: "3", task: "Permanent repair", completed: false },
            { id: "4", task: "Test for water tightness", completed: false },
            { id: "5", task: "Clean affected area", completed: false },
        ],
        timeline: [
            { id: "1", type: "created", description: "Emergency job created", timestamp: "2024-01-28 16:00", user: "John Doe" },
            { id: "2", type: "assigned", description: "Tom Williams assigned (urgent)", timestamp: "2024-01-28 16:05", user: "John Doe" },
            { id: "3", type: "confirmed", description: "Engineer confirmed", timestamp: "2024-01-28 16:30", user: "Tom Williams" },
            { id: "4", type: "started", description: "Job started", timestamp: "2024-01-29 08:10", user: "Tom Williams" },
            { id: "5", type: "update", description: "Leak source identified - damaged flashing", timestamp: "2024-01-29 08:30", user: "Tom Williams" },
            { id: "6", type: "update", description: "Temporary fix applied, permanent repair in progress", timestamp: "2024-01-29 09:15", user: "Tom Williams" },
        ],
        equipment: ["Emergency repair kit", "Sealant", "Flashing materials", "Tarpaulin", "Safety equipment"],
    },
};

const allEngineers = [
    { id: "ENG-001", name: "Mike Johnson", role: "Lead Roofer", phone: "(555) 111-2222" },
    { id: "ENG-002", name: "David Brown", role: "Roofer", phone: "(555) 333-4444" },
    { id: "ENG-003", name: "Tom Williams", role: "Roofer", phone: "(555) 555-6666" },
];

const statusColors: Record<string, string> = {
    scheduled: STATUS_COLORS.job.scheduled,
    in_progress: STATUS_COLORS.job.in_progress,
    completed: STATUS_COLORS.job.complete,
    cancelled: STATUS_COLORS.job.cancelled,
    confirmed: STATUS_COLORS.job.complete,
    pending: STATUS_COLORS.semantic.pending,
    on_site: STATUS_COLORS.job.in_progress,
};

const priorityColors: Record<string, string> = {
    low: STATUS_COLORS.priority.low,
    normal: STATUS_COLORS.priority.medium,
    high: STATUS_COLORS.priority.high,
    urgent: STATUS_COLORS.priority.critical,
};

const timelineIcons: Record<string, React.ElementType> = {
    created: FileText,
    assigned: UserPlus,
    confirmed: CheckCircle2,
    reminder: AlertCircle,
    started: PlayCircle,
    update: MessageSquare,
    completed: CheckCircle2,
};

// Empty State Component
function EmptyState({ icon: Icon, title, description }: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
        </div>
    );
}

// Assign Engineer Form
function AssignEngineerForm({ job }: { job: ScheduledJob }) {
    const [selected, setSelected] = useState<string[]>(job.engineers.map(e => e.id));

    const toggleEngineer = (engId: string) => {
        setSelected(prev =>
            prev.includes(engId)
                ? prev.filter(e => e !== engId)
                : [...prev, engId]
        );
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select engineers for this job:</p>
            <div className="space-y-2">
                {allEngineers.map((eng) => (
                    <div
                        key={eng.id}
                        onClick={() => toggleEngineer(eng.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected.includes(eng.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted"
                            }`}
                    >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selected.includes(eng.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                            {eng.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{eng.name}</p>
                            <p className="text-xs text-muted-foreground">{eng.role}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button disabled={selected.length === 0}>
                    Assign ({selected.length})
                </Button>
            </div>
        </div>
    );
}

// Reschedule Form
function RescheduleForm({ job }: { job: ScheduledJob }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">New Date</label>
                <Input type="date" defaultValue={job.date} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <Input type="time" defaultValue={job.startTime} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Time</label>
                    <Input type="time" defaultValue={job.endTime} />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Reason (Optional)</label>
                <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Reason for rescheduling..."
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Reschedule</Button>
            </div>
        </div>
    );
}

// Add Note Form
function AddNoteForm() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Add a note about this job..."
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button>Add Note</Button>
            </div>
        </div>
    );
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer } = useDrawer();
    const { openModal, openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("overview");

    // Get job data
    const job = mockJobs[id] || mockJobs["J-001"];

    // Handlers
    const handleAssign = () => {
        openModal({
            title: "Assign Engineers",
            description: `Assign engineers to "${job.title}"`,
            content: <AssignEngineerForm job={job} />,
        });
    };

    const handleReschedule = () => {
        openModal({
            title: "Reschedule Job",
            description: `Reschedule "${job.title}"`,
            content: <RescheduleForm job={job} />,
        });
    };

    const handleAddNote = () => {
        openModal({
            title: "Add Note",
            description: "Add a note to this job",
            content: <AddNoteForm />,
        });
    };

    const handleStartJob = () => {
        openConfirmation(
            "Start Job",
            "Mark this job as in progress? This will notify all assigned engineers.",
            () => console.log("Started:", job.id)
        );
    };

    const handleCompleteJob = () => {
        openConfirmation(
            "Complete Job",
            "Mark this job as completed? Make sure all checklist items are done.",
            () => console.log("Completed:", job.id)
        );
    };

    const handleDelete = () => {
        openConfirmation(
            "Cancel Job",
            `Are you sure you want to cancel this job? This will notify the customer and engineers.`,
            () => console.log("Cancelled:", job.id)
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp.replace(" ", "T"));
        return date.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const completedTasks = job.checklist.filter(t => t.completed).length;
    const totalTasks = job.checklist.length;

    return (
        <>
            <Topbar title="Job Details" />
            <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/scheduling">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Scheduling
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <Card className="mb-6">
                    <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                    <Calendar className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold">{job.title}</h1>
                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", statusColors[job.status])}>
                                            {job.status.replace("_", " ")}
                                        </Badge>
                                        {job.priority !== "normal" && (
                                            <Badge className={cn("border-none text-[10px] font-bold uppercase", priorityColors[job.priority])}>
                                                {job.priority}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {job.startTime} - {job.endTime}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(job.date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {job.status === "scheduled" && (
                                    <Button size="sm" onClick={handleStartJob}>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Job
                                    </Button>
                                )}
                                {job.status === "in_progress" && (
                                    <Button size="sm" onClick={handleCompleteJob}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Complete
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={handleReschedule}>
                                    <CalendarClock className="mr-2 h-4 w-4" />
                                    Reschedule
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleAssign}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Assign Engineers
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleAddNote}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Add Note
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Cancel Job
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="checklist">Checklist</TabsTrigger>
                        <TabsTrigger value="engineers">Engineers</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Job Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Job Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">{job.description}</p>

                                        <Separator />

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Location</p>
                                                    <p className="text-sm">{job.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Duration</p>
                                                    <p className="text-sm">{job.startTime} - {job.endTime}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {job.notes && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                                    <p className="text-sm bg-muted/50 p-3 rounded-md">{job.notes}</p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Equipment Required */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Equipment Required</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {job.equipment.map((item) => (
                                                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                                                    <Wrench className="h-3 w-3" />
                                                    {item}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Checklist Summary */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-base">Checklist Progress</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("checklist")}>
                                            View All
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Completed Tasks</span>
                                                <span className="font-medium">{completedTasks} / {totalTasks}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-2 rounded-full bg-primary transition-all"
                                                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Customer Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Customer</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Company</p>
                                                <p className="text-sm font-medium">{job.customerName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Phone</p>
                                                <p className="text-sm">{job.customerPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Email</p>
                                                <p className="text-sm">{job.customerEmail}</p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/accounts/${job.customerId}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Account
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Assigned Engineers */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-base">Assigned Engineers</CardTitle>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAssign}>
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {job.engineers.map((engineer) => (
                                                <div key={engineer.id} className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                        {engineer.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{engineer.name}</p>
                                                        <p className="text-xs text-muted-foreground">{engineer.role}</p>
                                                    </div>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusColors[engineer.status])}>
                                                        {engineer.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Related Project */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Related Project</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/projects/${job.projectId}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Project {job.projectId}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Checklist Tab */}
                    <TabsContent value="checklist" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Job Checklist</CardTitle>
                                <CardDescription>Tasks to complete for this job</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {job.checklist.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border ${item.completed ? "bg-muted/30" : ""
                                                }`}
                                        >
                                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.completed ? "bg-green-500 text-white" : "border-2 border-muted-foreground"
                                                }`}>
                                                {item.completed && <CheckCircle2 className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                                                    {item.task}
                                                </p>
                                                {item.completed && item.completedBy && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Completed by {item.completedBy} at {item.completedAt}
                                                    </p>
                                                )}
                                            </div>
                                            {!item.completed && (
                                                <Button variant="outline" size="sm">
                                                    Mark Done
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Engineers Tab */}
                    <TabsContent value="engineers" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Assigned Engineers</CardTitle>
                                    <CardDescription>Engineers working on this job</CardDescription>
                                </div>
                                <Button size="sm" onClick={handleAssign}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Assign Engineer
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {job.engineers.length > 0 ? (
                                    <div className="space-y-4">
                                        {job.engineers.map((engineer) => (
                                            <div key={engineer.id} className="flex items-center gap-4 p-4 rounded-lg border">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                                                    {engineer.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{engineer.name}</p>
                                                    <p className="text-sm text-muted-foreground">{engineer.role}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Phone className="h-3 w-3" />
                                                        {engineer.phone}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className={statusColors[engineer.status]}>
                                                    {engineer.status.replace("_", " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Phone className="mr-2 h-4 w-4" />
                                                            Call
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <SharedEmptyState
                                        icon={Users}
                                        title="No engineers assigned yet."
                                        description="Assign engineers to this job to get started."
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Activity Timeline</CardTitle>
                                <CardDescription>History of this job</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {job.timeline.map((event, index) => {
                                        const Icon = timelineIcons[event.type] || Circle;
                                        return (
                                            <div key={event.id} className="relative">
                                                {index < job.timeline.length - 1 && (
                                                    <div className="absolute left-4 top-10 h-full w-0.5 bg-muted" />
                                                )}
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <p className="text-sm font-medium">{event.description}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {event.user} • {formatTimestamp(event.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
