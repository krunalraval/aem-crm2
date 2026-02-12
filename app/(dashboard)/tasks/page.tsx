"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    useDroppable,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import tasksData from "@/mock-data/tasks.json";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { STATUS_COLORS, getStatusStyle as getGlobalStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Inbox,
    LayoutGrid,
    List,
    CheckSquare,
    Phone,
    Mail,
    MapPin,
    FileText,
    Clock,
    AlertCircle,
    Calendar,
    User,
    Building2,
    ArrowUpRight,
    CheckCircle2,
    RefreshCw,
    Clipboard,
    XCircle,
    CalendarClock,
    UserPlus,
    Repeat,
    Bell,
    TrendingUp,
    Paperclip,
    Link2,
} from "lucide-react";

// Types
type TaskType = "call" | "email" | "meeting" | "site_visit" | "admin" | "follow_up" | "approval";
type TaskStatus = "not_started" | "in_progress" | "waiting_on_client" | "complete";
type TaskPriority = "Normal" | "High" | "Urgent";
type RecordType = "contact" | "lead" | "site" | "quote" | "job";

interface Task {
    id: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    dueTime?: string;
    assignee: string;
    assigneeId: string;
    assignedBy?: string;
    recordType?: RecordType;
    recordId?: string;
    recordName?: string;
    reminderSetting?: string;
    reminderMethod?: string;
    recurrence?: string;
    completionNotes?: string;
    createdAt: string;
    chaseCount?: number;
}

// Constants
const TODAY = new Date().toISOString().split("T")[0];
const currentUser = "John Smith";
const currentUserId = "USER-001";

const TASK_TYPES: { value: TaskType; label: string; icon: React.ElementType }[] = [
    { value: "call", label: "Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
    { value: "meeting", label: "Meeting", icon: Calendar },
    { value: "site_visit", label: "Site Visit", icon: MapPin },
    { value: "admin", label: "Admin", icon: Clipboard },
    { value: "follow_up", label: "Follow-Up", icon: RefreshCw },
    { value: "approval", label: "Approval", icon: CheckCircle2 },
];

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "waiting_on_client", label: "Waiting on Client" },
    { value: "complete", label: "Complete" },
];

const PIPELINE_COLUMNS: { value: TaskStatus; label: string }[] = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "waiting_on_client", label: "Waiting on Client" },
    { value: "complete", label: "Complete" },
];

const mockUsers = [
    { id: "USER-001", name: "John Smith" },
    { id: "USER-002", name: "Sarah Chen" },
    { id: "USER-003", name: "Mike Johnson" },
    { id: "USER-004", name: "Lisa Park" },
];

const mockRecords: Record<RecordType, { id: string; name: string }[]> = {
    contact: [
        { id: "CON-001", name: "Sarah Chen" },
        { id: "CON-002", name: "Mike Davis" },
    ],
    lead: [
        { id: "L-001", name: "Johnson Roofing - CCTV Upgrade" },
        { id: "L-002", name: "Acme Corp - Access Control" },
    ],
    site: [
        { id: "SITE-001", name: "Manchester Warehouse" },
        { id: "SITE-002", name: "London HQ" },
    ],
    quote: [
        { id: "Q-2024-015", name: "Quote #Q-2024-015" },
        { id: "Q-2024-010", name: "Quote #Q-2024-010" },
    ],
    job: [
        { id: "JOB-001", name: "CCTV Installation" },
        { id: "JOB-002", name: "Access Control Setup" },
    ],
};

// Transform mock data
const transformTasks = (rawTasks: any[]): Task[] => {
    const types: TaskType[] = ["call", "email", "meeting", "site_visit", "admin", "follow_up", "approval"];
    const statuses: TaskStatus[] = ["not_started", "in_progress", "waiting_on_client", "complete"];
    const priorities: TaskPriority[] = ["Normal", "Normal", "High", "Urgent"];

    return rawTasks.map((task, index) => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        type: types[index % types.length],
        status: (task.status === "completed" ? "complete" : task.status === "new" ? "not_started" : "in_progress") as TaskStatus,
        priority: priorities[index % priorities.length],
        dueDate: task.dueDate,
        dueTime: index % 3 === 0 ? "10:00" : index % 3 === 1 ? "14:30" : undefined,
        assignee: task.assignee,
        assigneeId: mockUsers[index % mockUsers.length].id,
        assignedBy: index % 2 === 0 ? "Sarah Chen" : undefined,
        recordType: task.siteId ? "site" : task.contactName ? "contact" : undefined,
        recordId: task.siteId || undefined,
        recordName: task.siteName || task.contactName || undefined,
        createdAt: task.createdAt,
        chaseCount: task.type === "call" ? (index % 4) : undefined,
    }));
};

