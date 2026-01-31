"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    MoreHorizontal,
    FileText,
    Download,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    PoundSterling,
    CreditCard,
    AlertTriangle,
    Printer,
    Copy,
    ExternalLink,
    RefreshCw,
    User,
    Inbox,
} from "lucide-react";

// Types
interface InvoiceDetail {
    id: string;
    date: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    amount: number;
    vatAmount: number;
    totalAmount: number;
    status: string;
    dueDate: string;
    paidDate: string | null;
    projectId: string | null;
    projectName: string | null;
    lineItems: LineItem[];
    payments: PaymentRecord[];
    activity: ActivityRecord[];
}

interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
}

interface ActivityRecord {
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
}

// Mock Data
const mockInvoices: Record<string, InvoiceDetail> = {
    "INV-2024-0001": {
        id: "INV-2024-0001",
        date: "2024-01-28",
        customerId: "ACC-001",
        customerName: "Johnson Roofing LLC",
        customerEmail: "accounts@johnsonroofing.co.uk",
        customerPhone: "(0121) 555-0198",
        customerAddress: "45 Industrial Estate, Birmingham, B12 0HT",
        amount: 12500.00,
        vatAmount: 2500.00,
        totalAmount: 15000.00,
        status: "settled",
        dueDate: "2024-02-11",
        paidDate: "2024-02-08",
        projectId: "P-2024-001",
        projectName: "Commercial Roof Installation",
        lineItems: [
            { id: "1", description: "Labour - Roof Installation (5 days)", quantity: 5, unitPrice: 1200.00, total: 6000.00 },
            { id: "2", description: "Clay Roof Tiles - Terracotta", quantity: 500, unitPrice: 8.50, total: 4250.00 },
            { id: "3", description: "Breathable Membrane - 50m²", quantity: 2, unitPrice: 450.00, total: 900.00 },
        ],
        payments: [
            { id: "PAY-001", date: "2024-02-08", amount: 15000.00, method: "bank_transfer", reference: "BACS-78542" },
        ],
        activity: [
            { id: "1", type: "payment", description: "Ledger Settlement Received", user: "System (Sage Connect)", timestamp: "2024-02-08 10:30" },
            { id: "2", type: "reminder", description: "Automated Payment Reminder Dispatched", user: "Sarah Admin", timestamp: "2024-02-05 09:00" },
            { id: "3", type: "sent", description: "Invoice PDF Dispatch for Customer Review", user: "Sarah Admin", timestamp: "2024-01-28 14:30" },
            { id: "4", type: "created", description: "Ledger Entry Initialized", user: "John Manager", timestamp: "2024-01-28 11:00" },
        ],
    },
};

const statusStyles: Record<string, string> = {
    draft: "bg-slate-50 text-slate-700",
    sent: "bg-blue-50 text-blue-700",
    settled: "bg-green-50 text-green-700",
    overdue: "bg-red-50 text-red-700",
    cancelled: "bg-slate-50 text-slate-400",
};

const activityIcons: Record<string, React.ElementType> = {
    created: FileText,
    sent: Send,
    reminder: Clock,
    payment: CheckCircle2,
    overdue: AlertTriangle,
    cancelled: XCircle,
};

