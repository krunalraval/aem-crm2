"use client";

import React, { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    ArrowLeft,
    MapPin,
    Clock,
    User,
    Phone,
    Building2,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Camera,
    Pen,
    FileText,
    Truck,
    PlayCircle,
    Upload,
    X,
    Calendar,
    Package,
    Info,
    RotateCcw,
    Link2,
    Copy,
} from "lucide-react";
import { ActivityTimeline, Activity as ActivityInterface } from "@/components/activity/activity-timeline";
import { SignatureCapture } from "@/components/ui/signature-capture";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";

// Types
type JobType = "installation" | "service" | "maintenance" | "decommission" | "repair";
type JobStatus = "scheduled" | "in_transit" | "in_progress" | "awaiting_signoff" | "complete" | "cancelled" | "rescheduled";

interface ChecklistItem {
    id: string;
    label: string;
    mandatory: boolean;
    completed: boolean;
}

interface Equipment {
    id: string;
    name: string;
    category: string;
    quantity: number;
    condition: string;
}

interface ActivityItem {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    user?: string;
}

interface JobDetail {
    id: string;
    reference: string;
    jobType: JobType;
    title: string;
    siteId: string;
    siteName: string;
    siteAddress: string;
    companyId: string;
    companyName: string;
    engineerId: string;
    engineerName: string;
    status: JobStatus;
    scheduledDate: string;
    scheduledTime?: string;
    estimatedDuration?: number;
    contactName?: string;
    contactPhone?: string;
    accessInstructions?: string;
    specialInstructions?: string;
    checklist: ChecklistItem[];
    equipment: Equipment[];
    photos: string[];
    activities: ActivityItem[];
    signedBy?: string;
    signatureData?: string;
}

// Constants
const TODAY = new Date().toISOString().split("T")[0];

const jobTypeColors: Record<JobType, string> = {
    installation: STATUS_COLORS.pipeline.site_visit_booked,
    service: STATUS_COLORS.pipeline.contacted,
    maintenance: STATUS_COLORS.pipeline.follow_up,
    decommission: STATUS_COLORS.semantic.draft,
    repair: STATUS_COLORS.semantic.error,
};

const statusColors: Record<JobStatus, string> = {
    scheduled: STATUS_COLORS.job.scheduled,
    in_transit: STATUS_COLORS.job.in_transit,
    in_progress: STATUS_COLORS.job.in_progress,
    awaiting_signoff: STATUS_COLORS.job.awaiting_signoff,
    complete: STATUS_COLORS.job.complete,
    cancelled: STATUS_COLORS.semantic.error,
    rescheduled: STATUS_COLORS.pipeline.follow_up,
};

const statusLabels: Record<JobStatus, string> = {
    scheduled: "Scheduled",
    in_transit: "In Transit",
    in_progress: "In Progress",
    awaiting_signoff: "Awaiting Sign-Off",
    complete: "Complete",
    cancelled: "Cancelled",
    rescheduled: "Rescheduled",
};

const jobTypeLabels: Record<JobType, string> = {
    installation: "Installation",
    service: "Service",
    maintenance: "Maintenance",
    decommission: "Decommission",
    repair: "Repair",
};

const mockActivitiesData: ActivityInterface[] = [
    { id: "ACT-1", type: "system_notification", description: "Job created", userName: "System", timestamp: "2024-01-29 08:00" },
    { id: "ACT-2", type: "status_change", description: "Status changed to In Transit", userName: "David Brown", timestamp: "2024-01-30 07:30" },
    { id: "ACT-3", type: "status_change", description: "Status changed to In Progress", userName: "David Brown", timestamp: "2024-01-30 08:15" },
];

