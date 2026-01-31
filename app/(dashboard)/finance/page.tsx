"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Search,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    Send,
    Download,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    FileText,
    CreditCard,
    Banknote,
    Building,
    Inbox,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    PoundSterling,
} from "lucide-react";

// Types
interface Invoice {
    id: string;
    date: string;
    customerId: string;
    customerName: string;
    amount: number;
    vatAmount: number;
    totalAmount: number;
    status: string;
    dueDate: string;
    paidDate: string | null;
    projectId: string | null;
}

interface Payment {
    id: string;
    date: string;
    customerId: string;
    customerName: string;
    amount: number;
    method: string;
    invoiceId: string | null;
    reference: string;
}

// Mock Data
const mockInvoices: Invoice[] = [
    { id: "INV-2024-0001", date: "2024-01-28", customerId: "ACC-001", customerName: "Johnson Roofing LLC", amount: 12500.00, vatAmount: 2500.00, totalAmount: 15000.00, status: "paid", dueDate: "2024-02-11", paidDate: "2024-02-08", projectId: "P-2024-001" },
    { id: "INV-2024-0002", date: "2024-01-25", customerId: "ACC-002", customerName: "Acme Construction", amount: 8750.00, vatAmount: 1750.00, totalAmount: 10500.00, status: "sent", dueDate: "2024-02-08", paidDate: null, projectId: "P-2024-004" },
    { id: "INV-2024-0003", date: "2024-01-20", customerId: "ACC-001", customerName: "Johnson Roofing LLC", amount: 4200.00, vatAmount: 840.00, totalAmount: 5040.00, status: "overdue", dueDate: "2024-02-03", paidDate: null, projectId: "P-2024-002" },
    { id: "INV-2024-0004", date: "2024-01-18", customerId: "ACC-002", customerName: "Acme Construction", amount: 22000.00, vatAmount: 4400.00, totalAmount: 26400.00, status: "paid", dueDate: "2024-02-01", paidDate: "2024-01-30", projectId: "P-2024-005" },
];

const mockPayments: Payment[] = [
    { id: "PAY-2024-0001", date: "2024-02-08", customerId: "ACC-001", customerName: "Johnson Roofing LLC", amount: 15000.00, method: "bank_transfer", invoiceId: "INV-2024-0001", reference: "BACS-78542" },
    { id: "PAY-2024-0002", date: "2024-01-30", customerId: "ACC-002", customerName: "Acme Construction", amount: 26400.00, method: "bank_transfer", invoiceId: "INV-2024-0004", reference: "BACS-78521" },
];

const mockPL = {
    income: [
        { category: "Roofing Services", amount: 185000 },
        { category: "Repairs & Maintenance", amount: 45000 },
        { category: "Materials Markup", amount: 28000 },
    ],
    expenses: [
        { category: "Labour Costs", amount: 95000 },
        { category: "Materials", amount: 62000 },
        { category: "Vehicle & Transport", amount: 18000 },
    ],
};

const invoiceStatusStyles: Record<string, string> = {
    draft: "bg-slate-50 text-slate-700",
    sent: "bg-blue-50 text-blue-700",
    paid: "bg-green-50 text-green-700",
    overdue: "bg-red-50 text-red-700",
    cancelled: "bg-slate-50 text-slate-400",
};

const paymentMethodIcons: Record<string, React.ElementType> = {
    bank_transfer: Building,
    card: CreditCard,
    cash: Banknote,
    cheque: FileText,
};

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subValue }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subValue?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className={`text-2xl font-semibold mt-1.5 ${color || ''}`}>{value}</p>
                        {subValue && <p className="text-[11px] text-muted-foreground mt-1 font-medium">{subValue}</p>}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Sage Sync Modal Content