const initialTasks: Task[] = transformTasks(tasksData as any[]);

// Helper functions
const getTaskTypeIcon = (type: TaskType): React.ElementType => {
    return TASK_TYPES.find(t => t.value === type)?.icon || FileText;
};

const getPriorityStyle = (priority: TaskPriority): string => {
    switch (priority) {
        case "Urgent": return STATUS_COLORS.priority.critical;
        case "High": return STATUS_COLORS.priority.high;
        default: return STATUS_COLORS.priority.medium;
    }
};

const getStatusStyle = (status: TaskStatus): string => {
    switch (status) {
        case "complete": return STATUS_COLORS.semantic.healthy;
        case "in_progress": return STATUS_COLORS.semantic.active;
        case "waiting_on_client": return STATUS_COLORS.semantic.warning;
        default: return STATUS_COLORS.semantic.draft;
    }
};

const isOverdue = (dueDate: string, status: TaskStatus): boolean => {
    if (status === "complete") return false;
    return new Date(dueDate) < new Date(TODAY);
};

const isDueToday = (dueDate: string): boolean => {
    return dueDate === TODAY;
};

const isDueThisWeek = (dueDate: string): boolean => {
    const due = new Date(dueDate);
    const today = new Date(TODAY);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return due >= today && due <= weekEnd;
};

const getUrgencyClass = (task: Task): string => {
    if (task.status === "complete") return "";
    if (task.status === "waiting_on_client") return ""; // No red escalation for waiting
    if (isOverdue(task.dueDate, task.status)) return "bg-red-50 border-red-200";
    if (isDueToday(task.dueDate) && (task.priority === "High" || task.priority === "Urgent")) {
        return "bg-amber-50 border-amber-200";
    }
    return "";
};

const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return timeString;
};

