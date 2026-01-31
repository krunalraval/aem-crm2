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
    Edit,
    Trash2,
    MoreHorizontal,
    Package,
    MapPin,
    Building2,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw,
    FileText,
    Inbox,
    Plus,
    Tag,
} from "lucide-react";

// Types
interface InventoryItem {
    id: string;
    partName: string;
    sku: string;
    description: string;
    stockLevel: number;
    reorderLevel: number;
    unitCost: number;
    location: string;
    supplier: string;
    supplierContact: string;
    supplierPhone: string;
    status: string;
    lastUpdated: string;
    stockHistory: StockMovement[];
    usageHistory: UsageRecord[];
}

interface StockMovement {
    id: string;
    type: string;
    quantity: number;
    previousLevel: number;
    newLevel: number;
    reason: string;
    user: string;
    timestamp: string;
}

interface UsageRecord {
    id: string;
    projectId: string;
    projectName: string;
    quantity: number;
    date: string;
    usedBy: string;
}

// Mock Data
const mockItems: Record<string, InventoryItem> = {
    "INV-001": {
        id: "INV-001",
        partName: "Clay Roof Tiles - Terracotta",
        sku: "CRT-001",
        description: "High-quality terracotta clay roof tiles. Traditional British design suitable for heritage and modern properties. Weather-resistant with 50+ year lifespan.",
        stockLevel: 2500,
        reorderLevel: 500,
        unitCost: 1.85,
        location: "Warehouse A - Bay 1",
        supplier: "British Clay Tiles Ltd",
        supplierContact: "James Smith",
        supplierPhone: "0121 555 0123",
        status: "in_stock",
        lastUpdated: "2024-01-28",
        stockHistory: [
            { id: "1", type: "received", quantity: 500, previousLevel: 2000, newLevel: 2500, reason: "PO-2024-0156 received", user: "John Doe", timestamp: "2024-01-28 14:30" },
            { id: "2", type: "used", quantity: -120, previousLevel: 2120, newLevel: 2000, reason: "Project P-2024-001", user: "Mike Johnson", timestamp: "2024-01-26 09:15" },
            { id: "3", type: "received", quantity: 1000, previousLevel: 1120, newLevel: 2120, reason: "PO-2024-0142 received", user: "John Doe", timestamp: "2024-01-22 11:00" },
            { id: "4", type: "used", quantity: -80, previousLevel: 1200, newLevel: 1120, reason: "Project P-2024-003", user: "David Brown", timestamp: "2024-01-20 16:45" },
            { id: "5", type: "adjustment", quantity: -50, previousLevel: 1250, newLevel: 1200, reason: "Stock count adjustment", user: "John Doe", timestamp: "2024-01-15 10:00" },
        ],
        usageHistory: [
            { id: "1", projectId: "P-2024-001", projectName: "Johnson Residence Roof", quantity: 120, date: "2024-01-26", usedBy: "Mike Johnson" },
            { id: "2", projectId: "P-2024-003", projectName: "Heritage Building Restoration", quantity: 80, date: "2024-01-20", usedBy: "David Brown" },
        ],
    },
};

