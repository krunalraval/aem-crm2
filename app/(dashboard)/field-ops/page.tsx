"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, CheckCircle2, AlertCircle, User, Phone, Mail, Navigation, Building2, Users, Briefcase, Calendar, Map, ExternalLink, Info, Inbox } from "lucide-react";
import fieldOpsData from "@/mock-data/field-ops.json";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

const mockSitesOnMap = fieldOpsData.sites;
const mockWorkOrders = fieldOpsData.workOrders;
const mockTechnicians = fieldOpsData.technicians;

const statusColors: Record<string, string> = {
    pending: STATUS_COLORS.semantic.pending,
    in_progress: STATUS_COLORS.job.in_progress,
    completed: STATUS_COLORS.job.complete,
};

const priorityColors: Record<string, string> = {
    low: STATUS_COLORS.priority.low,
    medium: STATUS_COLORS.priority.medium,
    high: STATUS_COLORS.priority.high,
    urgent: STATUS_COLORS.priority.critical,
};

const techStatusColors: Record<string, string> = {
    active: STATUS_COLORS.semantic.active,
    available: STATUS_COLORS.semantic.healthy,
    off_duty: STATUS_COLORS.semantic.inactive,
};

const techStatusLabels: Record<string, string> = {
    active: "On Job",
    available: "Available",
    off_duty: "Offline",
};

