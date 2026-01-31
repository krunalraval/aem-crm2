"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    MoreHorizontal,
    Video,
    Camera,
    Wifi,
    WifiOff,
    RefreshCw,
    ExternalLink,
    Unplug,
    Building2,
    MapPin,
    Clock,
    CheckCircle2,
    Loader2,
    XCircle,
    AlertTriangle,
    Play,
    Pause,
    Settings,
    Activity,
    Calendar,
    User,
    Inbox,
    Shield,
    Smartphone,
} from "lucide-react";

// Types
interface RMSCamera {
    id: string;
    name: string;
    status: string;
    lastActive: string;
    resolution: string;
    recording: boolean;
}

interface SyncEvent {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
}

interface RMSSiteDetail {
    id: string;
    siteId: string;
    siteName: string;
    address: string;
    cameraCount: number;
    status: "connected" | "offline" | "syncing" | "error";
    lastSync: string;
    rmsAccountId: string;
    installedDate: string;
    cameras: RMSCamera[];
    syncHistory: SyncEvent[];
}

// Mock Data
const mockSites: Record<string, RMSSiteDetail> = {
    "RMS-001": {
        id: "RMS-001",
        siteId: "P-2024-001",
        siteName: "Johnson Residence - Roof Installation",
        address: "45 Industrial Estate, Birmingham, B12 0HT",
        cameraCount: 4,
        status: "connected",
        lastSync: "2024-01-31T10:30:00Z",
        rmsAccountId: "RMS-ACC-78542",
        installedDate: "2024-01-15",
        cameras: [
            { id: "CAM-001", name: "Front Entrance", status: "online", lastActive: "2024-01-31T10:30:00Z", resolution: "4K High", recording: true },
            { id: "CAM-002", name: "Roof Area North", status: "online", lastActive: "2024-01-31T10:30:00Z", resolution: "1080p Ultra", recording: true },
            { id: "CAM-003", name: "Roof Area South", status: "online", lastActive: "2024-01-31T10:28:00Z", resolution: "1080p Ultra", recording: true },
            { id: "CAM-004", name: "Materials Storage", status: "offline", lastActive: "2024-01-30T18:45:00Z", resolution: "1080p Ultra", recording: false },
        ],
        syncHistory: [
            { id: "1", type: "sync", description: "Automatic poll cycle complete", timestamp: "2024-01-31T10:30:00Z", status: "success" },
            { id: "2", type: "sync", description: "Heartbeat detected - Primary Controller", timestamp: "2024-01-31T09:30:00Z", status: "success" },
            { id: "3", type: "camera", description: "Sensor CAM-004 packet loss - system marked offline", timestamp: "2024-01-30T18:45:00Z", status: "warning" },
        ],
    },
};

const statusStyles = {
    connected: "bg-green-50 text-green-700",
    offline: "bg-slate-50 text-slate-500",
    syncing: "bg-blue-50 text-blue-700",
    error: "bg-red-50 text-red-700",
};

