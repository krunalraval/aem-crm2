"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { toast } from "sonner";
import {
    Plus,
    Search,
    Eye,
    CheckCircle2,
    XCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    FileText,
    Building2,
    Calendar,
    PoundSterling,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    MapPin,
    History,
    BarChart3,
    RefreshCcw,
    Download,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/context/auth-context";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Types
type InvoiceStatus = "draft" | "pending_approval" | "sent" | "paid" | "overdue" | "disputed" | "credited";

interface Invoice {
    id: string;
    siteId: string;
    siteName: string;
    companyId: string;
    companyName: string;
    amount: number;
    periodFrom: string;
    periodTo: string;
    status: InvoiceStatus;
    dueDate: string;
    paidDate?: string;
    sageRef?: string;
    poNumber?: string;
    notes?: string;
    bdm: string;
}

interface PLReport {
    revenue: number;
    costs: {
        equipment: number;
        labour: number;
    };
    profit: number;
    margin: number;
}

// Mock Data
const mockInvoices: Invoice[] = [
    { id: "INV-2024-001", siteId: "SITE-001", siteName: "Johnson Roofing HQ", companyId: "COMP-001", companyName: "Johnson Roofing LLC", amount: 4500, periodFrom: "2024-01-01", periodTo: "2024-01-31", status: "paid", dueDate: "2024-02-14", paidDate: "2024-02-10", sageRef: "SAGE-1001", poNumber: "PO-4500", bdm: "David Brown" },
    { id: "INV-2024-002", siteId: "SITE-002", siteName: "Acme Construction Site", companyId: "COMP-002", companyName: "Acme Construction", amount: 12500, periodFrom: "2024-01-01", periodTo: "2024-01-31", status: "overdue", dueDate: "2024-02-01", poNumber: "PO-9921", bdm: "Tom Williams" },
    { id: "INV-2024-003", siteId: "SITE-003", siteName: "Premier Builders Office", companyId: "COMP-003", companyName: "Premier Builders", amount: 3200, periodFrom: "2024-02-01", periodTo: "2024-02-28", status: "sent", dueDate: "2024-03-14", bdm: "David Brown" },
    { id: "INV-2024-004", siteId: "SITE-001", siteName: "Johnson Roofing HQ", companyId: "COMP-001", companyName: "Johnson Roofing LLC", amount: 2800, periodFrom: "2024-02-01", periodTo: "2024-02-28", status: "draft", dueDate: "2024-03-30", bdm: "David Brown" },
    { id: "INV-2024-005", siteId: "SITE-004", siteName: "Tech Hub Park", companyId: "COMP-002", companyName: "Acme Construction", amount: 15600, periodFrom: "2024-01-15", periodTo: "2024-02-15", status: "draft", dueDate: "2024-03-15", bdm: "Tom Williams" },
    { id: "INV-2024-006", siteId: "SITE-002", siteName: "Acme Construction Site", companyId: "COMP-002", companyName: "Acme Construction", amount: 7200, periodFrom: "2024-02-01", periodTo: "2024-02-29", status: "disputed", dueDate: "2024-03-15", sageRef: "SAGE-1006", bdm: "Tom Williams" },
];

const revenueTrendData = [
    { name: "Feb 23", amount: 45000 },
    { name: "Mar 23", amount: 52000 },
    { name: "Apr 23", amount: 48000 },
    { name: "May 23", amount: 61000 },
    { name: "Jun 23", amount: 55000 },
    { name: "Jul 23", amount: 67000 },
    { name: "Aug 23", amount: 72000 },
    { name: "Sep 23", amount: 65000 },
    { name: "Oct 23", amount: 78000 },
    { name: "Nov 23", amount: 82000 },
    { name: "Dec 23", amount: 95000 },
    { name: "Jan 24", amount: 105000 },
];

const bdmRevenueData = [
    { name: "David Brown", amount: 320000, color: "#2563eb" },
    { name: "Tom Williams", amount: 245000, color: "#7c3aed" },
    { name: "Chris Martin", amount: 180000, color: "#db2777" },
];

const profitableSites = [
    { name: "Johnson Roofing HQ", revenue: 85000, margin: 42 },
    { name: "Acme Construction Site", revenue: 124000, margin: 38 },
    { name: "Tech Hub Park", revenue: 92000, margin: 35 },
    { name: "Premier Builders Office", revenue: 45000, margin: 32 },
    { name: "Skyline Apartments", revenue: 68000, margin: 30 },
];

const lossMakingSites = [
    { name: "Old Warehouse", revenue: 12000, margin: -15 },
    { name: "City Center Reno", revenue: 24000, margin: -8 },
    { name: "Harbor View", revenue: 18000, margin: -2 },
];

// Constants
const statusStyles: Record<InvoiceStatus, string> = {
    draft: STATUS_COLORS.invoice.draft,
    pending_approval: STATUS_COLORS.invoice.pending_approval,
    sent: STATUS_COLORS.invoice.sent,
    paid: STATUS_COLORS.invoice.paid,
    overdue: STATUS_COLORS.invoice.overdue,
    disputed: STATUS_COLORS.invoice.disputed,
    credited: STATUS_COLORS.invoice.credited,
};

const statusLabels: Record<InvoiceStatus, string> = {
    draft: "Draft",
    pending_approval: "Pending Approval",
    sent: "Sent",
    paid: "Paid",
    overdue: "Overdue",
    disputed: "Disputed",
    credited: "Credited",
};

// Helpers
const formatCurrency = (amount: number) => `£${amount.toLocaleString()}`;
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Sub-components
function ReviewInvoiceModal({ invoice, onApprove, onReject, onClose }: { invoice: Invoice; onApprove: () => void; onReject: (reason: string) => void; onClose: () => void }) {
    const [reason, setReason] = useState("");
    const [showRejectReason, setShowRejectReason] = useState(false);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Review Invoice - {invoice.id}</DialogTitle>
                    <DialogDescription>Review invoice details and approve for sending</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Site</p>
                            <p className="text-sm font-medium">{invoice.siteName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Company</p>
                            <p className="text-sm font-medium">{invoice.companyName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Period</p>
                            <p className="text-sm font-medium">{formatDate(invoice.periodFrom)} - {formatDate(invoice.periodTo)}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="text-lg font-bold text-primary">{formatCurrency(invoice.amount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">PO Number</p>
                            <p className="text-sm font-medium">{invoice.poNumber || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">BDM</p>
                            <p className="text-sm font-medium">{invoice.bdm}</p>
                        </div>
                    </div>
                </div>

                {showRejectReason && (
                    <div className="space-y-2 py-4 border-t">
                        <Label>Rejection Reason</Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please specify why this invoice is being rejected..."
                        />
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {!showRejectReason ? (
                        <>
                            <Button variant="outline" onClick={() => setShowRejectReason(true)} className="text-destructive hover:text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />Reject
                            </Button>
                            <Button onClick={onApprove}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />Approve Invoice
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setShowRejectReason(false)}>Back</Button>
                            <Button variant="destructive" onClick={() => onReject(reason)} disabled={!reason}>
                                Confirm Rejection
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CreateInvoiceForm({ onClose, onSave }: { onClose: () => void; onSave: (invoice: Partial<Invoice>) => void }) {
    const [siteId, setSiteId] = useState("");
    const [amount, setAmount] = useState("");
    const [periodFrom, setPeriodFrom] = useState("");
    const [periodTo, setPeriodTo] = useState("");
    const [poNumber, setPoNumber] = useState("");
    const [notes, setNotes] = useState("");

    const handleSave = () => {
        if (!siteId || !amount || !periodFrom || !periodTo) {
            toast.error("Required fields missing");
            return;
        }
        onSave({ id: `INV-${Date.now()}`, siteId, amount: parseFloat(amount), periodFrom, periodTo, poNumber, notes, status: "draft", bdm: "David Brown" });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Site <span className="text-destructive">*</span></Label>
                <Select value={siteId} onValueChange={setSiteId}>
                    <SelectTrigger><SelectValue placeholder="Select site..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="SITE-001">Johnson Roofing HQ</SelectItem>
                        <SelectItem value="SITE-002">Acme Construction Site</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Amount (£) <span className="text-destructive">*</span></Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Period From <span className="text-destructive">*</span></Label>
                    <Input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Period To <span className="text-destructive">*</span></Label>
                    <Input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>PO Number</Label>
                <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Create Draft</Button>
            </div>
        </div>
    );
}

export default function FinancePage() {
    const { openDrawer, closeDrawer } = useDrawer();
    const { canAccess } = useAuth();
    const [activeTab, setActiveTab] = useState("invoices");
    const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
    const [selectedInvoiceForReview, setSelectedInvoiceForReview] = useState<Invoice | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [bdmFilter, setBdmFilter] = useState("all");

    // P&L selectors
    const [selectedSiteId, setSelectedSiteId] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [plTimePeriod, setPlTimePeriod] = useState("this_month");

    const draftInvoices = useMemo(() => invoices.filter(i => i.status === "draft"), [invoices]);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(i => {
            const matchesSearch = i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.companyName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || i.status === statusFilter;
            const matchesBdm = bdmFilter === "all" || i.bdm === bdmFilter;
            return matchesSearch && matchesStatus && matchesBdm;
        });
    }, [invoices, searchQuery, statusFilter, bdmFilter]);

    const handleApprove = () => {
        if (!selectedInvoiceForReview) return;
        setInvoices(prev => prev.map(inv =>
            inv.id === selectedInvoiceForReview.id ? { ...inv, status: "sent" } : inv
        ));
        toast.success(`Invoice ${selectedInvoiceForReview.id} approved and sent`);
        setSelectedInvoiceForReview(null);
    };

    const handleReject = (reason: string) => {
        if (!selectedInvoiceForReview) return;
        toast.error(`Invoice ${selectedInvoiceForReview.id} rejected: ${reason}`);
        setSelectedInvoiceForReview(null);
    };

    const handleCreateInvoice = () => {
        openDrawer({
            title: "Create Manual Invoice",
            description: "Manually generate a new invoice record",
            content: <CreateInvoiceForm
                onClose={closeDrawer}
                onSave={(inv) => {
                    setInvoices(prev => [...prev, { ...inv, companyName: "New Client", siteName: "New Site" } as Invoice]);
                    closeDrawer();
                }}
            />
        });
    };

    return (
        <PermissionGuard permission="/finance">
            <Topbar title="Finance & Invoicing" subtitle="Sales Ledger, P&L Reports, and Financial Overview" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white dark:bg-slate-900 border-b rounded-none w-full justify-start h-12 p-0 px-6 gap-8">
                        <TabsTrigger value="invoices" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12 font-bold text-xs uppercase tracking-wider">Invoices</TabsTrigger>
                        <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12 font-bold text-xs uppercase tracking-wider">P&L Reports</TabsTrigger>
                        <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12 font-bold text-xs uppercase tracking-wider">Overview</TabsTrigger>
                    </TabsList>

                    {/* Invoices Tab */}
                    <TabsContent value="invoices" className="space-y-6 mt-0">
                        {/* Approval Queue */}
                        {draftInvoices.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700">Approval Queue ({draftInvoices.length})</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {draftInvoices.map(inv => (
                                        <Card key={inv.id} className="border-2 border-amber-100 shadow-sm bg-amber-50/30">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="font-bold text-sm">{inv.id}</p>
                                                        <p className="text-xs text-muted-foreground">{inv.companyName}</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-white text-[10px]">{formatCurrency(inv.amount)}</Badge>
                                                </div>
                                                <div className="space-y-1 mb-4">
                                                    <p className="text-xs flex items-center gap-1.5"><MapPin className="h-3 w-3" />{inv.siteName}</p>
                                                    <p className="text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3" />{formatDate(inv.periodFrom)} - {formatDate(inv.periodTo)}</p>
                                                </div>
                                                <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => setSelectedInvoiceForReview(inv)}>Review Invoice</Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search ledger..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {Object.entries(statusLabels).map(([k, v]) => (
                                                <SelectItem key={k} value={k}>{v}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={bdmFilter} onValueChange={setBdmFilter}>
                                        <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="BDM" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All BDMs</SelectItem>
                                            <SelectItem value="David Brown">David Brown</SelectItem>
                                            <SelectItem value="Tom Williams">Tom Williams</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:flex flex-col items-end mr-2">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Sage Sync</span>
                                        <span className="text-[10px] text-green-600 font-medium leading-none">Last synced: 2h ago</span>
                                    </div>
                                    <Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground border-dashed hover:text-primary transition-all active:scale-95">
                                        <RefreshCcw className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9 font-bold text-xs uppercase transition-all active:scale-95 border-dashed">
                                        <Download className="h-4 w-4 mr-1.5" />
                                        Export
                                    </Button>
                                    {canAccess("finance_actions") && (
                                        <Button id="create-invoice-btn" size="sm" onClick={handleCreateInvoice} className="transition-all active:scale-95 shadow-sm">
                                            <Plus className="h-4 w-4 mr-2" />Create Invoice
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Site / Company</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>PO / Sage</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map(inv => {
                                            const isOverdue = inv.status === "overdue";
                                            return (
                                                <TableRow key={inv.id} className={`${isOverdue ? "bg-red-50 hover:bg-red-100" : ""}`}>
                                                    <TableCell className="font-bold">{inv.id}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/sites/${inv.siteId}`} className="text-sm font-medium text-primary hover:underline block">{inv.siteName}</Link>
                                                        <Link href={`/accounts/${inv.companyId}`} className="text-xs text-muted-foreground hover:underline">{inv.companyName}</Link>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {formatDate(inv.periodFrom)} - {formatDate(inv.periodTo)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">{formatCurrency(inv.amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[inv.status])}>
                                                            {statusLabels[inv.status]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={`text-sm ${isOverdue ? "text-red-700 font-bold" : ""}`}>
                                                        {formatDate(inv.dueDate)}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        <p>PO: {inv.poNumber || "-"}</p>
                                                        <p>Sage: {inv.sageRef || "-"}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* P&L Reports Tab */}
                    <TabsContent value="reports" className="space-y-6 mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Site-Level */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />Site-Level P&L
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                        <SelectTrigger><SelectValue placeholder="Select a site..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SITE-001">Johnson Roofing HQ</SelectItem>
                                            <SelectItem value="SITE-002">Acme Construction Site</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedSiteId && (
                                        <div className="space-y-3 pt-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-3 bg-muted/30 rounded-lg">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Revenue</p>
                                                    <p className="text-lg font-bold">£45,200</p>
                                                </div>
                                                <div className="p-3 bg-muted/30 rounded-lg">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Costs</p>
                                                    <p className="text-lg font-bold">£28,400</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] uppercase text-green-700 font-bold">Net Profit</p>
                                                    <p className="text-2xl font-black text-green-700">£16,800</p>
                                                </div>
                                                <Badge className="bg-green-600 text-white font-black">37% Margin</Badge>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Company-Level */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />Company-Level P&L
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                        <SelectTrigger><SelectValue placeholder="Select a company..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COMP-001">Johnson Roofing LLC</SelectItem>
                                            <SelectItem value="COMP-002">Acme Construction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedCompanyId && (
                                        <div className="space-y-4 pt-2">
                                            <div className="p-4 bg-primary/5 rounded-lg border flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Aggregate Revenue</p>
                                                    <p className="text-xl font-bold">£215,800</p>
                                                </div>
                                                <Badge variant="outline" className="border-primary h-6">12 Sites</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold uppercase text-muted-foreground px-1">Top Sites</p>
                                                {[
                                                    { name: "Acme HQ", margin: 38, isProfitable: true },
                                                    { name: "Tech Park", margin: 35, isProfitable: true },
                                                    { name: "Old Depot", margin: -12, isProfitable: false },
                                                ].map(s => (
                                                    <div key={s.name} className={`flex justify-between items-center p-2 rounded-lg text-xs ${s.isProfitable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                        <span className="font-medium">{s.name}</span>
                                                        <span className="font-bold">{s.margin}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Business Stats Cards */}
                            <div className="space-y-4">
                                <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                                    <CardContent className="p-4">
                                        <p className="text-xs font-bold uppercase opacity-80">Total Revenue YTD</p>
                                        <p className="text-3xl font-black">£2.4M</p>
                                        <p className="text-xs mt-2 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> 15% vs previous year</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-muted-foreground">Overall Margin</p>
                                                <p className="text-2xl font-bold text-green-600">32.4%</p>
                                            </div>
                                            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-muted-foreground">Total Costs</p>
                                                <p className="text-2xl font-bold text-red-600">£1.62M</p>
                                            </div>
                                            <TrendingDown className="h-8 w-8 text-red-100" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold">Revenue Trend (Last 12 Months)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={revenueTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `£${val / 1000}k`} />
                                                <Tooltip
                                                    formatter={(val: number | string | undefined) => [val ? formatCurrency(Number(val)) : "£0", "Revenue"]}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold">Revenue by BDM</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={bdmRevenueData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={100} />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    formatter={(val: number | string | undefined) => [val ? formatCurrency(Number(val)) : "£0", "Revenue"]}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={32}>
                                                    {bdmRevenueData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profitability Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-green-600">Top 5 Profitable Sites</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="text-[10px]">Site Name</TableHead>
                                                <TableHead className="text-[10px] text-right">Revenue</TableHead>
                                                <TableHead className="text-[10px] text-right">Margin</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {profitableSites.map(site => (
                                                <TableRow key={site.name} className="bg-green-50/20">
                                                    <TableCell className="text-xs font-medium">{site.name}</TableCell>
                                                    <TableCell className="text-xs text-right font-bold">{formatCurrency(site.revenue)}</TableCell>
                                                    <TableCell className="text-xs text-right"><Badge className="bg-green-600 text-white border-none">{site.margin}%</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-red-600">Bottom 5 Profitability Sites</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="text-[10px]">Site Name</TableHead>
                                                <TableHead className="text-[10px] text-right">Revenue</TableHead>
                                                <TableHead className="text-[10px] text-right">Margin</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lossMakingSites.map(site => (
                                                <TableRow key={site.name} className="bg-red-50/20">
                                                    <TableCell className="text-xs font-medium">{site.name}</TableCell>
                                                    <TableCell className="text-xs text-right font-bold">{formatCurrency(site.revenue)}</TableCell>
                                                    <TableCell className="text-xs text-right"><Badge variant="destructive">{site.margin}%</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-0">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Outstanding</p>
                                            <p className="text-xl font-black">24 <span className="text-xs font-normal text-muted-foreground">/ £85k</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-red-50 border-red-100 border">
                                <CardContent className="p-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Overdue</p>
                                            <p className="text-xl font-black text-red-700">8 <span className="text-xs font-normal text-red-600">/ £32k</span></p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Paid This Month</p>
                                            <p className="text-xl font-black">£124k</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            <History className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Avg Days to Pay</p>
                                            <p className="text-xl font-black">28 Days</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Overdue Invoices */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2 border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />Overdue Invoices
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="text-xs text-primary">View All</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice</TableHead>
                                                <TableHead>Company</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="text-right">Days Late</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { id: "INV-2024-082", company: "Acme Construction", amount: 15200, days: 12 },
                                                { id: "INV-2024-095", company: "Skyline Partners", amount: 8400, days: 8 },
                                                { id: "INV-2024-102", company: "Prime Builders", amount: 4200, days: 5 },
                                                { id: "INV-2024-110", company: "Johnson Roofing", amount: 2400, days: 3 },
                                            ].map(inv => (
                                                <TableRow key={inv.id}>
                                                    <TableCell className="font-bold text-xs">{inv.id}</TableCell>
                                                    <TableCell className="text-xs">{inv.company}</TableCell>
                                                    <TableCell className="text-right text-xs font-bold text-red-600">{formatCurrency(inv.amount)}</TableCell>
                                                    <TableCell className="text-right"><Badge variant="destructive" className="h-5 text-[10px]">{inv.days}d</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Upcoming This Week */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2 border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />Due This Week
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="text-xs text-primary">View Calendar</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice</TableHead>
                                                <TableHead>Company</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Expected</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { id: "INV-2024-125", company: "BuildCorp LLC", amount: 22000, date: "Feb 12" },
                                                { id: "INV-2024-128", company: "Acme Construction", amount: 12500, date: "Feb 14" },
                                                { id: "INV-2024-130", company: "Heritage Restorations", amount: 6800, date: "Feb 15" },
                                                { id: "INV-2024-135", company: "Westside Dev", amount: 4500, date: "Feb 16" },
                                            ].map(inv => (
                                                <TableRow key={inv.id}>
                                                    <TableCell className="font-bold text-xs">{inv.id}</TableCell>
                                                    <TableCell className="text-xs">{inv.company}</TableCell>
                                                    <TableCell className="text-right text-xs font-bold">{formatCurrency(inv.amount)}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{inv.date}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {selectedInvoiceForReview && (
                <ReviewInvoiceModal
                    invoice={selectedInvoiceForReview}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClose={() => setSelectedInvoiceForReview(null)}
                />
            )}
        </PermissionGuard>
    );
}