function SageSyncModalContent() {
    const syncHistory = [
        { id: "1", status: "success", timestamp: "2024-01-29 14:30", items: 12 },
        { id: "2", status: "success", timestamp: "2024-01-29 10:00", items: 5 },
        { id: "3", status: "error", timestamp: "2024-01-28 12:00", items: 0, error: "Connection timeout" },
    ];

    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                        <p className="text-sm font-semibold text-green-800">Sage Business Cloud Connected</p>
                        <p className="text-[11px] text-green-600 font-medium">Auto-sync active • Last sweep 2h ago</p>
                    </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 bg-white border-green-200 text-green-700 hover:bg-green-50">
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Manual Sync
                </Button>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sync Distribution History</h4>
                <div className="space-y-2">
                    {syncHistory.map((sync) => (
                        <div key={sync.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-3">
                                {sync.status === "success" ? (
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                ) : (
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold">{sync.timestamp}</p>
                                    <p className="text-[10px] text-muted-foreground">{sync.status === "success" ? `${sync.items} records processed` : sync.error}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className={`h-5 text-[10px] font-bold ${sync.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {sync.status.toUpperCase()}
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Record Payment Form
function RecordPaymentForm({ invoice }: { invoice: Invoice }) {
    return (
        <div className="space-y-6 pt-2">
            <div className="bg-muted/30 p-4 rounded-xl border">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Settlement for</p>
                        <p className="text-sm font-semibold mt-0.5">{invoice.id}</p>
                    </div>
                    <Badge variant="outline" className="h-5 text-[10px] uppercase font-bold">{invoice.status}</Badge>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold">£{invoice.totalAmount.toLocaleString()}</span>
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Balance Due</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">{invoice.customerName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Date</label>
                    <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount (£)</label>
                    <Input type="number" step="0.01" defaultValue={invoice.totalAmount} className="h-9 font-semibold" />
                </div>
                <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Method</label>
                    <Select defaultValue="bank_transfer">
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer (BACS)</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="cash">Cash Settlement</SelectItem>
                            <SelectItem value="cheque">Cheque Payment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Reference</label>
                    <Input placeholder="e.g. BACS-88293" className="h-9" />
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button variant="outline" size="sm" className="h-9 px-4 font-medium">Cancel</Button>
                <Button size="sm" className="h-9 px-4 font-semibold shadow-sm">Record Settlement</Button>
            </div>
        </div>
    );
}

export default function FinancePage() {
    const { openModal, openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("overview");

    const [invoiceSearch, setInvoiceSearch] = useState("");
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");

    // Filtered invoices
    const filteredInvoices = useMemo(() => {
        return mockInvoices.filter((inv) => {
            const matchesSearch =
                inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase());
            const matchesStatus = invoiceStatusFilter === "all" || inv.status === invoiceStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoiceSearch, invoiceStatusFilter]);

    // Stats
    const totalRevenue = mockInvoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.totalAmount, 0);
    const outstandingAmount = mockInvoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + i.totalAmount, 0);
    const overdueAmount = mockInvoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.totalAmount, 0);

    const handleSageSync = () => {
        openModal({
            title: "ERP Ledger Synchronization",
            description: "View real-time handshake status with Sage Accounting",
            content: <SageSyncModalContent />,
        });
    };

    const handleMarkAsPaid = (invoice: Invoice) => {
        openModal({
            title: "Settle Invoice",
            description: "Record funds received against this ledger entry",
            content: <RecordPaymentForm invoice={invoice} />,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatCurrency = (amount: number) => {
        return `£${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    return (
        <>
            <Topbar title="Finance & Ledger" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Sage Sync Status */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Sage Synchronized</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-background hover:bg-muted" onClick={handleSageSync}>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        Sync Options
                    </Button>
                </div>

                {/* Main Dashboard Stats */}
                <div className="mb-8 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Cleared Revenue" value={formatCurrency(totalRevenue)} icon={PoundSterling} color="text-green-600" />
                    <StatCard title="Ledger Outstanding" value={formatCurrency(outstandingAmount)} icon={Clock} color="text-blue-600" subValue={`${mockInvoices.filter(i => i.status === 'sent').length} invoices awaiting funds`} />
                    <StatCard title="Overdue Debtors" value={formatCurrency(overdueAmount)} icon={AlertTriangle} color="text-red-600" subValue="Requires immediate action" />
                    <StatCard title="Net Profit Margin" value="28.5%" icon={TrendingUp} />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent h-auto p-0 gap-8 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                        <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Dashboard Overview</TabsTrigger>
                        <TabsTrigger value="invoices" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Sales Ledger</TabsTrigger>
                        <TabsTrigger value="payments" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Payment Log</TabsTrigger>
                        <TabsTrigger value="pl" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">P&L Visibility</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-8">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Revenue Trend */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-sm font-semibold">Invoicing Velocity</CardTitle>
                                        <CardDescription className="text-xs">Clearing volume over past 6 months</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="h-5 text-[10px] uppercase font-bold text-green-600 bg-green-50 border-green-100">+12% vs LY</Badge>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="h-[200px] flex items-end justify-between gap-3 px-2">
                                        {[45, 62, 58, 75, 92, 85].map((height, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                                <div className="w-full relative group">
                                                    <div className="absolute inset-0 bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" />
                                                    <div
                                                        className="relative w-full bg-primary rounded-t-lg transition-all duration-500"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ledger Health */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold">Receivables Risk Profile</CardTitle>
                                    <CardDescription className="text-xs">Ledger aging and composition</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-2">
                                    {[
                                        { label: "Settled / Paid", count: 72, color: "bg-green-500", val: "£182k" },
                                        { label: "Active Pending", count: 18, color: "bg-blue-500", val: "£45k" },
                                        { label: "Overdue Risk", count: 8, color: "bg-red-500", val: "£12k" },
                                        { label: "Draft / ProForma", count: 2, color: "bg-slate-300", val: "£4k" },
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                                                </div>
                                                <span className="text-xs font-semibold">{item.val}</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                                                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.count}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Invoices Tab */}
                    <TabsContent value="invoices" className="mt-8">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search sales ledger..."
                                            value={invoiceSearch}
                                            onChange={(e) => setInvoiceSearch(e.target.value)}
                                            className="pl-9 h-9 w-[280px]"
                                        />
                                    </div>
                                    <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-9">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Invoices</SelectItem>
                                            <SelectItem value="draft">Drafts</SelectItem>
                                            <SelectItem value="sent">Sent Out</SelectItem>
                                            <SelectItem value="paid">Settled</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button size="sm" className="h-9 font-semibold">
                                    <Send className="mr-2 h-4 w-4" />
                                    New Invoice
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="rounded-xl border border-muted/60 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Reference</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Client Entity</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Net Value</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Status</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Due Date</TableHead>
                                                <TableHead className="w-[44px] pr-6"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredInvoices.map((invoice) => (
                                                <TableRow key={invoice.id} className="group transition-colors">
                                                    <TableCell className="pl-6">
                                                        <Link href={`/finance/invoices/${invoice.id}`} className="font-semibold text-sm hover:underline cursor-pointer">
                                                            {invoice.id}
                                                        </Link>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(invoice.date)}</p>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium">{invoice.customerName}</TableCell>
                                                    <TableCell className="text-right font-bold text-sm">£{invoice.totalAmount.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={`${invoiceStatusStyles[invoice.status]} font-normal h-5 text-[10px]`}>
                                                            {invoice.status.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={`text-sm ${invoice.status === "overdue" ? "text-red-600 font-bold" : "text-muted-foreground font-medium"}`}>
                                                        {formatDate(invoice.dueDate)}
                                                    </TableCell>
                                                    <TableCell className="pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/finance/invoices/${invoice.id}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Breakdown
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {(invoice.status === "sent" || invoice.status === "overdue") && (
                                                                    <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                        Record Payment
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download PDF
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* P&L Tab */}
                    <TabsContent value="pl" className="mt-8">
                        <div className="grid gap-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-muted/50">
                                    <div>
                                        <CardTitle className="text-sm font-semibold tracking-tight">Financial Performance (YTD)</CardTitle>
                                        <CardDescription className="text-xs">Consolidated P&L summary based on cleared revenue</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-100">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Gross Margin</span>
                                            <span className="text-sm font-bold text-green-700">£122,000</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest">
                                            <FileText className="mr-1.5 h-3.5 w-3.5" /> Export P&L
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div className="space-y-6">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-green-600 flex items-center gap-2">
                                                <ArrowUpRight className="h-3.5 w-3.5" /> Cleared Income
                                            </h4>
                                            <div className="space-y-4">
                                                {mockPL.income.map(item => (
                                                    <div key={item.category} className="flex justify-between items-center py-2 border-b border-muted/30 last:border-0 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                                                        <span className="text-sm font-medium">{item.category}</span>
                                                        <span className="text-sm font-bold text-foreground">£{item.amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-4 flex justify-between items-center px-2">
                                                    <span className="text-sm font-bold uppercase tracking-wider">Total Ledger Credit</span>
                                                    <span className="text-base font-black text-green-600">£270,000</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                                                <ArrowDownRight className="h-3.5 w-3.5" /> Booked Expenses
                                            </h4>
                                            <div className="space-y-4">
                                                {mockPL.expenses.map(item => (
                                                    <div key={item.category} className="flex justify-between items-center py-2 border-b border-muted/30 last:border-0 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                                                        <span className="text-sm font-medium">{item.category}</span>
                                                        <span className="text-sm font-bold text-foreground">£{item.amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-4 flex justify-between items-center px-2">
                                                    <span className="text-sm font-bold uppercase tracking-wider">Total Direct Costs</span>
                                                    <span className="text-base font-black text-red-600">£175,000</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
