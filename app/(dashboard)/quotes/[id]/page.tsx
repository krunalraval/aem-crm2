"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    Save,
    Send,
    FileText,
    Download,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Plus,
    Trash2,
    GripVertical,
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    PoundSterling,
    Eye,
} from "lucide-react";

// Types
interface Quote {
    id: string;
    clientName: string;
    clientCompany: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;
    value: number;
    status: string;
    version: number;
    createdAt: string;
    expiresAt: string;
    discount: number;
}

interface LineItem {
    id: string;
    quoteId: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    vatRate: number;
}

// Mock Data
const mockQuotes: Record<string, Quote> = {
    "Q-2024-001": {
        id: "Q-2024-001",
        clientName: "Mike Thompson",
        clientCompany: "Johnson Roofing LLC",
        clientEmail: "mike@johnsonroofing.com",
        clientPhone: "07555 123 456",
        clientAddress: "123 Oak Street, Austin, TX 78701",
        value: 45000,
        status: "draft",
        version: 1,
        createdAt: "2024-01-28",
        expiresAt: "2024-02-28",
        discount: 5,
    },
    "Q-2024-002": {
        id: "Q-2024-002",
        clientName: "Sarah Chen",
        clientCompany: "Acme Construction",
        clientEmail: "sarah@acme.com",
        clientPhone: "07555 234 567",
        clientAddress: "456 Main Avenue, Dallas, TX 75201",
        value: 120000,
        status: "sent",
        version: 1,
        createdAt: "2024-01-25",
        expiresAt: "2024-02-25",
        discount: 0,
    },
};

const mockLineItems: LineItem[] = [
    { id: "LI-001", quoteId: "Q-2024-001", description: "Roof tile replacement - Clay tiles", quantity: 500, unit: "tiles", unitPrice: 45, vatRate: 20 },
    { id: "LI-002", quoteId: "Q-2024-001", description: "Labour - Roof installation", quantity: 40, unit: "hours", unitPrice: 65, vatRate: 20 },
    { id: "LI-003", quoteId: "Q-2024-001", description: "Scaffolding hire", quantity: 2, unit: "weeks", unitPrice: 850, vatRate: 20 },
];

const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    approved: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    expired: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

const unitOptions = ["units", "hours", "days", "weeks", "m²", "m", "tiles", "kg", "litres"];

// Info Row Component
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