// Mock Data
const mockJobs: Record<string, JobDetail> = {
    "JOB-001": {
        id: "JOB-001",
        reference: "K2S-J-0001",
        jobType: "installation",
        title: "CCTV Installation - Johnson Roofing",
        siteId: "SITE-001",
        siteName: "Johnson Roofing HQ",
        siteAddress: "123 Main St, Austin, TX 78701",
        companyId: "COMP-001",
        companyName: "Johnson Roofing LLC",
        engineerId: "ENG-001",
        engineerName: "David Brown",
        status: "in_progress",
        scheduledDate: TODAY,
        scheduledTime: "08:00",
        estimatedDuration: 4,
        contactName: "Mike Thompson",
        contactPhone: "+1 512-555-0101",
        accessInstructions: "Gate code: 1234. Report to main office on arrival.",
        specialInstructions: "Customer requested discrete camera placement.",
        checklist: [
            { id: "CL-1", label: "Survey site layout", mandatory: true, completed: true },
            { id: "CL-2", label: "Check power availability", mandatory: true, completed: true },
            { id: "CL-3", label: "Run cables", mandatory: true, completed: false },
            { id: "CL-4", label: "Mount cameras", mandatory: true, completed: false },
            { id: "CL-5", label: "Configure NVR", mandatory: true, completed: false },
            { id: "CL-6", label: "Test all cameras", mandatory: true, completed: false },
            { id: "CL-7", label: "Label all equipment", mandatory: false, completed: false },
            { id: "CL-8", label: "Train client on usage", mandatory: false, completed: false },
        ],
        equipment: [
            { id: "EQ-1", name: "8MP Dome Camera", category: "Cameras", quantity: 4, condition: "New" },
            { id: "EQ-2", name: "16-Channel NVR", category: "Recorders", quantity: 1, condition: "New" },
            { id: "EQ-3", name: "Cat6 Cable (100m)", category: "Cabling", quantity: 2, condition: "New" },
            { id: "EQ-4", name: "PoE Switch 8-Port", category: "Networking", quantity: 1, condition: "New" },
        ],
        photos: [],
        activities: [],
    },
    "JOB-002": {
        id: "JOB-002",
        reference: "K2S-J-0002",
        jobType: "service",
        title: "Service Call - Acme Construction",
        siteId: "SITE-002",
        siteName: "Acme Construction Site",
        siteAddress: "456 Oak Ave, Austin, TX 78702",
        companyId: "COMP-002",
        companyName: "Acme Construction",
        engineerId: "ENG-001",
        engineerName: "David Brown",
        status: "scheduled",
        scheduledDate: TODAY,
        scheduledTime: "13:00",
        estimatedDuration: 2,
        contactName: "Sarah Chen",
        contactPhone: "+1 512-555-0202",
        accessInstructions: "Report to site office.",
        checklist: [
            { id: "CL-1", label: "Diagnose issue", mandatory: true, completed: false },
            { id: "CL-2", label: "Replace faulty components", mandatory: true, completed: false },
            { id: "CL-3", label: "Test functionality", mandatory: true, completed: false },
            { id: "CL-4", label: "Update firmware", mandatory: false, completed: false },
            { id: "CL-5", label: "Document resolution", mandatory: true, completed: false },
        ],
        equipment: [],
        photos: [],
        activities: [],
    },
};

