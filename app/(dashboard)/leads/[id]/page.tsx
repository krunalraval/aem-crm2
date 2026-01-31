"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
    Edit,
    UserPlus,
    Trash2,
    FileText,
    MoreHorizontal,
    Mail,
    Phone,
    Building2,
    Globe,
    User,
    Calendar,
    PoundSterling,
    PhoneCall,
    MessageSquare,
    Users,
    RefreshCw,
    StickyNote,
    Plus,
    Pencil,
    Inbox,
    Clock,
    MapPin,
} from "lucide-react";

// Types
interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    source: string;
    status: string;
    owner: string;
    value: number;
    lastActivity: string;
    createdAt: string;
}

interface Activity {
    id: string;
    leadId: string;
    type: "call" | "email" | "meeting" | "note" | "status_change";
    description: string;
    author: string;
    date: string;
}

interface Note {
    id: string;
    leadId: string;
    content: string;
    author: string;
    createdAt: string;
    updatedAt: string;
}

// Mock Data
const mockLeads: Record<string, Lead> = {
    "L-001": { id: "L-001", name: "Mike Thompson", company: "Johnson Roofing LLC", email: "mike@johnsonroofing.com", phone: "07555 123 456", source: "Website", status: "qualified", owner: "John Smith", value: 45000, lastActivity: "2024-01-30", createdAt: "2024-01-15" },
    "L-002": { id: "L-002", name: "Sarah Chen", company: "Acme Construction", email: "sarah@acme.com", phone: "07555 234 567", source: "Referral", status: "contacted", owner: "Jane Wilson", value: 120000, lastActivity: "2024-01-29", createdAt: "2024-01-14" },
    "L-003": { id: "L-003", name: "Tom Williams", company: "Premier Builders", email: "tom@premierbuilders.com", phone: "07555 345 678", source: "Trade Show", status: "new", owner: "John Smith", value: 78000, lastActivity: "2024-01-28", createdAt: "2024-01-12" },
};

const mockActivities: Activity[] = [
    { id: "A-001", leadId: "L-001", type: "call", description: "Initial discovery call - discussed project requirements", author: "John Smith", date: "2024-01-30T14:30:00Z" },
    { id: "A-002", leadId: "L-001", type: "email", description: "Sent proposal document and pricing breakdown", author: "John Smith", date: "2024-01-28T10:15:00Z" },
    { id: "A-003", leadId: "L-001", type: "status_change", description: "Status changed from Contacted to Qualified", author: "System", date: "2024-01-27T09:00:00Z" },
    { id: "A-004", leadId: "L-001", type: "meeting", description: "On-site meeting to assess project scope", author: "Mike Johnson", date: "2024-01-25T11:00:00Z" },
    { id: "A-005", leadId: "L-001", type: "note", description: "Client prefers to start work in March due to weather conditions", author: "John Smith", date: "2024-01-24T16:45:00Z" },
];

const mockNotes: Note[] = [
    { id: "N-001", leadId: "L-001", content: "Client prefers to start work in March due to weather conditions. They have flexibility on the exact dates.", author: "John Smith", createdAt: "2024-01-24T16:45:00Z", updatedAt: "2024-01-24T16:45:00Z" },
    { id: "N-002", leadId: "L-001", content: "Budget approved internally. Decision maker is Mike Thompson (CEO). Secondary contact is their operations manager.", author: "Jane Wilson", createdAt: "2024-01-22T10:30:00Z", updatedAt: "2024-01-23T09:15:00Z" },
];

const mockQuotes = [
    { id: "Q-2024-0001", leadId: "L-001", total: 45000, status: "draft", created: "2024-01-28" },
];

const statusStyles: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    contacted: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    qualified: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    proposal: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    negotiation: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
    won: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    lost: "bg-muted text-muted-foreground",
};

const activityIcons: Record<string, React.ElementType> = {
    call: PhoneCall,
    email: Mail,
    meeting: Users,
    note: StickyNote,
    status_change: RefreshCw,
};

const activityColors: Record<string, string> = {
    call: "bg-green-500/10 text-green-600",
    email: "bg-blue-500/10 text-blue-600",
    meeting: "bg-purple-500/10 text-purple-600",
    note: "bg-amber-500/10 text-amber-600",
    status_change: "bg-muted text-muted-foreground",
};

// Empty State Component
function EmptyState({ icon: Icon, title, description, action }: {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[200px]">{description}</p>
            {action && (
                <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {action.label}
                </Button>
            )}
        </div>
    );
}

