"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Copy,
    Trash2,
    FileText,
    Inbox,
    TrendingUp,
} from "lucide-react";

// Types
interface Quote {
    id: string;
    clientName: string;
    clientCompany: string;
    value: number;
    status: string;
    version: number;
    createdAt: string;
    expiresAt: string;
}

// Mock Data
const mockQuotes: Quote[] = [
    { id: "Q-2024-001", clientName: "Mike Thompson", clientCompany: "Johnson Roofing LLC", value: 45000, status: "draft", version: 1, createdAt: "2024-01-28", expiresAt: "2024-02-28" },
    { id: "Q-2024-002", clientName: "Sarah Chen", clientCompany: "Acme Construction", value: 120000, status: "sent", version: 1, createdAt: "2024-01-25", expiresAt: "2024-02-25" },
    { id: "Q-2024-003", clientName: "Tom Williams", clientCompany: "Premier Builders", value: 78000, status: "approved", version: 2, createdAt: "2024-01-20", expiresAt: "2024-02-20" },
    { id: "Q-2024-004", clientName: "Emma Rodriguez", clientCompany: "Smith Residence", value: 32000, status: "rejected", version: 1, createdAt: "2024-01-18", expiresAt: "2024-02-18" },
    { id: "Q-2024-005", clientName: "James Wilson", clientCompany: "Downtown Office Complex", value: 250000, status: "sent", version: 3, createdAt: "2024-01-15", expiresAt: "2024-02-15" },
    { id: "Q-2024-006", clientName: "Lisa Park", clientCompany: "Greenfield Estates", value: 185000, status: "approved", version: 1, createdAt: "2024-01-12", expiresAt: "2024-02-12" },
    { id: "Q-2024-007", clientName: "David Brown", clientCompany: "Metro Apartments", value: 95000, status: "expired", version: 2, createdAt: "2024-01-05", expiresAt: "2024-01-20" },
    { id: "Q-2024-008", clientName: "Rachel Green", clientCompany: "Sunrise Commercial", value: 67000, status: "draft", version: 1, createdAt: "2024-01-30", expiresAt: "2024-03-01" },
];

const mockClients = [
    { id: "1", name: "Mike Thompson", company: "Johnson Roofing LLC" },
    { id: "2", name: "Sarah Chen", company: "Acme Construction" },
    { id: "3", name: "Tom Williams", company: "Premier Builders" },
];

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
];

const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    approved: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    expired: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

// Empty State Component
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No quotes found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">
                No quotes match your current filters. Try adjusting your search or create a new quote.
            </p>
        </div>
    );
}

// Create Quote Form Component
function CreateQuoteForm() {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="client">Client <span className="text-destructive">*</span></Label>
                <Select>
                    <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.name} - {client.company}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="title">Quote Title</Label>
                <Input id="title" placeholder="e.g., Roof Installation Project" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="expiry">Valid For (days)</Label>
                    <Input id="expiry" type="number" defaultValue="30" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="ref">Reference</Label>
                    <Input id="ref" placeholder="Optional reference" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                    id="notes"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Internal notes (optional)"
                />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button>Create Quote</Button>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, trend }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: { label: string; up: boolean }
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className="text-2xl font-semibold mt-1.5">{value}</p>
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
                                <span className={`text-[12px] font-medium ${trend.up ? 'text-green-600' : 'text-amber-600'}`}>
                                    {trend.label}
                                </span>
                                <TrendingUp className={`h-3 w-3 ${trend.up ? 'text-green-600' : 'text-amber-600'}`} />
                            </div>
                        )}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function QuotesPage() {
    const { openDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter quotes
    const filteredQuotes = useMemo(() => {
        return mockQuotes.filter((quote) => {
            const matchesSearch =
                quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quote.clientCompany.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    // Handlers
    const handleCreateQuote = () => {
        openDrawer({
            title: "Create New Quote",
            content: <CreateQuoteForm />,
            description: "Create a quote for a client"
        });
    };

    const handleDuplicate = (quote: Quote) => {
        openConfirmation(
            "Duplicate Quote",
            `Create a copy of quote "${quote.id}"? The new quote will be created as a draft.`,
            () => console.log("Duplicated:", quote.id)
        );
    };

    const handleDelete = (quote: Quote) => {
        openConfirmation(
            "Delete Quote",
            `Are you sure you want to delete quote "${quote.id}"? This action cannot be undone.`,
            () => console.log("Deleted:", quote.id)
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Calculate totals
    const totalValue = mockQuotes.reduce((sum, q) => sum + q.value, 0);
    const approvedValue = mockQuotes.filter(q => q.status === "approved").reduce((sum, q) => sum + q.value, 0);
    const pendingCount = mockQuotes.filter(q => q.status === "sent").length;

    return (
        <>
            <Topbar title="Quotes" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Quotes" value={mockQuotes.length} icon={FileText} />
                    <StatCard title="Total Value" value={formatCurrency(totalValue)} icon={FileText} />
                    <StatCard title="Approved" value={formatCurrency(approvedValue)} icon={FileText} trend={{ label: "+12.5%", up: true }} />
                    <StatCard title="Pending" value={pendingCount} icon={FileText} />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search quotes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleCreateQuote} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Create Quote
                    </Button>
                </div>

                {/* Quotes Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">All Quotes</CardTitle>
                            <span className="text-sm text-muted-foreground">{filteredQuotes.length} quotes</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredQuotes.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Quote ID</TableHead>
                                            <TableHead className="font-medium">Client</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Version</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Created</TableHead>
                                            <TableHead className="font-medium text-right">Value</TableHead>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredQuotes.map((quote) => (
                                            <TableRow key={quote.id} className="group">
                                                <TableCell>
                                                    <Link
                                                        href={`/quotes/${quote.id}`}
                                                        className="font-medium text-sm hover:underline"
                                                    >
                                                        {quote.id}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground mt-0.5 md:hidden">
                                                        {quote.clientName}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <p className="text-sm font-medium">{quote.clientName}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{quote.clientCompany}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`${statusStyles[quote.status]} font-normal`}
                                                    >
                                                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                                    v{quote.version}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                                                    {formatDate(quote.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-sm text-right font-medium">
                                                    {formatCurrency(quote.value)}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/quotes/${quote.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Quote
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicate(quote)}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(quote)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Quote
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
