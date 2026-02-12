"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
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
import leadsData from "@/mock-data/leads.json";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Plus,
    Search,
    Inbox,
    LayoutGrid,
    List,
    TrendingUp,
    Users as UsersIcon,
    DollarSign,
    Clock,
    Star,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Filter,
    Building2,
    User,
    FileText,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/context/auth-context";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton-loader";

// Types
type PipelineStage =
    | "new"
    | "contacted"
    | "follow_up"
    | "site_visit_booked"
    | "site_visit_completed"
    | "quote_sent"
    | "awaiting_response"
    | "negotiation"
    | "won"
    | "lost";

type Priority = "Normal" | "High" | "VIP/Big Deal";
type UrgencyStatus = "healthy" | "warning" | "overdue";

interface Lead {
    id: string;
    name: string;
    company: string;
    companyId?: string;
    contactId?: string;
    contactName?: string;
    email: string;
    phone: string;
    source: string;
    status: PipelineStage;
    owner: string;
    ownerId?: string;
    ownerColor?: string;
    value: number;
    priority: Priority;
    expectedCloseDate?: string;
    stageEnteredAt: string;
    createdAt: string;
    lastActivity: string;
}

// Pipeline Stages Configuration
const PIPELINE_STAGES: { value: PipelineStage; label: string }[] = [
    { value: "new", label: "New Lead" },
    { value: "contacted", label: "Contacted" },
    { value: "follow_up", label: "Follow-Up Scheduled" },
    { value: "site_visit_booked", label: "Site Visit Booked" },
    { value: "site_visit_completed", label: "Site Visit Completed" },
    { value: "quote_sent", label: "Quote Sent" },
    { value: "awaiting_response", label: "Awaiting Response" },
    { value: "negotiation", label: "In Negotiation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost/Rejected" },
];

const REJECTION_REASONS = [
    "Price Too High",
    "Competitor Won",
    "Timing/Delayed",
    "Client Changed Plans",
    "Other",
];

// Convert old statuses to new ones
const STATUS_MIGRATION: Record<string, PipelineStage> = {
    new: "new",
    contacted: "contacted",
    qualified: "follow_up",
    proposal: "quote_sent",
    negotiation: "negotiation",
    won: "won",
    lost: "lost",
};

// Mock Data
const mockBdmUsers = [
    { id: "BDM-001", name: "John Smith", color: "#3B82F6" },
    { id: "BDM-002", name: "Sarah Chen", color: "#10B981" },
    { id: "BDM-003", name: "Mike Johnson", color: "#F59E0B" },
    { id: "BDM-004", name: "Lisa Park", color: "#8B5CF6" },
];

const mockCompanies = [
    { id: "COMP-001", name: "Johnson Roofing LLC" },
    { id: "COMP-002", name: "Acme Construction" },
    { id: "COMP-003", name: "Premier Builders" },
    { id: "COMP-004", name: "Metro Properties" },
];

const mockContacts = [
    { id: "CON-001", name: "Sarah Chen", email: "sarah@johnson.com", companyId: "COMP-001" },
    { id: "CON-002", name: "Mike Davis", email: "mike@acme.com", companyId: "COMP-002" },
    { id: "CON-003", name: "Emily Watson", email: "emily@premier.com", companyId: "COMP-003" },
];

