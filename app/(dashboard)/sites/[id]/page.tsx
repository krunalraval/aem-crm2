"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
    MapPin,
    User,
    Phone,
    Mail,
    FileText,
    HardHat,
    Link2,
    Plus,
    ExternalLink,
    Clock,
    DollarSign,
    Camera,
    Calendar,
    Key,
    Globe,
    Receipt,
    Package,
    Filter,
    MessageSquare,
    Upload,
    Edit,
} from "lucide-react";
import { ActivityTimeline, Activity as ActivityInterface } from "@/components/activity/activity-timeline";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

// Types
type SiteStatus = "Active" | "Lead" | "Pending Install" | "Decommissioned";
type SystemType = "CCTV" | "Access Control" | "Intruder Alarm" | "Fire Alarm" | "Integrated";
type ActivityType = "call" | "email" | "meeting" | "note" | "quote" | "job";

interface Site {
    id: string;
    name: string;
    companyId: string;
    companyName: string;
    address: string;
    what3words: string;
    lat: number;
    lng: number;
    status: SiteStatus;
    systemType: SystemType;
    camerasCount: number;
    bdmId: string;
    bdmName: string;
    bdmColor: string;
    installDate: string;
    contractStart: string;
    contractEnd: string;
    billingFrequency: string;
    rate: number;
    contractValue: number;
    accessInstructions: string;
    primaryContactId: string;
    createdAt: string;
}

// Mock Data
const mockSite: Site = {
    id: "SITE-001",
    name: "Main Office",
    companyId: "COMP-001",
    companyName: "Johnson Roofing LLC",
    address: "123 Oak Street, Austin, TX 78701",
    what3words: "///filled.count.soap",
    lat: 30.2672,
    lng: -97.7431,
    status: "Active",
    systemType: "CCTV",
    camerasCount: 16,
    bdmId: "BDM-001",
    bdmName: "John Smith",
    bdmColor: "#3B82F6",
    installDate: "2023-06-15",
    contractStart: "2023-06-15",
    contractEnd: "2026-06-14",
    billingFrequency: "Monthly",
    rate: 450,
    contractValue: 16200,
    accessInstructions: "Call security gatehouse 30 minutes before arrival. Code: 4521. Parking available in visitor bay.",
    primaryContactId: "CON-001",
    createdAt: "2023-06-15",
};

const mockContacts = [
    { id: "CON-001", name: "Sarah Chen", role: "Facilities Manager", phone: "+1 512-555-0101", email: "sarah.chen@johnson.com", isPrimary: true },
    { id: "CON-002", name: "Mike Davis", role: "Operations Director", phone: "+1 512-555-0102", email: "m.davis@johnson.com", isPrimary: false },
    { id: "CON-003", name: "Emily Watson", role: "Security Manager", phone: "+1 512-555-0103", email: "e.watson@johnson.com", isPrimary: false },
];

const mockJobs = [
    { id: "JOB-001", ref: "JOB-2024-001", type: "Installation", engineer: "Tom Williams", scheduledDate: "2024-01-30", status: "Scheduled" },
    { id: "JOB-002", ref: "JOB-2024-002", type: "Maintenance", engineer: "Mike Johnson", scheduledDate: "2024-01-28", status: "Completed" },
    { id: "JOB-003", ref: "JOB-2024-003", type: "Repair", engineer: "Tom Williams", scheduledDate: "2024-01-25", status: "Completed" },
];

const mockActivitiesData: ActivityInterface[] = [
    { id: "ACT-001", type: "call", description: "Called to confirm installation schedule", userName: "John Smith", timestamp: "2024-01-28 14:30" },
    { id: "ACT-002", type: "system_notification", description: "Maintenance job completed successfully", userName: "Mike Johnson", timestamp: "2024-01-28 12:00" },
    { id: "ACT-003", type: "email_sent", description: "Sent updated service agreement", userName: "John Smith", timestamp: "2024-01-25 10:15" },
    { id: "ACT-004", type: "meeting", description: "Site walkthrough with facilities team", userName: "John Smith", timestamp: "2024-01-22 09:00" },
    { id: "ACT-005", type: "quote_sent", description: "Created upgrade quote QUO-2024-015", userName: "John Smith", timestamp: "2024-01-18 11:00" },
];

const mockQuotes = [
    { id: "QUO-001", ref: "QUO-2024-015", value: 12500, status: "Sent", dateSent: "2024-01-18" },
    { id: "QUO-002", ref: "QUO-2023-089", value: 16200, status: "Approved", dateSent: "2023-06-10" },
];