// Activity Timeline Component
function ActivityTimeline({ activities }: { activities: Activity[] }) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    };

    if (activities.length === 0) {
        return (
            <EmptyState
                icon={MessageSquare}
                title="No interactions logged yet."
                description="Activities will appear here as you interact with this lead."
            />
        );
    }

    return (
        <div className="space-y-6">
            {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type];
                return (
                    <div key={activity.id} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activityColors[activity.type]}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            {index < activities.length - 1 && (
                                <div className="absolute top-8 left-[15px] h-full w-[1px] bg-border" />
                            )}
                        </div>
                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium capitalize leading-none mb-1">
                                        {activity.type.replace("_", " ")}
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {activity.description}
                                    </p>
                                </div>
                                <div className="text-right text-[12px] text-muted-foreground whitespace-nowrap pt-0.5 ml-4">
                                    <p className="font-medium text-foreground">{formatDate(activity.date)}</p>
                                    <p>{formatTime(activity.date)}</p>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span>by {activity.author}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Info Row Component
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openModal, openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("overview");

    // Get lead data
    const lead = mockLeads[id] || mockLeads["L-001"];
    const leadActivities = mockActivities.filter(a => a.leadId === lead.id);
    const leadNotes = mockNotes.filter(n => n.leadId === lead.id);
    const leadQuotes = mockQuotes.filter(q => q.leadId === lead.id);

    // Handlers
    const handleAddNote = () => {
        openModal({
            title: "Add Note",
            description: `Add a note to ${lead.name}`,
            content: (
                <div className="space-y-4 pt-4">
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Enter your note..."
                    />
                </div>
            ),
            onConfirm: () => console.log("Note added"),
            confirmText: "Save Note",
        });
    };

    const handleConvert = () => {
        openConfirmation(
            "Convert to Account",
            `Are you sure you want to convert "${lead.name}" to an account? The lead will be archived.`,
            () => console.log("Converted:", lead.id)
        );
    };

    const handleDelete = () => {
        openConfirmation(
            "Delete Lead",
            `Are you sure you want to delete "${lead.name}"? This action cannot be undone.`,
            () => console.log("Deleted:", lead.id)
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <>
            <Topbar title="Lead Details" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/leads">
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground -ml-2">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Leads
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                            {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold leading-none">{lead.name}</h1>
                                <Badge variant="secondary" className={`${statusStyles[lead.status]} font-normal h-5`}>
                                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5">{lead.company}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Edit className="mr-1.5 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-9" onClick={handleConvert}>
                            <UserPlus className="mr-1.5 h-4 w-4" />
                            Convert
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleAddNote}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Add Note
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Lead
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left Column: Lead Info (1/4) */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">General Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <InfoRow label="Email" value={lead.email} icon={Mail} />
                                <InfoRow label="Phone" value={lead.phone} icon={Phone} />
                                <InfoRow label="Source" value={lead.source} icon={Globe} />
                                <InfoRow label="Owner" value={lead.owner} icon={User} />
                                <InfoRow label="Estimated Value" value={formatCurrency(lead.value)} icon={PoundSterling} />
                                <InfoRow label="Created" value={formatDate(lead.createdAt)} icon={Calendar} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Content + Timeline (3/4) */}
                    <div className="lg:col-span-3 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium"
                                >
                                    Activity Timeline
                                </TabsTrigger>
                                <TabsTrigger
                                    value="quotes"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium"
                                >
                                    Quotes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="notes"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium"
                                >
                                    Notes
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-6">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Value</p>
                                            <p className="text-2xl font-semibold mt-1">{formatCurrency(lead.value)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Interactions</p>
                                            <p className="text-2xl font-semibold mt-1">{leadActivities.length}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Quotes</p>
                                            <p className="text-2xl font-semibold mt-1">{leadQuotes.length}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="mt-6">
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle className="text-base font-medium">Internal Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        {leadNotes.length > 0 ? (
                                            <div className="space-y-4">
                                                {leadNotes.slice(0, 2).map((note) => (
                                                    <div key={note.id} className="text-sm">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{note.author}</span>
                                                            <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                                                        </div>
                                                        <p className="text-muted-foreground text-sm leading-relaxed">{note.content}</p>
                                                    </div>
                                                ))}
                                                <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" onClick={() => setActiveTab("notes")}>
                                                    View all notes
                                                </Button>
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={StickyNote}
                                                title="No notes"
                                                description="Keep track of internal discussions here."
                                                action={{ label: "Add Note", onClick: handleAddNote }}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Activity Tab */}
                            <TabsContent value="activity" className="mt-6">
                                <Card border-none className="bg-transparent shadow-none border-0">
                                    <CardContent className="p-0">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-base font-medium">Activity Timeline</h3>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="h-8">Log Call</Button>
                                                <Button variant="outline" size="sm" className="h-8">Log Email</Button>
                                            </div>
                                        </div>
                                        <ActivityTimeline activities={leadActivities} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Quotes Tab */}
                            <TabsContent value="quotes" className="mt-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                                        <CardTitle className="text-base font-medium">Lead Quotes</CardTitle>
                                        <Button size="sm" className="h-8">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Create Quote
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {leadQuotes.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="pl-6 font-medium">Quote #</TableHead>
                                                        <TableHead className="font-medium">Value</TableHead>
                                                        <TableHead className="font-medium">Status</TableHead>
                                                        <TableHead className="pr-6 font-medium text-right">Created</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {leadQuotes.map((quote) => (
                                                        <TableRow key={quote.id} className="group">
                                                            <TableCell className="pl-6">
                                                                <Link href={`/quotes/${quote.id}`} className="font-medium text-sm hover:underline">
                                                                    {quote.id}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-sm">{formatCurrency(quote.total)}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="font-normal">{quote.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="pr-6 text-sm text-muted-foreground text-right">
                                                                {formatDate(quote.created)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <EmptyState
                                                icon={FileText}
                                                title="No quotes"
                                                description="Create a quote to start the proposal process."
                                                action={{ label: "Create Quote", onClick: () => console.log("Create quote") }}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notes Tab */}
                            <TabsContent value="notes" className="mt-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                                        <CardTitle className="text-base font-medium">Internal Notes</CardTitle>
                                        <Button size="sm" className="h-8" onClick={handleAddNote}>
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Add Note
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="px-6 py-4">
                                        {leadNotes.length > 0 ? (
                                            <div className="space-y-6">
                                                {leadNotes.map((note) => (
                                                    <div key={note.id} className="relative group">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                                                    {note.author.split(" ").map(n => n[0]).join("")}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium leading-none">{note.author}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">{formatDate(note.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <p className="text-sm text-foreground leading-relaxed pl-8">
                                                            {note.content}
                                                        </p>
                                                        <Separator className="mt-6" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={StickyNote}
                                                title="No notes"
                                                description="Capture important details about this lead."
                                                action={{ label: "Add Note", onClick: handleAddNote }}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </>
    );
}