// Static Map Component with clickable CSS pins
function StaticMapView({ sites, onSiteClick }: { sites: typeof mockSitesOnMap; onSiteClick: (site: typeof mockSitesOnMap[0]) => void }) {
    const [hoveredSite, setHoveredSite] = useState<string | null>(null);

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Site Map</CardTitle>
                <CardDescription>Real-time view of all active sites and field work</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    {/* Map Background - stylized */}
                    <div className="absolute inset-0">
                        <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[...Array(10)].map((_, i) => (
                                <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="currentColor" strokeWidth="0.2" className="text-slate-400" />
                            ))}
                            {[...Array(10)].map((_, i) => (
                                <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="currentColor" strokeWidth="0.2" className="text-slate-400" />
                            ))}
                            {/* Some abstract "road" paths */}
                            <path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
                            <path d="M50,10 Q60,40 50,50 Q40,60 50,90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
                        </svg>
                    </div>

                    {/* Site Pins */}
                    {sites.map((site) => (
                        <div
                            key={site.id}
                            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 hover:scale-125 z-10"
                            style={{ left: `${site.x}%`, top: `${site.y}%` }}
                            onMouseEnter={() => setHoveredSite(site.id)}
                            onMouseLeave={() => setHoveredSite(null)}
                            onClick={() => onSiteClick(site)}
                        >
                            {/* Pin */}
                            <div className={`relative ${site.activeJob ? "animate-pulse" : ""}`}>
                                <MapPin className={`h-8 w-8 ${site.activeJob ? "text-green-500 fill-green-500" : site.status === "active" ? "text-primary fill-primary" : "text-slate-400 fill-slate-400"} drop-shadow-lg`} />
                                {site.activeJob && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                )}
                            </div>

                            {/* Tooltip on hover */}
                            {hoveredSite === site.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20">
                                    <p className="font-bold text-sm text-foreground">{site.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{site.region}</p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span>BDM: {site.bdm}</span>
                                    </div>
                                    {site.activeJob && (
                                        <Badge className="mt-2 bg-green-100 text-green-700 text-[9px] font-bold">
                                            <Clock className="h-2.5 w-2.5 mr-1" />
                                            Active Job
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-900/90 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Legend</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin className="h-4 w-4 text-green-500 fill-green-500" />
                                <span>Active Job</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin className="h-4 w-4 text-primary fill-primary" />
                                <span>Active Site</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin className="h-4 w-4 text-slate-400 fill-slate-400" />
                                <span>Inactive Site</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 shadow-sm">
                            {sites.filter(s => s.activeJob).length} Active Jobs
                        </Badge>
                        <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 shadow-sm">
                            {sites.length} Sites
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Technician Detail Drawer Content
function TechnicianDetailDrawer({ tech }: { tech: typeof mockTechnicians[0] }) {
    // Mock assigned jobs
    const assignedJobs = mockWorkOrders.filter(wo => wo.technician === tech.name);
    // Mock linked sites (can be from assigned jobs)
    const linkedSites = Array.from(new Set(assignedJobs.map(job => job.site)));

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
                        {tech.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                        <h3 className="text-lg font-black">{tech.name}</h3>
                        <p className="text-sm text-muted-foreground">{tech.region}</p>
                        <Badge className={cn("mt-2 border-none text-[10px] font-bold uppercase", techStatusColors[tech.status])}>
                            {techStatusLabels[tech.status]}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-1">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase">Call</span>
                </Button>
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 gap-1">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase">Email</span>
                </Button>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-3 w-3" />
                            Assigned Jobs
                        </h4>
                        <Badge variant="outline" className="text-[10px]">{assignedJobs.length}</Badge>
                    </div>
                    <div className="space-y-2">
                        {assignedJobs.length > 0 ? assignedJobs.map(job => (
                            <div key={job.id} className="p-3 rounded-lg border bg-white dark:bg-slate-950 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm">{job.task}</p>
                                    <p className="text-xs text-muted-foreground">{job.site}</p>
                                </div>
                                <Badge className={cn("border-none text-[9px] font-bold uppercase", statusColors[job.status])}>
                                    {job.status.replace("_", " ")}
                                </Badge>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground italic p-3 text-center border rounded-lg border-dashed">No active jobs assigned</p>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Map className="h-3 w-3" />
                        Linked Sites
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {linkedSites.length > 0 ? linkedSites.map(site => (
                            <Badge key={site} variant="secondary" className="px-3 py-1 flex items-center gap-1.5">
                                <Building2 className="h-3 w-3" />
                                {site}
                            </Badge>
                        )) : (
                            <p className="text-sm text-muted-foreground italic">No linked sites</p>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Schedule Summary
                    </h4>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Today's Start</span>
                            <span className="font-bold">08:30 AM</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Jobs Completed</span>
                            <span className="font-bold">2</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Est. Finish</span>
                            <span className="font-bold text-primary">05:30 PM</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t flex gap-3">
                <Button className="flex-1 font-bold text-xs uppercase tracking-widest h-10">
                    Edit technician
                </Button>
            </div>
        </div>
    );
}

// Work Order Detail Drawer Content
function WorkOrderDetailDrawer({ wo }: { wo: typeof mockWorkOrders[0] }) {
    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {wo.status === "completed" ? <CheckCircle2 className="h-6 w-6" /> : wo.priority === "urgent" ? <AlertCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-black">{wo.task}</h3>
                        <p className="text-sm text-muted-foreground">{wo.id}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                        <Badge className={cn("mt-1 border-none text-[10px] font-bold uppercase", statusColors[wo.status])}>
                            {wo.status.replace("_", " ")}
                        </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</p>
                        <Badge className={cn("mt-1 border-none text-[10px] font-bold uppercase", priorityColors[wo.priority])}>
                            {wo.priority}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Site</p>
                            <p className="text-sm font-medium">{wo.site}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Technician</p>
                            <p className="text-sm font-medium">{wo.technician}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ETA / Progress</p>
                            <p className="text-sm font-medium">{wo.eta}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t flex gap-3">
                <Button className="flex-1 font-bold text-xs uppercase tracking-widest h-10">
                    Update Progress
                </Button>
                <Button variant="outline" className="flex-1 font-bold text-xs uppercase tracking-widest h-10">
                    Reassign
                </Button>
            </div>
        </div>
    );
}

// Site Detail Drawer Content
function SiteDetailDrawer({ site }: { site: typeof mockSitesOnMap[0] }) {
    const relatedJobs = mockWorkOrders.filter(wo => wo.siteId === site.id);

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold">{site.name}</h3>
                        <p className="text-sm text-muted-foreground">{site.address}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Region</p>
                    <p className="font-medium text-sm mt-0.5">{site.region}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">BDM</p>
                    <p className="font-medium text-sm mt-0.5">{site.bdm}</p>
                </div>
            </div>

            {relatedJobs.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Active Work Orders</p>
                    <div className="space-y-2">
                        {relatedJobs.map(job => (
                            <div key={job.id} className="p-3 rounded-lg border flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm">{job.task}</p>
                                    <p className="text-xs text-muted-foreground">{job.technician}</p>
                                </div>
                                <Badge className={cn("border-none text-[10px] font-bold uppercase", priorityColors[job.priority])}>
                                    {job.priority}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" size="sm">
                    <Navigation className="h-4 w-4 mr-1.5" />
                    Get Directions
                </Button>
                <Button className="flex-1" size="sm">
                    View Site Details
                </Button>
            </div>
        </div>
    );
}

export default function FieldOpsPage() {
    const { openDrawer } = useDrawer();

    const handleSiteClick = (site: typeof mockSitesOnMap[0]) => {
        openDrawer({
            title: "Site Details",
            description: site.address,
            content: <SiteDetailDrawer site={site} />,
        });
    };

    const handleTechClick = (tech: typeof mockTechnicians[0]) => {
        openDrawer({
            title: "Technician Details",
            description: tech.region,
            content: <TechnicianDetailDrawer tech={tech} />,
        });
    };

    const handleWorkOrderClick = (wo: typeof mockWorkOrders[0]) => {
        openDrawer({
            title: "Work Order Details",
            description: wo.id,
            content: <WorkOrderDetailDrawer wo={wo} />,
        });
    };

    return (
        <>
            <Topbar title="Field Operations" subtitle="Real-time field visibility" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats */}
                <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Work Orders</p>
                            <p className="text-2xl font-black mt-1">{mockWorkOrders.filter(w => w.status !== "completed").length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Technicians</p>
                            <p className="text-2xl font-black mt-1">{mockTechnicians.filter(t => t.status === "active").length} / {mockTechnicians.length}</p>
                            <p className="text-[10px] text-muted-foreground">Active</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed Today</p>
                            <p className="text-2xl font-black mt-1">{mockWorkOrders.filter(w => w.status === "completed").length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Urgent Issues</p>
                            <p className="text-2xl font-black text-red-500 mt-1">{mockWorkOrders.filter(w => w.priority === "urgent").length}</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="map" className="space-y-4">
                    <TabsList className="bg-white dark:bg-slate-900 border">
                        <TabsTrigger value="map" className="text-xs font-bold uppercase tracking-wider">Map View</TabsTrigger>
                        <TabsTrigger value="workorders" className="text-xs font-bold uppercase tracking-wider">Work Orders</TabsTrigger>
                        <TabsTrigger value="technicians" className="text-xs font-bold uppercase tracking-wider">Technicians</TabsTrigger>
                    </TabsList>

                    <TabsContent value="map">
                        <StaticMapView sites={mockSitesOnMap} onSiteClick={handleSiteClick} />
                    </TabsContent>

                    <TabsContent value="workorders">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Active Work Orders</CardTitle>
                                <CardDescription>Real-time status of field operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockWorkOrders.map((wo) => (
                                        <div
                                            key={wo.id}
                                            className="group flex items-center gap-4 rounded-xl border p-4 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer"
                                            onClick={() => handleWorkOrderClick(wo)}
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                                                {wo.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : wo.priority === "urgent" ? <AlertCircle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm tracking-tight">{wo.task}</p>
                                                    <Badge className={cn("border-none text-[9px] font-bold uppercase", priorityColors[wo.priority])}>{wo.priority}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{wo.site}</span>
                                                    <span className="flex items-center gap-1 font-medium"><User className="h-3 w-3" />{wo.technician}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <Badge className={cn("border-none text-[9px] font-bold uppercase tracking-widest", statusColors[wo.status])}>{wo.status.replace("_", " ")}</Badge>
                                                <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {wo.eta}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="technicians">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-base font-medium">Field Technicians</CardTitle>
                                <CardDescription>Current status and real-time availability</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                                    {mockTechnicians.map((tech) => (
                                        <div
                                            key={tech.id}
                                            className="group flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer overflow-hidden text-left"
                                            onClick={() => handleTechClick(tech)}
                                        >
                                            <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {tech.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{tech.name}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                            <MapPin className="h-3 w-3" />
                                                            {tech.region}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className={cn("border-none text-[9px] font-bold uppercase tracking-tighter", techStatusColors[tech.status])}>
                                                    {techStatusLabels[tech.status]}
                                                </Badge>
                                            </div>

                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                                                            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase leading-none">Current Assignment</p>
                                                            <p className="text-xs font-medium mt-1 truncate">
                                                                {tech.currentJob ? `${tech.currentJob} - ${tech.currentSite}` : "Available for dispatch"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
