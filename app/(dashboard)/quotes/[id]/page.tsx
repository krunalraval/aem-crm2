"use client";

import { use, useState } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    ArrowLeft,
    Send,
    FileText,
    Download,
    Building2,
    User,
    Mail,
    Phone,
    Calendar,
    Clock,
    RefreshCw,
    ExternalLink,
    Edit,
    History,
    Star,
    AlertCircle,
} from "lucide-react";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

// Types
type QuoteStatus = "draft" | "sent" | "awaiting_response" | "in_negotiation" | "revised" | "accepted" | "rejected" | "expired";

interface Quote {
    id: string;
    reference: string;
    companyName: string;
    companyId: string;
    contactName: string;
    contactId: string;
    contactEmail: string;
    contactPhone: string;
    leadId?: string;
    leadName?: string;
    bdmName: string;
    bdmColor: string;
    systemType: string;
    units: number;
    billingTerms: string;
    rate: number;
    duration: number;
    durationUnit: string;
    totalValue: number;
    status: QuoteStatus;
    version: number;
    notes?: string;
    followUpDate?: string;
    createdAt: string;
    sentAt?: string;
    expiresAt: string;
}

interface QuoteVersion {
    version: number;
    createdAt: string;
    totalValue: number;
    status: string;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    user: string;
    date: string;
}

// Mock Data
const mockQuote: Quote = {
    id: "Q-001",
    reference: "K2S-Q-0001",
    companyName: "Johnson Roofing LLC",
    companyId: "COMP-001",
    contactName: "Mike Thompson",
    contactId: "CON-001",
    contactEmail: "mike@johnsonroofing.com",
    contactPhone: "+1 512-555-0101",
    leadId: "L-001",
    leadName: "Johnson Roofing - CCTV Upgrade",
    bdmName: "John Smith",
    bdmColor: "#3B82F6",
    systemType: "CCTV - Hardwired",
    units: 8,
    billingTerms: "Monthly",
    rate: 450,
    duration: 12,
    durationUnit: "Months",
    totalValue: 5400,
    status: "sent",
    version: 2,
    notes: "Includes 24/7 monitoring and maintenance support.",
    followUpDate: "2024-02-05",
    createdAt: "2024-01-28",
    sentAt: "2024-01-30",
    expiresAt: "2024-02-28",
};

const mockVersionHistory: QuoteVersion[] = [
    { version: 1, createdAt: "2024-01-20", totalValue: 4800, status: "revised" },
    { version: 2, createdAt: "2024-01-28", totalValue: 5400, status: "sent" },
];

const mockActivities: Activity[] = [
    { id: "A-001", type: "sent", description: "Quote sent to client", user: "John Smith", date: "2024-01-30T10:00:00Z" },
    { id: "A-002", type: "revised", description: "Quote revised - increased rate", user: "John Smith", date: "2024-01-28T14:30:00Z" },
    { id: "A-003", type: "created", description: "Quote created from lead", user: "John Smith", date: "2024-01-20T09:00:00Z" },
];

const stageStyles: Record<QuoteStatus, string> = {
    draft: STATUS_COLORS.quote.draft,
    sent: STATUS_COLORS.quote.sent,
    awaiting_response: STATUS_COLORS.pipeline.awaiting_response,
    in_negotiation: STATUS_COLORS.pipeline.negotiation,
    revised: STATUS_COLORS.pipeline.follow_up,
    accepted: STATUS_COLORS.quote.accepted,
    rejected: STATUS_COLORS.quote.rejected,
    expired: STATUS_COLORS.quote.expired,
};

const stageLabels: Record<QuoteStatus, string> = {
    draft: "Draft",
    sent: "Sent",
    awaiting_response: "Awaiting Response",
    in_negotiation: "In Negotiation",
    revised: "Revised",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
};

// Helpers
const formatCurrency = (value: number) => `£${value.toLocaleString()}`;
const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

