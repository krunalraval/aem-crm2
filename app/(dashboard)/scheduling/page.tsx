"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    User,
    Users,
    MoreHorizontal,
    Eye,
    UserPlus,
    CalendarClock,
    Building2,
    Inbox,
    GripVertical,
    ExternalLink,
    Search,
    Edit,
} from "lucide-react";
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
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
interface ScheduledJob {
    id: string;
    projectId: string;
    customerId: string;
    customerName: string;
    title: string;
    address: string;
    date: string;
    startTime: string;
    endTime: string;
    engineers: string[];
    status: string;
    notes: string;
}

// Mock Data
const mockJobs: ScheduledJob[] = [
    { id: "J-001", projectId: "P-2024-001", customerId: "ACC-001", customerName: "Johnson Roofing LLC", title: "Roof Inspection", address: "123 Oak Street, Austin, TX", date: "2024-01-29", startTime: "09:00", endTime: "11:00", engineers: ["Mike Johnson"], status: "scheduled", notes: "Annual inspection" },
    { id: "J-002", projectId: "P-2024-001", customerId: "ACC-001", customerName: "Johnson Roofing LLC", title: "Tile Replacement", address: "123 Oak Street, Austin, TX", date: "2024-01-29", startTime: "13:00", endTime: "17:00", engineers: ["Mike Johnson", "David Brown"], status: "scheduled", notes: "West section tiles" },
    { id: "J-003", projectId: "P-2024-004", customerId: "ACC-002", customerName: "Acme Construction", title: "Emergency Leak Repair", address: "456 Main Avenue, Dallas, TX", date: "2024-01-29", startTime: "08:00", endTime: "12:00", engineers: ["Tom Williams"], status: "in_progress", notes: "Urgent - water damage" },
    { id: "J-004", projectId: "P-2024-005", customerId: "ACC-002", customerName: "Acme Construction", title: "Flat Roof Membrane", address: "100 Logistics Way, Dallas, TX", date: "2024-01-30", startTime: "07:00", endTime: "15:00", engineers: ["Mike Johnson", "Tom Williams"], status: "scheduled", notes: "Phase 1 installation" },
    { id: "J-005", projectId: "P-2024-002", customerId: "ACC-001", customerName: "Johnson Roofing LLC", title: "Final Inspection", address: "456 Industrial Blvd, Austin, TX", date: "2024-01-30", startTime: "10:00", endTime: "11:30", engineers: ["David Brown"], status: "completed", notes: "Sign-off required" },
    { id: "J-006", projectId: "P-2024-003", customerId: "ACC-001", customerName: "Johnson Roofing LLC", title: "Gutter Assessment", address: "123 Oak Street, Austin, TX", date: "2024-01-31", startTime: "09:00", endTime: "12:00", engineers: ["David Brown"], status: "scheduled", notes: "Pre-work assessment" },
];

const allEngineers = ["Mike Johnson", "David Brown", "Tom Williams"];

const statusStyles: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    in_progress: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    cancelled: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const jobCardStyles: Record<string, string> = {
    scheduled: "border-l-blue-400 bg-blue-50/30",
    in_progress: "border-l-purple-400 bg-purple-50/30",
    completed: "border-l-green-400 bg-green-50/30",
    cancelled: "border-l-red-400 bg-red-50/30",
};

// Helper functions
function getWeekDates(date: Date): Date[] {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        week.push(d);
    }
    return week;
}

function formatDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
}

function formatDayName(date: Date): string {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function isToday(date: Date): boolean {
    const today = new Date("2024-01-29");
    return formatDateKey(date) === formatDateKey(today);
}

// Info Row Component for Drawer
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/50 border border-slate-100 shadow-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                <div className="text-sm font-bold text-foreground mt-0.5 leading-snug">
                    {value}
                </div>
            </div>
        </div>
    );
}

