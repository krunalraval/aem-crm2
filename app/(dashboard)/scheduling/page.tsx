"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    Users,
    Building2,
    ExternalLink,
    Phone,
    Wrench,
    Settings,
    MapPinned,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/context/auth-context";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DateSelectArg, EventContentArg } from "@fullcalendar/core";

// Dynamic import for map (SSR issue)
const MapContainer = dynamic(
    () => import("react-leaflet").then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then(mod => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then(mod => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then(mod => mod.Popup),
    { ssr: false }
);

// Types
interface SalesEvent {
    id: string;
    title: string;
    type: "meeting" | "site_visit" | "callback" | "other";
    date: string;
    startTime: string;
    endTime: string;
    bdmId: string;
    bdmName: string;
    bdmColor: string;
    contactId?: string;
    contactName?: string;
    siteId?: string;
    siteName?: string;
    notes?: string;
    isOutlook?: boolean;
}

interface EngineerJob {
    id: string;
    title: string;
    jobType: "installation" | "service" | "maintenance" | "decommission" | "repair";
    siteId: string;
    siteName: string;
    siteAddress: string;
    lat: number;
    lng: number;
    date: string;
    startTime: string;
    endTime: string;
    engineerId: string;
    engineerName: string;
    notes?: string;
}

// Constants
const TODAY = new Date().toISOString().split("T")[0];

const mockBDMs = [
    { id: "BDM-001", name: "John Smith", color: "#3B82F6" },
    { id: "BDM-002", name: "Sarah Chen", color: "#10B981" },
    { id: "BDM-003", name: "Mike Johnson", color: "#F59E0B" },
];

const mockEngineers = [
    { id: "ENG-001", name: "David Brown" },
    { id: "ENG-002", name: "Tom Williams" },
    { id: "ENG-003", name: "Chris Martin" },
];

const jobTypeStyles: Record<string, string> = {
    installation: STATUS_COLORS.job.scheduled,
    service: STATUS_COLORS.job.in_progress,
    maintenance: STATUS_COLORS.job.complete,
    decommission: STATUS_COLORS.semantic.warning,
    repair: STATUS_COLORS.semantic.error,
};
const jobTypeColors = jobTypeStyles;

const jobTypeLabels: Record<string, string> = {
    installation: "Installation",
    service: "Service",
    maintenance: "Maintenance",
    decommission: "Decommission",
    repair: "Repair",
};

const eventTypeLabels: Record<string, string> = {
    meeting: "Meeting",
    site_visit: "Site Visit",
    callback: "Callback",
    other: "Other",
};

// Mock Sales Events
const initialSalesEvents: SalesEvent[] = [
    { id: "SE-001", title: "Client Meeting - Johnson Roofing", type: "meeting", date: TODAY, startTime: "09:00", endTime: "10:00", bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", contactId: "CON-001", contactName: "Mike Thompson", notes: "Discuss new CCTV requirements" },
    { id: "SE-002", title: "Site Visit - Acme Construction", type: "site_visit", date: TODAY, startTime: "14:00", endTime: "15:30", bdmId: "BDM-002", bdmName: "Sarah Chen", bdmColor: "#10B981", siteId: "SITE-002", siteName: "Acme HQ" },
    { id: "SE-003", title: "Callback - Premier Builders", type: "callback", date: TODAY, startTime: "11:00", endTime: "11:30", bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", contactId: "CON-003", contactName: "Tom Williams" },
    { id: "SE-004", title: "Team Sync (Outlook)", type: "other", date: TODAY, startTime: "16:00", endTime: "16:30", bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", isOutlook: true },
];

// Mock Engineer Jobs
const initialEngineerJobs: EngineerJob[] = [
    { id: "JOB-001", title: "CCTV Installation - Johnson Roofing", jobType: "installation", siteId: "SITE-001", siteName: "Johnson Roofing HQ", siteAddress: "123 Main St, Austin, TX", lat: 30.2672, lng: -97.7431, date: TODAY, startTime: "08:00", endTime: "12:00", engineerId: "ENG-001", engineerName: "David Brown" },
    { id: "JOB-002", title: "Service Call - Acme Construction", jobType: "service", siteId: "SITE-002", siteName: "Acme Construction Site", siteAddress: "456 Oak Ave, Austin, TX", lat: 30.2750, lng: -97.7500, date: TODAY, startTime: "13:00", endTime: "15:00", engineerId: "ENG-001", engineerName: "David Brown" },
    { id: "JOB-003", title: "Maintenance - Premier Builders", jobType: "maintenance", siteId: "SITE-003", siteName: "Premier Builders Office", siteAddress: "789 Elm Rd, Austin, TX", lat: 30.2600, lng: -97.7350, date: TODAY, startTime: "09:00", endTime: "11:00", engineerId: "ENG-002", engineerName: "Tom Williams" },
    { id: "JOB-004", title: "Decommission - Old Site", jobType: "decommission", siteId: "SITE-004", siteName: "Legacy Warehouse", siteAddress: "321 Pine St, Austin, TX", lat: 30.2800, lng: -97.7600, date: TODAY, startTime: "14:00", endTime: "17:00", engineerId: "ENG-003", engineerName: "Chris Martin" },
];

// Helpers
const formatTime = (time: string) => time;

// Create Sales Event Form
function CreateSalesEventForm({ date, onClose, onSave }: { date?: string; onClose?: () => void; onSave?: (event: Partial<SalesEvent>) => void }) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"meeting" | "site_visit" | "callback" | "other">("meeting");
    const [eventDate, setEventDate] = useState(date || TODAY);
    const [startTime, setStartTime] = useState("09:00");
    const [duration, setDuration] = useState("60");
    const [bdmId, setBdmId] = useState(mockBDMs[0].id);
    const [contactName, setContactName] = useState("");
    const [siteName, setSiteName] = useState("");
    const [notes, setNotes] = useState("");

    const selectedBDM = mockBDMs.find(b => b.id === bdmId);

    const handleSave = () => {
        if (!title) {
            toast.error("Title is required");
            return;
        }
        const endHour = parseInt(startTime.split(":")[0]) + Math.floor(parseInt(duration) / 60);
        const endMin = (parseInt(startTime.split(":")[1]) + parseInt(duration) % 60) % 60;
        onSave?.({
            id: `SE-${Date.now()}`,
            title,
            type,
            date: eventDate,
            startTime,
            endTime: `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`,
            bdmId,
            bdmName: selectedBDM?.name || "",
            bdmColor: selectedBDM?.color || "#3B82F6",
            contactName: contactName || undefined,
            siteName: siteName || undefined,
            notes: notes || undefined,
        });
        toast.success("Event created");
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting with..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="site_visit">Site Visit</SelectItem>
                            <SelectItem value="callback">Callback</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>BDM</Label>
                    <Select value={bdmId} onValueChange={setBdmId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {mockBDMs.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Start Time</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Duration (min)</Label>
                    <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Contact Name</Label>
                    <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                    <Label>Site Name</Label>
                    <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Optional" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Create Event</Button>
            </div>
        </div>
    );
}

// Create Engineer Job Form
function CreateJobForm({ date, onClose, onSave }: { date?: string; onClose?: () => void; onSave?: (job: Partial<EngineerJob>) => void }) {
    const [title, setTitle] = useState("");
    const [jobType, setJobType] = useState<EngineerJob["jobType"]>("installation");
    const [jobDate, setJobDate] = useState(date || TODAY);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("12:00");
    const [engineerId, setEngineerId] = useState(mockEngineers[0].id);
    const [siteName, setSiteName] = useState("");
    const [siteAddress, setSiteAddress] = useState("");
    const [notes, setNotes] = useState("");

    const selectedEngineer = mockEngineers.find(e => e.id === engineerId);

    const handleSave = () => {
        if (!title || !siteName) {
            toast.error("Title and Site Name are required");
            return;
        }
        onSave?.({
            id: `JOB-${Date.now()}`,
            title,
            jobType,
            siteId: `SITE-${Date.now()}`,
            siteName,
            siteAddress,
            lat: 30.27 + Math.random() * 0.02,
            lng: -97.74 + Math.random() * 0.02,
            date: jobDate,
            startTime,
            endTime,
            engineerId,
            engineerName: selectedEngineer?.name || "",
            notes: notes || undefined,
        });
        toast.success("Job scheduled");
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Job Title <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="CCTV Installation..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Job Type</Label>
                    <Select value={jobType} onValueChange={(v) => setJobType(v as EngineerJob["jobType"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(jobTypeLabels).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Engineer</Label>
                    <Select value={engineerId} onValueChange={setEngineerId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {mockEngineers.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={jobDate} onChange={(e) => setJobDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Start</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>End</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Site Name <span className="text-destructive">*</span></Label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
                <Label>Site Address</Label>
                <Input value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} />
            </div>
            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Schedule Job</Button>
            </div>
        </div>
    );
}

// Main Page Content
function SchedulingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openDrawer, closeDrawer } = useDrawer();
    const { role, canAccess } = useAuth();

    const viewMode = searchParams.get("view") === "map" ? "map" : "calendar";
    const [activeTab, setActiveTab] = useState<"sales" | "engineer">(role === "Engineer" ? "engineer" : "sales");
    const [salesEvents, setSalesEvents] = useState<SalesEvent[]>(initialSalesEvents);
    const [engineerJobs, setEngineerJobs] = useState<EngineerJob[]>(initialEngineerJobs);
    const [bdmFilter, setBdmFilter] = useState<string>(role === "BDM" ? "BDM-001" : "all");
    const [engineerFilter, setEngineerFilter] = useState<string>(role === "Engineer" ? "ENG-001" : "all");
    const [mapDate, setMapDate] = useState(TODAY);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    // Convert to FullCalendar events
    const salesCalendarEvents = useMemo(() => {
        return salesEvents
            .filter(e => bdmFilter === "all" || e.bdmId === bdmFilter)
            .map(e => ({
                id: e.id,
                title: e.title,
                start: `${e.date}T${e.startTime}`,
                end: `${e.date}T${e.endTime}`,
                backgroundColor: e.isOutlook ? "#94A3B8" : e.bdmColor,
                borderColor: e.isOutlook ? "#94A3B8" : e.bdmColor,
                extendedProps: { ...e },
            }));
    }, [salesEvents, bdmFilter]);

    const engineerCalendarEvents = useMemo(() => {
        return engineerJobs
            .filter(j => engineerFilter === "all" || j.engineerId === engineerFilter)
            .map(j => {
                const style = jobTypeStyles[j.jobType] || STATUS_COLORS.job.scheduled;
                // FullCalendar event coloring
                const bgColor = style.split(' ')[0].replace('bg-', ''); // Approximation
                return {
                    id: j.id,
                    title: j.title,
                    start: `${j.date}T${j.startTime}`,
                    end: `${j.date}T${j.endTime}`,
                    backgroundColor: j.jobType === 'installation' ? '#3B82F6' : j.jobType === 'repair' ? '#EF4444' : '#10B981',
                    borderColor: j.jobType === 'installation' ? '#3B82F6' : j.jobType === 'repair' ? '#EF4444' : '#10B981',
                    extendedProps: { ...j },
                };
            });
    }, [engineerJobs, engineerFilter]);

    const mapJobs = useMemo(() => {
        return engineerJobs.filter(j => j.date === mapDate);
    }, [engineerJobs, mapDate]);

    const handleSalesEventClick = (arg: EventClickArg) => {
        const event = arg.event.extendedProps as SalesEvent;
        openDrawer({
            title: event.title,
            description: eventTypeLabels[event.type],
            content: (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.bdmColor }} />
                        <span className="text-sm font-medium">{event.bdmName}</span>
                        {event.isOutlook && <Badge variant="secondary" className="text-[9px]">Outlook</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date(event.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="font-medium">{event.startTime} - {event.endTime}</p>
                        </div>
                    </div>
                    {event.contactName && (
                        <div>
                            <p className="text-xs text-muted-foreground">Contact</p>
                            <Link href={`/contacts/${event.contactId}`} className="text-primary hover:underline font-medium">{event.contactName}</Link>
                        </div>
                    )}
                    {event.siteName && (
                        <div>
                            <p className="text-xs text-muted-foreground">Site</p>
                            <Link href={`/sites/${event.siteId}`} className="text-primary hover:underline font-medium">{event.siteName}</Link>
                        </div>
                    )}
                    {event.notes && (
                        <div>
                            <p className="text-xs text-muted-foreground">Notes</p>
                            <p className="text-sm">{event.notes}</p>
                        </div>
                    )}
                </div>
            )
        });
    };

    const handleEngineerEventClick = (arg: EventClickArg) => {
        const job = arg.event.extendedProps as EngineerJob;
        openDrawer({
            title: job.title,
            description: jobTypeLabels[job.jobType],
            content: (
                <div className="space-y-4">
                    <Badge className={cn("border-none text-[10px] font-bold uppercase", jobTypeStyles[job.jobType])}>
                        {jobTypeLabels[job.jobType]}
                    </Badge>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date(job.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="font-medium">{job.startTime} - {job.endTime}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Engineer</p>
                        <p className="font-medium">{job.engineerName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Site</p>
                        <Link href={`/sites/${job.siteId}`} className="text-primary hover:underline font-medium">{job.siteName}</Link>
                        <p className="text-xs text-muted-foreground mt-0.5">{job.siteAddress}</p>
                    </div>
                    {job.notes && (
                        <div>
                            <p className="text-xs text-muted-foreground">Notes</p>
                            <p className="text-sm">{job.notes}</p>
                        </div>
                    )}
                    <div className="pt-4 border-t">
                        <Button asChild className="w-full">
                            <Link href={`/jobs/${job.id}`}>View Full Job Details</Link>
                        </Button>
                    </div>
                </div>
            )
        });
    };

    const handleDateSelect = (arg: DateSelectArg) => {
        const selectedDate = arg.startStr.split("T")[0];
        if (activeTab === "sales") {
            openDrawer({
                title: "Create Event",
                description: `Schedule for ${new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}`,
                content: (
                    <CreateSalesEventForm
                        date={selectedDate}
                        onClose={closeDrawer}
                        onSave={(e) => setSalesEvents(prev => [...prev, e as SalesEvent])}
                    />
                )
            });
        } else {
            openDrawer({
                title: "Schedule Job",
                description: `Create job for ${new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}`,
                content: (
                    <CreateJobForm
                        date={selectedDate}
                        onClose={closeDrawer}
                        onSave={(j) => setEngineerJobs(prev => [...prev, j as EngineerJob])}
                    />
                )
            });
        }
    };

    const handleCreateEvent = () => {
        if (activeTab === "sales") {
            openDrawer({
                title: "Create Event",
                description: "Schedule a new sales event",
                content: (
                    <CreateSalesEventForm
                        onClose={closeDrawer}
                        onSave={(e) => setSalesEvents(prev => [...prev, e as SalesEvent])}
                    />
                )
            });
        } else {
            openDrawer({
                title: "Schedule Job",
                description: "Create a new engineering job",
                content: (
                    <CreateJobForm
                        onClose={closeDrawer}
                        onSave={(j) => setEngineerJobs(prev => [...prev, j as EngineerJob])}
                    />
                )
            });
        }
    };

    const toggleView = () => {
        router.push(viewMode === "calendar" ? "/scheduling?view=map" : "/scheduling");
    };

    if (!isMounted) return null;

    return (
        <>
            <Topbar title="Scheduling" subtitle="Manage calendars and job schedules" />
            <main className="flex-1 overflow-hidden bg-muted/20 p-6">
                {/* Filter Bar */}
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        {viewMode === "calendar" && (
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sales" | "engineer")} className="w-auto">
                                <TabsList className="h-9">
                                    {(role === "Super Admin" || role === "BDM") && (
                                        <TabsTrigger value="sales" className="text-xs px-4">Sales Calendar</TabsTrigger>
                                    )}
                                    {(role === "Super Admin" || role === "Engineer") && (
                                        <TabsTrigger value="engineer" className="text-xs px-4">Engineer Calendar</TabsTrigger>
                                    )}
                                </TabsList>
                            </Tabs>
                        )}
                        {viewMode === "calendar" && activeTab === "sales" && (
                            <Select value={bdmFilter} onValueChange={setBdmFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs bg-muted/30 border-none">
                                    <SelectValue placeholder="Filter BDM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All BDMs</SelectItem>
                                    {mockBDMs.map(b => (
                                        <SelectItem key={b.id} value={b.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                                                {b.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {viewMode === "calendar" && activeTab === "engineer" && (
                            <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                                <SelectTrigger className="w-[150px] h-9 text-xs bg-muted/30 border-none">
                                    <SelectValue placeholder="Filter Engineer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Engineers</SelectItem>
                                    {mockEngineers.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {viewMode === "map" && (
                            <div className="flex items-center gap-2">
                                <Label className="text-xs">Date:</Label>
                                <Input type="date" value={mapDate} onChange={(e) => setMapDate(e.target.value)} className="w-[140px] h-9 text-xs" />
                            </div>
                        )}
                        <div className="flex items-center rounded-lg border bg-muted/30 p-1">
                            <Button
                                variant={viewMode === "calendar" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => viewMode === "map" && toggleView()}
                            >
                                <CalendarIcon className="h-3.5 w-3.5 mr-1" />Calendar
                            </Button>
                            <Button
                                variant={viewMode === "map" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => viewMode === "calendar" && toggleView()}
                            >
                                <MapPinned className="h-3.5 w-3.5 mr-1" />Map
                            </Button>
                        </div>
                    </div>
                    {viewMode === "calendar" && (
                        <Button id="create-event-btn" onClick={handleCreateEvent} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95 shadow-sm">
                            <Plus className="mr-1.5 h-4 w-4" />
                            {activeTab === "sales" ? "Create Event" : "Create Job"}
                        </Button>
                    )}
                </div>

                {/* Calendar View */}
                {viewMode === "calendar" && (
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-4">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                                }}
                                events={activeTab === "sales" ? salesCalendarEvents : engineerCalendarEvents}
                                eventClick={activeTab === "sales" ? handleSalesEventClick : handleEngineerEventClick}
                                selectable={true}
                                select={handleDateSelect}
                                height="calc(100vh - 280px)"
                                nowIndicator={true}
                                slotMinTime="06:00:00"
                                slotMaxTime="20:00:00"
                                allDaySlot={false}
                                weekends={true}
                                eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Map View */}
                {viewMode === "map" && (
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">
                                Engineer Schedule - {new Date(mapDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{mapJobs.length} jobs scheduled</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[calc(100vh-320px)] relative">
                                <MapContainer
                                    center={[30.2672, -97.7431]}
                                    zoom={12}
                                    style={{ height: "100%", width: "100%" }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {mapJobs.map(job => (
                                        <Marker key={job.id} position={[job.lat, job.lng]}>
                                            <Popup>
                                                <div className="text-sm min-w-[200px]">
                                                    <Badge className={cn("border-none text-white text-[9px] mb-2 uppercase font-bold", jobTypeStyles[job.jobType])}>
                                                        {jobTypeLabels[job.jobType]}
                                                    </Badge>
                                                    <p className="font-bold">{job.siteName}</p>
                                                    <p className="text-xs text-muted-foreground">{job.siteAddress}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                                        <User className="h-3 w-3" />
                                                        {job.engineerName}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                                        <Clock className="h-3 w-3" />
                                                        {job.startTime} - {job.endTime}
                                                    </div>
                                                    <Link href={`/jobs/${job.id}`} className="text-primary text-xs hover:underline mt-2 inline-flex items-center gap-1">
                                                        View Job<ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                            {/* Legend */}
                            <div className="p-4 border-t flex flex-wrap gap-3">
                                {Object.entries(jobTypeColors).map(([type, color]) => (
                                    <div key={type} className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-xs">{jobTypeLabels[type]}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </>
    );
}

export default function SchedulingPage() {
    return (
        <PermissionGuard permission="/scheduling">
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading calendar...</p>
                    </div>
                </div>
            }>
                <SchedulingPageContent />
            </Suspense>
        </PermissionGuard>
    );
}
