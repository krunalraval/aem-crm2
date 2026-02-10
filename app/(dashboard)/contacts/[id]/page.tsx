"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    Mail,
    Phone,
    MapPin,
    User,
    FileText,
    CheckSquare,
    Clock,
    Calendar,
    MessageSquare,
    Edit,
    ExternalLink,
    Plus,
    Linkedin,
    TrendingUp,
    StickyNote,
    Filter,
    PhoneCall,
    Video,
    PenLine,
} from "lucide-react";
import { ActivityTimeline, Activity as ActivityInterface } from "@/components/activity/activity-timeline";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

// Types
type PreferredCommunication = "Phone" | "Email" | "In-Person" | "WhatsApp";
type ContactSource = "LinkedIn" | "Referral" | "Cold Call" | "Inbound" | "Website" | "Other";
type ActivityType = "call" | "email" | "meeting" | "note" | "quote";
type TaskPriority = "High" | "Medium" | "Low";

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    email: string;
    mobilePhone?: string;
    officePhone?: string;
    linkedinUrl?: string;
    preferredCommunication: PreferredCommunication;
    companyId: string;
    companyName: string;
    bdmOwnerId: string;
    bdmOwnerName: string;
    regionId?: string;
    regionName?: string;
    source: ContactSource;
    notes?: string;
    excludeFromWorkflows: boolean;
    createdAt: string;
}

interface Site {
    id: string;
    name: string;
    address: string;
    status: string;
}

interface Lead {
    id: string;
    name: string;
    stage: string;
    value: number;
}

interface Activity {
    id: string;
    type: ActivityType;
    description: string;
    user: string;
    date: string;
    time: string;
    outcome?: string;
    duration?: number;
}

interface Task {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    priority: TaskPriority;
    status: string;
}

interface Quote {
    id: string;
    ref: string;
    value: number;
    status: string;
    dateSent: string;
}

interface Note {
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
}

// Mock Contact Data
const mockContacts: Contact[] = [
    { id: "CONT-001", firstName: "Mike", lastName: "Thompson", jobTitle: "Operations Director", email: "mike@johnsonroofing.com", mobilePhone: "07555 111 222", officePhone: "0161 555 1234", linkedinUrl: "https://linkedin.com/in/mikethompson", preferredCommunication: "Email", companyId: "COMP-001", companyName: "Johnson Roofing LLC", bdmOwnerId: "BDM-001", bdmOwnerName: "John Smith", regionId: "REG-001", regionName: "Austin Metro", source: "Referral", notes: "Prefers morning calls before 10am. Hard to reach on Fridays.", excludeFromWorkflows: false, createdAt: "2023-06-15" },
    { id: "CONT-002", firstName: "Rachel", lastName: "Green", jobTitle: "Site Manager", email: "rachel@johnsonroofing.com", mobilePhone: "07555 222 333", preferredCommunication: "Phone", companyId: "COMP-001", companyName: "Johnson Roofing LLC", bdmOwnerId: "BDM-001", bdmOwnerName: "John Smith", source: "LinkedIn", excludeFromWorkflows: false, createdAt: "2023-08-20" },
];

// Mock Associated Sites
const mockSites: Site[] = [
    { id: "SITE-001", name: "Manchester Warehouse", address: "123 Industrial Rd, Manchester M1 2AB", status: "Active" },
    { id: "SITE-002", name: "Birmingham Office", address: "45 Business Park, Birmingham B2 3CD", status: "Active" },
    { id: "SITE-003", name: "Leeds Distribution", address: "78 Commerce St, Leeds LS1 4EF", status: "Pending" },
];

// Mock Associated Leads
const mockLeads: Lead[] = [
    { id: "LEAD-001", name: "Roof Replacement - Phase 2", stage: "Proposal", value: 45000 },
    { id: "LEAD-002", name: "New Warehouse Roofing", stage: "Qualification", value: 120000 },
];