// Helpers
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const formatDateTime = (timestamp: string) => new Date(timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Info Row Component
function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
    return (
        <div className="flex items-start gap-3 py-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-words">{value}</p>
            </div>
        </div>
    );
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [job, setJob] = useState<JobDetail | null>(null);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [photos, setPhotos] = useState<string[]>([]);
    const [showReschedule, setShowReschedule] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleReason, setRescheduleReason] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [signedBy, setSignedBy] = useState("");
    const [signatureData, setSignatureData] = useState("");
    const [showSignOff, setShowSignOff] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const foundJob = mockJobs[id] || mockJobs["JOB-001"];
        setJob(foundJob);
        setChecklist(foundJob.checklist);
        setPhotos(foundJob.photos);
    }, [id]);

    if (!job) return null;

    const mandatoryItems = checklist.filter(c => c.mandatory);
    const completedMandatory = mandatoryItems.filter(c => c.completed).length;
    const allMandatoryComplete = completedMandatory === mandatoryItems.length;
    const totalCompleted = checklist.filter(c => c.completed).length;
    const progressPercent = (totalCompleted / checklist.length) * 100;

    const canEditChecklist = job.status === "in_progress" || job.status === "awaiting_signoff";
    const canUploadPhotos = job.status === "in_progress" || job.status === "awaiting_signoff";
    const showSignOffSection = allMandatoryComplete && (job.status === "in_progress" || job.status === "awaiting_signoff");

    const handleChecklistToggle = (itemId: string) => {
        if (!canEditChecklist) return;
        setChecklist(prev => prev.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        ));
    };

    const handleStatusChange = (newStatus: JobStatus, message: string) => {
        setJob(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(message);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setPhotos(prev => [...prev, ev.target!.result as string]);
                    toast.success("Photo uploaded");
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleGenerateLink = () => {
        const link = `${window.location.origin}/sign/token-${job.id}`;
        navigator.clipboard.writeText(link);
        toast.success("Signing link copied to clipboard!");
    };

    const handleSubmitSignOff = () => {
        if (!signedBy || !signatureData) {
            toast.error("Signature and name required");
            return;
        }
        setJob(prev => prev ? { ...prev, status: "complete", signedBy, signatureData } : null);
        setShowSignOff(false);
        toast.success("Job completed with sign-off!");
    };

    const handleReschedule = () => {
        if (!rescheduleDate || !rescheduleReason) {
            toast.error("Date and reason required");
            return;
        }
        setJob(prev => prev ? { ...prev, status: "rescheduled", scheduledDate: rescheduleDate } : null);
        setShowReschedule(false);
        toast.success("Job rescheduled");
    };

    const handleCancel = () => {
        if (!cancelReason) {
            toast.error("Reason required");
            return;
        }
        setJob(prev => prev ? { ...prev, status: "cancelled" } : null);
        setShowCancel(false);
        toast.success("Job cancelled");
    };

    return (
        <>
            <Topbar title="Job Details" subtitle={job.reference} />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
                {/* Back */}
                <Button variant="ghost" size="sm" asChild className="mb-4 h-8 px-2 text-muted-foreground">
                    <Link href="/jobs"><ArrowLeft className="mr-1 h-4 w-4" />Back to Jobs</Link>
                </Button>

                {/* Header */}
                <Card className="mb-4 border-none shadow-sm">
                    <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg md:text-xl font-bold">{job.reference}</h1>
                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", jobTypeColors[job.jobType])}>
                                        {jobTypeLabels[job.jobType]}
                                    </Badge>
                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusColors[job.status])}>
                                        {statusLabels[job.status]}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{job.title}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <Link href={`/sites/${job.siteId}`} className="text-primary hover:underline flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />{job.siteName}
                                    </Link>
                                    <Link href={`/accounts/${job.companyId}`} className="text-primary hover:underline flex items-center gap-1">
                                        <Building2 className="h-3.5 w-3.5" />{job.companyName}
                                    </Link>
                                </div>
                            </div>
                            {/* Status Actions */}
                            <Button variant="outline" size="sm" onClick={handleGenerateLink} className="h-10 md:h-9">
                                <Link2 className="h-4 w-4 mr-1.5" />Share Link
                            </Button>
                            {job.status === "scheduled" && (
                                <Button size="sm" onClick={() => handleStatusChange("in_transit", "Started transit")} className="h-10 md:h-9">
                                    <Truck className="h-4 w-4 mr-1.5" />Start Transit
                                </Button>
                            )}
                            {job.status === "in_transit" && (
                                <Button size="sm" onClick={() => handleStatusChange("in_progress", "Arrived on site")} className="h-10 md:h-9">
                                    <PlayCircle className="h-4 w-4 mr-1.5" />Arrive On Site
                                </Button>
                            )}
                            {job.status !== "complete" && job.status !== "cancelled" && (
                                <>
                                    <Button variant="outline" size="sm" onClick={() => setShowReschedule(true)} className="h-10 md:h-9">
                                        <Calendar className="h-4 w-4 mr-1.5" />Reschedule
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setShowCancel(true)} className="h-10 md:h-9 text-destructive hover:text-destructive">
                                        <X className="h-4 w-4 mr-1.5" />Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Info Card */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Info className="h-4 w-4" />Job Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <InfoRow label="Assigned Engineer" value={job.engineerName} icon={User} />
                                    <InfoRow label="Scheduled Date" value={formatDate(job.scheduledDate)} icon={Calendar} />
                                    {job.scheduledTime && <InfoRow label="Scheduled Time" value={job.scheduledTime} icon={Clock} />}
                                    {job.estimatedDuration && <InfoRow label="Estimated Duration" value={`${job.estimatedDuration} hours`} icon={Clock} />}
                                    <InfoRow
                                        label="Site Address"
                                        value={
                                            <Link href={`/sites/${job.siteId}`} className="text-primary hover:underline flex items-center gap-1">
                                                {job.siteAddress} <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        }
                                        icon={MapPin}
                                    />
                                    {job.contactName && (
                                        <InfoRow
                                            label="Site Contact"
                                            value={
                                                <span>
                                                    {job.contactName}
                                                    {job.contactPhone && (
                                                        <a href={`tel:${job.contactPhone}`} className="ml-2 text-primary hover:underline">
                                                            {job.contactPhone}
                                                        </a>
                                                    )}
                                                </span>
                                            }
                                            icon={Phone}
                                        />
                                    )}
                                </div>
                                {job.accessInstructions && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Access Instructions</p>
                                        <p className="text-sm mt-1">{job.accessInstructions}</p>
                                    </div>
                                )}
                                {job.specialInstructions && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Special Instructions</p>
                                        <p className="text-sm mt-1">{job.specialInstructions}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Equipment */}
                        {job.equipment.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Package className="h-4 w-4" />Equipment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="divide-y">
                                        {job.equipment.map(eq => (
                                            <div key={eq.id} className="flex items-center justify-between py-2">
                                                <div>
                                                    <p className="font-medium text-sm">{eq.name}</p>
                                                    <p className="text-xs text-muted-foreground">{eq.category} • Qty: {eq.quantity}</p>
                                                </div>
                                                <Badge variant="secondary" className={cn("border-none text-[10px] font-bold uppercase", job.status === "complete" ? STATUS_COLORS.semantic.active : STATUS_COLORS.semantic.draft)}>
                                                    {job.status === "complete" ? "Deployed" : "Reserved"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Checklist */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />Checklist
                                    </CardTitle>
                                    <span className="text-xs text-muted-foreground">{totalCompleted} of {checklist.length} completed</span>
                                </div>
                                <Progress value={progressPercent} className="h-2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {checklist.map(item => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${canEditChecklist ? "hover:bg-muted/50 cursor-pointer" : ""} ${item.completed ? "bg-green-50 dark:bg-green-950/20" : ""}`}
                                            onClick={() => handleChecklistToggle(item.id)}
                                        >
                                            <Checkbox
                                                checked={item.completed}
                                                disabled={!canEditChecklist}
                                                className="h-5 w-5"
                                            />
                                            <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                                {item.label}
                                                {item.mandatory && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                            <Badge variant="secondary" className={cn("border-none text-[9px] font-bold uppercase", item.mandatory ? STATUS_COLORS.semantic.error : STATUS_COLORS.semantic.draft)}>
                                                {item.mandatory ? "Required" : "Optional"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                {!allMandatoryComplete && (
                                    <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {mandatoryItems.length - completedMandatory} mandatory items remaining
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Photos */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Camera className="h-4 w-4" />Photos
                                    </CardTitle>
                                    {canUploadPhotos && (
                                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-8">
                                            <Upload className="h-3.5 w-3.5 mr-1" />Upload
                                        </Button>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </CardHeader>
                            <CardContent>
                                {photos.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No photos uploaded</p>
                                ) : (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                        {photos.map((photo, i) => (
                                            <div
                                                key={i}
                                                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setViewingPhoto(photo)}
                                            >
                                                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Sign-Off Section */}
                        {showSignOffSection && job.status !== "complete" && (
                            <Card className="border-none shadow-sm border-2 border-green-500/50 bg-green-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-700">
                                        <Pen className="h-4 w-4" />Ready for Sign-Off
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">All mandatory checklist items complete. Capture client signature to complete job.</p>
                                    <Button onClick={() => setShowSignOff(true)} className="w-full h-12 text-base font-bold">
                                        <FileText className="h-5 w-5 mr-2" />Generate Sign-Off
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Activity */}
                </div>
            </main>

            {/* Sign-Off Dialog */}
            <Dialog open={showSignOff} onOpenChange={setShowSignOff}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Job Sign-Off</DialogTitle>
                        <DialogDescription>Capture client signature to complete the job</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-lg text-sm">
                            <p><strong>Job:</strong> {job.reference}</p>
                            <p><strong>Site:</strong> {job.siteName}</p>
                            <p><strong>Date:</strong> {new Date().toLocaleDateString("en-GB")}</p>
                            <p><strong>Checklist:</strong> {totalCompleted}/{checklist.length} items complete</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Client Signature</Label>
                            <SignatureCapture
                                onSave={setSignatureData}
                                onClear={() => setSignatureData("")}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Signed By</Label>
                            <Input
                                value={signedBy}
                                onChange={(e) => setSignedBy(e.target.value)}
                                placeholder="Client name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSignOff(false)}>Cancel</Button>
                        <Button onClick={handleSubmitSignOff} disabled={!signedBy || !signatureData}>
                            Submit Sign-Off
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Dialog */}
            <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Job</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>New Date</Label>
                            <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Reason</Label>
                            <Textarea value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReschedule(false)}>Cancel</Button>
                        <Button onClick={handleReschedule}>Reschedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Job?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-1.5 py-2">
                        <Label>Reason</Label>
                        <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Cancel Job
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Photo Viewer */}
            <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
                <DialogContent className="max-w-3xl p-0">
                    {viewingPhoto && (
                        <img src={viewingPhoto} alt="Full size" className="w-full h-auto max-h-[80vh] object-contain" />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
