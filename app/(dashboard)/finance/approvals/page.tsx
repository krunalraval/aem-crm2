"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import approvalsData from "@/mock-data/approvals.json";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    MapPin,
    FileText,
    AlertCircle,
    ArrowUpRight,
    Inbox,
    Filter,
    Send,
} from "lucide-react";
import Link from "next/link";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Types
interface ApprovalItem {
    id: string;
    quoteId: string;
    siteName: string;
    siteId: string;
    regionName: string;
    companyName: string;
    quoteValue: number;
    status: "pending" | "approved" | "sent_back";
    submittedBy: string;
    submittedAt: string;
    notes: string | null;
}

// Mock Data
const mockApprovals: ApprovalItem[] = approvalsData as ApprovalItem[];

const statusStyles: Record<string, string> = {
    pending: STATUS_COLORS.semantic.pending,
    approved: STATUS_COLORS.semantic.active,
    sent_back: STATUS_COLORS.semantic.error,
};

const statusIcons: Record<string, React.ElementType> = {
    pending: Clock,
    approved: CheckCircle,
    sent_back: XCircle,
};

// Metric Card
function MetricCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color?: string }) {
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                    <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Icon className={`h-3.5 w-3.5 ${color || "text-primary"}`} />
                    </div>
                </div>
                <h2 className="text-xl font-black tracking-tight mt-1.5">{value}</h2>
            </CardContent>
        </Card>
    );
}

// Send Back Form
function SendBackForm({ item, onSubmit }: { item: ApprovalItem; onSubmit: (notes: string) => void }) {
    const [notes, setNotes] = useState("");

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
                <p className="text-sm"><span className="font-bold">{item.quoteId}</span> • {item.siteName}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.companyName} → {item.regionName}</p>
            </div>
            <div className="space-y-2">
                <Label>Reason for Sending Back <span className="text-destructive">*</span></Label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explain what needs to be corrected or clarified..."
                    className="min-h-[120px]"
                />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => onSubmit(notes)} disabled={!notes.trim()} className="bg-red-600 hover:bg-red-700">
                    Send Back
                </Button>
            </div>
        </div>
    );
}

export default function ApprovalsPage() {
    const { openDrawer } = useDrawer();
    const [approvals, setApprovals] = useState(mockApprovals);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "sent_back">("all");

    const filteredApprovals = approvals.filter((item) => {
        const matchesSearch =
            item.quoteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.companyName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || item.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleApprove = (id: string) => {
        setApprovals(prev => prev.map(item =>
            item.id === id ? { ...item, status: "approved" as const } : item
        ));
    };

    const handleSendBack = (item: ApprovalItem) => {
        openDrawer({
            title: "Send Back for Revision",
            description: "Provide feedback for the submitted quote",
            content: <SendBackForm item={item} onSubmit={(notes) => {
                setApprovals(prev => prev.map(a =>
                    a.id === item.id ? { ...a, status: "sent_back" as const, notes } : a
                ));
            }} />,
        });
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    // Stats
    const pendingCount = approvals.filter(a => a.status === "pending").length;
    const pendingValue = approvals.filter(a => a.status === "pending").reduce((sum, a) => sum + a.quoteValue, 0);
    const approvedCount = approvals.filter(a => a.status === "approved").length;
    const sentBackCount = approvals.filter(a => a.status === "sent_back").length;

    return (
        <>
            <Topbar title="Admin Approvals" subtitle="Pre-invoice approval queue" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard title="Pending" value={String(pendingCount)} icon={Clock} color="text-amber-500" />
                    <MetricCard title="Pending Value" value={formatCurrency(pendingValue)} icon={FileText} />
                    <MetricCard title="Approved" value={String(approvedCount)} icon={CheckCircle} color="text-green-500" />
                    <MetricCard title="Sent Back" value={String(sentBackCount)} icon={XCircle} color="text-red-500" />
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search approvals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border p-0.5">
                            {(["all", "pending", "approved", "sent_back"] as const).map((s) => (
                                <Button
                                    key={s}
                                    variant={filter === s ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 px-3 text-xs font-bold"
                                    onClick={() => setFilter(s)}
                                >
                                    {s === "all" ? "All" : s === "sent_back" ? "Sent Back" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Approvals Table */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Approval Queue</CardTitle>
                            <span className="text-sm text-muted-foreground">{filteredApprovals.length} items</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredApprovals.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Quote</TableHead>
                                            <TableHead className="font-medium">Site / Region</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Company</TableHead>
                                            <TableHead className="font-medium text-right">Value</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Submitted</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApprovals.map((item) => {
                                            const StatusIcon = statusIcons[item.status];
                                            return (
                                                <TableRow key={item.id} className="group">
                                                    <TableCell>
                                                        <Link href={`/quotes/${item.quoteId}`} className="font-medium text-sm hover:underline">
                                                            {item.quoteId}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{item.siteName}</p>
                                                                <p className="text-xs text-muted-foreground">{item.regionName}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="text-sm">{item.companyName}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-bold text-sm">{formatCurrency(item.quoteValue)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[item.status])}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {item.status === "sent_back" ? "Sent Back" : item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <div className="text-sm text-muted-foreground">
                                                            <p>{formatDate(item.submittedAt)}</p>
                                                            <p className="text-xs">by {item.submittedBy}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.status === "pending" ? (
                                                            <div className="flex items-center gap-1">
                                                                <Button size="sm" className="h-7 px-2 text-xs font-bold bg-green-600 hover:bg-green-700" onClick={() => handleApprove(item.id)}>
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs font-bold" onClick={() => handleSendBack(item)}>
                                                                    <Send className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ) : item.notes ? (
                                                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openDrawer({
                                                                title: "Rejection Notes",
                                                                description: `Feedback for ${item.quoteId}`,
                                                                content: <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-sm">{item.notes}</div>,
                                                            })}>
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                View Notes
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <SharedEmptyState
                                title="No approvals found"
                                description="No items match your current filters."
                                icon={Inbox}
                            />
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