// Mock Activity
const mockActivitiesData: ActivityInterface[] = [
    { id: "ACT-001", type: "email_sent", description: "Sent quote follow-up email", userName: "John Smith", timestamp: "2024-01-28 14:30" },
    { id: "ACT-002", type: "call", description: "Discussed project timeline and requirements", userName: "John Smith", timestamp: "2024-01-25 10:15", outcome: "Positive", duration: 25 },
    { id: "ACT-003", type: "meeting", description: "Site visit at Manchester warehouse", userName: "John Smith", timestamp: "2024-01-22 09:00", duration: 90 },
    { id: "ACT-004", type: "note", description: "Updated contact preferences - prefers email over phone", userName: "Sarah Chen", timestamp: "2024-01-20 16:45" },
    { id: "ACT-005", type: "quote_sent", description: "Created new quote QUO-2024-015 for £32,000", userName: "John Smith", timestamp: "2024-01-18 11:00" },
];

// Mock Tasks
const mockTasks: Task[] = [
    { id: "TASK-001", title: "Follow up on quote acceptance", type: "Call", dueDate: "2024-02-15", priority: "High", status: "Pending" },
    { id: "TASK-002", title: "Schedule site inspection", type: "Meeting", dueDate: "2024-02-20", priority: "Medium", status: "Pending" },
    { id: "TASK-003", title: "Send updated pricing", type: "Email", dueDate: "2024-02-10", priority: "Low", status: "Completed" },
];

// Mock Quotes
const mockQuotes: Quote[] = [
    { id: "QUO-001", ref: "QUO-2024-015", value: 32000, status: "Sent", dateSent: "2024-01-18" },
    { id: "QUO-002", ref: "QUO-2024-008", value: 18500, status: "Approved", dateSent: "2024-01-05" },
    { id: "QUO-003", ref: "QUO-2023-142", value: 45000, status: "Draft", dateSent: "2023-12-20" },
];

// Mock Notes
const mockNotes: Note[] = [
    { id: "NOTE-001", content: "Prefers morning calls before 10am. Difficult to reach on Fridays.", createdAt: "2024-01-15", createdBy: "John Smith" },
    { id: "NOTE-002", content: "Decision maker for all roofing contracts over £20k.", createdAt: "2023-11-20", createdBy: "Sarah Chen" },
];

const activityIcons: Record<ActivityType, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    call: <Phone className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    note: <MessageSquare className="h-4 w-4" />,
    quote: <FileText className="h-4 w-4" />,
};

const statusStyles: Record<string, string> = {
    "Active": STATUS_COLORS.semantic.active,
    "Pending": STATUS_COLORS.semantic.warning,
    "Completed": STATUS_COLORS.semantic.healthy,
    "Sent": STATUS_COLORS.quote.sent,
    "Approved": STATUS_COLORS.quote.accepted,
    "Rejected": STATUS_COLORS.quote.rejected,
    "Draft": STATUS_COLORS.quote.draft,
    "Proposal": STATUS_COLORS.pipeline.quote_sent,
    "Qualification": STATUS_COLORS.pipeline.contacted,
};

const priorityStyles: Record<TaskPriority, string> = {
    "High": STATUS_COLORS.priority.high,
    "Medium": STATUS_COLORS.priority.normal,
    "Low": STATUS_COLORS.priority.normal,
};

const preferredCommStyles: Record<PreferredCommunication, string> = {
    "Phone": STATUS_COLORS.semantic.info,
    "Email": STATUS_COLORS.semantic.active,
    "In-Person": STATUS_COLORS.semantic.special,
    "WhatsApp": STATUS_COLORS.semantic.healthy,
};

const sourceStyles: Record<ContactSource, string> = {
    "LinkedIn": STATUS_COLORS.semantic.info,
    "Referral": STATUS_COLORS.pipeline.contacted,
    "Cold Call": STATUS_COLORS.semantic.draft,
    "Inbound": STATUS_COLORS.semantic.active,
    "Website": STATUS_COLORS.semantic.special,
    "Other": STATUS_COLORS.semantic.draft,
};