// Revise Quote Form
function ReviseQuoteForm({ quote, onClose, onSave }: { quote: Quote; onClose?: () => void; onSave?: () => void }) {
    const [rate, setRate] = useState(quote.rate);
    const [duration, setDuration] = useState(quote.duration);
    const [notes, setNotes] = useState(quote.notes || "");

    const totalValue = quote.billingTerms === "One-Off" ? rate : rate * duration;

    const handleSave = () => {
        toast.success(`Quote revised to Version ${quote.version + 1}`);
        onSave?.();
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <p className="font-medium text-amber-800">Creating Version {quote.version + 1}</p>
                <p className="text-amber-700 text-xs mt-1">This will create a new version of the quote with your changes.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Rate (per {quote.billingTerms.toLowerCase().replace("ly", "")})</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                        <Input type="number" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)} className="pl-7" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Duration ({quote.durationUnit})</Label>
                    <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} />
                </div>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">New Total Value</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            </div>

            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Create Revision</Button>
            </div>
        </div>
    );
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { openDrawer, closeDrawer } = useDrawer();
    const { openConfirmation } = useModal();

    const quote = mockQuote;
    const versions = mockVersionHistory;
    const activities = mockActivities;

    const handleReviseQuote = () => {
        openDrawer({
            title: "Revise Quote",
            description: `Create a new version of ${quote.reference}`,
            content: <ReviseQuoteForm quote={quote} onClose={closeDrawer} />
        });
    };

    const handleResendQuote = () => {
        openConfirmation(
            "Resend Quote",
            `Send ${quote.reference} to ${quote.contactName} at ${quote.contactEmail}?`,
            () => toast.success("Quote resent successfully")
        );
    };

    const handleDownloadPDF = () => {
        toast.success("Downloading PDF...");
    };

    return (
        <>
            <Topbar title="Quote Details" subtitle={quote.reference} />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Back Link */}
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground">
                        <Link href="/quotes"><ArrowLeft className="mr-1 h-4 w-4" />Back to Quotes</Link>
                    </Button>
                </div>

                {/* Header Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <h1 className="text-xl font-bold">{quote.reference}</h1>
                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", stageStyles[quote.status])}>
                                            {stageLabels[quote.status]}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider">v{quote.version}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm flex-wrap">
                                        <Link href={`/accounts/${quote.companyId}`} className="flex items-center gap-1 text-primary hover:underline">
                                            <Building2 className="h-3.5 w-3.5" />{quote.companyName}
                                        </Link>
                                        <Link href={`/contacts/${quote.contactId}`} className="flex items-center gap-1 text-primary hover:underline">
                                            <User className="h-3.5 w-3.5" />{quote.contactName}
                                        </Link>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: quote.bdmColor }}></div>
                                            {quote.bdmName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                                    <Download className="mr-1.5 h-4 w-4" />Download PDF
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleResendQuote}>
                                    <Send className="mr-1.5 h-4 w-4" />Resend
                                </Button>
                                <Button size="sm" onClick={handleReviseQuote}>
                                    <RefreshCw className="mr-1.5 h-4 w-4" />Revise Quote
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quote Summary */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quote Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Total Value</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(quote.totalValue)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">System Type</p>
                                <p className="text-sm font-medium">{quote.systemType}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Rate</p>
                                <p className="text-sm font-medium">{formatCurrency(quote.rate)} / {quote.billingTerms.toLowerCase()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Duration</p>
                                <p className="text-sm font-medium">{quote.duration} {quote.durationUnit}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Date Created</p>
                                <p className="text-sm font-medium">{formatDate(quote.createdAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Date Sent</p>
                                <p className="text-sm font-medium">{formatDate(quote.sentAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Expiry Date</p>
                                <p className="text-sm font-medium">{formatDate(quote.expiresAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Follow-Up Date</p>
                                <p className="text-sm font-medium">{formatDate(quote.followUpDate)}</p>
                            </div>
                        </div>
                        {quote.notes && (
                            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm">{quote.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Associated Lead */}
                {quote.leadId && (
                    <Card className="mb-6 border-none shadow-sm">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Associated Lead</p>
                                        <p className="font-medium">{quote.leadName}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/leads/${quote.leadId}`}>
                                        View Lead<ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
                <Tabs defaultValue="versions" className="space-y-6">
                    <TabsList className="bg-transparent h-auto p-0 gap-2 border-b rounded-none w-full justify-start">
                        {["versions", "activity", "contact"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 pb-3 text-xs font-bold uppercase tracking-wider transition-none capitalize"
                            >
                                {tab === "versions" ? "Version History" : tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Version History Tab */}
                    <TabsContent value="versions">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Version History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {versions.map((v) => (
                                            <TableRow key={v.version}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <History className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">Version {v.version}</span>
                                                        {v.version === quote.version && (
                                                            <Badge className="bg-primary/10 text-primary text-[9px]">Current</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(v.createdAt)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(v.totalValue)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", stageStyles[v.status as QuoteStatus] || STATUS_COLORS.quote.draft)}>
                                                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activities.map((activity, index) => (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                    {activity.type === "sent" && <Send className="h-4 w-4" />}
                                                    {activity.type === "revised" && <RefreshCw className="h-4 w-4" />}
                                                    {activity.type === "created" && <FileText className="h-4 w-4" />}
                                                </div>
                                                {index < activities.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-medium">{activity.description}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span>{activity.user}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(activity.date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Contact Name</p>
                                            <Link href={`/contacts/${quote.contactId}`} className="font-medium text-primary hover:underline">
                                                {quote.contactName}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <a href={`mailto:${quote.contactEmail}`} className="font-medium text-primary hover:underline">
                                                {quote.contactEmail}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <a href={`tel:${quote.contactPhone}`} className="font-medium">
                                                {quote.contactPhone}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Company</p>
                                            <Link href={`/accounts/${quote.companyId}`} className="font-medium text-primary hover:underline">
                                                {quote.companyName}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