// Info Row Component
function InfoRow({ label, value, icon: Icon, isBold = false }: { label: string; value: string | number; icon: React.ElementType; isBold?: boolean }) {
    return (
        <div className="flex items-start gap-3 py-1">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className={`text-sm ${isBold ? 'font-black' : 'font-bold'} text-foreground mt-0.5 truncate`}>{value}</p>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color?: string }) {
    return (
        <Card className="border-none shadow-sm h-full">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <p className={`text-2xl font-black mt-1.5 ${color || ''}`}>{value}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function RMSDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("cameras");

    const site = mockSites[id] || mockSites["RMS-001"];
    const onlineCameras = site.cameras.filter((c) => c.status === "online").length;

    const handleSyncNow = () => {
        openConfirmation(
            "Sync Resource",
            `Initiate a manual linkage sync for ${site.siteName}?`,
            () => console.log("Syncing:", site.id)
        );
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <Topbar title="Security Asset Monitor" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Header Section */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-background p-6 rounded-2xl shadow-sm border border-slate-200/50">
                    <div className="flex items-center gap-4">
                        <Link href="/rms">
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/50 rounded-xl">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="h-12 w-px bg-slate-200 mx-2 hidden sm:block" />
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black tracking-tight">{site.siteName}</h1>
                                <Badge variant="outline" className={`${statusStyles[site.status]} border-none font-bold text-[10px] uppercase tracking-widest h-5`}>
                                    <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${site.status === 'connected' ? 'bg-green-600' : 'bg-red-600'}`} />
                                    {site.status}
                                </Badge>
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border-none">
                                    <Shield className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Encrypted Link</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3" />
                                    {site.address}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleSyncNow} className="h-9 bg-background shadow-sm border-none font-bold text-xs">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Force Poll
                        </Button>
                        <Button size="sm" className="h-9 font-bold text-xs" disabled>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Live Portal
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configure Hardware
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Diagnostic Log
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    <Unplug className="mr-2 h-4 w-4" />
                                    Sever Connection
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                            <StatCard
                                title="Link Accuracy"
                                value={`${Math.round((onlineCameras / site.cameraCount) * 100)}%`}
                                icon={Wifi}
                                color="text-emerald-600"
                            />
                            <StatCard
                                title="Active Sensors"
                                value={`${onlineCameras} / ${site.cameraCount}`}
                                icon={Camera}
                            />
                        </div>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Network Context</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoRow label="Integration ID" value={site.id} icon={Shield} />
                                <InfoRow label="Project Link" value={site.siteId} icon={Building2} />
                                <InfoRow label="Account Hash" value={site.rmsAccountId} icon={User} />
                                <InfoRow label="Polling Frequency" value="Every 60s" icon={Clock} />
                                <InfoRow label="Last Uplink" value={formatTimestamp(site.lastSync)} icon={RefreshCw} />
                                <InfoRow label="Commenced" value={site.installedDate} icon={Calendar} />
                            </CardContent>
                        </Card>

                        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-primary">Mobile Access</p>
                                <p className="text-xs font-bold text-muted-foreground leading-tight">Link authorized for mobile monitoring</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start h-12 p-0 mb-6">
                                <TabsTrigger value="cameras" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-bold uppercase tracking-widest px-6 h-full">Managed Sensors</TabsTrigger>
                                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-bold uppercase tracking-widest px-6 h-full">Audit Trail</TabsTrigger>
                            </TabsList>

                            {/* Managed Sensors */}
                            <TabsContent value="cameras" className="m-0">
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Core Sensor</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Uplink State</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Fidelity</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3">Archiving</TableHead>
                                                <TableHead className="text-[11px] font-bold uppercase py-3 pr-6">Last Pulse</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {site.cameras.map((camera) => (
                                                <TableRow key={camera.id}>
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
                                                                <Camera className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold tracking-tight">{camera.name}</p>
                                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{camera.id}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${camera.status === 'online' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border-none font-bold text-[10px] uppercase tracking-widest h-5`}>
                                                            <div className={`h-1 w-1 rounded-full mr-1.5 ${camera.status === 'online' ? 'bg-green-600' : 'bg-red-600'}`} />
                                                            {camera.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-600">{camera.resolution}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`h-1.5 w-1.5 rounded-full ${camera.recording ? 'bg-red-600 animate-pulse' : 'bg-slate-300'}`} />
                                                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{camera.recording ? 'Archiving' : 'Standby'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="pr-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        {formatTimestamp(camera.lastActive)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>

                            {/* Audit Trail */}
                            <TabsContent value="history" className="m-0">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="pt-6">
                                        <div className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-100">
                                            {site.syncHistory.map((event) => (
                                                <div key={event.id} className="relative pl-10">
                                                    <div className={`absolute left-0 top-1 h-8 w-8 rounded-full border-4 border-background flex items-center justify-center ${event.status === 'success' ? 'bg-green-100 text-green-600' :
                                                            event.status === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        <Activity className="h-3 w-3" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold tracking-tight">{event.description}</p>
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{formatTimestamp(event.timestamp)}</span>
                                                        </div>
                                                        <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-tighter h-4 border-none bg-slate-100 text-slate-600">{event.type}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