// Info Row Component
function InfoRow({ label, value, icon: Icon, isBold = false }: { label: string; value: string | number; icon: React.ElementType; isBold?: boolean }) {
    return (
        <div className="flex items-start gap-3 py-1">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-foreground mt-0.5 truncate`}>{value}</p>
            </div>
        </div>
    );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openModal, openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("breakdown");

    const invoice = mockInvoices[id] || mockInvoices["INV-2024-0001"];
    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const amountDue = invoice.totalAmount - amountPaid;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatCurrency = (amount: number) => {
        return `£${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <>
            <Topbar title="Ledger Detail" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Navigation */}
                <div className="mb-4">
                    <Link href="/finance">
                        <Button variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sales Ledger
                        </Button>
                    </Link>
                </div>

                {/* Header Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardContent className="py-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl font-semibold tracking-tight">{invoice.id}</h1>
                                        <Badge variant="secondary" className={`${statusStyles[invoice.status]} font-normal h-5`}>
                                            {invoice.status.toUpperCase()}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">In Sage Ledger</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        <span>{invoice.customerName}</span>
                                        <span>•</span>
                                        <span>Issued {formatDate(invoice.date)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {amountDue > 0 && (
                                    <Button size="sm" className="h-9 shadow-sm">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Settle Funds
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="h-9 bg-background">
                                    <Send className="mr-2 h-4 w-4" />
                                    Dispatch PDF
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 bg-background">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuItem>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export to CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print Statement
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Re-sync with Sage
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Void Ledger Entry
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Summary Pane */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 border-b border-muted/50">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Settlement Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Value</p>
                                    <p className="text-2xl font-black text-foreground">{formatCurrency(invoice.totalAmount)}</p>
                                </div>
                                <Separator className="bg-muted/50" />
                                <InfoRow label="Subtotal" value={formatCurrency(invoice.amount)} icon={PoundSterling} />
                                <InfoRow label="VAT (20%)" value={formatCurrency(invoice.vatAmount)} icon={AlertTriangle} />
                                <Separator className="bg-muted/50" />
                                {amountDue > 0 ? (
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-red-600">
                                            <span>Outstanding</span>
                                            <span>{formatCurrency(amountDue)}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(amountDue / invoice.totalAmount) * 100}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-green-50 text-green-700 border border-green-100">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-center flex-1">Fully Settled</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 border-b border-muted/50">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Entity Information</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <InfoRow label="Debtor Name" value={invoice.customerName} icon={Building2} />
                                <InfoRow label="Accounts Email" value={invoice.customerEmail} icon={Mail} />
                                <InfoRow label="Direct Dial" value={invoice.customerPhone} icon={Phone} />
                                <InfoRow label="Office" value={invoice.customerAddress} icon={MapPin} />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 border-b border-muted/50">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Timeline Context</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <InfoRow label="Issuance" value={formatDate(invoice.date)} icon={Calendar} />
                                <InfoRow label="Requirement" value={formatDate(invoice.dueDate)} icon={Clock} />
                                {invoice.paidDate && (
                                    <InfoRow label="Settlement" value={formatDate(invoice.paidDate)} icon={CheckCircle2} />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Breakdown Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-transparent h-auto p-0 gap-8 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                                <TabsTrigger value="breakdown" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Line Breakdown</TabsTrigger>
                                <TabsTrigger value="history" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Activity Log</TabsTrigger>
                                <TabsTrigger value="payments" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Receipt History</TabsTrigger>
                            </TabsList>

                            {/* Line Breakdown Tab */}
                            <TabsContent value="breakdown" className="mt-8 space-y-6">
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Line Description</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Units</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Rate</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Net Line Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.lineItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="pl-6 text-sm font-medium py-4">{item.description}</TableCell>
                                                    <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                                                    <TableCell className="text-right text-sm">£{item.unitPrice.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-sm font-bold pr-6">£{item.total.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-sm bg-muted/20">
                                        <CardHeader>
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commercial Project Context</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Link href={`/projects/${invoice.projectId}`} className="flex items-center justify-between group">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold group-hover:text-primary transition-colors underline-offset-4 decoration-primary/30 group-hover:underline">{invoice.projectName}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{invoice.projectId}</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </Link>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-1.5 pt-4">
                                        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground px-4">
                                            <span>Subtotal</span>
                                            <span className="font-bold text-foreground">{formatCurrency(invoice.amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground px-4">
                                            <span>VAT (20%)</span>
                                            <span className="font-bold text-foreground">{formatCurrency(invoice.vatAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3 bg-primary/5 rounded-xl border border-primary/10 mt-2">
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">Consolidated Total</span>
                                            <span className="text-xl font-black text-primary">{formatCurrency(invoice.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Activity Log Tab */}
                            <TabsContent value="history" className="mt-8">
                                <Card className="border-none shadow-sm pb-6">
                                    <CardContent className="pt-6 space-y-0">
                                        {invoice.activity.map((activity, index) => {
                                            const Icon = activityIcons[activity.type] || FileText;
                                            return (
                                                <div key={activity.id} className="relative pl-10 pb-10 group">
                                                    {index !== invoice.activity.length - 1 && (
                                                        <div className="absolute left-[15px] top-[24px] bottom-0 w-[2px] bg-muted group-hover:bg-primary/20 transition-colors" />
                                                    )}
                                                    <div className="absolute left-0 top-0 h-8 w-8 rounded-full border-2 border-background flex items-center justify-center bg-muted text-muted-foreground z-10 group-hover:bg-primary/5 group-hover:text-primary transition-all shadow-sm">
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold tracking-tight">{activity.description}</p>
                                                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                                            <span>{activity.user}</span>
                                                            <span className="text-muted-foreground/30">•</span>
                                                            <span>{activity.timestamp}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Payment Receipt History Tab */}
                            <TabsContent value="payments" className="mt-8">
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Receipt Code</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Received Date</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Methodology</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Allocated Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.payments.map((payment) => (
                                                <TableRow key={payment.id} className="group">
                                                    <TableCell className="pl-6 font-bold text-sm">{payment.id}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{formatDate(payment.date)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded flex items-center justify-center bg-muted text-muted-foreground">
                                                                <CreditCard className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-wider">{payment.method.replace('_', ' ')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm font-black text-green-600 pr-6">{formatCurrency(payment.amount)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {invoice.payments.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground italic">
                                                        No payment receipts recorded for this ledger entry.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </>
    );
}
