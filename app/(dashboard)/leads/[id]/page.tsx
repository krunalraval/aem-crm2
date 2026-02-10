"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    ArrowLeft,
    Building2,
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Clock,
    Star,
    Plus,
    Edit,
    FileText,
    CheckCircle2,
    Circle,
    PhoneCall,
    MessageSquare,
    StickyNote,
    CheckSquare,
    RefreshCw,
    ExternalLink,
} from "lucide-react";
import { ActivityTimeline, Activity } from "@/components/activity/activity-timeline";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

// Types
type PipelineStage =
    | "new"
    | "contacted"
    | "follow_up"
    | "site_visit_booked"
    | "site_visit_completed"
    | "quote_sent"
    | "awaiting_response"
    | "negotiation"
    | "won"
    | "lost";

type Priority = "Normal" | "High" | "VIP/Big Deal";
type ActivityType = "call" | "email" | "meeting" | "note" | "status_change";

interface Lead {
    id: string;
    name: string;
    company: string;
    companyId: string;
    contactName: string;
    contactId: string;
    email: string;
    phone: string;
    source: string;
    status: PipelineStage;
    owner: string;
    ownerId: string;
    ownerColor: string;
    value: number;
    priority: Priority;
    expectedCloseDate: string;
    stageEnteredAt: string;
    createdAt: string;
    lastActivity: string;
}