// Transform raw leads data
const transformLeads = (rawLeads: any[]): Lead[] => {
    return rawLeads.map((lead, index) => {
        const bdm = mockBdmUsers[index % mockBdmUsers.length];
        const priorities: Priority[] = ["Normal", "Normal", "High", "VIP/Big Deal"];
        const createdDate = new Date(lead.createdAt);
        const stageDate = new Date(createdDate);
        stageDate.setDate(stageDate.getDate() + Math.floor(Math.random() * 14));

        return {
            ...lead,
            status: STATUS_MIGRATION[lead.status] || "new",
            ownerId: bdm.id,
            ownerColor: bdm.color,
            priority: priorities[index % priorities.length],
            stageEnteredAt: stageDate.toISOString(),
            expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
    });
};

const initialLeads: Lead[] = transformLeads(leadsData as any[]);

const stageStyles: Record<string, string> = {
    new: STATUS_COLORS.pipeline.new,
    contacted: STATUS_COLORS.pipeline.contacted,
    follow_up: STATUS_COLORS.pipeline.follow_up,
    site_visit_booked: STATUS_COLORS.pipeline.site_visit_booked,
    site_visit_completed: STATUS_COLORS.pipeline.site_visit_completed,
    quote_sent: STATUS_COLORS.pipeline.quote_sent,
    awaiting_response: STATUS_COLORS.pipeline.awaiting_response,
    negotiation: STATUS_COLORS.pipeline.negotiation,
    won: STATUS_COLORS.pipeline.won,
    lost: STATUS_COLORS.pipeline.lost,
};

// Utility Functions
const getDaysInStage = (stageEnteredAt: string): number => {
    const entered = new Date(stageEnteredAt);
    const now = new Date();
    return Math.floor((now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
};

const getUrgencyStatus = (lead: Lead): UrgencyStatus => {
    const daysInStage = getDaysInStage(lead.stageEnteredAt);
    if (daysInStage > 14) return "overdue";
    if (daysInStage > 7) return "warning";
    return "healthy";
};

const urgencyColors: Record<UrgencyStatus, string> = {
    healthy: STATUS_COLORS.semantic.healthy,
    warning: STATUS_COLORS.semantic.warning,
    overdue: STATUS_COLORS.semantic.overdue,
};

// Multi-Step Create Lead Form
export function CreateLeadForm({ onClose }: { onClose?: () => void }) {
    const [step, setStep] = useState(1);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [newCompanyName, setNewCompanyName] = useState("");
    const [selectedContactId, setSelectedContactId] = useState("");
    const [newContactName, setNewContactName] = useState("");
    const [newContactEmail, setNewContactEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [leadName, setLeadName] = useState("");
    const [estimatedValue, setEstimatedValue] = useState("");
    const [leadSource, setLeadSource] = useState("");
    const [priority, setPriority] = useState<Priority>("Normal");
    const [expectedClose, setExpectedClose] = useState("");
    const [notes, setNotes] = useState("");

    const selectedCompany = mockCompanies.find(c => c.id === selectedCompanyId);
    const filteredContacts = mockContacts.filter(c => c.companyId === selectedCompanyId);

    const checkDuplicateEmail = () => {
        if (!newContactEmail.trim()) return;
        const existing = mockContacts.find(c => c.email.toLowerCase() === newContactEmail.toLowerCase());
        if (existing) {
            setEmailError(`A contact with this email already exists: ${existing.name}`);
        } else {
            setEmailError("");
        }
    };

    const getDefaultLeadName = () => {
        const company = selectedCompany?.name || newCompanyName;
        const contact = mockContacts.find(c => c.id === selectedContactId)?.name || newContactName;
        return `${company} - ${contact}`.trim().replace(/ - $/, "");
    };

    useEffect(() => {
        if (step === 3 && !leadName) {
            setLeadName(getDefaultLeadName());
        }
    }, [step]);

    const canProceedStep1 = selectedCompanyId || newCompanyName.trim();
    const canProceedStep2 = selectedContactId || (newContactName.trim() && newContactEmail.trim() && !emailError);
    const canSubmit = leadName.trim() && estimatedValue;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                            <Building2 className="h-4 w-4" />
                            Step 1: Select or Create Company
                        </div>
                        <div className="space-y-3">
                            <Label>Existing Company</Label>
                            <Select value={selectedCompanyId} onValueChange={(v) => { setSelectedCompanyId(v); setNewCompanyName(""); }}>
                                <SelectTrigger><SelectValue placeholder="Search companies..." /></SelectTrigger>
                                <SelectContent>
                                    {mockCompanies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative flex items-center gap-4 py-2">
                            <div className="flex-1 border-t" />
                            <span className="text-xs text-muted-foreground">OR</span>
                            <div className="flex-1 border-t" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Create New Company</Label>
                            <Input
                                placeholder="Enter company name..."
                                value={newCompanyName}
                                onChange={(e) => { setNewCompanyName(e.target.value); setSelectedCompanyId(""); }}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                            <User className="h-4 w-4" />
                            Step 2: Select or Create Contact
                        </div>
                        {filteredContacts.length > 0 && (
                            <div className="space-y-3">
                                <Label>Existing Contacts for {selectedCompany?.name || newCompanyName}</Label>
                                <Select value={selectedContactId} onValueChange={(v) => { setSelectedContactId(v); setNewContactName(""); setNewContactEmail(""); }}>
                                    <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
                                    <SelectContent>
                                        {filteredContacts.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {filteredContacts.length > 0 && (
                            <div className="relative flex items-center gap-4 py-2">
                                <div className="flex-1 border-t" />
                                <span className="text-xs text-muted-foreground">OR</span>
                                <div className="flex-1 border-t" />
                            </div>
                        )}
                        <div className="space-y-3">
                            <Label>Create New Contact</Label>
                            <Input
                                placeholder="Contact name"
                                value={newContactName}
                                onChange={(e) => { setNewContactName(e.target.value); setSelectedContactId(""); }}
                            />
                            <Input
                                type="email"
                                placeholder="Contact email"
                                value={newContactEmail}
                                onChange={(e) => { setNewContactEmail(e.target.value); setSelectedContactId(""); }}
                                onBlur={checkDuplicateEmail}
                            />
                            {emailError && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />{emailError}
                                </p>
                            )}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                            <FileText className="h-4 w-4" />
                            Step 3: Lead Details
                        </div>
                        <div className="space-y-1.5">
                            <Label>Lead Name <span className="text-destructive">*</span></Label>
                            <Input value={leadName} onChange={(e) => setLeadName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Estimated Value <span className="text-destructive">*</span></Label>
                                <Input type="number" placeholder="£0" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Lead Source</Label>
                                <Select value={leadSource} onValueChange={setLeadSource}>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Website">Website</SelectItem>
                                        <SelectItem value="Referral">Referral</SelectItem>
                                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="VIP/Big Deal">VIP/Big Deal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Expected Close</Label>
                                <Input type="date" value={expectedClose} onChange={(e) => setExpectedClose(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Textarea placeholder="Additional notes..." rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between px-2">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />}
                    </React.Fragment>
                ))}
            </div>

            {renderStep()}

            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => step === 1 ? onClose?.() : setStep(s => s - 1)}>
                    {step === 1 ? "Cancel" : <><ChevronLeft className="h-4 w-4 mr-1" />Back</>}
                </Button>
                {step < 3 ? (
                    <Button disabled={step === 1 ? !canProceedStep1 : !canProceedStep2} onClick={() => setStep(s => s + 1)}>
                        Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                ) : (
                    <Button disabled={!canSubmit} onClick={onClose}>
                        Create Lead
                    </Button>
                )}
            </div>
        </div>
    );
}

// Sortable Lead Card Component
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
        data: { type: "Lead", lead },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const daysInStage = getDaysInStage(lead.stageEnteredAt);
    const urgency = getUrgencyStatus(lead);
    const isVIP = lead.priority === "VIP/Big Deal";

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-4 bg-muted/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 h-[140px] mb-3"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => { window.location.href = `/leads/${lead.id}`; }}
            className="group p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing mb-3 block relative"
        >
            {/* VIP Badge */}
            {isVIP && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                    <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {/* Urgency Dot */}
                    <div className={`h-2.5 w-2.5 rounded-full ${urgencyColors[urgency]}`} />
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-slate-50 dark:bg-slate-800 border-none px-2 h-5">
                        {lead.id}
                    </Badge>
                </div>
                {/* BDM Colour Dot */}
                <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{ backgroundColor: lead.ownerColor || "#3B82F6" }}
                    title={lead.owner}
                >
                    {lead.owner.split(" ").map(n => n[0]).join("")}
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
                    {daysInStage} days
                </div>
            </div>
        </div>
    );
});

// Static Card for Drag Overlay
function LeadCardStatic({ lead }: { lead: Lead }) {
    const daysInStage = getDaysInStage(lead.stageEnteredAt);
    const urgency = getUrgencyStatus(lead);
    const isVIP = lead.priority === "VIP/Big Deal";

    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/20 shadow-xl rotate-[2deg] scale-[1.05] inline-block w-[280px] relative">
            {isVIP && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                    <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${urgencyColors[urgency]}`} />
                    <Badge variant="outline" className="text-[10px] font-black uppercase px-2 h-5">{lead.id}</Badge>
                </div>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: lead.ownerColor || "#3B82F6" }}>
                    {lead.owner.split(" ").map(n => n[0]).join("")}
                </div>
            </div>
            <h4 className="text-sm font-bold">{lead.name}</h4>
            <p className="text-[12px] text-muted-foreground mt-1 truncate">{lead.company}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-[12px] font-black">£{lead.value.toLocaleString()}</span>
                <div className="flex items-center text-[10px] font-bold text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />{daysInStage} days
                </div>
            </div>
        </div>
    );
}

// Droppable Kanban Column
function KanbanColumn({ id, title, leads, totalValue, formatCurrency }: { id: string; title: string; leads: Lead[]; totalValue: number; formatCurrency: (v: number) => string }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: "Column" },
    });

    const isTerminal = id === "won" || id === "lost";

    return (
        <div ref={setNodeRef} className={`flex-shrink-0 w-72 rounded-2xl transition-colors ${isOver ? "bg-primary/5" : ""}`}>
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground">{title}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black h-5">
                        {leads.length}
                    </Badge>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{formatCurrency(totalValue)}</span>
            </div>
            <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className={`space-y-1 min-h-[400px] max-h-[calc(100vh-320px)] overflow-y-auto rounded-2xl p-2.5 border border-dashed ${isTerminal ? "bg-muted/50 border-slate-300" : "bg-muted/30 border-slate-200 dark:border-slate-800"}`}>
                    {leads.length > 0 ? (
                        leads.map(lead => <SortableLeadCard key={lead.id} lead={lead} />)
                    ) : (
                        <EmptyState
                            title="No Leads"
                            description={`No leads in ${title}`}
                            className="py-8 bg-transparent border-none"
                        />
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// Metric Card
function MetricCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                        <p className="text-xl font-black mt-1">{value}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Main Page Content (wrapped in Suspense for useSearchParams)
function LeadsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openDrawer, closeDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const { role, user, canAccess } = useAuth();

    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchQuery, setSearchQuery] = useState("");
    const [bdmFilter, setBdmFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [viewToggle, setViewToggle] = useState<"my" | "all">(role === "BDM" ? "my" : "all");
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Won Conversion Dialog
    const [showWonDialog, setShowWonDialog] = useState(false);
    const [wonLead, setWonLead] = useState<Lead | null>(null);

    // Lost Rejection Modal
    const [showLostModal, setShowLostModal] = useState(false);
    const [lostLead, setLostLead] = useState<Lead | null>(null);
    const [lostPreviousStatus, setLostPreviousStatus] = useState<PipelineStage>("new");
    const [rejectionCategory, setRejectionCategory] = useState("");
    const [rejectionNotes, setRejectionNotes] = useState("");

    useEffect(() => { setIsMounted(true); }, []);

    // Filter leads
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            // Ownership filter for BDM
            if (role === "BDM" && viewToggle === "my") {
                // In mock data context, we assume the user is BDM-001
                if (lead.ownerId !== "BDM-001") return false;
            }

            const matchesSearch =
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBdm = bdmFilter === "all" || lead.ownerId === bdmFilter;
            const matchesPriority = priorityFilter === "all" || lead.priority === priorityFilter;
            return matchesSearch && matchesBdm && matchesPriority;
        });
    }, [leads, searchQuery, bdmFilter, priorityFilter, viewToggle, role]);

    // DND Sensors
    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
    const sensors = useSensors(pointerSensor, keyboardSensor);

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

        if (isActiveALead && isOverALead) {
            setLeads((prevLeads) => {
                const activeIndex = prevLeads.findIndex((l) => l.id === activeId);
                const overIndex = prevLeads.findIndex((l) => l.id === overId);
                if (activeIndex === -1 || overIndex === -1) return prevLeads;

                if (prevLeads[activeIndex].status !== prevLeads[overIndex].status) {
                    const updatedLeads = [...prevLeads];
                    updatedLeads[activeIndex] = { ...prevLeads[activeIndex], status: prevLeads[overIndex].status };
                    return arrayMove(updatedLeads, activeIndex, overIndex);
                }

                if (activeIndex === overIndex) return prevLeads;
                return arrayMove(prevLeads, activeIndex, overIndex);
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveALead && isOverAColumn) {
            const newStatus = overId as PipelineStage;

            // Don't update immediately for terminal stages - wait for dialog
            if (newStatus !== "won" && newStatus !== "lost") {
                setLeads((prevLeads) => {
                    const activeIndex = prevLeads.findIndex((l) => l.id === activeId);
                    if (activeIndex === -1) return prevLeads;
                    if (prevLeads[activeIndex].status === newStatus) return prevLeads;

                    const updatedLeads = [...prevLeads];
                    updatedLeads[activeIndex] = { ...prevLeads[activeIndex], status: newStatus, stageEnteredAt: new Date().toISOString() };
                    return updatedLeads;
                });
            }
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveLead(null);

        if (!over) return;

        const overId = over.id;
        const isOverAColumn = over.data.current?.type === "Column";
        const lead = active.data.current?.lead as Lead;

        if (!lead || !isOverAColumn) return;

        const newStatus = overId as PipelineStage;
        if (lead.status === newStatus) return;

        // Handle Won
        if (newStatus === "won") {
            setWonLead(lead);
            setShowWonDialog(true);
            return;
        }

        // Handle Lost
        if (newStatus === "lost") {
            setLostLead(lead);
            setLostPreviousStatus(lead.status);
            setRejectionCategory("");
            setRejectionNotes("");
            setShowLostModal(true);
            return;
        }
    }, []);

    const confirmWonConversion = () => {
        if (!wonLead) return;
        setLeads(prev => prev.map(l => l.id === wonLead.id ? { ...l, status: "won" as PipelineStage, stageEnteredAt: new Date().toISOString() } : l));
        setShowWonDialog(false);
        setWonLead(null);
        // Redirect to accounts page (simulated)
        router.push(`/accounts/COMP-001?converted=true`);
    };

    const cancelWonConversion = () => {
        setShowWonDialog(false);
        setWonLead(null);
    };

    const confirmLostRejection = () => {
        if (!lostLead || !rejectionCategory) return;
        setLeads(prev => prev.map(l => l.id === lostLead.id ? { ...l, status: "lost" as PipelineStage, stageEnteredAt: new Date().toISOString() } : l));
        setShowLostModal(false);
        setLostLead(null);
        setRejectionCategory("");
        setRejectionNotes("");
    };

    const cancelLostRejection = () => {
        // Return lead to previous column
        setShowLostModal(false);
        setLostLead(null);
        setRejectionCategory("");
        setRejectionNotes("");
    };

    const handleCreateLead = () => {
        if (!canAccess("create_lead")) return;
        openDrawer({
            title: "Create New Lead",
            content: <CreateLeadForm onClose={closeDrawer} />,
            description: "Add a new lead to your pipeline"
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(value);
    };

    // Calculate metrics
    const totalPipelineValue = filteredLeads.filter(l => l.status !== "won" && l.status !== "lost").reduce((sum, l) => sum + l.value, 0);
    const activeLeadsCount = filteredLeads.filter(l => l.status !== "won" && l.status !== "lost").length;
    const wonValue = filteredLeads.filter(l => l.status === "won").reduce((sum, l) => sum + l.value, 0);
    const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === "won").length / leads.length) * 100) : 0;

    if (!isMounted) return null;

    return (
        <>
            <Topbar title="Leads Pipeline" subtitle="Manage and track sales opportunities" />
            <main className="flex-1 overflow-hidden bg-muted/20 p-6">
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard title="Pipeline Value" value={formatCurrency(totalPipelineValue)} icon={DollarSign} />
                    <MetricCard title="Active Leads" value={activeLeadsCount.toString()} icon={UsersIcon} />
                    <MetricCard title="Won Value" value={formatCurrency(wonValue)} icon={TrendingUp} />
                    <MetricCard title="Conversion Rate" value={`${conversionRate}%`} icon={LayoutGrid} />
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={bdmFilter} onValueChange={setBdmFilter}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="BDM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All BDMs</SelectItem>
                                {mockBdmUsers.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="VIP/Big Deal">VIP/Big Deal</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center rounded-lg border bg-muted/30 p-1">
                            <Button
                                variant={viewToggle === "my" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => setViewToggle("my")}
                            >
                                My Leads
                            </Button>
                            <Button
                                variant={viewToggle === "all" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => setViewToggle("all")}
                            >
                                All Leads
                            </Button>
                        </div>
                    </div>
                    {canAccess("create_lead") && (
                        <Button
                            onClick={handleCreateLead}
                            size="sm"
                            className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95 sm:w-auto w-full"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            New Lead
                        </Button>
                    )}
                </div>

                {/* Kanban Board */}
                <div className="overflow-x-auto -mx-6 px-6 pb-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-4" style={{ minWidth: `${PIPELINE_STAGES.length * 300}px` }}>
                            {PIPELINE_STAGES.map(stage => {
                                const stageLeads = filteredLeads.filter(l => l.status === stage.value);
                                const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
                                return (
                                    <KanbanColumn
                                        key={stage.value}
                                        id={stage.value}
                                        title={stage.label}
                                        leads={stageLeads}
                                        totalValue={stageValue}
                                        formatCurrency={formatCurrency}
                                    />
                                );
                            })}
                        </div>
                        <DragOverlay>
                            {activeLead && <LeadCardStatic lead={activeLead} />}
                        </DragOverlay>
                    </DndContext>
                </div>
            </main>

            {/* Won Conversion Dialog */}
            <AlertDialog open={showWonDialog} onOpenChange={setShowWonDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>🎉 Convert Lead to Account</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>Convert this lead to an active account?</p>
                            {wonLead && (
                                <div className="bg-muted/50 rounded-lg p-3 mt-3 text-sm">
                                    <p className="font-medium text-foreground">{wonLead.name}</p>
                                    <p className="text-muted-foreground">{wonLead.company}</p>
                                    <p className="font-bold text-primary mt-2">{formatCurrency(wonLead.value)}</p>
                                </div>
                            )}
                            <div className="space-y-4 pt-2 border-t mt-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Title</Label>
                                    <Input defaultValue={wonLead?.name} className="h-9 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Site Name</Label>
                                    <Input placeholder="e.g., Main Office, Phase 1" className="h-9 text-sm" />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelWonConversion}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmWonConversion}>Convert to Account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Lost Rejection Modal (Blocking) */}
            <Dialog open={showLostModal} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Rejection Reason Required</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for marking this lead as lost.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {lostLead && (
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <p className="font-medium text-foreground">{lostLead.name}</p>
                                <p className="text-muted-foreground">{lostLead.company}</p>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label>Rejection Category <span className="text-destructive">*</span></Label>
                            <Select value={rejectionCategory} onValueChange={setRejectionCategory}>
                                <SelectTrigger className={!rejectionCategory ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select a reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {REJECTION_REASONS.map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!rejectionCategory && (
                                <p className="text-xs text-destructive">A rejection category is required</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                placeholder="Additional details..."
                                value={rejectionNotes}
                                onChange={(e) => setRejectionNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelLostRejection}>Cancel</Button>
                        <Button onClick={confirmLostRejection} disabled={!rejectionCategory}>
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function LeadsPage() {
    return (
        <PermissionGuard permission="/leads">
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                        <LayoutGrid className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading pipeline...</p>
                    </div>
                </div>
            }>
                <LeadsPageContent />
            </Suspense>
        </PermissionGuard>
    );
}
