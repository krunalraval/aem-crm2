"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    Search,
    MoreHorizontal,
    Video,
    Camera,
    Wifi,
    WifiOff,
    RefreshCw,
    ExternalLink,
    Eye,
    Unplug,
    Building2,
    MapPin,
    Clock,
    CheckCircle2,
    Loader2,
    XCircle,
    Inbox,
} from "lucide-react";

// Types
interface RMSCamera {
    id: string;
    name: string;
    status: string;
    lastActive: string;
}

interface RMSSite {
    id: string;
    siteId: string;
    siteName: string;
    address: string;
    cameraCount: number;
    status: "connected" | "offline" | "syncing" | "error";
    lastSync: string;
    cameras: RMSCamera[];
}

// Mock Data
const mockData = {
    sites: [
        {
            id: "RMS-001",
            siteId: "P-2024-001",
            siteName: "Johnson Residence - Roof Installation",
            address: "45 Industrial Estate, Birmingham, B12 0HT",
            cameraCount: 4,
            status: "connected",
            lastSync: "2024-01-31T10:30:00Z",
            cameras: [],
        },
        {
            id: "RMS-003",
            siteId: "P-2024-003",
            siteName: "Heritage Building Restoration",
            address: "78 High Street, Oxford, OX1 4AZ",
            cameraCount: 6,
            status: "syncing",
            lastSync: "2024-01-31T10:00:00Z",
            cameras: [],
        },
        {
            id: "RMS-004",
            siteId: "P-2024-004",
            siteName: "New Build Estate Phase 2",
            address: "Plot 15-20, Newtown Development, Leeds, LS1 3EZ",
            cameraCount: 8,
            status: "connected",
            lastSync: "2024-01-31T10:25:00Z",
            cameras: [],
        },
        {
            id: "RMS-006",
            siteId: "P-2024-006",
            siteName: "School Roof Replacement",
            address: "St. Mary's Primary School, 22 Church Lane, Cambridge, CB2 1LA",
            cameraCount: 5,
            status: "error",
            lastSync: "2024-01-30T08:00:00Z",
            cameras: [],
        },
    ] as RMSSite[],
    summary: {
        totalSites: 8,
        connectedSites: 5,
        totalCameras: 38,
        onlineCameras: 30,
    },
};

const statusStyles = {
    connected: "bg-green-50 text-green-700",
    offline: "bg-slate-50 text-slate-500",
    syncing: "bg-blue-50 text-blue-700",
    error: "bg-red-50 text-red-700",
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
        <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <p className={`text-2xl font-black mt-1.5 ${color || ''}`}>{value}</p>
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

export default function RMSPage() {
    const { openConfirmation } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredSites = useMemo(() => {
        return mockData.sites.filter((site) => {
            const matchesSearch =
                site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                site.address.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || site.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSyncNow = (site: RMSSite) => {
        openConfirmation(
            "Sync Resource",
            `Initiate a manual linkage sync for ${site.siteName}?`,
            () => console.log("Syncing:", site.id)
        );
    };

    return (
        <>
            <Topbar title="Security Linkage" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Visual Summary */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <StatCard
                        title="Linked Assets"
                        value={mockData.summary.totalSites}
                        icon={Building2}
                        subValue={`${mockData.summary.connectedSites} Active links`}
                    />
                    <StatCard
                        title="Force Connection"
                        value="Active"
                        icon={Wifi}
                        color="text-emerald-600"
                        subValue="CCTV Linkage established"
                    />
                    <StatCard
                        title="Active Sensors"
                        value={mockData.summary.totalCameras}
                        icon={Camera}
                        subValue={`${mockData.summary.onlineCameras} Currently online`}
                    />
                    <StatCard
                        title="Sensor Health"
                        value={`${Math.round((mockData.summary.onlineCameras / mockData.summary.totalCameras) * 100)}%`}
                        icon={CheckCircle2}
                        subValue="Average uptime"
                    />
                </div>

                {/* Search & Filter */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search site or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-background shadow-sm border-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9 bg-background shadow-sm border-none">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All States</SelectItem>
                                <SelectItem value="connected">Connected</SelectItem>
                                <SelectItem value="syncing">Syncing</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sites Grid/Table */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Monitored Site</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase py-3">Location Context</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase py-3 text-center">Sensor Count</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase py-3">Link Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase py-3">Last Polled</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Management</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSites.map((site) => (
                                <TableRow key={site.id} className="group hover:bg-muted/20 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                                <Video className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Link href={`/rms/${site.id}`} className="font-bold text-sm hover:text-primary transition-colors underline-offset-4 decoration-primary/30 hover:underline">
                                                    {site.siteName}
                                                </Link>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{site.siteId}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-medium text-muted-foreground truncate">{site.address}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-black text-sm">{site.cameraCount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${statusStyles[site.status]} border-none font-bold text-[10px] uppercase tracking-widest h-5`}>
                                            <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${site.status === 'connected' ? 'bg-green-600' : site.status === 'syncing' ? 'bg-blue-600 animate-pulse' : 'bg-red-600'}`} />
                                            {site.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Clock className="h-3 w-3" />
                                            {formatTimestamp(site.lastSync)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" className="h-8 bg-background border-none shadow-sm text-xs font-bold" asChild>
                                                <Link href={`/rms/${site.id}`}>
                                                    Manage Link
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleSyncNow(site)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Manual Poll
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/projects/${site.siteId}`}>
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            View Project
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Unplug className="mr-2 h-4 w-4" />
                                                        Sever Connection
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSites.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20">
                                        <div className="flex flex-col items-center justify-center text-center space-y-3">
                                            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                                                <Inbox className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">No security links found</p>
                                                <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </>
    );
}
