"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar, useDrawer, useModal } from "@/components/layout";
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
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    Plus,
    Upload,
    FileText,
    File,
    FolderKanban,
    PoundSterling,
    TrendingUp,
    Receipt,
    CreditCard,
    Clock,
    Download,
    Eye,
    ChevronRight,
    CheckCircle,
} from "lucide-react";

// Types
interface Account {
    id: string;
    name: string;
    type: string;
    status: string;
    totalProjects: number;
    revenue: number;
    location: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    createdAt: string;
}

interface Site {
    id: string;
    accountId: string;
    name: string;
    address: string;
    status: string;
    projectsCount: number;
}

interface Project {
    id: string;
    accountId: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    progress: number;
    manager: string;
}

interface Document {
    id: string;
    accountId: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: string;
    uploadedAt: string;
}

interface Activity {
    id: string;
    description: string;
    date: string;
    user: string;
}

// Mock Data
const mockAccounts: Record<string, Account> = {
    "ACC-001": { id: "ACC-001", name: "Johnson Roofing LLC", type: "commercial", status: "active", totalProjects: 12, revenue: 450000, location: "Austin, TX", contactName: "Mike Thompson", contactEmail: "mike@johnsonroofing.com", contactPhone: "07555 123 456", address: "123 Oak Street, Austin, TX 78701", createdAt: "2023-06-15" },
    "ACC-002": { id: "ACC-002", name: "Acme Construction", type: "enterprise", status: "active", totalProjects: 28, revenue: 1200000, location: "Dallas, TX", contactName: "Sarah Chen", contactEmail: "sarah@acme.com", contactPhone: "07555 234 567", address: "456 Main Avenue, Dallas, TX 75201", createdAt: "2023-04-10" },
};

const mockSites: Site[] = [
    { id: "SITE-001", accountId: "ACC-001", name: "Main Office", address: "123 Oak Street, Austin, TX 78701", status: "active", projectsCount: 5 },
    { id: "SITE-002", accountId: "ACC-001", name: "Warehouse Facility", address: "456 Industrial Blvd, Austin, TX 78702", status: "active", projectsCount: 3 },
    { id: "SITE-003", accountId: "ACC-001", name: "Branch Office - North", address: "789 North Ave, Round Rock, TX 78664", status: "active", projectsCount: 2 },
];

const mockProjects: Project[] = [
    { id: "P-2024-001", accountId: "ACC-001", name: "Roof Replacement - Main Office", status: "in_progress", budget: 45000, spent: 28000, progress: 62, manager: "John Doe" },
    { id: "P-2024-002", accountId: "ACC-001", name: "Warehouse Roof Inspection", status: "completed", budget: 5000, spent: 4800, progress: 100, manager: "Mike Johnson" },
    { id: "P-2024-003", accountId: "ACC-001", name: "Gutter System Upgrade", status: "planning", budget: 12000, spent: 0, progress: 10, manager: "Jane Smith" },
];

const mockDocuments: Document[] = [
    { id: "DOC-001", accountId: "ACC-001", name: "Service Agreement 2024", type: "contract", size: "2.4 MB", uploadedBy: "John Doe", uploadedAt: "2024-01-15" },
    { id: "DOC-002", accountId: "ACC-001", name: "Insurance Certificate", type: "certificate", size: "1.1 MB", uploadedBy: "Jane Smith", uploadedAt: "2024-01-10" },
    { id: "DOC-003", accountId: "ACC-001", name: "Invoice INV-2024-0045", type: "invoice", size: "156 KB", uploadedBy: "System", uploadedAt: "2024-01-28" },
];

const mockActivities: Activity[] = [
    { id: "1", description: "New project created: Roof Replacement - Main Office", date: "2024-01-15", user: "John Doe" },
    { id: "2", description: "Service Agreement 2024 uploaded", date: "2024-01-15", user: "John Doe" },
    { id: "3", description: "Payment received: £15,000", date: "2024-01-12", user: "System" },
    { id: "4", description: "New site added: Branch Office - North", date: "2024-01-05", user: "Jane Smith" },
];

const mockFinancials = {
    totalRevenue: 450000,
    invoiced: 320000,
    paid: 280000,
    outstanding: 40000,
    invoices: [
        { id: "INV-2024-0045", amount: 15000, status: "paid", date: "2024-01-28" },
        { id: "INV-2024-0032", amount: 25000, status: "pending", date: "2024-01-15" },
        { id: "INV-2024-0018", amount: 15000, status: "overdue", date: "2024-01-02" },
    ],
};

