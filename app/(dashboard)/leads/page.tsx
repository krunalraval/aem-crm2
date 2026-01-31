"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
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

import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Plus,
    Search,
    FileText,
    Inbox,
    LayoutGrid,
    List,
    TrendingUp,
    Users as UsersIcon,
    DollarSign,
    ArrowUpRight,
    Clock,
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

// Mock Data
const initialLeads: Lead[] = [
    { id: "L-001", name: "Mike Thompson", company: "Johnson Roofing LLC", email: "mike@johnsonroofing.com", phone: "07555 123 456", source: "Website", status: "qualified", owner: "John Smith", value: 45000, lastActivity: "2024-01-30", createdAt: "2024-01-15" },
    { id: "L-002", name: "Sarah Chen", company: "Acme Construction", email: "sarah@acme.com", phone: "07555 234 567", source: "Referral", status: "contacted", owner: "Jane Wilson", value: 120000, lastActivity: "2024-01-29", createdAt: "2024-01-14" },
    { id: "L-003", name: "Tom Williams", company: "Premier Builders", email: "tom@premierbuilders.com", phone: "07555 345 678", source: "Trade Show", status: "new", owner: "John Smith", value: 78000, lastActivity: "2024-01-28", createdAt: "2024-01-12" },
    { id: "L-004", name: "Emma Rodriguez", company: "Smith Residence", email: "emma.r@email.com", phone: "07555 456 789", source: "Cold Call", status: "proposal", owner: "Mike Johnson", value: 32000, lastActivity: "2024-01-27", createdAt: "2024-01-10" },
    { id: "L-005", name: "James Wilson", company: "Downtown Office Complex", email: "jwilson@downtownoffice.com", phone: "07555 567 890", source: "Website", status: "negotiation", owner: "Jane Wilson", value: 250000, lastActivity: "2024-01-26", createdAt: "2024-01-08" },
    { id: "L-006", name: "Lisa Park", company: "Greenfield Estates", email: "lisa@greenfield.com", phone: "07555 678 901", source: "Referral", status: "won", owner: "John Smith", value: 185000, lastActivity: "2024-01-25", createdAt: "2024-01-05" },
    { id: "L-007", name: "David Brown", company: "Metro Apartments", email: "dbrown@metro.com", phone: "07555 789 012", source: "Website", status: "lost", owner: "Mike Johnson", value: 95000, lastActivity: "2024-01-24", createdAt: "2024-01-03" },
    { id: "L-008", name: "Rachel Green", company: "Sunrise Commercial", email: "rgreen@sunrise.com", phone: "07555 890 123", source: "Trade Show", status: "new", owner: "Jane Wilson", value: 67000, lastActivity: "2024-01-30", createdAt: "2024-01-29" },
];

const mockUsers = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Wilson" },
    { id: "3", name: "Mike Johnson" },
];

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
];

const sourceOptions = [
    { value: "Website", label: "Website" },
    { value: "Referral", label: "Referral" },
    { value: "Cold Call", label: "Cold Call" },
    { value: "Trade Show", label: "Trade Show" },
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

// Empty State Component
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No leads found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">
                No leads match your current filters. Try adjusting your search or create a new lead.
            </p>
        </div>
    );
}

// Create Lead Form Component
function CreateLeadForm() {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="leadName">Lead Name <span className="text-destructive">*</span></Label>
                <Input id="leadName" placeholder="Enter lead name" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
                <Input id="company" placeholder="Enter company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="07XXX XXX XXX" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Source</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select defaultValue="new">
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.filter(s => s.value !== "all").map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Owner</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Assign owner" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button variant="ghost" className="font-bold text-xs">Cancel</Button>
                <Button className="font-bold text-xs px-6">Create Lead Record</Button>
            </div>
        </div>
    );
}

