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
    Pencil,
    Trash2,
    Building2,
    MapPin,
    ArrowUpRight,
    Briefcase,
    Globe,
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

// Mock Data
const mockAccounts: Account[] = [
    { id: "ACC-001", name: "Johnson Roofing LLC", type: "commercial", status: "active", totalProjects: 12, revenue: 450000, location: "Austin, TX", contactName: "Mike Thompson", contactEmail: "mike@johnsonroofing.com", contactPhone: "07555 123 456", address: "123 Oak Street, Austin, TX 78701", createdAt: "2023-06-15" },
    { id: "ACC-002", name: "Acme Construction", type: "enterprise", status: "active", totalProjects: 28, revenue: 1200000, location: "Dallas, TX", contactName: "Sarah Chen", contactEmail: "sarah@acme.com", contactPhone: "07555 234 567", address: "456 Main Avenue, Dallas, TX 75201", createdAt: "2023-04-10" },
    { id: "ACC-003", name: "Premier Builders", type: "commercial", status: "active", totalProjects: 15, revenue: 780000, location: "Houston, TX", contactName: "Tom Williams", contactEmail: "tom@premierbuilders.com", contactPhone: "07555 345 678", address: "789 Pine Boulevard, Houston, TX 77001", createdAt: "2023-08-22" },
    { id: "ACC-004", name: "Smith Residence", type: "residential", status: "inactive", totalProjects: 1, revenue: 32000, location: "San Antonio, TX", contactName: "John Smith", contactEmail: "john.smith@email.com", contactPhone: "07555 456 789", address: "555 Cedar Lane, San Antonio, TX 78201", createdAt: "2023-11-05" },
    { id: "ACC-005", name: "Downtown Office Complex", type: "enterprise", status: "active", totalProjects: 45, revenue: 2500000, location: "Austin, TX", contactName: "James Wilson", contactEmail: "jwilson@downtownoffice.com", contactPhone: "07555 567 890", address: "321 Elm Street, Austin, TX 78702", createdAt: "2022-12-01" },
    { id: "ACC-006", name: "Greenfield Estates", type: "residential", status: "active", totalProjects: 8, revenue: 185000, location: "Fort Worth, TX", contactName: "Lisa Park", contactEmail: "lisa@greenfield.com", contactPhone: "07555 678 901", address: "222 Willow Drive, Fort Worth, TX 76101", createdAt: "2023-09-18" },
    { id: "ACC-007", name: "Metro Apartments", type: "commercial", status: "on_hold", totalProjects: 5, revenue: 95000, location: "Dallas, TX", contactName: "David Brown", contactEmail: "dbrown@metro.com", contactPhone: "07555 789 012", address: "888 Tower Road, Dallas, TX 75202", createdAt: "2023-07-30" },
    { id: "ACC-008", name: "Sunrise Commercial", type: "commercial", status: "active", totalProjects: 3, revenue: 67000, location: "Houston, TX", contactName: "Rachel Green", contactEmail: "rgreen@sunrise.com", contactPhone: "07555 890 123", address: "444 Business Park, Houston, TX 77002", createdAt: "2024-01-10" },
];

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on_hold", label: "On Hold" },
];

const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "enterprise", label: "Enterprise" },
];

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

// Empty State Component
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No accounts found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">
                No accounts match your current filters. Try adjusting your search or create a new account.
            </p>
        </div>
    );
}

// Create Account Form Component
function CreateAccountForm() {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="name">Company Name <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="Enter company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="type">Account Type <span className="text-destructive">*</span></Label>
                    <Select>
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.filter(t => t.value !== "all").map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="active">
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.filter(s => s.value !== "all").map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="contact">Primary Contact <span className="text-destructive">*</span></Label>
                <Input id="contact" placeholder="Contact name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@company.com" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="07XXX XXXXXX" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Street address" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">Cancel</Button>
                <Button>Create Account</Button>
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
                                <ArrowUpRight className={`h-3 w-3 ${trend.up ? 'text-green-600' : 'text-amber-600'}`} />
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

export default function AccountsPage() {
    const { openDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    // Filter accounts
    const filteredAccounts = useMemo(() => {
        return mockAccounts.filter((account) => {
            const matchesSearch =
                account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || account.status === statusFilter;
            const matchesType = typeFilter === "all" || account.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [searchQuery, statusFilter, typeFilter]);

    // Handlers
    const handleCreateAccount = () => {
        openDrawer({
            title: "Create New Account",
            content: <CreateAccountForm />,
            description: "Add a new customer account"
        });
    };

    const handleDelete = (account: Account) => {
        openConfirmation(
            "Delete Account",
            `Are you sure you want to delete "${account.name}"? This will also remove all associated sites and projects.`,
            () => console.log("Deleted:", account.id)
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
    const totalRevenue = mockAccounts.reduce((sum, a) => sum + a.revenue, 0);
    const totalProjects = mockAccounts.reduce((sum, a) => sum + a.totalProjects, 0);
    const activeAccounts = mockAccounts.filter(a => a.status === "active").length;

    return (
        <>
            <Topbar title="Accounts" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Accounts" value={mockAccounts.length} icon={Building2} />
                    <StatCard title="Active Accounts" value={activeAccounts} icon={Globe} />
                    <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={Briefcase} trend={{ label: "+8.2%", up: true }} />
                    <StatCard title="Total Projects" value={totalProjects} icon={Plus} />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search accounts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    <Button onClick={handleCreateAccount} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Create Account
                    </Button>
                </div>

                {/* Accounts Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">All Accounts</CardTitle>
                            <span className="text-sm text-muted-foreground">{filteredAccounts.length} accounts</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredAccounts.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Account Name</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Type</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Projects</TableHead>
                                            <TableHead className="font-medium text-right">Revenue</TableHead>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAccounts.map((account) => (
                                            <TableRow key={account.id} className="group">
                                                <TableCell>
                                                    <Link
                                                        href={`/accounts/${account.id}`}
                                                        className="font-medium text-sm hover:underline"
                                                    >
                                                        {account.name}
                                                    </Link>
                                                    <p className="text-[12px] text-muted-foreground mt-0.5">
                                                        {account.contactName}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary" className={`${typeStyles[account.type]} font-normal`}>
                                                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`${statusStyles[account.status]} font-normal`}>
                                                        {account.status === "on_hold" ? "On Hold" : account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell font-medium text-sm">
                                                    {account.totalProjects}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-sm">
                                                    {formatCurrency(account.revenue)}
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
                                                                <Link href={`/accounts/${account.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Account
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(account)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Account
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
