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
    FolderKanban,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    Trash2,
} from "lucide-react";

// Types
interface Project {
    id: string;
    name: string;
    customer: string;
    status: string;
    budget: number;
    progress: number;
    manager: string;
}

// Mock Data
const mockProjects: Project[] = [
    { id: "P-2024-001", name: "Oak Street Renovation", customer: "Johnson Roofing LLC", status: "in_progress", budget: 145000, progress: 65, manager: "John Doe" },
    { id: "P-2024-002", name: "Downtown Office Roof", customer: "Acme Construction", status: "planning", budget: 280000, progress: 15, manager: "Jane Smith" },
    { id: "P-2024-003", name: "Warehouse Complex", customer: "Premier Builders", status: "in_progress", budget: 520000, progress: 40, manager: "Mike Johnson" },
    { id: "P-2024-004", name: "Residential Development", customer: "Smith Residence", status: "completed", budget: 32000, progress: 100, manager: "John Doe" },
    { id: "P-2024-005", name: "Mall Renovation", customer: "Downtown Office Complex", status: "on_hold", budget: 750000, progress: 25, manager: "Jane Smith" },
];

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "planning", label: "Planning" },
    { value: "in_progress", label: "In Progress" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
];

const statusStyles: Record<string, string> = {
    planning: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    in_progress: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    completed: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    on_hold: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

// Empty State Component
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No projects found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">
                No projects match your current filters. Try adjusting your search or create a new project.
            </p>
        </div>
    );
}

// Create Project Form Component
function CreateProjectForm() {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="e.g., Roof Replacement - Main Office" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="customer">Customer <span className="text-destructive">*</span></Label>
                <Select>
                    <SelectTrigger id="customer">
                        <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Johnson Roofing LLC</SelectItem>
                        <SelectItem value="2">Acme Construction</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="budget">Budget (GBP)</Label>
                    <Input id="budget" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="manager">Project Manager</Label>
                    <Select>
                        <SelectTrigger id="manager">
                            <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jd">John Doe</SelectItem>
                            <SelectItem value="js">Jane Smith</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <textarea
                    id="desc"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Project details..."
                />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button>Create Project</Button>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, trend, color }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: { label: string; up: boolean };
    color?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className={`text-2xl font-semibold mt-1.5 ${color || ''}`}>{value}</p>
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

export default function ProjectsPage() {
    const { openDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter projects
    const filteredProjects = useMemo(() => {
        return mockProjects.filter((project) => {
            const matchesSearch =
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || project.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    // Handlers
    const handleCreateProject = () => {
        openDrawer({
            title: "Create New Project",
            content: <CreateProjectForm />,
            description: "Start a new project for a customer"
        });
    };

    const handleDelete = (project: Project) => {
        openConfirmation(
            "Delete Project",
            `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
            () => console.log("Deleted:", project.id)
        );
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
    const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0);
    const inProgressCount = mockProjects.filter(p => p.status === "in_progress").length;
    const completedCount = mockProjects.filter(p => p.status === "completed").length;

    return (
        <>
            <Topbar title="Projects" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Projects" value={mockProjects.length} icon={FolderKanban} />
                    <StatCard title="In Progress" value={inProgressCount} icon={Clock} color="text-purple-600" />
                    <StatCard title="Completed" value={completedCount} icon={CheckCircle2} color="text-green-600" />
                    <StatCard title="Total Budget" value={formatCurrency(totalBudget)} icon={TrendingUp} trend={{ label: "+5.4%", up: true }} />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    <Button onClick={handleCreateProject} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                {/* Projects Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">All Projects</CardTitle>
                            <span className="text-sm text-muted-foreground">{filteredProjects.length} projects</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredProjects.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Project</TableHead>
                                            <TableHead className="font-medium">Customer</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium text-right">Budget</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Progress</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Manager</TableHead>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProjects.map((project) => (
                                            <TableRow key={project.id} className="group">
                                                <TableCell>
                                                    <Link
                                                        href={`/projects/${project.id}`}
                                                        className="font-medium text-sm hover:underline"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    <p className="text-[12px] text-muted-foreground mt-0.5">
                                                        {project.id}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {project.customer}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`${statusStyles[project.status]} font-normal`}>
                                                        {project.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-sm">
                                                    {formatCurrency(project.budget)}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all"
                                                                style={{ width: `${project.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-medium text-muted-foreground">{project.progress}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                    {project.manager}
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
                                                                <Link href={`/projects/${project.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Add Job Sheet
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(project)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Project
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