// Log Activity Form Component
function LogActivityForm({ onClose }: { onClose?: () => void }) {
    const [activityType, setActivityType] = useState("");
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="activityType">Activity Type <span className="text-destructive">*</span></Label>
                <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger id="activityType">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea id="description" placeholder="What happened?" rows={3} />
            </div>
            {(activityType === "call") && (
                <div className="space-y-1.5">
                    <Label htmlFor="outcome">Outcome</Label>
                    <Select>
                        <SelectTrigger id="outcome">
                            <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="no_answer">No Answer</SelectItem>
                            <SelectItem value="voicemail">Voicemail</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            {(activityType === "call" || activityType === "meeting") && (
                <div className="space-y-1.5">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" placeholder="e.g. 30" />
                </div>
            )}
            <div className="space-y-1.5">
                <Label htmlFor="dateTime">Date/Time</Label>
                <Input id="dateTime" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Log Activity</Button>
            </div>
        </div>
    );
}

// Create Task Form Component
function CreateTaskForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="taskTitle">Task Title <span className="text-destructive">*</span></Label>
                <Input id="taskTitle" placeholder="What needs to be done?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="taskType">Type</Label>
                    <Select>
                        <SelectTrigger id="taskType">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Meeting">Meeting</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="taskPriority">Priority</Label>
                    <Select>
                        <SelectTrigger id="taskPriority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="taskNotes">Notes</Label>
                <Textarea id="taskNotes" placeholder="Additional details..." rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Create Task</Button>
            </div>
        </div>
    );
}

