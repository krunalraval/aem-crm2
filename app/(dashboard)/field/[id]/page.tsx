"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    Clock,
    MapPin,
    Phone,
    Building2,
    CheckCircle2,
    PlayCircle,
    PauseCircle,
    FileText,
    Upload,
    Camera,
    Image,
    File,
    X,
    Plus,
    Send,
    WifiOff,
    AlertTriangle,
    Calendar,
    User,
    ExternalLink,
    Trash2,
    CheckCircle,
    Receipt,
} from "lucide-react";

// Types
interface FieldJob {
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
    status: string;
    priority: string;
    notes: string;
    checklist: ChecklistItem[];
    fieldNotes: FieldNote[];
    files: UploadedFile[];
}

interface ChecklistItem {
    id: string;
    task: string;
    completed: boolean;
    completedAt?: string;
}

interface FieldNote {
    id: string;
    content: string;
    timestamp: string;
    author: string;
}

interface UploadedFile {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedAt: string;
}

// Mock Data
const mockJobs: Record<string, FieldJob> = {
    "J-001": {
        id: "J-001",
        projectId: "P-2024-001",
        customerId: "ACC-001",
        customerName: "Johnson Roofing LLC",
        customerEmail: "mike@johnsonroofing.com",
        customerPhone: "07555 123 456",
        title: "Roof Inspection",
        description: "Annual comprehensive roof inspection including assessment of tiles, guttering, and underlayment condition.",
        address: "123 Oak Street, London, EC1A 1BB",
        date: "2024-01-29",
        startTime: "09:00",
        endTime: "11:00",
        status: "in_progress",
        priority: "normal",
        notes: "Customer will be on site. Access via side gate. Key code: 1234",
        checklist: [
            { id: "1", task: "Initial site assessment", completed: true, completedAt: "09:15" },
            { id: "2", task: "Photograph existing condition", completed: true, completedAt: "09:30" },
            { id: "3", task: "Check tile integrity", completed: false },
            { id: "4", task: "Inspect guttering", completed: false },
            { id: "5", task: "Check for leaks/water damage", completed: false },
            { id: "6", task: "Complete inspection report", completed: false },
        ],
        fieldNotes: [
            { id: "1", content: "Arrived on site. Customer met me at the gate.", timestamp: "2024-01-29 09:05", author: "Mike Johnson" },
            { id: "2", content: "Started initial assessment. Noticed some loose tiles on west side.", timestamp: "2024-01-29 09:20", author: "Mike Johnson" },
        ],
        files: [
            { id: "1", name: "roof_overview.jpg", type: "image", size: "2.4 MB", uploadedAt: "09:25" },
            { id: "2", name: "west_side_damage.jpg", type: "image", size: "1.8 MB", uploadedAt: "09:28" },
        ],
    },
};

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    in_progress: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    paused: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
};

const priorityStyles: Record<string, string> = {
    urgent: "bg-red-50 text-red-700 border-red-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    normal: "bg-muted text-muted-foreground border-transparent",
};

const fileTypeIcons: Record<string, React.ElementType> = {
    image: Image,
    pdf: FileText,
    doc: File,
};