const mockInvoices = [
    { id: "INV-001", ref: "INV-2024-001", period: "Jan 2024", amount: 450, status: "Paid", dueDate: "2024-01-15", paymentDate: "2024-01-12" },
    { id: "INV-002", ref: "INV-2023-012", period: "Dec 2023", amount: 450, status: "Paid", dueDate: "2023-12-15", paymentDate: "2023-12-12" },
    { id: "INV-003", ref: "INV-2023-011", period: "Nov 2023", amount: 450, status: "Paid", dueDate: "2023-11-15", paymentDate: "2023-11-14" },
    { id: "INV-004", ref: "INV-2024-002", period: "Feb 2024", amount: 450, status: "Pending", dueDate: "2024-02-15", paymentDate: "" },
];

const mockDocuments = [
    { id: "DOC-001", name: "Installation Sign-Off", type: "sign-off", url: "https://sharepoint.com/docs/signoff", date: "2023-06-15" },
    { id: "DOC-002", name: "Service Contract", type: "contract", url: "https://sharepoint.com/docs/contract", date: "2023-06-15" },
    { id: "DOC-003", name: "Site Survey Photos", type: "photos", url: "https://sharepoint.com/docs/photos", date: "2023-06-01" },
    { id: "DOC-004", name: "Safety Certificate", type: "certificate", url: "https://sharepoint.com/docs/safety", date: "2023-12-01" },
];

const mockEquipment = [
    { id: "EQ-001", name: "Hikvision DS-2CD2343G2-IU", category: "Camera", quantity: 12, condition: "New" },
    { id: "EQ-002", name: "Hikvision DS-7616NI-K2", category: "NVR", quantity: 1, condition: "New" },
    { id: "EQ-003", name: "Seagate SkyHawk 8TB", category: "Storage", quantity: 2, condition: "New" },
    { id: "EQ-004", name: "Hikvision DS-2CD2083G2-I", category: "Camera", quantity: 4, condition: "Recycled" },
];

const statusStyles: Record<string, string> = {
    // Site Status
    "Active": STATUS_COLORS.semantic.active,
    "Lead": STATUS_COLORS.pipeline.new,
    "Pending Install": STATUS_COLORS.pipeline.site_visit_booked,
    "Decommissioned": STATUS_COLORS.semantic.draft,
    // Job Status
    "Scheduled": STATUS_COLORS.job.scheduled,
    "Completed": STATUS_COLORS.job.complete,
    "In Progress": STATUS_COLORS.job.in_progress,
    // Quote Status
    "Sent": STATUS_COLORS.quote.sent,
    "Approved": STATUS_COLORS.quote.accepted,
    "Draft": STATUS_COLORS.quote.draft,
    // Invoice/Misc
    "Paid": STATUS_COLORS.semantic.healthy,
    "Pending": STATUS_COLORS.semantic.warning,
    "New": STATUS_COLORS.semantic.active,
    "Recycled": STATUS_COLORS.semantic.draft,
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
    call: <Phone className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    note: <MessageSquare className="h-4 w-4" />,
    quote: <FileText className="h-4 w-4" />,
    job: <HardHat className="h-4 w-4" />,
};

// Dynamically import map components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

// Mini Map Component
function MiniMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
    const [mapReady, setMapReady] = useState(false);
    const [L, setL] = useState<typeof import("leaflet") | null>(null);

    useEffect(() => {
        import("leaflet").then((leaflet) => {
            setL(leaflet.default);
            setMapReady(true);
        });
    }, []);

    if (!mapReady || !L) {
        return (
            <div className="h-[200px] bg-muted rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-muted-foreground animate-pulse" />
            </div>
        );
    }

    const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: #3B82F6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    return (
        <div className="h-[200px] rounded-lg overflow-hidden border">
            <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={icon} />
            </MapContainer>
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

function CreateJobForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Job Type <span className="text-destructive">*</span></Label>
                <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Assign Engineer <span className="text-destructive">*</span></Label>
                <Select><SelectTrigger><SelectValue placeholder="Select engineer" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="eng-1">Tom Williams</SelectItem>
                        <SelectItem value="eng-2">Mike Johnson</SelectItem>
                        <SelectItem value="eng-3">Dave Roberts</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Scheduled Date</Label>
                <Input type="date" />
            </div>
            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea placeholder="Job details..." rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Create Job</Button>
            </div>
        </div>
    );
}

function LinkContactForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Search Contact</Label>
                <Input placeholder="Search by name or email..." />
            </div>
            <div className="border rounded-lg p-3 space-y-2">
                <p className="text-xs text-muted-foreground">Available contacts from Johnson Roofing LLC:</p>
                {[{ id: "1", name: "James Wilson", role: "CEO" }, { id: "2", name: "Anna Lee", role: "CFO" }].map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                        <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.role}</p></div>
                        <Button size="sm" variant="outline" className="h-7">Link</Button>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
        </div>
    );
}

function UploadDocumentForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Document Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g., Site Survey Report" />
            </div>
            <div className="space-y-1.5">
                <Label>Document URL <span className="text-destructive">*</span></Label>
                <Input placeholder="https://sharepoint.com/..." />
            </div>
            <div className="space-y-1.5">
                <Label>Document Type</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="sign-off">Sign-Off</SelectItem>
                        <SelectItem value="photos">Photos</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Upload Document</Button>
            </div>
        </div>
    );
}

export default function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer, closeDrawer } = useDrawer();
    const [activityFilter, setActivityFilter] = useState("all");

    const site = mockSite;
    const primaryContact = mockContacts.find(c => c.isPrimary);

    const filteredActivities = useMemo(() => {
        if (activityFilter === "all") return mockActivitiesData;
        return mockActivitiesData.filter(a => a.type === activityFilter);
    }, [activityFilter]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatCurrency = (value: number) => `£${value.toLocaleString()}`;

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;

    // Stats
    const totalInvoiced = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const completedJobs = mockJobs.filter(j => j.status === "Completed").length;

    return (
        <>
            <Topbar title={site.name} subtitle={site.address} />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Back Link */}
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground">
                        <Link href="/sites"><ArrowLeft className="mr-1 h-4 w-4" />Back to Sites</Link>
                    </Button>
                </div>

                {/* Header Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-xl font-bold">{site.name}</h1>
                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[site.status])}>
                                            {site.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <Link href={`/accounts/${site.companyId}`} className="flex items-center gap-1 text-primary hover:underline">
                                            <Building2 className="h-3.5 w-3.5" />{site.companyName}
                                        </Link>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <User className="h-3.5 w-3.5" />{site.bdmName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Edit Site</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card + Mini Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <Card className="lg:col-span-2 border-none shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Site Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Full Address</p>
                                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                        {site.address}<ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">What3Words</p>
                                    <p className="text-sm font-medium">{site.what3words}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">System Type</p>
                                    <p className="text-sm font-medium">{site.systemType}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Cameras</p>
                                    <p className="text-sm font-medium">{site.camerasCount}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Install Date</p>
                                    <p className="text-sm font-medium">{formatDate(site.installDate)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Contract Period</p>
                                    <p className="text-sm font-medium">{formatDate(site.contractStart)} – {formatDate(site.contractEnd)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Billing</p>
                                    <p className="text-sm font-medium">{site.billingFrequency} @ {formatCurrency(site.rate)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Contract Value</p>
                                    <p className="text-sm font-bold text-primary">{formatCurrency(site.contractValue)}</p>
                                </div>
                            </div>
                            {site.accessInstructions && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs text-muted-foreground mb-1">Special Access Instructions</p>
                                    <p className="text-sm bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-100">{site.accessInstructions}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MiniMap lat={site.lat} lng={site.lng} name={site.name} />
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                                <Globe className="h-3.5 w-3.5" />Open in Google Maps
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-transparent h-auto p-0 gap-2 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar flex-wrap">
                        {["overview", "contacts", "jobs", "activity", "quotes", "invoices", "documents", "equipment"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 pb-3 text-xs font-bold uppercase tracking-wider transition-none whitespace-nowrap"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                                    <Badge className={cn("border-none text-[10px] font-bold uppercase mt-2", statusStyles[site.status])}>{site.status}</Badge>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Contract Value</p>
                                    <p className="text-xl font-black mt-1">{formatCurrency(site.contractValue)}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Invoiced</p>
                                    <p className="text-xl font-black mt-1">{formatCurrency(totalInvoiced)}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Jobs Completed</p>
                                    <p className="text-xl font-black mt-1">{completedJobs}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {primaryContact && (
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold">Primary Contact</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                            {primaryContact.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold">{primaryContact.name}</p>
                                            <p className="text-sm text-muted-foreground">{primaryContact.role}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" asChild><a href={`tel:${primaryContact.phone}`}><Phone className="h-4 w-4 mr-1" />Call</a></Button>
                                            <Button size="sm" variant="outline" asChild><a href={`mailto:${primaryContact.email}`}><Mail className="h-4 w-4 mr-1" />Email</a></Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockActivitiesData.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">{activity.userName} • {activity.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contacts Tab */}
                    <TabsContent value="contacts">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Site Contacts</CardTitle>
                                <Button size="sm" onClick={() => openDrawer({ title: "Link Contact", content: <LinkContactForm onClose={closeDrawer} />, description: "Link an existing contact to this site" })}>
                                    <Link2 className="mr-1 h-4 w-4" />Link Contact
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead className="w-[80px]"></TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {mockContacts.map((contact) => (
                                            <TableRow key={contact.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/contacts/${contact.id}`} className="font-medium text-sm text-primary hover:underline">{contact.name}</Link>
                                                        {contact.isPrimary && <Badge variant="outline" className="text-[9px]">Primary</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{contact.role}</TableCell>
                                                <TableCell className="text-sm">{contact.email}</TableCell>
                                                <TableCell className="text-sm">{contact.phone}</TableCell>
                                                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" asChild><a href={`tel:${contact.phone}`}><Phone className="h-4 w-4" /></a></Button><Button variant="ghost" size="icon" className="h-8 w-8" asChild><a href={`mailto:${contact.email}`}><Mail className="h-4 w-4" /></a></Button></div></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Jobs Tab */}
                    <TabsContent value="jobs">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Site Jobs</CardTitle>
                                <Button size="sm" onClick={() => openDrawer({ title: "Create Job", content: <CreateJobForm onClose={closeDrawer} />, description: "Schedule a new job for this site" })}>
                                    <Plus className="mr-1 h-4 w-4" />Create Job
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Job Ref</TableHead><TableHead>Type</TableHead><TableHead>Engineer</TableHead><TableHead>Scheduled</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {mockJobs.map((job) => (
                                            <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50" onClick={() => window.location.href = `/jobs/${job.id}`}>
                                                <TableCell><Link href={`/jobs/${job.id}`} className="font-medium text-sm text-primary hover:underline">{job.ref}</Link></TableCell>
                                                <TableCell className="text-sm">{job.type}</TableCell>
                                                <TableCell className="text-sm">{job.engineer}</TableCell>
                                                <TableCell className="text-sm">{formatDate(job.scheduledDate)}</TableCell>
                                                <TableCell><Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[job.status])} variant="secondary">{job.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity">
                        <ActivityTimeline activities={mockActivitiesData} />
                    </TabsContent>

                    {/* Quotes Tab */}
                    <TabsContent value="quotes">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Site Quotes</CardTitle>
                                <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Quote</Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Quote Ref</TableHead><TableHead className="text-right">Value</TableHead><TableHead>Status</TableHead><TableHead>Date Sent</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {mockQuotes.map((quote) => (
                                            <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell><Link href={`/quotes/${quote.id}`} className="font-medium text-sm text-primary hover:underline">{quote.ref}</Link></TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(quote.value)}</TableCell>
                                                <TableCell><Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[quote.status])}>{quote.status}</Badge></TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(quote.dateSent)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Invoices Tab */}
                    <TabsContent value="invoices">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold">Site Invoices</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Invoice Ref</TableHead><TableHead>Period</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead><TableHead>Payment Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {mockInvoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium text-sm">{inv.ref}</TableCell>
                                                <TableCell className="text-sm">{inv.period}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(inv.amount)}</TableCell>
                                                <TableCell><Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[inv.status])}>{inv.status}</Badge></TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{inv.paymentDate ? formatDate(inv.paymentDate) : "—"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents">
                        <Card className="border-none shadow-sm pb-6">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Site Documents</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="border-dashed">
                                        <Link2 className="mr-1 h-4 w-4" />Link External (SharePoint)
                                    </Button>
                                    <Button size="sm" onClick={() => openDrawer({ title: "Upload Document", content: <UploadDocumentForm onClose={closeDrawer} />, description: "Link a document to this site" })}>
                                        <Upload className="mr-1 h-4 w-4" />Upload Document
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="w-[60px]"></TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {mockDocuments.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="h-4 w-4 text-blue-600" /></div><span className="font-medium text-sm">{doc.name}</span></div></TableCell>
                                                <TableCell><Badge variant="outline" className="text-[10px] capitalize">{doc.type}</Badge></TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(doc.date)}</TableCell>
                                                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" asChild><a href={doc.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <div className="mt-6 px-6 pt-6 border-t">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Linked SharePoint Folders</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-dashed hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-[#0078d4]/10 flex items-center justify-center">
                                                <Globe className="h-5 w-5 text-[#0078d4]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Site Project Folder</p>
                                                <p className="text-[10px] text-muted-foreground">Main Office / Project Docs</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-dashed hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-[#0078d4]/10 flex items-center justify-center">
                                                <Globe className="h-5 w-5 text-[#0078d4]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Install Photos (Live)</p>
                                                <p className="text-[10px] text-muted-foreground">Engineering / Field Assets</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Equipment Tab */}
                    <TabsContent value="equipment">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">Allocated Equipment</CardTitle>
                                <Badge variant="secondary">{mockEquipment.length} items</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Item Name</TableHead><TableHead>Category</TableHead><TableHead className="text-center">Quantity</TableHead><TableHead>Condition</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {mockEquipment.map((eq) => (
                                            <TableRow key={eq.id}>
                                                <TableCell className="font-medium text-sm">{eq.name}</TableCell>
                                                <TableCell className="text-sm">{eq.category}</TableCell>
                                                <TableCell className="text-center">{eq.quantity}</TableCell>
                                                <TableCell><Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[eq.condition])}>{eq.condition}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        </>
    );
}