// Add Note Form Component
function AddNoteForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="noteContent">Note <span className="text-destructive">*</span></Label>
                <Textarea id="noteContent" placeholder="Add a reference note about this contact..." rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Save Note</Button>
            </div>
        </div>
    );
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer, closeDrawer } = useDrawer();
    const [activityFilter, setActivityFilter] = useState("all");

    const contact = mockContacts.find(c => c.id === id) || mockContacts[0];

    const filteredActivities = useMemo(() => {
        if (activityFilter === "all") return mockActivitiesData;
        return mockActivitiesData.filter(a => a.type === activityFilter);
    }, [activityFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const handleLogActivity = () => {
        openDrawer({
            title: "Log Activity",
            content: <LogActivityForm onClose={closeDrawer} />,
            description: "Record an interaction with this contact"
        });
    };

    const handleCreateTask = () => {
        openDrawer({
            title: "Create Task",
            content: <CreateTaskForm onClose={closeDrawer} />,
            description: "Create a new task for this contact"
        });
    };

    const handleAddNote = () => {
        openDrawer({
            title: "Add Note",
            content: <AddNoteForm onClose={closeDrawer} />,
            description: "Add a reference note for this contact"
        });
    };

    return (
        <>
            <Topbar
                title={`${contact.firstName} ${contact.lastName}`}
                subtitle={contact.jobTitle}
            />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Back Link */}
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground">
                        <Link href="/contacts">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Contacts
                        </Link>
                    </Button>
                </div>

                {/* Header Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-bold text-primary">
                                        {contact.firstName[0]}{contact.lastName[0]}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-bold">{contact.firstName} {contact.lastName}</h1>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">{contact.jobTitle}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <Link href={`/accounts/${contact.companyId}`} className="flex items-center gap-1 text-primary hover:underline">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {contact.companyName}
                                        </Link>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <User className="h-3.5 w-3.5" />
                                            {contact.bdmOwnerName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Contact
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Email</p>
                                <a href={`mailto:${contact.email}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {contact.email}
                                </a>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Mobile Phone</p>
                                {contact.mobilePhone ? (
                                    <a href={`tel:${contact.mobilePhone}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {contact.mobilePhone}
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground">—</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Office Phone</p>
                                {contact.officePhone ? (
                                    <a href={`tel:${contact.officePhone}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                        <PhoneCall className="h-3.5 w-3.5" />
                                        {contact.officePhone}
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground">—</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">LinkedIn</p>
                                {contact.linkedinUrl ? (
                                    <a
                                        href={contact.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Linkedin className="h-3.5 w-3.5" />
                                        Profile
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground">—</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                            <Badge className={cn("border-none text-[10px] font-bold uppercase", preferredCommStyles[contact.preferredCommunication])}>
                                Prefers: {contact.preferredCommunication}
                            </Badge>
                            <Badge className={cn("border-none text-[10px] font-bold uppercase", sourceStyles[contact.source])}>
                                Source: {contact.source}
                            </Badge>
                            {contact.excludeFromWorkflows && (
                                <Badge variant="outline" className="text-[10px] font-bold uppercase">
                                    Excluded from Workflows
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Associated Sites */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold">Associated Sites</CardTitle>
                                <CardDescription className="text-xs">Sites linked to this contact</CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">{mockSites.length}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Site Name</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Address</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockSites.map((site) => (
                                            <TableRow key={site.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>
                                                    <Link href={`/sites/${site.id}`} className="font-medium text-sm hover:underline text-primary">
                                                        {site.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[site.status] || STATUS_COLORS.semantic.draft)}>
                                                        {site.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{site.address}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Associated Leads */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold">Associated Leads</CardTitle>
                                <CardDescription className="text-xs">Leads involving this contact</CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">{mockLeads.length}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Lead Name</TableHead>
                                            <TableHead className="font-medium">Stage</TableHead>
                                            <TableHead className="font-medium text-right">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockLeads.map((lead) => (
                                            <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>
                                                    <Link href={`/leads/${lead.id}`} className="font-medium text-sm hover:underline text-primary">
                                                        {lead.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[lead.stage] || STATUS_COLORS.semantic.draft)}>
                                                        {lead.stage}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-right">£{lead.value.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Timeline */}
                <div className="mt-6">
                    <ActivityTimeline activities={mockActivitiesData} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                    {/* Tasks */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold">Tasks</CardTitle>
                                <CardDescription className="text-xs">Tasks associated with this contact</CardDescription>
                            </div>
                            <Button size="sm" className="h-8" onClick={handleCreateTask}>
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                Create Task
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Task</TableHead>
                                            <TableHead className="font-medium">Due Date</TableHead>
                                            <TableHead className="font-medium">Priority</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockTasks.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">{task.title}</p>
                                                        <p className="text-xs text-muted-foreground">{task.type}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{formatDate(task.dueDate)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", priorityStyles[task.priority])}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[task.status] || STATUS_COLORS.semantic.draft)}>
                                                        {task.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quotes */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold">Quotes</CardTitle>
                                <CardDescription className="text-xs">Quotes sent to this contact</CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-xs">{mockQuotes.length}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Quote Ref</TableHead>
                                            <TableHead className="font-medium text-right">Value</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockQuotes.map((quote) => (
                                            <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>
                                                    <Link href={`/quotes/${quote.id}`} className="font-medium text-sm hover:underline text-primary">
                                                        {quote.ref}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium text-right">£{quote.value.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[quote.status] || STATUS_COLORS.semantic.draft)}>
                                                        {quote.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(quote.dateSent)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes Section */}
                <Card className="mt-6 border-none shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-sm font-bold">Notes</CardTitle>
                            <CardDescription className="text-xs">Reference notes about this contact</CardDescription>
                        </div>
                        <Button size="sm" className="h-8" onClick={handleAddNote}>
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Add Note
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {mockNotes.length > 0 ? (
                            <div className="space-y-3">
                                {mockNotes.map((note) => (
                                    <div key={note.id} className="p-3 rounded-lg bg-muted/50 border">
                                        <p className="text-sm">{note.content}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <span>{note.createdBy}</span>
                                            <span>•</span>
                                            <span>{formatDate(note.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <StickyNote className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No notes yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
