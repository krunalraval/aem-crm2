"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
    Plus,
    Search,
    Calendar,
    MapPin,
    Clock,
    User,
    HardHat,
    Wrench,
    Settings,
    AlertTriangle,
    Package,
    Building2,
    Phone,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Types
type JobType = "installation" | "service" | "maintenance" | "decommission" | "repair";
type JobStatus = "scheduled" | "in_transit" | "in_progress" | "awaiting_signoff" | "complete" | "cancelled" | "rescheduled";

interface Job {
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
}

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stockLevel: number;
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

const jobTypeLabels: Record<JobType, string> = {
    installation: "Installation",
    service: "Service",
    maintenance: "Maintenance",
    decommission: "Decommission",
    repair: "Repair",
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

const mockEngineers = [
    { id: "ENG-001", name: "David Brown" },
    { id: "ENG-002", name: "Tom Williams" },
    { id: "ENG-003", name: "Chris Martin" },
];

const mockSites = [
    { id: "SITE-001", name: "Johnson Roofing HQ", address: "123 Main St, Austin, TX", companyId: "COMP-001", companyName: "Johnson Roofing LLC", contactName: "Mike Thompson", contactPhone: "+1 512-555-0101", accessInstructions: "Gate code: 1234" },
    { id: "SITE-002", name: "Acme Construction Site", address: "456 Oak Ave, Austin, TX", companyId: "COMP-002", companyName: "Acme Construction", contactName: "Sarah Chen", contactPhone: "+1 512-555-0202", accessInstructions: "Report to site office" },
    { id: "SITE-003", name: "Premier Builders Office", address: "789 Elm Rd, Austin, TX", companyId: "COMP-003", companyName: "Premier Builders", contactName: "Tom Williams", contactPhone: "+1 512-555-0303" },
];

const mockInventory: InventoryItem[] = [
    { id: "INV-001", name: "8MP Dome Camera", category: "Cameras", stockLevel: 25 },
    { id: "INV-002", name: "4MP Bullet Camera", category: "Cameras", stockLevel: 18 },
    { id: "INV-003", name: "16-Channel NVR", category: "Recorders", stockLevel: 5 },
    { id: "INV-004", name: "8-Channel NVR", category: "Recorders", stockLevel: 12 },
    { id: "INV-005", name: "Cat6 Cable (100m)", category: "Cabling", stockLevel: 45 },
    { id: "INV-006", name: "PoE Switch 8-Port", category: "Networking", stockLevel: 8 },
];

const checklistTemplates: Record<JobType, string[]> = {
    installation: ["Survey site layout", "Check power availability", "Run cables", "Mount cameras", "Configure NVR", "Test all cameras", "Label all equipment", "Train client on usage"],
    service: ["Diagnose issue", "Replace faulty components", "Test functionality", "Update firmware", "Document resolution"],
    maintenance: ["Clean camera lenses", "Check cable connections", "Test recording", "Verify remote access", "Clear storage if needed"],
    decommission: ["Document existing setup", "Disconnect all equipment", "Remove cameras", "Remove cabling", "Pack equipment", "Restore site condition"],
    repair: ["Identify fault", "Order replacement parts", "Replace component", "Test system", "Document repair"],
};

// Mock Jobs
const initialJobs: Job[] = [
    { id: "JOB-001", reference: "K2S-J-0001", jobType: "installation", title: "CCTV Installation - Johnson Roofing", siteId: "SITE-001", siteName: "Johnson Roofing HQ", siteAddress: "123 Main St, Austin, TX", companyId: "COMP-001", companyName: "Johnson Roofing LLC", engineerId: "ENG-001", engineerName: "David Brown", status: "scheduled", scheduledDate: TODAY, scheduledTime: "08:00", estimatedDuration: 4, contactName: "Mike Thompson", contactPhone: "+1 512-555-0101" },
    { id: "JOB-002", reference: "K2S-J-0002", jobType: "service", title: "Service Call - Acme Construction", siteId: "SITE-002", siteName: "Acme Construction Site", siteAddress: "456 Oak Ave, Austin, TX", companyId: "COMP-002", companyName: "Acme Construction", engineerId: "ENG-001", engineerName: "David Brown", status: "in_progress", scheduledDate: TODAY, scheduledTime: "13:00", estimatedDuration: 2 },
    { id: "JOB-003", reference: "K2S-J-0003", jobType: "maintenance", title: "Quarterly Maintenance - Premier Builders", siteId: "SITE-003", siteName: "Premier Builders Office", siteAddress: "789 Elm Rd, Austin, TX", companyId: "COMP-003", companyName: "Premier Builders", engineerId: "ENG-002", engineerName: "Tom Williams", status: "complete", scheduledDate: "2024-01-28" },
    { id: "JOB-004", reference: "K2S-J-0004", jobType: "repair", title: "Camera Repair - Johnson Roofing", siteId: "SITE-001", siteName: "Johnson Roofing HQ", siteAddress: "123 Main St, Austin, TX", companyId: "COMP-001", companyName: "Johnson Roofing LLC", engineerId: "ENG-003", engineerName: "Chris Martin", status: "awaiting_signoff", scheduledDate: TODAY },
    { id: "JOB-005", reference: "K2S-J-0005", jobType: "decommission", title: "System Removal - Old Warehouse", siteId: "SITE-002", siteName: "Acme Construction Site", siteAddress: "456 Oak Ave, Austin, TX", companyId: "COMP-002", companyName: "Acme Construction", engineerId: "ENG-002", engineerName: "Tom Williams", status: "cancelled", scheduledDate: "2024-01-25" },
];

// Helpers
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Create Job Form
function CreateJobForm({ onClose, onSave }: { onClose?: () => void; onSave?: (job: Partial<Job>) => void }) {
    const [jobType, setJobType] = useState<JobType>("installation");
    const [siteId, setSiteId] = useState("");
    const [engineerId, setEngineerId] = useState("");
    const [scheduledDate, setScheduledDate] = useState(TODAY);
    const [scheduledTime, setScheduledTime] = useState("");
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [selectedEquipment, setSelectedEquipment] = useState<Record<string, number>>({});

    const selectedSite = mockSites.find(s => s.id === siteId);
    const checklistItems = checklistTemplates[jobType];

    const handleEquipmentChange = (itemId: string, quantity: number) => {
        setSelectedEquipment(prev => {
            if (quantity <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: quantity };
        });
    };

    const getStockWarning = (itemId: string, quantity: number) => {
        const item = mockInventory.find(i => i.id === itemId);
        if (!item) return null;
        if (quantity > item.stockLevel) {
            return `Insufficient stock: only ${item.stockLevel} available`;
        }
        return null;
    };

    const handleSave = () => {
        if (!siteId || !engineerId) {
            toast.error("Site and Engineer are required");
            return;
        }
        const newRef = `K2S-J-${String(Date.now()).slice(-4)}`;
        const site = mockSites.find(s => s.id === siteId);
        const engineer = mockEngineers.find(e => e.id === engineerId);
        onSave?.({
            id: `JOB-${Date.now()}`,
            reference: newRef,
            jobType,
            title: `${jobTypeLabels[jobType]} - ${site?.name}`,
            siteId,
            siteName: site?.name || "",
            siteAddress: site?.address || "",
            companyId: site?.companyId || "",
            companyName: site?.companyName || "",
            engineerId,
            engineerName: engineer?.name || "",
            status: "scheduled",
            scheduledDate,
            scheduledTime: scheduledTime || undefined,
            estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
            specialInstructions: specialInstructions || undefined,
            contactName: site?.contactName,
            contactPhone: site?.contactPhone,
            accessInstructions: site?.accessInstructions,
        });
        toast.success(`Job ${newRef} created`);
        onClose?.();
    };

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-1.5">
                <Label>Job Type <span className="text-destructive">*</span></Label>
                <Select value={jobType} onValueChange={(v) => setJobType(v as JobType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(jobTypeLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label>Site <span className="text-destructive">*</span></Label>
                <Select value={siteId} onValueChange={setSiteId}>
                    <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
                    <SelectContent>
                        {mockSites.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} - {s.companyName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedSite && (
                <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                    <p><strong>Company:</strong> {selectedSite.companyName}</p>
                    <p><strong>Address:</strong> {selectedSite.address}</p>
                    <p><strong>Contact:</strong> {selectedSite.contactName} ({selectedSite.contactPhone})</p>
                    {selectedSite.accessInstructions && <p><strong>Access:</strong> {selectedSite.accessInstructions}</p>}
                </div>
            )}

            <div className="space-y-1.5">
                <Label>Assigned Engineer <span className="text-destructive">*</span></Label>
                <Select value={engineerId} onValueChange={setEngineerId}>
                    <SelectTrigger><SelectValue placeholder="Select engineer..." /></SelectTrigger>
                    <SelectContent>
                        {mockEngineers.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label>Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Time</Label>
                    <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Duration (hrs)</Label>
                    <Input type="number" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} min={1} />
                </div>
            </div>

            {/* Equipment Selection */}
            <div className="space-y-2">
                <Label>Equipment Required</Label>
                <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                    {mockInventory.map(item => {
                        const qty = selectedEquipment[item.id] || 0;
                        const warning = getStockWarning(item.id, qty);
                        return (
                            <div key={item.id} className="flex items-center justify-between p-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={qty > 0}
                                        onCheckedChange={(checked) => handleEquipmentChange(item.id, checked ? 1 : 0)}
                                    />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.category} • Stock: {item.stockLevel}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={qty || ""}
                                        onChange={(e) => handleEquipmentChange(item.id, parseInt(e.target.value) || 0)}
                                        className="w-16 h-7 text-xs"
                                        min={0}
                                        max={999}
                                    />
                                    {warning && (
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {Object.entries(selectedEquipment).some(([id, qty]) => getStockWarning(id, qty)) && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Some items exceed available stock
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label>Special Instructions</Label>
                <Textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} rows={2} />
            </div>

            {/* Checklist Preview */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{checklistItems.length} checklist items will be assigned</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-0.5 ml-6 list-disc">
                    {checklistItems.slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                    {checklistItems.length > 3 && <li>...and {checklistItems.length - 3} more</li>}
                </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Create Job</Button>
            </div>
        </div>
    );
}

export default function JobsPage() {
    const { openDrawer, closeDrawer } = useDrawer();
    const { role, canAccess } = useAuth();
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [viewToggle, setViewToggle] = useState<"all" | "my">(role === "Engineer" ? "my" : "all");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [engineerFilter, setEngineerFilter] = useState("all");

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            // Ownership filter for Engineer
            if (role === "Engineer" && viewToggle === "my") {
                if (job.engineerId !== "ENG-001") return false; // David Brown is our mock engineer
            }

            const matchesSearch = job.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || job.status === statusFilter;
            const matchesType = typeFilter === "all" || job.jobType === typeFilter;
            const matchesEngineer = engineerFilter === "all" || job.engineerId === engineerFilter;
            return matchesSearch && matchesStatus && matchesType && matchesEngineer;
        });
    }, [jobs, searchQuery, statusFilter, typeFilter, engineerFilter, role, viewToggle]);

    const handleCreateJob = () => {
        openDrawer({
            title: "Create Job",
            description: "Schedule a new job",
            content: (
                <CreateJobForm
                    onClose={closeDrawer}
                    onSave={(job) => setJobs(prev => [...prev, job as Job])}
                />
            )
        });
    };

    // Stats
    const stats = useMemo(() => ({
        scheduled: jobs.filter(j => j.status === "scheduled").length,
        inProgress: jobs.filter(j => j.status === "in_progress" || j.status === "in_transit").length,
        awaitingSignoff: jobs.filter(j => j.status === "awaiting_signoff").length,
        complete: jobs.filter(j => j.status === "complete").length,
    }), [jobs]);

    return (
        <PermissionGuard permission="/jobs">
            <Topbar title="Jobs" subtitle="Manage field operations and job scheduling" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.scheduled}</p>
                                    <p className="text-xs text-muted-foreground">Scheduled</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Wrench className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                                    <p className="text-xs text-muted-foreground">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.awaitingSignoff}</p>
                                    <p className="text-xs text-muted-foreground">Awaiting Sign-Off</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.complete}</p>
                                    <p className="text-xs text-muted-foreground">Complete</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Bar */}
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {Object.entries(jobTypeLabels).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tabs value={viewToggle} onValueChange={(v) => setViewToggle(v as "all" | "my")} className="h-9">
                            <TabsList className="bg-muted/50 h-9">
                                <TabsTrigger value="all" className="text-xs px-3">All Jobs</TabsTrigger>
                                <TabsTrigger value="my" className="text-xs px-3">My Jobs</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {canAccess("create_job") && (
                            <Button id="create-job-btn" onClick={handleCreateJob} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95">
                                <Plus className="mr-1.5 h-4 w-4" />Create Job
                            </Button>
                        )}
                    </div>
                </div>

                {/* Jobs Table */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Ref</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Engineer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.length > 0 ? (
                                    filteredJobs.map(job => (
                                        <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell>
                                                <Link href={`/jobs/${job.id}`} className="font-bold text-primary hover:underline">
                                                    {job.reference}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("border-none text-[10px] font-bold uppercase", jobTypeColors[job.jobType])}>
                                                    {jobTypeLabels[job.jobType]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/sites/${job.siteId}`} className="text-primary hover:underline text-sm font-medium">
                                                    {job.siteName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/accounts/${job.companyId}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                                    {job.companyName}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-sm">{job.engineerName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(job.scheduledDate)}
                                                {job.scheduledTime && ` ${job.scheduledTime}`}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("border-none text-[10px] font-bold uppercase", statusColors[job.status])}>
                                                    {statusLabels[job.status]}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="p-0">
                                            <SharedEmptyState
                                                icon={Package}
                                                title="No jobs found"
                                                description="No jobs match your current filters. Try adjusting your search or create a new job."
                                                actionLabel="Create Job"
                                                onAction={() => document.getElementById('create-job-btn')?.click()}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </PermissionGuard>
    );
}
