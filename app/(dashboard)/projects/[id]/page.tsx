"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    FolderKanban,
    Calendar,
    User,
    Building2,
    Plus,
    CheckCircle2,
    Circle,
    Clock,
    ClipboardList,
    Users,
    Package,
    TrendingUp,
    Sun,
    Cloud,
    CloudRain,
    Download,
    Eye,
    ChevronRight,
    MapPin,
    Receipt,
} from "lucide-react";

// Types
interface Project {
    id: string;
    accountId: string;
    accountName: string;
    siteId: string;
    siteName: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    progress: number;
    startDate: string;
    endDate: string;
    manager: string;
    description: string;
}

interface JobSheet {
    id: string;
    projectId: string;
    date: string;
    engineer: string;
    hoursWorked: number;
    weather: string;
    description: string;
    materials: string;
    notes: string;
}

interface Engineer {
    id: string;
    projectId: string;
    name: string;
    role: string;
    hoursAllocated: number;
    hoursWorked: number;
    status: string;
    phone: string;
}

interface InventoryItem {
    id: string;
    projectId: string;
    item: string;
    quantity: number;
    unit: string;
    unitCost: number;
    status: string;
}

interface SignOffStage {
    id: string;
    name: string;
    status: string;
    completedBy?: string;
    completedAt?: string;
    notes?: string;
}

// Mock Data
const mockProjects: Record<string, Project> = {
    "P-2024-001": {
        id: "P-2024-001",
        accountId: "ACC-001",
        accountName: "Johnson Roofing LLC",
        siteId: "SITE-001",
        siteName: "Main Office",
        name: "Roof Replacement - Main Office",
        status: "in_progress",
        budget: 45000,
        spent: 28000,
        progress: 62,
        startDate: "2024-01-15",
        endDate: "2024-03-15",
        manager: "John Doe",
        description: "Complete roof replacement including underlayment, tiles, and guttering.",
    },
};

const mockJobSheets: JobSheet[] = [
    { id: "JS-001", projectId: "P-2024-001", date: "2024-01-28", engineer: "Mike Johnson", hoursWorked: 8, weather: "Clear", description: "Removed old tiles from west section. Inspected underlayment for damage.", materials: "None required", notes: "Found minor water damage in north corner." },
    { id: "JS-002", projectId: "P-2024-001", date: "2024-01-27", engineer: "Mike Johnson", hoursWorked: 7.5, weather: "Overcast", description: "Set up scaffolding. Delivered materials to site.", materials: "500 roof tiles", notes: "All checked." },
    { id: "JS-003", projectId: "P-2024-001", date: "2024-01-26", engineer: "David Brown", hoursWorked: 4, weather: "Light Rain", description: "Initial site survey and measurement.", materials: "None", notes: "Photos taken." },
];

const mockEngineers: Engineer[] = [
    { id: "ENG-001", projectId: "P-2024-001", name: "Mike Johnson", role: "Lead Roofer", hoursAllocated: 80, hoursWorked: 52, status: "active", phone: "07555 111 222" },
    { id: "ENG-002", projectId: "P-2024-001", name: "David Brown", role: "Roofer", hoursAllocated: 60, hoursWorked: 38, status: "active", phone: "07555 333 444" },
    { id: "ENG-003", projectId: "P-2024-001", name: "Tom Williams", role: "Apprentice", hoursAllocated: 40, hoursWorked: 20, status: "active", phone: "07555 555 666" },
];

const mockSignOffStages: SignOffStage[] = [
    { id: "1", name: "Site Survey", status: "completed", completedBy: "John Doe", completedAt: "2024-01-15", notes: "Site assessed and approved" },
    { id: "2", name: "Work Complete", status: "in_progress", notes: "Currently at 62% completion" },
    { id: "3", name: "QA Check", status: "pending" },
    { id: "4", name: "Client Sign-Off", status: "pending" },
    { id: "5", name: "Final Approval", status: "pending" },
];

const mockInventory: InventoryItem[] = [
    { id: "INV-001", projectId: "P-2024-001", item: "Clay Roof Tiles", quantity: 500, unit: "tiles", unitCost: 45, status: "delivered" },
    { id: "INV-002", projectId: "P-2024-001", item: "Underlayment Membrane", quantity: 150, unit: "m²", unitCost: 12, status: "delivered" },
    { id: "INV-004", projectId: "P-2024-001", item: "Scaffolding Hire", quantity: 2, unit: "weeks", unitCost: 850, status: "in_use" },
];