// Create Task Form Component
export function CreateTaskForm({ onClose, onSave }: { onClose?: () => void; onSave?: (task: Partial<Task>) => void }) {
    const [title, setTitle] = useState("");
    const [taskType, setTaskType] = useState<TaskType>("call");
    const [assigneeId, setAssigneeId] = useState(currentUserId);
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("Normal");
    const [status, setStatus] = useState<TaskStatus>("not_started");
    const [description, setDescription] = useState("");
    const [recordType, setRecordType] = useState<RecordType | "">("");
    const [recordId, setRecordId] = useState("");
    const [reminderSetting, setReminderSetting] = useState("");
    const [reminderMethod, setReminderMethod] = useState("");
    const [recurrence, setRecurrence] = useState("");

    const filteredRecords = recordType ? mockRecords[recordType] : [];
    const canSubmit = title.trim() && taskType && assigneeId && dueDate;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSave?.({
            title,
            type: taskType,
            assigneeId,
            assignee: mockUsers.find(u => u.id === assigneeId)?.name || "",
            dueDate,
            dueTime: dueTime || undefined,
            priority,
            status,
            description,
            recordType: recordType as RecordType | undefined,
            recordId: recordId || undefined,
            recordName: recordType && recordId ? mockRecords[recordType as RecordType].find(r => r.id === recordId)?.name : undefined,
        });
        onClose?.();
        toast.success("Task created successfully");
    };

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-1.5">
                <Label>Task Title <span className="text-destructive">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Follow up on proposal" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Task Type <span className="text-destructive">*</span></Label>
                    <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {TASK_TYPES.map(t => {
                                const Icon = t.icon;
                                return (
                                    <SelectItem key={t.value} value={t.value}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />{t.label}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Assigned To <span className="text-destructive">*</span></Label>
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {mockUsers.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Due Date <span className="text-destructive">*</span></Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Due Time</Label>
                    <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Priority <span className="text-destructive">*</span></Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Status <span className="text-destructive">*</span></Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {TASK_STATUSES.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Description/Notes</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details..." rows={2} />
            </div>

            {/* Polymorphic Associated Record Selector */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Associated Record</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Record Type</Label>
                        <Select value={recordType} onValueChange={(v) => { setRecordType(v as RecordType); setRecordId(""); }}>
                            <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="contact">Contact</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="site">Site</SelectItem>
                                <SelectItem value="quote">Quote</SelectItem>
                                <SelectItem value="job">Job</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Search Record</Label>
                        <Select value={recordId} onValueChange={setRecordId} disabled={!recordType}>
                            <SelectTrigger><SelectValue placeholder={recordType ? "Select..." : "Select type first"} /></SelectTrigger>
                            <SelectContent>
                                {filteredRecords.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Reminder</Label>
                    <Select value={reminderSetting} onValueChange={setReminderSetting}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="at_due">At Due Time</SelectItem>
                            <SelectItem value="1_hour">1 Hour Before</SelectItem>
                            <SelectItem value="1_day">1 Day Before</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Reminder Method</Label>
                    <Select value={reminderMethod} onValueChange={setReminderMethod} disabled={!reminderSetting || reminderSetting === "none"}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="in_app">In-App</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Recurrence</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!canSubmit}>Save Task</Button>
            </div>
        </div>
    );
}

// Task Detail Drawer Component
function TaskDetailDrawer({
    task,
    onClose,
    onMarkComplete,
    onReschedule,
    onReassign,
    onCancel
}: {
    task: Task;
    onClose?: () => void;
    onMarkComplete?: (notes: string) => void;
    onReschedule?: (newDate: string) => void;
    onReassign?: (userId: string) => void;
    onCancel?: () => void;
}) {
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [completionNotes, setCompletionNotes] = useState("");
    const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
    const [newDueDate, setNewDueDate] = useState(task.dueDate);
    const [showReassignDialog, setShowReassignDialog] = useState(false);
    const [newAssigneeId, setNewAssigneeId] = useState(task.assigneeId);

    const TypeIcon = getTaskTypeIcon(task.type);
    const overdue = isOverdue(task.dueDate, task.status);

    const getRecordLink = () => {
        if (!task.recordType || !task.recordId) return null;
        const paths: Record<RecordType, string> = {
            contact: "/contacts",
            lead: "/leads",
            site: "/sites",
            quote: "/quotes",
            job: "/jobs",
        };
        return `${paths[task.recordType]}/${task.recordId}`;
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={`${getPriorityStyle(task.priority)} border-none text-[10px] font-bold uppercase px-2 h-5`}>
                            {task.priority}
                        </Badge>
                        <Badge className={`${getStatusStyle(task.status)} border-none text-[10px] font-bold uppercase px-2 h-5`}>
                            {TASK_STATUSES.find(s => s.value === task.status)?.label}
                        </Badge>
                        {overdue && (
                            <Badge className="bg-red-100 text-red-700 border-none text-[10px] font-bold uppercase px-2 h-5">
                                <AlertCircle className="h-3 w-3 mr-1" />Overdue
                            </Badge>
                        )}
                        {task.status === "waiting_on_client" && (
                            <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-bold uppercase px-2 h-5">
                                Waiting on Client
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <TypeIcon className="h-4 w-4" />
                        </div>
                        <h3 className="text-base font-bold">{task.title}</h3>
                    </div>
                    {task.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                    )}
                    {task.chaseCount !== undefined && task.chaseCount > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-fit">
                            <span className="text-xs font-bold uppercase tracking-wider">Attempt #{task.chaseCount}</span>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Due Date</span>
                        <span className={`text-sm font-medium ${overdue ? "text-red-600" : ""}`}>
                            {formatDate(task.dueDate)} {task.dueTime && `at ${task.dueTime}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assignee</span>
                        <span className="text-sm font-medium">{task.assignee}</span>
                    </div>
                    {task.assignedBy && task.assignedBy !== currentUser && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Assigned By</span>
                            <span className="text-sm text-muted-foreground">{task.assignedBy}</span>
                        </div>
                    )}
                    {task.recurrence && task.recurrence !== "none" && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recurrence</span>
                            <Badge variant="outline" className="text-xs capitalize">{task.recurrence}</Badge>
                        </div>
                    )}
                </div>

                {/* Associated Record */}
                {task.recordName && (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Associated Record</p>
                        <Link href={getRecordLink() || "#"} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                            {task.recordType === "site" && <Building2 className="h-4 w-4" />}
                            {task.recordType === "contact" && <User className="h-4 w-4" />}
                            {task.recordType === "lead" && <ArrowUpRight className="h-4 w-4" />}
                            {task.recordName}
                        </Link>
                    </div>
                )}

                {/* Attachments Placeholder */}
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Attachments</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-[11px] border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary transition-all">
                            <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                            Upload File
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary transition-all">
                            <Link2 className="h-3.5 w-3.5 mr-1.5" />
                            Add URL
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                    {task.status !== "complete" && (
                        <Button className="w-full h-10 font-bold text-xs" onClick={() => setShowCompleteDialog(true)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />Mark Complete
                        </Button>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="h-9 text-xs" onClick={() => setShowRescheduleDialog(true)}>
                            <CalendarClock className="h-3.5 w-3.5 mr-1" />Reschedule
                        </Button>
                        <Button variant="outline" className="h-9 text-xs" onClick={() => setShowReassignDialog(true)}>
                            <UserPlus className="h-3.5 w-3.5 mr-1" />Reassign
                        </Button>
                        <Button variant="outline" className="h-9 text-xs text-destructive hover:text-destructive" onClick={onCancel}>
                            <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mark Complete Dialog */}
            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Task</DialogTitle>
                        <DialogDescription>Add completion notes before marking this task as complete.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Completion Notes</Label>
                        <Textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="What was accomplished? Any follow-up needed?"
                            rows={4}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
                        <Button onClick={() => { onMarkComplete?.(completionNotes); setShowCompleteDialog(false); }}>
                            Mark Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Dialog */}
            <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule Task</DialogTitle>
                        <DialogDescription>Select a new due date for this task.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>New Due Date</Label>
                        <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="mt-2" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>Cancel</Button>
                        <Button onClick={() => { onReschedule?.(newDueDate); setShowRescheduleDialog(false); }}>
                            Reschedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reassign Dialog */}
            <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reassign Task</DialogTitle>
                        <DialogDescription>Select a new assignee for this task.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Assign To</Label>
                        <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
                            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {mockUsers.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReassignDialog(false)}>Cancel</Button>
                        <Button onClick={() => { onReassign?.(newAssigneeId); setShowReassignDialog(false); }}>
                            Reassign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Sortable Task Card for Pipeline View
const SortableTaskCard = React.memo(({ task, onClick }: { task: Task; onClick: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: "Task", task },
    });

    const style = { transform: CSS.Translate.toString(transform), transition };
    const TypeIcon = getTaskTypeIcon(task.type);
    const urgencyClass = getUrgencyClass(task);

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="p-4 bg-muted/20 rounded-xl border border-dashed h-[90px] mb-2" />;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`group p-3 bg-white dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing mb-2 ${urgencyClass}`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    <Badge className={`${getPriorityStyle(task.priority)} border-none text-[9px] font-bold uppercase h-4 px-1.5`}>
                        {task.priority}
                    </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>
            </div>
            <h4 className="text-sm font-medium leading-tight truncate">{task.title}</h4>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{task.assignee.split(" ")[0]}</span>
                    {task.chaseCount !== undefined && task.chaseCount > 0 && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-200 text-amber-700 bg-amber-50/50">
                            Attempt {task.chaseCount}
                        </Badge>
                    )}
                </div>
                {urgencyClass && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                )}
            </div>
        </div>
    );
});

// Pipeline Column
function PipelineColumn({ id, title, tasks, onClickTask }: { id: string; title: string; tasks: Task[]; onClickTask: (task: Task) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id, data: { type: "Column" } });

    return (
        <div ref={setNodeRef} className={`flex-shrink-0 w-72 rounded-xl transition-colors ${isOver ? "bg-primary/5" : ""}`}>
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">{title}</h3>
                <Badge variant="secondary" className="text-[10px] font-bold h-5">{tasks.length}</Badge>
            </div>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1 min-h-[300px] max-h-[calc(100vh-350px)] overflow-y-auto rounded-xl p-2 border border-dashed bg-muted/30">
                    {tasks.length > 0 ? (
                        tasks.map(task => <SortableTaskCard key={task.id} task={task} onClick={() => onClickTask(task)} />)
                    ) : (
                        <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                            <Inbox className="h-5 w-5 opacity-20" />
                            <span className="text-[10px] font-bold mt-1 uppercase">Empty</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// Static Task Card for Drag Overlay
function TaskCardStatic({ task }: { task: Task }) {
    const TypeIcon = getTaskTypeIcon(task.type);
    return (
        <div className="p-3 bg-white rounded-xl border border-primary/20 shadow-xl rotate-[2deg] scale-105 w-[280px]">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4" />
                    <Badge className={`${getPriorityStyle(task.priority)} border-none text-[9px] font-bold uppercase h-4 px-1.5`}>
                        {task.priority}
                    </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{formatDate(task.dueDate)}</span>
            </div>
            <h4 className="text-sm font-medium">{task.title}</h4>
        </div>
    );
}

// Main Page Content
function TasksPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openDrawer, closeDrawer } = useDrawer();

    const viewMode = searchParams.get("view") === "pipeline" ? "pipeline" : "list";
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTab, setActiveTab] = useState<"today" | "week" | "overdue" | "all" | "completed">("today");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    // Filter tasks based on active tab
    const filteredTasks = useMemo(() => {
        let filtered = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

        switch (activeTab) {
            case "today":
                filtered = filtered.filter(t => isDueToday(t.dueDate) && t.status !== "complete");
                break;
            case "week":
                filtered = filtered.filter(t => isDueThisWeek(t.dueDate) && t.status !== "complete");
                break;
            case "overdue":
                filtered = filtered.filter(t => isOverdue(t.dueDate, t.status) && t.status !== "complete");
                break;
            case "all":
                filtered = filtered.filter(t => t.status !== "complete");
                break;
            case "completed":
                filtered = filtered.filter(t => t.status === "complete");
                break;
        }

        // Sort: Overdue first (pinned), then by priority (Urgent > High > Normal), then by due date
        return filtered.sort((a, b) => {
            const aOverdue = isOverdue(a.dueDate, a.status) ? 1 : 0;
            const bOverdue = isOverdue(b.dueDate, b.status) ? 1 : 0;
            if (bOverdue !== aOverdue) return bOverdue - aOverdue;

            const priorityOrder = { Urgent: 3, High: 2, Normal: 1 };
            if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }

            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [tasks, activeTab, searchQuery]);

    // Counts for tabs
    const counts = useMemo(() => ({
        today: tasks.filter(t => isDueToday(t.dueDate) && t.status !== "complete").length,
        week: tasks.filter(t => isDueThisWeek(t.dueDate) && t.status !== "complete").length,
        overdue: tasks.filter(t => isOverdue(t.dueDate, t.status) && t.status !== "complete").length,
        all: tasks.filter(t => t.status !== "complete").length,
        completed: tasks.filter(t => t.status === "complete").length,
    }), [tasks]);

    // DND
    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
    const sensors = useSensors(pointerSensor, keyboardSensor);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const task = active.data.current?.task as Task;
        const isOverColumn = over.data.current?.type === "Column";

        if (task && isOverColumn) {
            const newStatus = over.id as TaskStatus;
            if (task.status !== newStatus) {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
                toast.success(`Task moved to ${TASK_STATUSES.find(s => s.value === newStatus)?.label}`);
            }
        }
    }, []);

    const handleOpenTask = (task: Task) => {
        setSelectedTask(task);
        openDrawer({
            title: "Task Details",
            description: task.title,
            content: (
                <TaskDetailDrawer
                    task={task}
                    onClose={closeDrawer}
                    onMarkComplete={(notes) => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "complete", completionNotes: notes } : t));
                        closeDrawer();
                        toast.success("Task marked complete");
                    }}
                    onReschedule={(newDate) => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, dueDate: newDate } : t));
                        closeDrawer();
                        toast.success("Task rescheduled");
                    }}
                    onReassign={(userId) => {
                        const user = mockUsers.find(u => u.id === userId);
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assigneeId: userId, assignee: user?.name || "" } : t));
                        closeDrawer();
                        toast.success(`Task reassigned to ${user?.name}`);
                    }}
                    onCancel={() => {
                        setTasks(prev => prev.filter(t => t.id !== task.id));
                        closeDrawer();
                        toast.success("Task cancelled");
                    }}
                />
            )
        });
    };

    const handleCreateTask = () => {
        openDrawer({
            title: "Create Task",
            description: "Add a new task to your list",
            content: (
                <CreateTaskForm
                    onClose={closeDrawer}
                    onSave={(newTask) => {
                        setTasks(prev => [...prev, {
                            ...newTask,
                            id: `TASK-${Date.now()}`,
                            createdAt: new Date().toISOString(),
                        } as Task]);
                    }}
                />
            )
        });
    };

    const toggleView = () => {
        router.push(viewMode === "list" ? "/tasks?view=pipeline" : "/tasks");
    };

    if (!isMounted) return null;

    return (
        <>
            <Topbar title="Tasks" subtitle="Manage your daily tasks and follow-ups" />
            <main className="flex-1 overflow-hidden bg-muted/20 p-6">
                {/* Filter Bar */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <div className="flex items-center rounded-lg border bg-muted/30 p-1">
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => viewMode === "pipeline" && toggleView()}
                            >
                                <List className="h-3.5 w-3.5 mr-1" />List
                            </Button>
                            <Button
                                variant={viewMode === "pipeline" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => viewMode === "list" && toggleView()}
                            >
                                <LayoutGrid className="h-3.5 w-3.5 mr-1" />Pipeline
                            </Button>
                        </div>
                    </div>
                    <Button id="create-task-btn" onClick={handleCreateTask} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95 shadow-sm">
                        <Plus className="mr-1.5 h-4 w-4" />Create Task
                    </Button>
                </div>

                {/* Tabs */}
                {viewMode === "list" && (
                    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
                        {[
                            { key: "today", label: "Due Today", count: counts.today },
                            { key: "week", label: "Due This Week", count: counts.week },
                            { key: "overdue", label: "Overdue", count: counts.overdue },
                            { key: "all", label: "All Active", count: counts.all },
                            { key: "completed", label: "Completed", count: counts.completed },
                        ].map(tab => (
                            <Button
                                key={tab.key}
                                variant={activeTab === tab.key ? "default" : "ghost"}
                                size="sm"
                                className={`h-8 px-3 text-xs font-bold ${activeTab === tab.key ? "" : "text-muted-foreground"} ${tab.key === "overdue" && tab.count > 0 ? "text-red-600" : ""}`}
                                onClick={() => setActiveTab(tab.key as any)}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <Badge className={`ml-1.5 h-5 text-[10px] ${tab.key === "overdue" && tab.count > 0 ? "bg-red-100 text-red-700" : ""}`} variant="secondary">
                                        {tab.count}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead>Task</TableHead>
                                        <TableHead className="hidden md:table-cell">Associated Record</TableHead>
                                        <TableHead>Due</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTasks.length > 0 ? filteredTasks.map(task => {
                                        const TypeIcon = getTaskTypeIcon(task.type);
                                        const overdue = isOverdue(task.dueDate, task.status);
                                        const urgencyClass = getUrgencyClass(task);

                                        return (
                                            <TableRow
                                                key={task.id}
                                                className={`cursor-pointer hover:bg-muted/50 ${urgencyClass}`}
                                                onClick={() => handleOpenTask(task)}
                                            >
                                                <TableCell>
                                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">{task.title}</p>
                                                        {task.assignedBy && task.assignedBy !== currentUser && (
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">assigned by {task.assignedBy}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {task.recordName ? (
                                                        <Link
                                                            href={`/${task.recordType}s/${task.recordId}`}
                                                            className="text-sm text-primary hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {task.recordName}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`text-sm ${overdue ? "text-red-600 font-medium" : ""}`}>
                                                        {formatDate(task.dueDate)}
                                                        {task.dueTime && <span className="text-muted-foreground ml-1">{task.dueTime}</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getPriorityStyle(task.priority)} border-none text-[10px] font-bold uppercase`}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusStyle(task.status)} border-none text-[10px] font-bold uppercase`}>
                                                        {TASK_STATUSES.find(s => s.value === task.status)?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <span className="text-sm">{task.assignee}</span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-48 text-center">
                                                <SharedEmptyState
                                                    icon={Inbox}
                                                    title="No tasks found"
                                                    description={searchQuery ? `No tasks found matching "${searchQuery}"` : "You don't have any tasks scheduled for this period."}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Pipeline View */}
                {viewMode === "pipeline" && (
                    <div className="overflow-x-auto -mx-6 px-6 pb-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-4" style={{ minWidth: `${PIPELINE_COLUMNS.length * 300}px` }}>
                                {PIPELINE_COLUMNS.map(col => {
                                    const colTasks = tasks.filter(t => t.status === col.value);
                                    return (
                                        <PipelineColumn
                                            key={col.value}
                                            id={col.value}
                                            title={col.label}
                                            tasks={colTasks}
                                            onClickTask={handleOpenTask}
                                        />
                                    );
                                })}
                            </div>
                            <DragOverlay>
                                {activeTask && <TaskCardStatic task={activeTask} />}
                            </DragOverlay>
                        </DndContext>
                    </div>
                )}
            </main>
        </>
    );
}

export default function TasksPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                    <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading tasks...</p>
                </div>
            </div>
        }>
            <TasksPageContent />
        </Suspense>
    );
}
