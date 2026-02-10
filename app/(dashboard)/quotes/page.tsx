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
    DragEndEvent,
    useDroppable,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
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
    FileText,
    Inbox,
    LayoutGrid,
    List,
    Building2,
    Star,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Send,
    Eye,
    ChevronRight,
    ChevronLeft,
    User,
    RefreshCw,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/context/auth-context";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Types
type QuoteStatus = "draft" | "sent" | "awaiting_signature" | "awaiting_response" | "in_negotiation" | "revised" | "accepted" | "rejected" | "expired";

interface Quote {
    id: string;
    reference: string;
    companyName: string;
    companyId: string;
    contactName: string;
    contactId: string;
    leadId?: string;
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
    isBigDeal: boolean;
    notes?: string;
    followUpDate?: string;
    createdAt: string;
    sentAt?: string;
    expiresAt: string;
    rejectionReason?: string;
    rejectionNotes?: string;
}

// Constants
const TODAY = new Date().toISOString().split("T")[0];

const PIPELINE_STAGES: { value: QuoteStatus; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "awaiting_signature", label: "Awaiting Signature" },
    { value: "awaiting_response", label: "Awaiting Response" },
    { value: "in_negotiation", label: "In Negotiation" },
    { value: "revised", label: "Revised" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
];

const stageStyles: Record<QuoteStatus, string> = {
    draft: STATUS_COLORS.quote.draft,
    sent: STATUS_COLORS.quote.sent,
    awaiting_signature: "bg-indigo-100 text-indigo-700",
    awaiting_response: STATUS_COLORS.pipeline.awaiting_response,
    in_negotiation: STATUS_COLORS.pipeline.negotiation,
    revised: STATUS_COLORS.pipeline.follow_up,
    accepted: STATUS_COLORS.quote.accepted,
    rejected: STATUS_COLORS.quote.rejected,
    expired: STATUS_COLORS.quote.expired,
};

const rejectionReasons = [
    { value: "price_too_high", label: "Price Too High" },
    { value: "competitor_won", label: "Competitor Won" },
    { value: "project_cancelled", label: "Project Cancelled" },
    { value: "budget_constraints", label: "Budget Constraints" },
    { value: "timing_not_right", label: "Timing Not Right" },
    { value: "other", label: "Other" },
];

const quoteTemplates = [
    { id: "TPL-001", name: "8-Camera Hardwired System", systemType: "CCTV - Hardwired", defaultRate: 450, defaultUnits: 8 },
    { id: "TPL-002", name: "Wireless Tower System", systemType: "CCTV - Wireless", defaultRate: 650, defaultUnits: 4 },
    { id: "TPL-003", name: "Access Control Package", systemType: "Access Control", defaultRate: 350, defaultUnits: 2 },
    { id: "TPL-004", name: "Service Visit", systemType: "Service", defaultRate: 150, defaultUnits: 1 },
    { id: "TPL-005", name: "Security Audit", systemType: "Consultation", defaultRate: 500, defaultUnits: 1 },
];

const mockCompanies = [
    { id: "COMP-001", name: "Johnson Roofing LLC" },
    { id: "COMP-002", name: "Acme Construction" },
    { id: "COMP-003", name: "Premier Builders" },
];

const mockContacts: Record<string, { id: string; name: string; email: string }[]> = {
    "COMP-001": [{ id: "CON-001", name: "Mike Thompson", email: "mike@johnsonroofing.com" }],
    "COMP-002": [{ id: "CON-002", name: "Sarah Chen", email: "sarah@acme.com" }],
    "COMP-003": [{ id: "CON-003", name: "Tom Williams", email: "tom@premier.com" }],
};

const mockBDMs = [
    { id: "BDM-001", name: "John Smith", color: "#3B82F6" },
    { id: "BDM-002", name: "Sarah Chen", color: "#10B981" },
    { id: "BDM-003", name: "Mike Johnson", color: "#F59E0B" },
];