// PDF Preview Component (Refined)
function PDFPreview({ quote, lineItems }: { quote: Quote, lineItems: LineItem[] }) {
    return (
        <div className="space-y-4 pt-4">
            <div className="aspect-[1/1.4] bg-white border rounded shadow-sm p-8 text-black overflow-y-auto">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-xl font-bold">QUOTATION</h1>
                        <p className="text-sm text-muted-foreground mt-1">{quote.id}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">AEM CRM</p>
                        <p className="text-[12px] text-muted-foreground">123 Business Way, London</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-10">
                    <div>
                        <p className="text-[12px] font-medium text-muted-foreground uppercase mb-2">Quote For</p>
                        <p className="font-semibold">{quote.clientName}</p>
                        <p className="text-sm text-muted-foreground">{quote.clientCompany}</p>
                        <p className="text-sm text-muted-foreground mt-1">{quote.clientAddress}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-sm"><span className="text-muted-foreground">Date:</span> {quote.createdAt}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Valid Until:</span> {quote.expiresAt}</p>
                    </div>
                </div>

                <div className="border rounded-t overflow-hidden mb-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="py-2 px-3 text-left font-medium">Description</th>
                                <th className="py-2 px-3 text-right font-medium w-16">Qty</th>
                                <th className="py-2 px-3 text-right font-medium w-24">Price</th>
                                <th className="py-2 px-3 text-right font-medium w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {lineItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-2 px-3">{item.description}</td>
                                    <td className="py-2 px-3 text-right">{item.quantity}</td>
                                    <td className="py-2 px-3 text-right">£{item.unitPrice}</td>
                                    <td className="py-2 px-3 text-right font-medium">£{(item.quantity * item.unitPrice).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-4">
                    <div className="w-1/2 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>£{(quote.value / 1.2).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">VAT (20%)</span>
                            <span>£{(quote.value - (quote.value / 1.2)).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Total (GBP)</span>
                            <span>£{quote.value.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <Button size="sm">
                    <Download className="mr-1.5 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
        </div>
    );
}

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openModal, openConfirmation } = useModal();

    const quote = mockQuotes[id] || mockQuotes["Q-2024-001"];
    const [lineItems, setLineItems] = useState<LineItem[]>(mockLineItems.filter(li => li.quoteId === quote.id));

    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = subtotal * (quote.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * 0.20;
    const total = afterDiscount + vatAmount;

    const handlePreviewPDF = () => {
        openModal({
            title: "Quote Preview",
            description: `Draft PDF preview for ${quote.id}`,
            content: <PDFPreview quote={quote} lineItems={lineItems} />,
            size: "lg",
        });
    };

    const handleSendToClient = () => {
        openConfirmation(
            "Send Quote to Client",
            `Send ${quote.id} to ${quote.clientName} at ${quote.clientEmail}? this will lock the current version.`,
            () => console.log("Sent:", quote.id)
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const isEditable = quote.status === "draft";

    return (
        <>
            <Topbar title="Quote Builder" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                <div className="mb-4">
                    <Link href="/quotes">
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground -ml-2">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Quotes
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold leading-none">{quote.id}</h1>
                                <Badge variant="secondary" className={`${statusStyles[quote.status]} font-normal h-5`}>
                                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                </Badge>
                                <Badge variant="outline" className="h-5 font-normal text-muted-foreground">v{quote.version}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5">
                                Created {formatDate(quote.createdAt)} • Expires {formatDate(quote.expiresAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditable && (
                            <Button variant="outline" size="sm" className="h-9">
                                <Save className="mr-1.5 h-4 w-4" />
                                Save
                            </Button>
                        )}
                        <Button variant="outline" size="sm" className="h-9" onClick={handlePreviewPDF}>
                            <Eye className="mr-1.5 h-4 w-4" />
                            Preview
                        </Button>
                        <Button size="sm" className="h-9" onClick={handleSendToClient}>
                            <Send className="mr-1.5 h-4 w-4" />
                            Send to Client
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-medium">Line Items</CardTitle>
                                {isEditable && (
                                    <Button size="sm" variant="outline" className="h-8">
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Item
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            {isEditable && <TableHead className="w-10"></TableHead>}
                                            <TableHead className="pl-6 font-medium">Description</TableHead>
                                            <TableHead className="font-medium text-right w-20">Qty</TableHead>
                                            <TableHead className="font-medium w-24">Unit</TableHead>
                                            <TableHead className="font-medium text-right w-32">Price</TableHead>
                                            <TableHead className="font-medium text-right pr-6 w-32">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lineItems.map((item) => (
                                            <TableRow key={item.id}>
                                                {isEditable && (
                                                    <TableCell className="text-center">
                                                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                    </TableCell>
                                                )}
                                                <TableCell className="pl-6">
                                                    {isEditable ? (
                                                        <Input defaultValue={item.description} className="h-8 text-sm" />
                                                    ) : (
                                                        <span className="text-sm">{item.description}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {isEditable ? (
                                                        <Input type="number" defaultValue={item.quantity} className="h-8 text-sm text-right" />
                                                    ) : (
                                                        <span className="text-sm font-medium">{item.quantity}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-sm font-medium">{formatCurrency(item.unitPrice)}</span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <span className="text-sm font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base font-medium">Client Details</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <InfoRow label="Client Name" value={quote.clientName} icon={User} />
                                    <InfoRow label="Company" value={quote.clientCompany} icon={Building2} />
                                    <InfoRow label="Email" value={quote.clientEmail} icon={Mail} />
                                    <InfoRow label="Phone" value={quote.clientPhone} icon={Phone} />
                                    <InfoRow label="Address" value={quote.clientAddress} icon={MapPin} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base font-medium">Pricing Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">VAT (20%)</span>
                                        <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                    </div>
                                    {quote.discount > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Discount ({quote.discount}%)</span>
                                            <span className="text-green-600 font-medium">-{formatCurrency(discountAmount)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-lg">{formatCurrency(total)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Summary Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Total Items</p>
                                        <p className="text-lg font-semibold mt-1">{lineItems.length}</p>
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted/50">
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Estimated Value</p>
                                        <p className="text-lg font-semibold mt-1">{formatCurrency(total)}</p>
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted/50">
                                        <PoundSterling className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-2">
                                <Button variant="outline" className="w-full justify-start h-9" onClick={handlePreviewPDF}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate PDF
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-9">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <Button className="w-full justify-start h-9" onClick={handleSendToClient}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send to Client
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