function JobDetailDrawer({ job }: { job: ScheduledJob }) {
    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-base font-black tracking-tight">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">{job.notes}</p>
                </div>

                <Separator className="bg-slate-100/50" />

                <div className="space-y-5 px-1">
                    <InfoRow label="Operational Status" value={
                        <Badge className={`${jobCardStyles[job.status]} border-none font-black text-[10px] uppercase tracking-widest h-5 px-2`}>
                            {job.status}
                        </Badge>
                    } icon={Clock} />
                    <InfoRow label="Customer Asset" value={job.customerName} icon={Building2} />
                    <InfoRow label="Operational Address" value={job.address} icon={MapPin} />
                    <InfoRow
                        label="Deployment Window"
                        value={`${new Date(job.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} • ${job.startTime} - ${job.endTime}`}
                        icon={CalendarIcon}
                    />
                    <InfoRow
                        label="Assigned Crew"
                        value={
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {job.engineers.map((eng) => (
                                    <Badge key={eng} variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-background border-slate-200 h-5">
                                        {eng}
                                    </Badge>
                                ))}
                            </div>
                        }
                        icon={Users}
                    />
                </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="flex gap-3">
                <Button asChild className="flex-1 h-10 font-bold text-xs" size="sm">
                    <Link href={`/projects/${job.projectId}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Project Dossier
                    </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-10 w-10 p-0 border-none shadow-sm bg-background hover:bg-muted/50">
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// Sortable Job Card Component
const SortableJobCard = React.memo(({ job, onClick }: { job: ScheduledJob; onClick: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: job.id,
        data: {
            type: "Job",
            job,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-4 bg-muted/20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 h-[80px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`group relative rounded-md border-l-4 p-2.5 text-xs shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all active:scale-[0.98] ${jobCardStyles[job.status]}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{job.title}</p>
                    <p className="text-muted-foreground truncate mt-0.5">{job.customerName}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{job.startTime} - {job.endTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Droppable Day Component
function DroppableDay({ dateKey, label, dayNumber, jobs, isToday, onClickJob }: {
    dateKey: string,
    label: string,
    dayNumber: number,
    jobs: ScheduledJob[],
    isToday: boolean,
    onClickJob: (job: ScheduledJob) => void
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: dateKey,
        data: {
            type: "Day",
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[450px] rounded-xl border bg-background/50 p-2.5 transition-all ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-muted/40" : ""} ${isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
        >
            <div className="text-center pb-3 border-b mb-3">
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                </p>
                <div className={`mt-1.5 flex h-8 w-8 items-center justify-center rounded-full mx-auto text-sm font-bold ${isToday ? "bg-primary text-white shadow-sm" : "text-foreground"}`}>
                    {dayNumber}
                </div>
            </div>

            <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5 min-h-[300px]">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <SortableJobCard
                                key={job.id}
                                job={job}
                                onClick={() => onClickJob(job)}
                            />
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                            <Inbox className="h-5 w-5 mb-1.5" />
                            <span className="text-[10px] uppercase font-bold tracking-tighter">No Jobs</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// Static Job Card for Drag Overlay
function JobCardStatic({ job }: { job: ScheduledJob }) {
    return (
        <div className={`rounded-md border-l-4 p-2.5 text-xs shadow-xl rotate-[2deg] scale-[1.05] w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${jobCardStyles[job.status]}`}>
            <p className="font-semibold truncate">{job.title}</p>
            <p className="text-muted-foreground truncate mt-0.5">{job.customerName}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{job.startTime} - {job.endTime}</span>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className={`text-2xl font-semibold mt-1.5 ${color || ''}`}>{value}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SchedulingPage() {
    const { openDrawer } = useDrawer();
    const [jobs, setJobs] = useState<ScheduledJob[]>(mockJobs);
    const [currentDate, setCurrentDate] = useState(new Date("2024-01-29"));
    const [view, setView] = useState<"week" | "day" | "month">("week");
    const [engineerFilter, setEngineerFilter] = useState<string>("all");

    const weekDates = getWeekDates(currentDate);

    // Group jobs by date
    const jobsByDate = useMemo(() => {
        return jobs.filter(job => {
            if (engineerFilter === "all") return true;
            return job.engineers.includes(engineerFilter);
        }).reduce<Record<string, ScheduledJob[]>>((acc, job) => {
            if (!acc[job.date]) acc[job.date] = [];
            acc[job.date].push(job);
            return acc;
        }, {});
    }, [jobs, engineerFilter]);

    const [isMounted, setIsMounted] = useState(false);
    const [activeJob, setActiveJob] = useState<ScheduledJob | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // DND Sensors
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    });
    const keyboardSensor = useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    });
    const sensors = useSensors(pointerSensor, keyboardSensor);

    // DND Handlers
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current?.type === "Job") {
            setActiveJob(active.data.current.job);
        }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAJob = active.data.current?.type === "Job";
        const isOverAJob = over.data.current?.type === "Job";
        const isOverADay = over.data.current?.type === "Day";

        if (!isActiveAJob) return;

        // Moving over another job
        if (isOverAJob) {
            setJobs((prevJobs) => {
                const activeIndex = prevJobs.findIndex(j => j.id === activeId);
                const overIndex = prevJobs.findIndex(j => j.id === overId);

                if (activeIndex === -1 || overIndex === -1) return prevJobs;

                if (prevJobs[activeIndex].date !== prevJobs[overIndex].date) {
                    const updatedJobs = [...prevJobs];
                    updatedJobs[activeIndex] = {
                        ...prevJobs[activeIndex],
                        date: prevJobs[overIndex].date,
                    };
                    return arrayMove(updatedJobs, activeIndex, overIndex);
                }

                if (activeIndex === overIndex) return prevJobs;
                return arrayMove(prevJobs, activeIndex, overIndex);
            });
        }

        // Moving over an empty day
        if (isOverADay) {
            setJobs((prevJobs) => {
                const activeIndex = prevJobs.findIndex(j => j.id === activeId);
                if (activeIndex === -1) return prevJobs;

                const newDate = overId as string;
                if (prevJobs[activeIndex].date === newDate) return prevJobs;

                const updatedJobs = [...prevJobs];
                updatedJobs[activeIndex] = {
                    ...prevJobs[activeIndex],
                    date: newDate,
                };
                return arrayMove(updatedJobs, activeIndex, activeIndex);
            });
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        setActiveJob(null);
    }, []);

    // Navigation
    const goToToday = () => setCurrentDate(new Date("2024-01-29"));
    const goToPrevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };
    const goToNextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    return (
        <>
            <Topbar title="Scheduling" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Today's Jobs" value={jobs.filter(j => j.date === "2024-01-29").length} icon={CalendarIcon} />
                    <StatCard title="This Week" value={jobs.length} icon={CalendarClock} />
                    <StatCard title="In Progress" value={jobs.filter(j => j.status === 'in_progress').length} icon={Clock} color="text-purple-600" />
                    <StatCard title="Active Engineers" value={allEngineers.length} icon={Users} color="text-green-600" />
                </div>

                {/* Controls */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={goToPrevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9" onClick={goToToday}>
                            Today
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={goToNextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="ml-3 text-base font-semibold">
                            {weekDates[0].toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-48">
                            <Users className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                                <SelectTrigger className="pl-9 h-9">
                                    <SelectValue placeholder="All Engineers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Engineers</SelectItem>
                                    {allEngineers.map((eng) => (
                                        <SelectItem key={eng} value={eng}>{eng}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex border rounded-md p-1 bg-background shadow-sm">
                            {(["day", "week", "month"] as const).map((v) => (
                                <Button
                                    key={v}
                                    variant={view === v ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setView(v)}
                                    className={`h-7 px-3 text-[11px] font-medium uppercase tracking-wider ${view === v ? 'bg-muted' : ''}`}
                                >
                                    {v}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                {view === "week" && isMounted ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-7 gap-3">
                            {weekDates.map((date) => {
                                const dateKey = formatDateKey(date);
                                const dayJobs = jobsByDate[dateKey] || [];
                                const today = isToday(date);

                                return (
                                    <DroppableDay
                                        key={dateKey}
                                        dateKey={dateKey}
                                        label={formatDayName(date)}
                                        dayNumber={date.getDate()}
                                        jobs={dayJobs}
                                        isToday={today}
                                        onClickJob={(job) => openDrawer(job.title, <JobDetailDrawer job={job} />, `Job ${job.id}`)}
                                    />
                                );
                            })}
                        </div>
                        <DragOverlay adjustScale={false} dropAnimation={{
                            duration: 250,
                            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: "0.5",
                                    },
                                },
                            }),
                        }}>
                            {activeJob ? (
                                <JobCardStatic job={activeJob} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : view === "week" ? (
                    <div className="grid grid-cols-7 gap-3">
                        {weekDates.map((date) => {
                            const dateKey = formatDateKey(date);
                            const dayJobs = jobsByDate[dateKey] || [];
                            const today = isToday(date);

                            return (
                                <div
                                    key={dateKey}
                                    className={`min-h-[450px] rounded-xl border bg-background/50 p-2.5 transition-all ${today ? "ring-2 ring-primary ring-offset-2 ring-offset-muted/40" : ""}`}
                                >
                                    <div className="text-center pb-3 border-b mb-3">
                                        <p className={`text-[11px] font-bold uppercase tracking-widest ${today ? "text-primary" : "text-muted-foreground"}`}>
                                            {formatDayName(date)}
                                        </p>
                                        <div className={`mt-1.5 flex h-8 w-8 items-center justify-center rounded-full mx-auto text-sm font-bold ${today ? "bg-primary text-white shadow-sm" : "text-foreground"}`}>
                                            {date.getDate()}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        {dayJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                className={`group relative rounded-md border-l-4 p-2.5 text-xs shadow-sm ${jobCardStyles[job.status]}`}
                                            >
                                                <p className="font-semibold truncate">{job.title}</p>
                                                <p className="text-muted-foreground truncate mt-0.5">{job.customerName}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="min-h-[500px] flex items-center justify-center bg-background/50 border-dashed">
                        <div className="text-center max-w-xs px-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto">
                                <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium">{view.charAt(0).toUpperCase() + view.slice(1)} View Coming Soon</h3>
                            <p className="mt-2 text-sm text-muted-foreground">We are working on this view. Please use the Week view for now.</p>
                        </div>
                    </Card>
                )}

                {/* Legend */}
                <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                        <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        <span>Completed</span>
                    </div>
                </div>
            </main>
        </>
    );
}