// Info Row Component
function InfoRow({ label, value, icon: Icon, href }: { label: string; value: string; icon: React.ElementType; href?: string }) {
    const content = (
        <div className="flex items-start gap-3 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 border">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-medium mt-0.5 ${href ? 'text-primary' : 'text-foreground'}`}>{value}</p>
            </div>
        </div>
    );

    if (href) {
        return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{content}</a>;
    }

    return content;
}

// Signature Canvas Component
function SignatureCanvas({ onSave }: { onSave: (signature: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        setIsDrawing(true);
        setHasSignature(true);
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (canvas && hasSignature) {
            onSave(canvas.toDataURL("image/png"));
        }
    };

    return (
        <div className="space-y-3">
            <div className="border border-dashed rounded-lg p-1 bg-white overflow-hidden shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    className="w-full h-40 touch-none cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <Button variant="ghost" size="sm" onClick={clearCanvas} className="h-7 px-2 text-primary">Clear</Button>
                <span>Please sign here</span>
                <Button variant="ghost" size="sm" onClick={saveSignature} className="h-7 px-2 text-primary">Capture</Button>
            </div>
        </div>
    );
}

// Digital Sign-Off Modal
function SignOffModalContent({ job, onComplete }: { job: FieldJob; onComplete: () => void }) {
    const [customerName, setCustomerName] = useState(job.customerName);
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!signature || !customerName) return;
        setIsSubmitting(true);
        setTimeout(() => {
            onComplete();
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Print Name</label>
                <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="h-10"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Digital Signature</label>
                <SignatureCanvas onSave={setSignature} />
            </div>
            {signature && (
                <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 p-2 rounded-md border border-green-100">
                    <CheckCircle2 className="h-4 w-4" />
                    Signature verified and stored securely
                </div>
            )}
            <Button
                className="w-full h-11 text-sm font-semibold"
                disabled={!signature || !customerName || isSubmitting}
                onClick={handleSubmit}
            >
                {isSubmitting ? "Completing Job..." : "Complete & Send Report"}
            </Button>
        </div>
    );
}

export default function FieldJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openModal, openConfirmation } = useModal();

    const [job, setJob] = useState(mockJobs[id] || mockJobs["J-001"]);
    const [newNote, setNewNote] = useState("");

    const handleToggleTask = (taskId: string) => {
        setJob(prev => ({
            ...prev,
            checklist: prev.checklist.map(item =>
                item.id === taskId
                    ? {
                        ...item,
                        completed: !item.completed,
                        completedAt: !item.completed ? new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : undefined
                    }
                    : item
            ),
        }));
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const note: FieldNote = {
            id: Date.now().toString(),
            content: newNote,
            timestamp: new Date().toISOString(),
            author: "Mike Johnson",
        };
        setJob(prev => ({
            ...prev,
            fieldNotes: [note, ...prev.fieldNotes],
        }));
        setNewNote("");
    };

    const handleStatusChange = (newStatus: string) => {
        const titles: Record<string, string> = { in_progress: "Start Job", paused: "Pause Job" };
        openConfirmation(
            titles[newStatus] || "Change Status",
            `Are you sure you want to ${newStatus === "in_progress" ? "start" : "pause"} this job?`,
            () => setJob(prev => ({ ...prev, status: newStatus }))
        );
    };

    const handleSignOff = () => {
        openModal({
            title: "Digital Sign-Off",
            description: "Please collect customer signature to complete this work",
            content: (
                <SignOffModalContent
                    job={job}
                    onComplete={() => {
                        setJob(prev => ({ ...prev, status: 'completed' }));
                        window.location.href = "/field";
                    }}
                />
            ),
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    };

    const formatTime = (isoString: string) => {
        const date = isoString.includes('T') ? new Date(isoString) : null;
        if (!date || isNaN(date.getTime())) return isoString;
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    };

    const progress = Math.round((job.checklist.filter(t => t.completed).length / job.checklist.length) * 100);

    return (
        <>
            <Topbar title="Field Briefing" />
            <main className="flex-1 overflow-y-auto bg-muted/40 pb-20">
                {/* Mobile-Optimized Header */}
                <div className="bg-background border-b sticky top-0 z-10 shadow-sm">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <Link href="/field">
                            <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>

                    <div className="px-5 pb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-lg font-semibold tracking-tight">{job.title}</h1>
                            <Badge variant="secondary" className={`${statusStyles[job.status]} font-normal h-5`}>
                                {job.status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-[11px] font-medium text-muted-foreground ml-auto">{job.id}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{job.customerName}</span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="flex items-center gap-1.5 font-medium text-foreground"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{job.startTime} - {job.endTime}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-5 max-w-2xl mx-auto">
                    {/* Status Actions */}
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0 flex gap-3">
                            {job.status === "scheduled" && (
                                <Button className="flex-1 h-11 font-semibold shadow-sm" onClick={() => handleStatusChange("in_progress")}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Start Job
                                </Button>
                            )}
                            {job.status === "in_progress" && (
                                <>
                                    <Button variant="outline" className="flex-1 h-11 font-semibold bg-background" onClick={() => handleStatusChange("paused")}>
                                        <PauseCircle className="mr-2 h-4 w-4" />
                                        Pause
                                    </Button>
                                    <Button className="flex-1 h-11 font-semibold shadow-sm" onClick={handleSignOff}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Sign Off
                                    </Button>
                                </>
                            )}
                            {job.status === "paused" && (
                                <Button className="flex-1 h-11 font-semibold shadow-sm" onClick={() => handleStatusChange("in_progress")}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Resume Job
                                </Button>
                            )}
                            {job.status === "completed" && (
                                <div className="flex-1 py-3 px-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-semibold uppercase tracking-wider">Job Completed Successfully</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Site Location */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Location & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y pt-0">
                            <InfoRow label="Site Address" value={job.address} icon={MapPin} href={`https://maps.apple.com/?q=${encodeURIComponent(job.address)}`} />
                            <InfoRow label="Customer Phone" value={job.customerPhone} icon={Phone} href={`tel:${job.customerPhone}`} />
                            <InfoRow label="Related Project" value={job.projectId} icon={ExternalLink} href={`/projects/${job.projectId}`} />
                        </CardContent>
                    </Card>

                    {/* Checklist */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Task Checklist</CardTitle>
                                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted mt-3 overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1 pt-0">
                            {job.checklist.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleToggleTask(item.id)}
                                    className={`flex items-start gap-4 p-3.5 rounded-xl transition-all cursor-pointer border ${item.completed ? "bg-muted/30 border-transparent" : "bg-card hover:border-primary/30"}`}
                                >
                                    <Checkbox
                                        checked={item.completed}
                                        onCheckedChange={() => handleToggleTask(item.id)}
                                        className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                            {item.task}
                                        </p>
                                        {item.completed && item.completedAt && (
                                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Done at {item.completedAt}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Field Notes */}
                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activity Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add progress note..."
                                    className="h-10 text-sm"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                                />
                                <Button size="icon" onClick={handleAddNote} disabled={!newNote.trim()} className="h-10 w-10 shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4 overflow-hidden relative first:mt-0">
                                {job.fieldNotes.map((note, idx) => (
                                    <div key={note.id} className="relative pl-6 last:pb-0 pb-6 group">
                                        {idx !== job.fieldNotes.length - 1 && <div className="absolute left-2 top-2 h-full w-0.5 bg-muted" />}
                                        <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm" />
                                        <div className="bg-muted/40 p-3 rounded-xl border border-muted-foreground/10 group-hover:bg-muted/60 transition-colors">
                                            <p className="text-sm leading-relaxed">{note.content}</p>
                                            <div className="mt-2.5 flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                                <span>{note.author}</span>
                                                <span>•</span>
                                                <span>{formatTime(note.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {job.fieldNotes.length === 0 && (
                                    <div className="text-center py-6">
                                        <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Photos */}
                    <Card>
                        <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Evidence & Photos</CardTitle>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-primary font-bold tracking-widest uppercase">
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <Button variant="outline" className="h-auto py-5 flex-col gap-2 rounded-xl bg-muted/20 border-dashed hover:bg-muted/40 hover:border-primary/50 transition-all">
                                    <Camera className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Take Photo</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-5 flex-col gap-2 rounded-xl bg-muted/20 border-dashed hover:bg-muted/40 hover:border-primary/50 transition-all">
                                    <Upload className="h-5 w-5 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload File</span>
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {job.files.map((file) => {
                                    const FileIcon = fileTypeIcons[file.type] || File;
                                    return (
                                        <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/20 transition-colors group">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                                                <FileIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium">{file.size} • {file.uploadedAt}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