// Mock Quotes Data
const initialQuotes: Quote[] = [
    { id: "Q-001", reference: "K2S-Q-0001", companyName: "Johnson Roofing LLC", companyId: "COMP-001", contactName: "Mike Thompson", contactId: "CON-001", bdmName: "John Smith", bdmColor: "#3B82F6", systemType: "CCTV - Hardwired", units: 8, billingTerms: "Monthly", rate: 450, duration: 12, durationUnit: "Months", totalValue: 5400, status: "draft", version: 1, isBigDeal: false, createdAt: "2024-01-28", expiresAt: "2024-02-28" },
    { id: "Q-002", reference: "K2S-Q-0002", companyName: "Acme Construction", companyId: "COMP-002", contactName: "Sarah Chen", contactId: "CON-002", bdmName: "Sarah Chen", bdmColor: "#10B981", systemType: "Access Control", units: 4, billingTerms: "Monthly", rate: 650, duration: 24, durationUnit: "Months", totalValue: 15600, status: "sent", version: 1, isBigDeal: true, sentAt: "2024-01-25", createdAt: "2024-01-20", expiresAt: "2024-02-25" },
    { id: "Q-003", reference: "K2S-Q-0003", companyName: "Premier Builders", companyId: "COMP-003", contactName: "Tom Williams", contactId: "CON-003", bdmName: "Mike Johnson", bdmColor: "#F59E0B", systemType: "CCTV - Wireless", units: 6, billingTerms: "Monthly", rate: 550, duration: 18, durationUnit: "Months", totalValue: 9900, status: "awaiting_signature", version: 1, isBigDeal: false, sentAt: "2024-01-18", createdAt: "2024-01-15", expiresAt: "2024-02-18" },
    { id: "Q-004", reference: "K2S-Q-0004", companyName: "Johnson Roofing LLC", companyId: "COMP-001", contactName: "Mike Thompson", contactId: "CON-001", bdmName: "John Smith", bdmColor: "#3B82F6", systemType: "Service", units: 1, billingTerms: "One-Off", rate: 250, duration: 1, durationUnit: "Months", totalValue: 250, status: "in_negotiation", version: 2, isBigDeal: false, sentAt: "2024-01-22", createdAt: "2024-01-20", expiresAt: "2024-02-22" },
    { id: "Q-005", reference: "K2S-Q-0005", companyName: "Acme Construction", companyId: "COMP-002", contactName: "Sarah Chen", contactId: "CON-002", bdmName: "Sarah Chen", bdmColor: "#10B981", systemType: "CCTV - Hardwired", units: 16, billingTerms: "Monthly", rate: 850, duration: 36, durationUnit: "Months", totalValue: 30600, status: "accepted", version: 1, isBigDeal: true, sentAt: "2024-01-10", createdAt: "2024-01-05", expiresAt: "2024-02-10" },
    { id: "Q-006", reference: "K2S-Q-0006", companyName: "Premier Builders", companyId: "COMP-003", contactName: "Tom Williams", contactId: "CON-003", bdmName: "Mike Johnson", bdmColor: "#F59E0B", systemType: "Access Control", units: 2, billingTerms: "Monthly", rate: 300, duration: 12, durationUnit: "Months", totalValue: 3600, status: "rejected", version: 1, isBigDeal: false, rejectionReason: "price_too_high", sentAt: "2024-01-08", createdAt: "2024-01-02", expiresAt: "2024-02-08" },
    { id: "Q-007", reference: "K2S-Q-0007", companyName: "Johnson Roofing LLC", companyId: "COMP-001", contactName: "Mike Thompson", contactId: "CON-001", bdmName: "John Smith", bdmColor: "#3B82F6", systemType: "Consultation", units: 1, billingTerms: "One-Off", rate: 500, duration: 1, durationUnit: "Months", totalValue: 500, status: "expired", version: 1, isBigDeal: false, sentAt: "2024-01-01", createdAt: "2023-12-28", expiresAt: "2024-01-15" },
];