const mockFinancials = {
    budget: 45000,
    spent: 28000,
    remaining: 17000,
    labourCosts: 12000,
    materialCosts: 14500,
    invoices: [
        { id: "INV-P-001", description: "Deposit (50%)", amount: 22500, status: "paid", date: "2024-01-15" },
        { id: "INV-P-002", description: "Progress Payment", amount: 10000, status: "pending", date: "2024-02-01" },
    ],
};

const statusStyles: Record<string, string> = {
    planning: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    in_progress: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    on_hold: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

const inventoryStatusStyles: Record<string, string> = {
    ordered: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    delivered: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    in_use: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
};

const weatherIcons: Record<string, React.ElementType> = {
    Clear: Sun,
    Overcast: Cloud,
    "Light Rain": CloudRain,
};

// Info Row Component
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 border">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, description, icon: Icon, green, orange }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    green?: boolean;
    orange?: boolean;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <p className={`text-2xl font-bold ${green ? 'text-green-600' : orange ? 'text-orange-600' : ''}`}>{value}</p>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("overview");

    const project = mockProjects[id] || mockProjects["P-2024-001"];

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

    const handleDelete = () => {
        openConfirmation(
            "Delete Project",
            `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
            () => console.log("Deleted:", project.id)
        );
    };

    return (
        <>
            <Topbar title="Project Management" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                <div className="mb-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground -ml-2">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FolderKanban className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold leading-none">{project.name}</h1>
                                <Badge variant="secondary" className={`${statusStyles[project.status]} font-normal h-5`}>
                                    {project.status.replace("_", " ").toUpperCase()}
                                </Badge>
                                <span className="text-[12px] font-medium text-muted-foreground ml-1">{project.id}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />
                                {project.accountName}
                                <span className="mx-1.5 text-muted-foreground/30">•</span>
                                <MapPin className="h-3.5 w-3.5" />
                                {project.siteName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Edit className="mr-1.5 h-4 w-4" />
                            Edit Project
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Job Sheet
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    Assign Engineer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left Column: Project Info (1/4) */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">General Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <InfoRow label="Project Manager" value={project.manager} icon={User} />
                                <InfoRow label="Start Date" value={formatDate(project.startDate)} icon={Calendar} />
                                <InfoRow label="End Date" value={formatDate(project.endDate)} icon={Calendar} />
                                <InfoRow label="Budget" value={formatCurrency(project.budget)} icon={TrendingUp} />
                                <InfoRow label="Spent" value={formatCurrency(project.spent)} icon={Receipt} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Progress Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground">Completion</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Content + Tabs (3/4) */}
                    <div className="lg:col-span-3 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="job-sheets"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Job Sheets
                                </TabsTrigger>
                                <TabsTrigger
                                    value="engineers"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Engineers
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sign-off"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Sign-Off
                                </TabsTrigger>
                                <TabsTrigger
                                    value="inventory"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Inventory
                                </TabsTrigger>
                                <TabsTrigger
                                    value="financials"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Financials
                                </TabsTrigger>
                            </TabsList>

                            {/* Overview Content */}
                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <StatCard title="Total Budget" value={formatCurrency(project.budget)} icon={TrendingUp} />
                                    <StatCard title="Actual Spent" value={formatCurrency(project.spent)} icon={Receipt} orange />
                                    <StatCard title="Remaining" value={formatCurrency(project.budget - project.spent)} icon={CheckCircle2} green />
                                </div>

                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            {mockJobSheets.map((sheet) => (
                                                <div key={sheet.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background">
                                                        {weatherIcons[sheet.weather] ? (
                                                            <div className="h-4 w-4">
                                                                {(() => {
                                                                    const Icon = weatherIcons[sheet.weather];
                                                                    return <Icon className="h-4 w-4 text-muted-foreground" />;
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium truncate">{sheet.description}</p>
                                                            <span className="text-xs text-muted-foreground">{formatDate(sheet.date)}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Actioned by <span className="font-medium text-foreground">{sheet.engineer}</span> • {sheet.hoursWorked}h worked
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Job Sheets Content */}
                            <TabsContent value="job-sheets" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Daily Job Sheets</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Add Job Sheet
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Date</TableHead>
                                                    <TableHead className="font-medium">Engineer</TableHead>
                                                    <TableHead className="font-medium">Hours</TableHead>
                                                    <TableHead className="font-medium">Weather</TableHead>
                                                    <TableHead className="font-medium">Description</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockJobSheets.map((sheet) => (
                                                    <TableRow key={sheet.id} className="group">
                                                        <TableCell className="pl-6 font-medium text-sm">{formatDate(sheet.date)}</TableCell>
                                                        <TableCell className="text-sm">{sheet.engineer}</TableCell>
                                                        <TableCell className="text-sm font-medium">{sheet.hoursWorked}h</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{sheet.weather}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{sheet.description}</TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Engineers Content */}
                            <TabsContent value="engineers" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Team Allocation</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Assign Engineer
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Engineer</TableHead>
                                                    <TableHead className="font-medium">Role</TableHead>
                                                    <TableHead className="font-medium">Allocation</TableHead>
                                                    <TableHead className="font-medium">Worked</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockEngineers.map((engineer) => (
                                                    <TableRow key={engineer.id} className="group">
                                                        <TableCell className="pl-6">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                                                    {engineer.name.split(" ").map(n => n[0]).join("")}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm">{engineer.name}</p>
                                                                    <p className="text-[11px] text-muted-foreground">{engineer.phone}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm">{engineer.role}</TableCell>
                                                        <TableCell className="text-sm font-medium">{engineer.hoursAllocated}h</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary"
                                                                        style={{ width: `${(engineer.hoursWorked / engineer.hoursAllocated) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-medium text-muted-foreground">{engineer.hoursWorked}h</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Sign-Off Content */}
                            <TabsContent value="sign-off" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b">
                                        <CardTitle className="text-base font-medium">Sign-Off Workflow</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-8 px-10">
                                        <div className="relative space-y-0">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[17px] top-2 h-[calc(100%-16px)] w-0.5 bg-muted" />

                                            {mockSignOffStages.map((stage, index) => (
                                                <div key={stage.id} className="relative flex gap-6 pb-12 last:pb-0">
                                                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm z-10 
                                                        ${stage.status === "completed" ? "bg-green-600 border-green-600 text-white" :
                                                            stage.status === "in_progress" ? "bg-primary border-primary text-white" :
                                                                "bg-background text-muted-foreground"}`}
                                                    >
                                                        {stage.status === "completed" ? (
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        ) : stage.status === "in_progress" ? (
                                                            <Clock className="h-5 w-5" />
                                                        ) : (
                                                            <span className="text-sm font-bold">{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pt-0.5">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={`text-base font-semibold ${stage.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                                                                {stage.name}
                                                            </h4>
                                                            {stage.status === "in_progress" && (
                                                                <Button size="sm" className="h-8">Approve Stage</Button>
                                                            )}
                                                        </div>
                                                        {stage.completedBy && (
                                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                                Approved by <span className="font-medium text-foreground">{stage.completedBy}</span> on {formatDate(stage.completedAt || "")}
                                                            </p>
                                                        )}
                                                        {stage.notes && (
                                                            <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2.5 rounded-md border border-dashed">
                                                                {stage.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Inventory Content */}
                            <TabsContent value="inventory" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Project Materials</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Add Item
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Item Name</TableHead>
                                                    <TableHead className="font-medium">Quantity</TableHead>
                                                    <TableHead className="font-medium">Unit Cost</TableHead>
                                                    <TableHead className="font-medium">Status</TableHead>
                                                    <TableHead className="font-medium text-right">Total</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockInventory.map((item) => (
                                                    <TableRow key={item.id} className="group">
                                                        <TableCell className="pl-6 font-medium text-sm">{item.item}</TableCell>
                                                        <TableCell className="text-sm">{item.quantity} {item.unit}</TableCell>
                                                        <TableCell className="text-sm">{formatCurrency(item.unitCost)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={`${inventoryStatusStyles[item.status]} font-normal h-5`}>
                                                                {item.status.replace("_", " ").toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-sm">{formatCurrency(item.quantity * item.unitCost)}</TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Financials Content */}
                            <TabsContent value="financials" className="mt-6 space-y-6">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <StatCard title="Project Budget" value={formatCurrency(mockFinancials.budget)} icon={TrendingUp} />
                                    <StatCard title="Labour Costs" value={formatCurrency(mockFinancials.labourCosts)} icon={Users} orange />
                                    <StatCard title="Material Costs" value={formatCurrency(mockFinancials.materialCosts)} icon={Package} orange />
                                </div>

                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Project Invoices</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">View All</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Invoice ID</TableHead>
                                                    <TableHead className="font-medium">Description</TableHead>
                                                    <TableHead className="font-medium">Amount</TableHead>
                                                    <TableHead className="font-medium">Status</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockFinancials.invoices.map((invoice) => (
                                                    <TableRow key={invoice.id} className="group">
                                                        <TableCell className="pl-6 font-medium text-sm">{invoice.id}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{invoice.description}</TableCell>
                                                        <TableCell className="text-sm font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={`${invoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'} font-normal h-5`}>
                                                                {invoice.status.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Download className="h-4 w-4" />
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