const statusStyles: Record<string, string> = {
    in_stock: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    low_stock: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    out_of_stock: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

const movementTypeStyles: Record<string, string> = {
    received: "bg-green-50 text-green-700 border-green-100",
    used: "bg-red-50 text-red-700 border-red-100",
    adjustment: "bg-blue-50 text-blue-700 border-blue-100",
    returned: "bg-purple-50 text-purple-700 border-purple-100",
};

// Info Row Component
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-3 py-1">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

export default function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer } = useDrawer();
    const { openModal, openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("overview");

    const item = mockItems[id] || mockItems["INV-001"];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString.replace(" ", "T"));
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp.replace(" ", "T"));
        return date.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const isLowStock = item.stockLevel <= item.reorderLevel;

    return (
        <>
            <Topbar title="SKU Lifecycle" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/inventory">
                        <Button variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Inventory
                        </Button>
                    </Link>
                </div>

                {/* Header Card */}
                <Card className="mb-6 border-none shadow-sm">
                    <CardContent className="py-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl font-semibold tracking-tight">{item.partName}</h1>
                                        <Badge variant="secondary" className={`${statusStyles[item.status]} font-normal h-5`}>
                                            {item.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        <span>{item.sku}</span>
                                        <span>•</span>
                                        <span>Updated {formatDate(item.lastUpdated)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="h-9 shadow-sm">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Adjust Stock
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 bg-background">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Details
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 bg-background">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuItem>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reorder from Supplier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Export Movement Log
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Deactivate SKU
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Layout */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left Column: Summary Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 border-b border-muted/50">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Material Specs</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <InfoRow label="Availability" value={`${item.stockLevel.toLocaleString()} Units`} icon={Boxes} />
                                <InfoRow label="Safety Buffer" value={`${item.reorderLevel.toLocaleString()} Units`} icon={AlertTriangle} />
                                <InfoRow label="Unit Cost" value={`£${item.unitCost.toFixed(2)}`} icon={Tag} />
                                <InfoRow label="Warehouse Location" value={item.location} icon={MapPin} />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3 border-b border-muted/50">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Supplier Context</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <InfoRow label="Provider" value={item.supplier} icon={Building2} />
                                <InfoRow label="Contact Person" value={item.supplierContact} icon={User} />
                                <InfoRow label="Phone" value={item.supplierPhone} icon={Phone} />
                                <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-[11px] font-bold uppercase tracking-widest text-primary border-primary/20 hover:bg-primary/5">
                                    <Plus className="h-3 w-3 mr-1.5" /> New Purchase Order
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Detailed Context */}
                    <div className="lg:col-span-3 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                                <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Overview</TabsTrigger>
                                <TabsTrigger value="stock-history" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Movement Log</TabsTrigger>
                                <TabsTrigger value="usage" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-3 text-sm font-medium">Project Allocation</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab Content */}
                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-semibold">Material Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-1">
                                            {item.stockHistory.slice(0, 3).map((movement) => (
                                                <div key={movement.id} className="flex items-center justify-between py-3 group border-b last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${movementTypeStyles[movement.type]}`}>
                                                            {movement.type === "received" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{movement.reason}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">{movement.user} • {formatTimestamp(movement.timestamp)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                                            {movement.quantity > 0 ? "+" : ""}{movement.quantity.toLocaleString()}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Balance: {movement.newLevel}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Movement Log Tab Content */}
                            <TabsContent value="stock-history" className="mt-6">
                                <Card>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30">
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Date & Time</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3">Event</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Qty</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Balance</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 pr-6">Operator</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {item.stockHistory.map((movement) => (
                                                    <TableRow key={movement.id} className="group">
                                                        <TableCell className="text-sm pl-6">{formatTimestamp(movement.timestamp)}</TableCell>
                                                        <TableCell>
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-medium">{movement.reason}</p>
                                                                <Badge variant="outline" className={`${movementTypeStyles[movement.type]} font-normal h-4 text-[10px]`}>
                                                                    {movement.type.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className={`text-right font-medium ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                                            {movement.quantity > 0 ? "+" : ""}{movement.quantity.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm font-semibold">{movement.newLevel.toLocaleString()}</TableCell>
                                                        <TableCell className="text-sm pr-6 text-muted-foreground">{movement.user}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Project Allocation Tab Content */}
                            <TabsContent value="usage" className="mt-6">
                                <Card>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/30">
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Project Context</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3">Allocated Date</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Quantity</TableHead>
                                                    <TableHead className="text-[11px] font-bold uppercase py-3 text-right">Net Value</TableHead>
                                                    <TableHead className="w-[80px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {item.usageHistory.map((usage) => (
                                                    <TableRow key={usage.id} className="group">
                                                        <TableCell className="pl-6">
                                                            <Link href={`/projects/${usage.projectId}`} className="text-sm font-medium hover:underline text-primary">
                                                                {usage.projectName}
                                                            </Link>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{usage.projectId}</p>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{formatDate(usage.date)}</TableCell>
                                                        <TableCell className="text-right text-sm font-semibold">{usage.quantity.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right text-sm font-medium">
                                                            £{(usage.quantity * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell className="pr-6 text-right">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                                <Link href={`/projects/${usage.projectId}`}>
                                                                    <ArrowUpRight className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </>
    );
}

function Boxes(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    )
}

function User(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}

function Phone(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    )
}