// Pipeline Stages
const PIPELINE_STAGES: { value: PipelineStage; label: string }[] = [
    { value: "new", label: "New Lead" },
    { value: "contacted", label: "Contacted" },
    { value: "follow_up", label: "Follow-Up" },
    { value: "site_visit_booked", label: "Visit Booked" },
    { value: "site_visit_completed", label: "Visit Done" },
    { value: "quote_sent", label: "Quote Sent" },
    { value: "awaiting_response", label: "Awaiting" },
    { value: "negotiation", label: "Negotiation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
];

const priorityStyles: Record<Priority, string> = {
    "Normal": STATUS_COLORS.priority.normal,
    "High": STATUS_COLORS.priority.high,
    "VIP/Big Deal": STATUS_COLORS.priority["VIP/Big Deal"],
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
    call: <PhoneCall className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    note: <MessageSquare className="h-4 w-4" />,
    status_change: <RefreshCw className="h-4 w-4" />,
};

// Mock Data
const mockLead: Lead = {
    id: "L-001",
    name: "Johnson Roofing - CCTV Upgrade",
    company: "Johnson Roofing LLC",
    companyId: "COMP-001",
    contactName: "Mike Thompson",
    contactId: "CON-001",
    email: "mike@johnsonroofing.com",
    phone: "+1 512-555-0101",
    source: "Referral",
    status: "quote_sent",
    owner: "John Smith",
    ownerId: "BDM-001",
    ownerColor: "#3B82F6",
    value: 45000,
    priority: "VIP/Big Deal",
    expectedCloseDate: "2024-03-15",
    stageEnteredAt: "2024-01-25",
    createdAt: "2024-01-10",
    lastActivity: "2024-01-30",
};

const mockActivitiesData: Activity[] = [
    { id: "A-001", type: "call", description: "Discovery call - discussed project requirements", userName: "John Smith", timestamp: "2024-01-30 14:30" },
    { id: "A-002", type: "email_sent", description: "Sent quote for CCTV upgrade", userName: "John Smith", timestamp: "2024-01-28 10:00" },
    { id: "A-003", type: "status_change", description: "Moved to Quote Sent", userName: "John Smith", timestamp: "2024-01-28 09:00" },
    { id: "A-004", type: "site_visit", description: "Site visit completed - 16 camera locations identified", userName: "John Smith", timestamp: "2024-01-22 09:00" },
    { id: "A-005", type: "note", description: "Client interested in 4K cameras with night vision", userName: "John Smith", timestamp: "2024-01-18 11:00" },
];

const mockTasks = [
    { id: "T-001", title: "Follow up on quote", dueDate: "2024-02-05", priority: "High", status: "pending" },
    { id: "T-002", title: "Prepare technical proposal", dueDate: "2024-01-28", priority: "Normal", status: "completed" },
    { id: "T-003", title: "Schedule site survey", dueDate: "2024-01-20", priority: "Normal", status: "completed" },
];

const mockQuotes = [
    { id: "Q-2024-015", value: 45000, status: "Sent", createdDate: "2024-01-28" },
    { id: "Q-2024-010", value: 38000, status: "Rejected", createdDate: "2024-01-15" },
];

const mockNotes = [
    { id: "N-001", content: "Client prefers Hikvision cameras. Budget around £50K. Decision expected by end of March.", author: "John Smith", createdAt: "2024-01-28" },
    { id: "N-002", content: "Primary contact is Mike Thompson (Facilities Manager). Also spoke with IT Director about network requirements.", author: "John Smith", createdAt: "2024-01-18" },
];

// Pipeline Progress Indicator Component
function PipelineProgress({ currentStage }: { currentStage: PipelineStage }) {
    const currentIndex = PIPELINE_STAGES.findIndex(s => s.value === currentStage);

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-center min-w-[700px]">
                {PIPELINE_STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isTerminal = stage.value === "won" || stage.value === "lost";

                    return (
                        <div key={stage.value} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`
                                    h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${isCompleted ? "bg-primary text-white" : ""}
                                    ${isCurrent ? "bg-primary text-white ring-4 ring-primary/20" : ""}
                                    ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
                                    ${isTerminal && isCurrent && stage.value === "won" ? "bg-green-500" : ""}
                                    ${isTerminal && isCurrent && stage.value === "lost" ? "bg-slate-400" : ""}
                                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : isCurrent ? (
                                        index + 1
                                    ) : (
                                        <Circle className="h-4 w-4" />
                                    )}
                                </div>
                                <span className={`mt-2 text-[10px] font-bold text-center whitespace-nowrap ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                                    {stage.label}
                                </span>
                            </div>
                            {index < PIPELINE_STAGES.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 rounded ${index < currentIndex ? "bg-primary" : "bg-muted"}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Form Components
function LogActivityForm({ onClose }: { onClose?: () => void }) {
    const [activityType, setActivityType] = useState("");
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Activity Type <span className="text-destructive">*</span></Label>
                <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Description <span className="text-destructive">*</span></Label>
                <Textarea placeholder="What happened?" rows={3} />
            </div>
            <div className="space-y-1.5">
                <Label>Date/Time</Label>
                <Input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Log Activity</Button>
            </div>
        </div>
    );
}

function CreateTaskForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Task Title <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g., Follow up on proposal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Due Date</Label>
                    <Input type="date" />
                </div>
                <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select defaultValue="Normal">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea placeholder="Additional details..." rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Create Task</Button>
            </div>
        </div>
    );
}

function AddNoteForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Note Content <span className="text-destructive">*</span></Label>
                <Textarea placeholder="Enter your note..." rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Save Note</Button>
            </div>
        </div>
    );
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { openDrawer, closeDrawer } = useDrawer();
    const { openConfirmation } = useModal();

    const lead = mockLead;

    const getDaysInPipeline = () => {
        const created = new Date(lead.createdAt);
        const now = new Date();
        return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getDaysInStage = () => {
        const entered = new Date(lead.stageEnteredAt);
        const now = new Date();
        return Math.floor((now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
    };

    const formatCurrency = (value: number) => `£${value.toLocaleString()}`;
    const formatDate = (dateString: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const handleCreateQuote = () => {
        router.push(`/quotes/new?leadId=${lead.id}&companyId=${lead.companyId}&value=${lead.value}`);
    };

    const handleLogActivity = () => {
        openDrawer({
            title: "Log Activity",
            content: <LogActivityForm onClose={closeDrawer} />,
            description: "Record an interaction with this lead"
        });
    };

    const handleCreateTask = () => {
        openDrawer({
            title: "Create Task",
            content: <CreateTaskForm onClose={closeDrawer} />,
            description: "Create a task for this lead"
        });
    };

    const handleAddNote = () => {
        openDrawer({
            title: "Add Note",
            content: <AddNoteForm onClose={closeDrawer} />,
            description: "Add a note to this lead"
        });
    };

    const isVIP = lead.priority === "VIP/Big Deal";

    return (
        <>
            <Topbar title="Lead Details" subtitle={lead.name} />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Back Link */}
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground">
                        <Link href="/leads"><ArrowLeft className="mr-1 h-4 w-4" />Back to Leads</Link>
                    </Button>
                </div>

                {/* Header Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                                    <DollarSign className="h-7 w-7 text-primary" />
                                    {isVIP && (
                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-400 rounded-full flex items-center justify-center">
                                            <Star className="h-3 w-3 text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <h1 className="text-xl font-bold">{lead.name}</h1>
                                        <Badge className={`${priorityStyles[lead.priority]} text-xs font-medium border-none`}>
                                            {lead.priority}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm flex-wrap">
                                        <Link href={`/accounts/${lead.companyId}`} className="flex items-center gap-1 text-primary hover:underline">
                                            <Building2 className="h-3.5 w-3.5" />{lead.company}
                                        </Link>
                                        <Link href={`/contacts/${lead.contactId}`} className="flex items-center gap-1 text-primary hover:underline">
                                            <User className="h-3.5 w-3.5" />{lead.contactName}
                                        </Link>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: lead.ownerColor }}></div>
                                            {lead.owner}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" onClick={handleCreateQuote}>
                                    <FileText className="mr-1.5 h-4 w-4" />Create Quote
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleLogActivity}>
                                    <PhoneCall className="mr-1.5 h-4 w-4" />Log Activity
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleCreateTask}>
                                    <CheckSquare className="mr-1.5 h-4 w-4" />Create Task
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-1.5 h-4 w-4" />Edit
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Progress */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pipeline Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PipelineProgress currentStage={lead.status} />
                    </CardContent>
                </Card>

                {/* Detail Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Lead Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Estimated Value</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(lead.value)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Expected Close</p>
                                <p className="text-sm font-medium">{formatDate(lead.expectedCloseDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Lead Source</p>
                                <p className="text-sm font-medium">{lead.source}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Date Created</p>
                                <p className="text-sm font-medium">{formatDate(lead.createdAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Days in Pipeline</p>
                                <p className="text-sm font-medium">{getDaysInPipeline()} days</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Days in Current Stage</p>
                                <p className="text-sm font-medium">{getDaysInStage()} days</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">{lead.email}</a>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <a href={`tel:${lead.phone}`} className="text-sm text-primary hover:underline">{lead.phone}</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="activity" className="space-y-6">
                    <TabsList className="bg-transparent h-auto p-0 gap-2 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                        {["activity", "tasks", "quotes", "notes"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3 text-[10px] font-bold uppercase tracking-widest transition-none capitalize"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <ActivityTimeline activities={mockActivitiesData} />
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Tasks</CardTitle>
                                <Button size="sm" onClick={handleCreateTask}>
                                    <Plus className="mr-1 h-4 w-4" />Create Task
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(task.dueDate)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold",
                                                        task.priority === "High" ? STATUS_COLORS.priority.high : STATUS_COLORS.priority.normal
                                                    )}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold",
                                                        task.status === "completed" ? STATUS_COLORS.semantic.healthy : STATUS_COLORS.semantic.warning
                                                    )}>
                                                        {task.status === "completed" ? "Completed" : "Pending"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Quotes Tab */}
                    <TabsContent value="quotes">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Quotes</CardTitle>
                                <Button size="sm" onClick={handleCreateQuote}>
                                    <Plus className="mr-1 h-4 w-4" />Create Quote
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quote Ref</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockQuotes.map((quote) => (
                                            <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>
                                                    <Link href={`/quotes/${quote.id}`} className="font-medium text-primary hover:underline">
                                                        {quote.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(quote.value)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold",
                                                        quote.status === "Sent" ? STATUS_COLORS.quote.sent : STATUS_COLORS.quote.rejected
                                                    )}>
                                                        {quote.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(quote.createdDate)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Notes</CardTitle>
                                <Button size="sm" onClick={handleAddNote}>
                                    <Plus className="mr-1 h-4 w-4" />Add Note
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockNotes.map((note) => (
                                        <div key={note.id} className="p-4 bg-muted/30 rounded-lg border">
                                            <p className="text-sm">{note.content}</p>
                                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                                <span className="font-medium">{note.author}</span>
                                                <span>•</span>
                                                <span>{formatDate(note.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