// Helpers
const formatCurrency = (value: number) => `£${value.toLocaleString()}`;
const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const getDaysSinceSent = (sentAt?: string): number | null => {
    if (!sentAt) return null;
    const sent = new Date(sentAt);
    const today = new Date(TODAY);
    return Math.floor((today.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryWarning = (expiresAt: string, status: QuoteStatus): "expired" | "warning" | null => {
    if (status === "accepted" || status === "rejected" || status === "expired") return null;
    const expiry = new Date(expiresAt);
    const today = new Date(TODAY);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 5) return "warning";
    return null;
};

// Create Quote Form Component (Multi-step)
function CreateQuoteForm({ onClose, onSave }: { onClose?: () => void; onSave?: (quote: Partial<Quote>) => void }) {
    const [step, setStep] = useState(1);
    const [templateId, setTemplateId] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [contactId, setContactId] = useState("");
    const [systemType, setSystemType] = useState("");
    const [units, setUnits] = useState(1);
    const [billingTerms, setBillingTerms] = useState("Monthly");
    const [rate, setRate] = useState(0);
    const [duration, setDuration] = useState(12);
    const [durationUnit, setDurationUnit] = useState("Months");
    const [notes, setNotes] = useState("");
    const [additionalEmails, setAdditionalEmails] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");

    const selectedTemplate = quoteTemplates.find(t => t.id === templateId);
    const selectedCompany = mockCompanies.find(c => c.id === companyId);
    const contacts = companyId ? mockContacts[companyId] || [] : [];
    const selectedContact = contacts.find(c => c.id === contactId);

    const totalValue = useMemo(() => {
        if (billingTerms === "One-Off") return rate;
        return rate * duration;
    }, [rate, duration, billingTerms]);

    useEffect(() => {
        if (selectedTemplate) {
            setSystemType(selectedTemplate.systemType);
            setRate(selectedTemplate.defaultRate);
            setUnits(selectedTemplate.defaultUnits);
        }
    }, [selectedTemplate]);

    const canProceed = () => {
        switch (step) {
            case 1: return !!templateId;
            case 2: return !!companyId && !!contactId;
            case 3: return !!systemType && rate > 0;
            case 4: return true;
            default: return false;
        }
    };

    const handleSend = () => {
        const newRef = `K2S-Q-${String(Date.now()).slice(-4)}`;
        onSave?.({
            reference: newRef,
            companyName: selectedCompany?.name || "",
            companyId,
            contactName: selectedContact?.name || "",
            contactId,
            systemType,
            units,
            billingTerms,
            rate,
            duration,
            durationUnit,
            totalValue,
            notes,
            followUpDate: followUpDate || undefined,
            status: "sent",
            version: 1,
            isBigDeal: totalValue >= 10000,
            bdmName: mockBDMs[0].name,
            bdmColor: mockBDMs[0].color,
            createdAt: TODAY,
            sentAt: TODAY,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        });
        toast.success(`Quote ${newRef} sent to ${selectedContact?.name} at ${selectedContact?.email}`);
        onClose?.();
    };

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                            {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                        </div>
                        {s < 5 && <div className={`w-8 h-1 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Template */}
            {step === 1 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Step 1: Select Template</h3>
                    <div className="space-y-2">
                        {quoteTemplates.map(t => (
                            <div
                                key={t.id}
                                onClick={() => setTemplateId(t.id)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${templateId === t.id ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.systemType}</p>
                                    </div>
                                    <span className="text-sm font-bold">{formatCurrency(t.defaultRate)}/mo</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Customer */}
            {step === 2 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Step 2: Select Customer</h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Company <span className="text-destructive">*</span></Label>
                            <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setContactId(""); }}>
                                <SelectTrigger><SelectValue placeholder="Select company..." /></SelectTrigger>
                                <SelectContent>
                                    {mockCompanies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Contact <span className="text-destructive">*</span></Label>
                            <Select value={contactId} onValueChange={setContactId} disabled={!companyId}>
                                <SelectTrigger><SelectValue placeholder={companyId ? "Select contact..." : "Select company first"} /></SelectTrigger>
                                <SelectContent>
                                    {contacts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Step 3: Quote Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>System Type</Label>
                            <Select value={systemType} onValueChange={setSystemType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CCTV - Hardwired">CCTV - Hardwired</SelectItem>
                                    <SelectItem value="CCTV - Wireless">CCTV - Wireless</SelectItem>
                                    <SelectItem value="Access Control">Access Control</SelectItem>
                                    <SelectItem value="Service">Service</SelectItem>
                                    <SelectItem value="Consultation">Consultation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Number of Units</Label>
                            <Input type="number" value={units} onChange={(e) => setUnits(parseInt(e.target.value) || 0)} min={1} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Billing Terms</Label>
                            <Select value={billingTerms} onValueChange={setBillingTerms}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                    <SelectItem value="Fortnightly">Fortnightly</SelectItem>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="One-Off">One-Off</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Rate ({billingTerms === "One-Off" ? "Total" : `per ${billingTerms.toLowerCase().replace("ly", "")}`})</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                                <Input type="number" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)} className="pl-7" />
                            </div>
                        </div>
                    </div>
                    {billingTerms !== "One-Off" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Contract Duration</Label>
                                <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 0)} min={1} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Duration Unit</Label>
                                <Select value={durationUnit} onValueChange={setDurationUnit}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Weeks">Weeks</SelectItem>
                                        <SelectItem value="Months">Months</SelectItem>
                                        <SelectItem value="Years">Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-black text-primary">{formatCurrency(totalValue)}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Special Terms / Notes</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Included in PDF..." rows={2} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Additional Email Recipients (CC)</Label>
                        <Input value={additionalEmails} onChange={(e) => setAdditionalEmails(e.target.value)} placeholder="email@example.com, other@example.com" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Follow-Up Reminder Date</Label>
                        <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                    </div>
                </div>
            )}

            {/* Step 4: Preview */}
            {step === 4 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Step 4: Preview</h3>
                    <div className="border rounded-lg p-6 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black">K2S Security</h2>
                                <p className="text-xs text-muted-foreground">Quote Reference: K2S-Q-XXXX</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700">DRAFT</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-muted-foreground">Bill To</p>
                                <p className="font-medium">{selectedCompany?.name}</p>
                                <p className="text-sm">{selectedContact?.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedContact?.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Quote Date</p>
                                <p className="font-medium">{formatDate(TODAY)}</p>
                                <p className="text-xs text-muted-foreground mt-2">Valid Until</p>
                                <p className="font-medium">30 days</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Description</th>
                                        <th className="text-right py-2">Qty</th>
                                        <th className="text-right py-2">Rate</th>
                                        <th className="text-right py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2">{systemType}</td>
                                        <td className="text-right">{units}</td>
                                        <td className="text-right">{formatCurrency(rate)}/{billingTerms.toLowerCase()}</td>
                                        <td className="text-right font-bold">{formatCurrency(totalValue)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {notes && (
                            <div className="mt-4 p-3 bg-muted/30 rounded text-sm">
                                <p className="text-xs font-bold text-muted-foreground mb-1">Notes</p>
                                {notes}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 5: Send */}
            {step === 5 && (
                <div className="space-y-4 text-center py-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Send className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Ready to Send</h3>
                    <p className="text-muted-foreground">
                        Quote will be sent to <strong>{selectedContact?.name}</strong> at <strong>{selectedContact?.email}</strong>
                    </p>
                    {additionalEmails && (
                        <p className="text-sm text-muted-foreground">CC: {additionalEmails}</p>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={step === 1 ? onClose : () => setStep(s => s - 1)}>
                    {step === 1 ? "Cancel" : <><ChevronLeft className="h-4 w-4 mr-1" />Back</>}
                </Button>
                {step < 5 ? (
                    <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                        Next<ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                ) : (
                    <Button onClick={handleSend}>
                        <Send className="h-4 w-4 mr-1.5" />Send Quote
                    </Button>
                )}
            </div>
        </div>
    );
}

// Sortable Quote Card
const SortableQuoteCard = React.memo(({ quote, onClick }: { quote: Quote; onClick: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: quote.id,
        data: { type: "Quote", quote },
    });

    const style = { transform: CSS.Translate.toString(transform), transition };
    const daysSinceSent = getDaysSinceSent(quote.sentAt);
    const expiryWarning = getExpiryWarning(quote.expiresAt, quote.status);

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="p-4 bg-muted/20 rounded-xl border border-dashed h-[110px] mb-2" />;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="group p-3 bg-white dark:bg-slate-900 rounded-xl border shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing mb-2"
        >
            <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-black text-primary">{quote.reference}</span>
                <div className="flex items-center gap-1">
                    {quote.isBigDeal && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: quote.bdmColor }} />
                </div>
            </div>
            <p className="text-sm font-medium truncate">{quote.companyName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{quote.contactName}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <span className="text-sm font-bold">{formatCurrency(quote.totalValue)}</span>
                <div className="flex items-center gap-1.5">
                    {daysSinceSent !== null && (
                        <span className="text-[10px] text-muted-foreground">{daysSinceSent}d ago</span>
                    )}
                    {expiryWarning === "expired" && (
                        <Badge className="bg-red-100 text-red-700 h-4 text-[9px] px-1">Expired</Badge>
                    )}
                    {expiryWarning === "warning" && (
                        <Badge className="bg-amber-100 text-amber-700 h-4 text-[9px] px-1">Expiring</Badge>
                    )}
                </div>
            </div>
        </div>
    );
});

// Pipeline Column
function PipelineColumn({ id, title, quotes, onClickQuote }: { id: string; title: string; quotes: Quote[]; onClickQuote: (quote: Quote) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id, data: { type: "Column" } });
    const total = quotes.reduce((sum, q) => sum + q.totalValue, 0);

    return (
        <div ref={setNodeRef} className={`flex-shrink-0 w-64 rounded-xl transition-colors ${isOver ? "bg-primary/5" : ""}`}>
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.12em]">{title}</h3>
                <Badge variant="secondary" className="text-[9px] font-bold h-4">{quotes.length}</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2 px-1">{formatCurrency(total)}</p>
            <SortableContext items={quotes.map(q => q.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1 min-h-[200px] max-h-[calc(100vh-350px)] overflow-y-auto rounded-lg p-1.5 border border-dashed bg-muted/20">
                    {quotes.length > 0 ? quotes.map(q => (
                        <SortableQuoteCard key={q.id} quote={q} onClick={() => onClickQuote(q)} />
                    )) : (
                        <div className="flex flex-col items-center justify-center h-16 text-muted-foreground">
                            <Inbox className="h-4 w-4 opacity-20" />
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// Quote Card Static (for drag overlay)
function QuoteCardStatic({ quote }: { quote: Quote }) {
    return (
        <div className="p-3 bg-white rounded-xl border border-primary/20 shadow-xl rotate-[2deg] scale-105 w-[250px]">
            <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-black text-primary">{quote.reference}</span>
                {quote.isBigDeal && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
            </div>
            <p className="text-sm font-medium">{quote.companyName}</p>
            <p className="text-sm font-bold mt-1">{formatCurrency(quote.totalValue)}</p>
        </div>
    );
}

// Main Page Content
function QuotesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openDrawer, closeDrawer } = useDrawer();
    const { role, canAccess } = useAuth();

    const viewMode = searchParams.get("view") === "list" ? "list" : "pipeline";
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [searchQuery, setSearchQuery] = useState("");
    const [bdmFilter, setBdmFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Rejection Modal State
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [pendingRejection, setPendingRejection] = useState<Quote | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionNotes, setRejectionNotes] = useState("");

    // Accepted Dialog State
    const [acceptedDialogOpen, setAcceptedDialogOpen] = useState(false);
    const [pendingAccept, setPendingAccept] = useState<Quote | null>(null);

    useEffect(() => { setIsMounted(true); }, []);

    const filteredQuotes = useMemo(() => {
        return quotes.filter(q => {
            // Ownership filter for BDM
            // In mock data context, we assume the user is "John Smith" (BDM-001)
            if (role === "BDM" && q.bdmName !== "John Smith") return false;

            const matchesSearch = q.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.reference.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBdm = bdmFilter === "all" || q.bdmName === bdmFilter;
            const matchesStatus = statusFilter === "all" || q.status === statusFilter;

            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && new Date(q.createdAt) >= new Date(startDate);
            }
            if (endDate) {
                matchesDate = matchesDate && new Date(q.createdAt) <= new Date(endDate);
            }

            return matchesSearch && matchesBdm && matchesStatus && matchesDate;
        });
    }, [quotes, searchQuery, bdmFilter, statusFilter, startDate, endDate, role]);

    // DND
    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
    const sensors = useSensors(pointerSensor, keyboardSensor);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === "Quote") {
            setActiveQuote(event.active.data.current.quote);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveQuote(null);
        if (!over) return;

        const quote = active.data.current?.quote as Quote;
        const isOverColumn = over.data.current?.type === "Column";

        if (quote && isOverColumn) {
            const newStatus = over.id as QuoteStatus;
            if (quote.status !== newStatus) {
                if (newStatus === "rejected") {
                    setPendingRejection(quote);
                    setRejectionModalOpen(true);
                } else if (newStatus === "accepted") {
                    setPendingAccept(quote);
                    setAcceptedDialogOpen(true);
                } else {
                    setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: newStatus } : q));
                    toast.success(`Quote moved to ${PIPELINE_STAGES.find(s => s.value === newStatus)?.label}`);
                }
            }
        }
    }, []);

    const handleRejectionSubmit = () => {
        if (!rejectionReason || !pendingRejection) return;
        setQuotes(prev => prev.map(q => q.id === pendingRejection.id ? { ...q, status: "rejected", rejectionReason, rejectionNotes } : q));
        toast.success("Quote marked as rejected");
        setRejectionModalOpen(false);
        setPendingRejection(null);
        setRejectionReason("");
        setRejectionNotes("");
    };

    const handleAcceptConfirm = () => {
        if (!pendingAccept) return;
        setQuotes(prev => prev.map(q => q.id === pendingAccept.id ? { ...q, status: "accepted" } : q));
        toast.success("Quote accepted! Lead will be converted to an account.");
        setAcceptedDialogOpen(false);
        setPendingAccept(null);
    };

    const handleOpenQuote = (quote: Quote) => {
        router.push(`/quotes/${quote.id}`);
    };

    const handleCreateQuote = () => {
        openDrawer({
            title: "Create Quote",
            description: "Create and send a new quote",
            content: (
                <CreateQuoteForm
                    onClose={closeDrawer}
                    onSave={(newQuote) => {
                        setQuotes(prev => [...prev, { ...newQuote, id: `Q-${Date.now()}` } as Quote]);
                    }}
                />
            )
        });
    };

    const toggleView = () => {
        router.push(viewMode === "pipeline" ? "/quotes?view=list" : "/quotes");
    };

    if (!isMounted) return null;

    return (
        <>
            <Topbar title="Quotes" subtitle="Manage proposals and pricing" />
            <main className="flex-1 overflow-hidden bg-muted/20 p-6">
                {/* Filter Bar */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search quotes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={bdmFilter} onValueChange={setBdmFilter}>
                            <SelectTrigger className="w-[140px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="BDM" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All BDMs</SelectItem>
                                {mockBDMs.map(b => (
                                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {PIPELINE_STAGES.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">From</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="h-7 w-[120px] text-[11px] bg-transparent border-none p-0 focus-visible:ring-0"
                            />
                            <div className="w-px h-3 bg-muted-foreground/20 mx-1" />
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">To</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-7 w-[120px] text-[11px] bg-transparent border-none p-0 focus-visible:ring-0"
                            />
                            {(startDate || endDate) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 ml-1 hovr:bg-red-100 hover:text-red-600 rounded-full"
                                    onClick={() => { setStartDate(""); setEndDate(""); }}
                                >
                                    <XCircle className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center rounded-lg border bg-muted/30 p-1">
                            <Button
                                variant={viewMode === "pipeline" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => viewMode === "list" && toggleView()}
                            >
                                <LayoutGrid className="h-3.5 w-3.5 mr-1" />Pipeline
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3 text-xs"
                                onClick={() => viewMode === "pipeline" && toggleView()}
                            >
                                <List className="h-3.5 w-3.5 mr-1" />List
                            </Button>
                        </div>
                    </div>
                    {canAccess("create_quote") && (
                        <Button id="create-quote-btn" onClick={handleCreateQuote} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95 shadow-sm">
                            <Plus className="mr-1.5 h-4 w-4" />Create Quote
                        </Button>
                    )}
                </div>

                {/* Pipeline View */}
                {viewMode === "pipeline" && (
                    <div className="overflow-x-auto -mx-6 px-6 pb-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-3" style={{ minWidth: `${PIPELINE_STAGES.length * 272}px` }}>
                                {PIPELINE_STAGES.map(stage => {
                                    const stageQuotes = filteredQuotes.filter(q => q.status === stage.value);
                                    return (
                                        <PipelineColumn
                                            key={stage.value}
                                            id={stage.value}
                                            title={stage.label}
                                            quotes={stageQuotes}
                                            onClickQuote={handleOpenQuote}
                                        />
                                    );
                                })}
                            </div>
                            <DragOverlay>
                                {activeQuote && <QuoteCardStatic quote={activeQuote} />}
                            </DragOverlay>
                        </DndContext>
                    </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quote Ref</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>System Type</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>BDM</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Sent</TableHead>
                                        <TableHead>Expires</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredQuotes.map(quote => {
                                        const expiryWarning = getExpiryWarning(quote.expiresAt, quote.status);
                                        return (
                                            <TableRow key={quote.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenQuote(quote)}>
                                                <TableCell>
                                                    <span className="font-bold text-primary">{quote.reference}</span>
                                                </TableCell>
                                                <TableCell className="font-medium">{quote.companyName}</TableCell>
                                                <TableCell className="text-muted-foreground">{quote.contactName}</TableCell>
                                                <TableCell className="text-sm">{quote.systemType}</TableCell>
                                                <TableCell className="text-right font-bold">{formatCurrency(quote.totalValue)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", stageStyles[quote.status])}>
                                                        {PIPELINE_STAGES.find(s => s.value === quote.status)?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: quote.bdmColor }} />
                                                        <span className="text-sm">{quote.bdmName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(quote.createdAt)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(quote.sentAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm">{formatDate(quote.expiresAt)}</span>
                                                        {expiryWarning === "expired" && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                                                        {expiryWarning === "warning" && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Rejection Modal */}
            <Dialog open={rejectionModalOpen} onOpenChange={(open) => {
                if (!open && !rejectionReason) {
                    // Cannot close without a reason
                    return;
                }
                setRejectionModalOpen(open);
                if (!open) {
                    setPendingRejection(null);
                    setRejectionReason("");
                    setRejectionNotes("");
                }
            }}>
                <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Quote Rejected</DialogTitle>
                        <DialogDescription>Please select a reason for rejection. This is required.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label>Rejection Reason <span className="text-destructive">*</span></Label>
                            <Select value={rejectionReason} onValueChange={setRejectionReason}>
                                <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                                <SelectContent>
                                    {rejectionReasons.map(r => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Textarea value={rejectionNotes} onChange={(e) => setRejectionNotes(e.target.value)} placeholder="Additional details..." rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setRejectionModalOpen(false); setPendingRejection(null); }}>Cancel</Button>
                        <Button onClick={handleRejectionSubmit} disabled={!rejectionReason}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Accepted Confirmation Dialog */}
            <AlertDialog open={acceptedDialogOpen} onOpenChange={setAcceptedDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Accept Quote?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark quote <strong>{pendingAccept?.reference}</strong> as accepted.
                            The associated lead will be converted to an account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingAccept(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAcceptConfirm}>Accept Quote</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function QuotesPage() {
    return (
        <PermissionGuard permission="/quotes">
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading quotes...</p>
                    </div>
                </div>
            }>
                <QuotesPageContent />
            </Suspense>
        </PermissionGuard>
    );
}