// Add Note Form Component
function AddNoteForm({ leadName }: { leadName: string }) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Adding note for <strong>{leadName}</strong></p>
            <div className="space-y-1.5">
                <Label htmlFor="note">Note</Label>
                <textarea
                    id="note"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Enter your note..."
                />
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, trend, trendValue }: { title: string; value: string; icon: any; trend: "up" | "down"; trendValue: string }) {
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
            <CardContent className="p-5">
                <div className="flex items-center justify-between space-y-0">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                    <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <h2 className="text-2xl font-black tracking-tight">{value}</h2>
                    <span className={`flex items-center text-[10px] font-black ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        <ArrowUpRight className={`mr-0.5 h-3 w-3 ${trend === "down" ? "rotate-90" : ""}`} />
                        {trendValue}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// Sortable Kanban Card Component - Memoized for performance
const SortableLeadCard = React.memo(({ lead }: { lead: Lead }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: "Lead",
            lead,
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
                className="p-4 bg-muted/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 h-[120px] mb-3"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => {
                window.location.href = `/leads/${lead.id}`;
            }}
            className="group p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing mb-3 block"
        >
            <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-slate-50 dark:bg-slate-800 border-none px-2 h-5">
                    {lead.id}
                </Badge>
                <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black">
                        {lead.owner.split(" ").map(n => n[0]).join("")}
                    </div>
                </div>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{lead.name}</h4>
            <p className="text-[12px] text-muted-foreground mt-1 truncate">{lead.company}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[12px] font-black text-foreground">
                    £{lead.value.toLocaleString()}
                </span>
                <div className="flex items-center text-[10px] font-bold text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(lead.lastActivity).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
            </div>
        </div>
    );
});

// Droppable Kanban Column Component
function KanbanColumn({ id, title, leads, totalValue, formatCurrency }: { id: string, title: string, leads: Lead[], totalValue: number, formatCurrency: (v: number) => string }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: "Column",
        },
    });

    return (
        <div ref={setNodeRef} className={`flex-shrink-0 w-80 rounded-2xl transition-colors ${isOver ? "bg-primary/5" : ""}`}>
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground">{title}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black h-5">
                        {leads.length}
                    </Badge>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">{formatCurrency(totalValue)}</span>
            </div>
            <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1 min-h-[500px] rounded-2xl bg-muted/30 p-3 border border-dashed border-slate-200 dark:border-slate-800">
                    {leads.length > 0 ? (
                        leads.map(lead => <SortableLeadCard key={lead.id} lead={lead} />)
                    ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                            <Inbox className="h-5 w-5 opacity-20" />
                            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">No Leads</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// Static Card for Drag Overlay
function LeadCardStatic({ lead }: { lead: Lead }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/20 shadow-xl rotate-[2deg] scale-[1.05] inline-block w-[304px]">
            <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-slate-50 dark:bg-slate-800 border-none px-2 h-5">
                    {lead.id}
                </Badge>
                <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black">
                        {lead.owner.split(" ").map(n => n[0]).join("")}
                    </div>
                </div>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{lead.name}</h4>
            <p className="text-[12px] text-muted-foreground mt-1 truncate">{lead.company}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[12px] font-black text-foreground">
                    £{lead.value.toLocaleString()}
                </span>
                <div className="flex items-center text-[10px] font-bold text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(lead.lastActivity).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
            </div>
        </div>
    );
}

export default function LeadsPage() {
    const { openDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "pipeline">("pipeline");
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter leads
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesSearch =
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [leads, searchQuery, statusFilter]);

    // Pipeline Groups - Memoized
    const pipelineStages = useMemo(() => statusOptions.filter(s => s.value !== "all"), []);

    // DND Sensors - Memoized to prevent re-render loops
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    });
    const keyboardSensor = useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    });
    const sensors = useSensors(pointerSensor, keyboardSensor);

    // DND Handlers - Wrapped in useCallback for maximum stability
    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === "Lead") {
            setActiveLead(event.active.data.current.lead);
        }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveALead = active.data.current?.type === "Lead";
        const isOverALead = over.data.current?.type === "Lead";

        if (!isActiveALead) return;

        // Implements dragging over another lead in a different column
        if (isActiveALead && isOverALead) {
            setLeads((prevLeads) => {
                const activeIndex = prevLeads.findIndex((l) => l.id === activeId);
                const overIndex = prevLeads.findIndex((l) => l.id === overId);

                if (activeIndex === -1 || overIndex === -1) return prevLeads;

                if (prevLeads[activeIndex].status !== prevLeads[overIndex].status) {
                    const updatedLeads = [...prevLeads];
                    updatedLeads[activeIndex] = {
                        ...prevLeads[activeIndex],
                        status: prevLeads[overIndex].status,
                    };
                    return arrayMove(updatedLeads, activeIndex, overIndex);
                }

                if (activeIndex === overIndex) return prevLeads;
                return arrayMove(prevLeads, activeIndex, overIndex);
            });
        }

        // Implements dragging over an empty column
        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveALead && isOverAColumn) {
            setLeads((prevLeads) => {
                const activeIndex = prevLeads.findIndex((l) => l.id === activeId);
                if (activeIndex === -1) return prevLeads;

                // Use the column ID (over.id) as the new status
                const newStatus = overId as string;

                if (prevLeads[activeIndex].status === newStatus) return prevLeads;

                const updatedLeads = [...prevLeads];
                updatedLeads[activeIndex] = {
                    ...prevLeads[activeIndex],
                    status: newStatus,
                };

                // When moving to an empty column, we don't necessarily need to move the array index,
                // but we keep the current index or move it to the end?
                // arrayMove(updatedLeads, activeIndex, activeIndex) is a no-op but it returns a copy
                return arrayMove(updatedLeads, activeIndex, activeIndex);
            });
        }
    }, [pipelineStages]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveLead(null);
    }, []);

    // Handlers
    const handleCreateLead = () => {
        openDrawer("Create New Lead", <CreateLeadForm />, "Add a new lead to your pipeline");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <>
            <Topbar title="Lead Management" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <MetricCard title="Total Pipeline" value="£840,500" icon={TrendingUp} trend="up" trendValue="12.5%" />
                    <MetricCard title="Qualified Leads" value="124" icon={UsersIcon} trend="up" trendValue="8%" />
                    <MetricCard title="Avg. Deal Size" value="£6,800" icon={DollarSign} trend="down" trendValue="2.1%" />
                    <MetricCard title="Active Quotes" value="48" icon={FileText} trend="up" trendValue="14.2%" />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search pipeline..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none ring-0">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs font-bold uppercase tracking-wider">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-muted/30 p-1 rounded-xl mr-2">
                            <Button
                                variant={viewMode === "pipeline" ? "secondary" : "ghost"}
                                size="sm"
                                className={`h-7 px-3 rounded-lg text-[11px] font-black uppercase tracking-widest ${viewMode === "pipeline" ? "bg-white shadow-sm" : ""}`}
                                onClick={() => setViewMode("pipeline")}
                            >
                                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                                Pipeline
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="sm"
                                className={`h-7 px-3 rounded-lg text-[11px] font-black uppercase tracking-widest ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                                onClick={() => setViewMode("list")}
                            >
                                <List className="mr-1.5 h-3.5 w-3.5" />
                                Table
                            </Button>
                        </div>
                        <Button onClick={handleCreateLead} size="sm" className="h-9 px-4 font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90">
                            <Plus className="mr-1.5 h-4 w-4" />
                            New Lead
                        </Button>
                    </div>
                </div>

                {/* Pipeline View (Kanban) */}
                {viewMode === "pipeline" && isMounted && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                            {pipelineStages.map((stage) => {
                                const stageLeads = leads.filter(l => l.status === stage.value);
                                const totalStageValue = stageLeads.reduce((acc, current) => acc + current.value, 0);

                                return (
                                    <KanbanColumn
                                        key={stage.value}
                                        id={stage.value}
                                        title={stage.label}
                                        leads={stageLeads}
                                        totalValue={totalStageValue}
                                        formatCurrency={formatCurrency}
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
                            {activeLead ? (
                                <LeadCardStatic lead={activeLead} />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}

                {/* List View (Table) */}
                {viewMode === "list" && (
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            {filteredLeads.length > 0 ? (
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="text-[11px] font-black uppercase tracking-widest py-4 bg-transparent pl-6">Client / Prospect</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase tracking-widest py-4 bg-transparent">Organization</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase tracking-widest py-4 bg-transparent hidden md:table-cell text-center">Engagement Source</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase tracking-widest py-4 bg-transparent">Lifecycle Status</TableHead>
                                            <TableHead className="text-[11px] font-black uppercase tracking-widest py-4 bg-transparent text-right hidden sm:table-cell pr-6">Estimated Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLeads.map((lead) => (
                                            <TableRow key={lead.id} className="group border-slate-50 dark:border-slate-800 hover:bg-primary/[0.02] cursor-pointer" onClick={() => (window.location.href = `/leads/${lead.id}`)}>
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center text-[11px] font-black text-primary">
                                                            {lead.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm tracking-tight">{lead.name}</div>
                                                            <div className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter mt-0.5">{lead.id}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{lead.company}</TableCell>
                                                <TableCell className="text-center hidden md:table-cell">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 border-none h-6">
                                                        {lead.source}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${statusStyles[lead.status]} border-none font-black text-[10px] uppercase tracking-widest h-6 px-3`}>
                                                        {lead.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-right font-black pr-6">
                                                    {formatCurrency(lead.value)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-20">
                                    <EmptyState />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </>
    );
}