const statusStyles: Record<string, string> = {
    active: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    inactive: "bg-muted text-muted-foreground",
    on_hold: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

const typeStyles: Record<string, string> = {
    residential: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    commercial: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    enterprise: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
};

const projectStatusStyles: Record<string, string> = {
    planning: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    in_progress: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    on_hold: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

const invoiceStatusStyles: Record<string, string> = {
    paid: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    overdue: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
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
function StatCard({ title, value, description, icon: Icon, green }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    green?: boolean;
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
                <p className={`text-2xl font-bold ${green ? 'text-green-600' : ''}`}>{value}</p>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer } = useDrawer();
    const [activeTab, setActiveTab] = useState("overview");

    const account = mockAccounts[id] || mockAccounts["ACC-001"];
    const accountSites = mockSites.filter(s => s.accountId === account.id);
    const accountProjects = mockProjects.filter(p => p.accountId === account.id);
    const accountDocuments = mockDocuments.filter(d => d.accountId === account.id);

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

    return (
        <>
            <Topbar title="Account Management" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                <div className="mb-4">
                    <Link href="/accounts">
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground -ml-2">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Accounts
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-semibold leading-none">{account.name}</h1>
                                <Badge variant="secondary" className={`${statusStyles[account.status]} font-normal h-5`}>
                                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                </Badge>
                                <Badge variant="secondary" className={`${typeStyles[account.type]} font-normal h-5`}>
                                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {account.location}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Edit className="mr-1.5 h-4 w-4" />
                            Edit Account
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
                                    New Project
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Account
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left Column: Account Info (1/4) */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">General Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <InfoRow label="Primary Contact" value={account.contactName} icon={User} />
                                <InfoRow label="Email" value={account.contactEmail} icon={Mail} />
                                <InfoRow label="Phone" value={account.contactPhone} icon={Phone} />
                                <InfoRow label="Address" value={account.address} icon={MapPin} />
                                <InfoRow label="Member Since" value={formatDate(account.createdAt)} icon={Clock} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Stats Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Projects</span>
                                    <span className="font-semibold">{account.totalProjects}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Active Sites</span>
                                    <span className="font-semibold">{accountSites.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Revenue</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(account.revenue)}</span>
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
                                    value="sites"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Sites
                                </TabsTrigger>
                                <TabsTrigger
                                    value="projects"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Projects
                                </TabsTrigger>
                                <TabsTrigger
                                    value="documents"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium transition-none"
                                >
                                    Documents
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
                                    <StatCard title="Total Revenue" value={formatCurrency(account.revenue)} icon={TrendingUp} green />
                                    <StatCard title="Projects" value={account.totalProjects} icon={FolderKanban} />
                                    <StatCard title="Active Sites" value={accountSites.length} icon={MapPin} />
                                </div>

                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="relative space-y-0 pb-2">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[17px] top-2 h-[calc(100%-16px)] w-0.5 bg-muted" />

                                            {mockActivities.map((activity, index) => (
                                                <div key={activity.id} className="relative flex gap-4 pb-8 last:pb-0">
                                                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 pt-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium leading-none">{activity.description}</p>
                                                            <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1.5">
                                                            Actioned by <span className="font-medium text-foreground">{activity.user}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Sites Content */}
                            <TabsContent value="sites" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Associated Sites</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Add Site
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Site Name</TableHead>
                                                    <TableHead className="font-medium">Status</TableHead>
                                                    <TableHead className="font-medium">Projects</TableHead>
                                                    <TableHead className="font-medium">Address</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {accountSites.map((site) => (
                                                    <TableRow key={site.id} className="group">
                                                        <TableCell className="pl-6 font-medium text-sm">{site.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={`${statusStyles[site.status]} font-normal h-5`}>
                                                                {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium">{site.projectsCount}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{site.address}</TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Projects Content */}
                            <TabsContent value="projects" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Active Projects</CardTitle>
                                        <Button size="sm" className="h-8">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            New Project
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Project</TableHead>
                                                    <TableHead className="font-medium">Status</TableHead>
                                                    <TableHead className="font-medium">Budget</TableHead>
                                                    <TableHead className="font-medium">Progress</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {accountProjects.map((project) => (
                                                    <TableRow key={project.id} className="group">
                                                        <TableCell className="pl-6">
                                                            <Link href={`/projects/${project.id}`} className="font-medium text-sm hover:underline">
                                                                {project.name}
                                                            </Link>
                                                            <p className="text-[12px] text-muted-foreground mt-0.5">{project.manager}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={`${projectStatusStyles[project.status]} font-normal h-5`}>
                                                                {project.status.replace("_", " ").toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium">{formatCurrency(project.budget)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary"
                                                                        style={{ width: `${project.progress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-medium text-muted-foreground">{project.progress}%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                                <Link href={`/projects/${project.id}`}>
                                                                    <Eye className="h-4 w-4" />
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

                            {/* Documents Content */}
                            <TabsContent value="documents" className="mt-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Documents</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">
                                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                                            Upload
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Name</TableHead>
                                                    <TableHead className="font-medium">Type</TableHead>
                                                    <TableHead className="font-medium">Date</TableHead>
                                                    <TableHead className="font-medium">Size</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {accountDocuments.map((doc) => (
                                                    <TableRow key={doc.id} className="group">
                                                        <TableCell className="pl-6">
                                                            <div className="flex items-center gap-2">
                                                                <File className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium text-sm">{doc.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-normal text-[11px] h-5 px-1.5 uppercase">
                                                                {doc.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{formatDate(doc.uploadedAt)}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
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
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <StatCard title="Invoiced" value={formatCurrency(mockFinancials.invoiced)} icon={Receipt} />
                                    <StatCard title="Paid" value={formatCurrency(mockFinancials.paid)} icon={CheckCircle} green />
                                    <StatCard title="Outstanding" value={formatCurrency(mockFinancials.outstanding)} icon={CreditCard} />
                                    <StatCard title="Pending" value={formatCurrency(15000)} icon={Clock} />
                                </div>

                                <Card>
                                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
                                        <Button size="sm" variant="outline" className="h-8">View All</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="pl-6 font-medium">Invoice ID</TableHead>
                                                    <TableHead className="font-medium">Amount</TableHead>
                                                    <TableHead className="font-medium">Status</TableHead>
                                                    <TableHead className="font-medium">Date</TableHead>
                                                    <TableHead className="w-[44px] pr-6"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockFinancials.invoices.map((invoice) => (
                                                    <TableRow key={invoice.id} className="group">
                                                        <TableCell className="pl-6 font-medium text-sm">{invoice.id}</TableCell>
                                                        <TableCell className="text-sm font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={`${invoiceStatusStyles[invoice.status]} font-normal h-5`}>
                                                                {invoice.status.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{formatDate(invoice.date)}</TableCell>
                                                        <TableCell className="pr-6">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <FileText className="h-4 w-4" />
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
