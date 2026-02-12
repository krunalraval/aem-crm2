"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    ArrowUpDown,
    Upload,
    FileJson,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

// Types matching lib/types.ts
type CompanyType = "Main Contractor" | "Subcontractor" | "Both" | "Other";
type CompanyIndustry = "Construction" | "Commercial" | "Residential" | "Other";
type CompanyStatus = "Prospect" | "Active Customer" | "Inactive" | "Archived";

interface Company {
    id: string;
    companyName: string;
    companyType: CompanyType;
    industry: CompanyIndustry;
    accountOwnerBdmId: string;
    accountOwnerBdmName: string;
    status: CompanyStatus;
    domain?: string;
    phone?: string;
    registeredAddress?: string;
    registrationNumber?: string;
    notes?: string;
    activeSitesCount: number;
    totalRevenue: number;
    createdAt: string;
}

// Mock BDM Users
const mockBdmUsers = [
    { id: "BDM-001", name: "John Smith" },
    { id: "BDM-002", name: "Sarah Chen" },
    { id: "BDM-003", name: "Mike Johnson" },
    { id: "BDM-004", name: "Lisa Park" },
];

// Mock Data
const mockCompanies: Company[] = [
    { id: "COMP-001", companyName: "Johnson Roofing LLC", companyType: "Main Contractor", industry: "Construction", accountOwnerBdmId: "BDM-001", accountOwnerBdmName: "John Smith", status: "Active Customer", domain: "johnsonroofing.com", phone: "07555 123 456", registeredAddress: "123 Oak Street, Austin, TX 78701", activeSitesCount: 5, totalRevenue: 450000, createdAt: "2023-06-15" },
    { id: "COMP-002", companyName: "Acme Construction", companyType: "Main Contractor", industry: "Commercial", accountOwnerBdmId: "BDM-002", accountOwnerBdmName: "Sarah Chen", status: "Active Customer", domain: "acme.com", phone: "07555 234 567", registeredAddress: "456 Main Avenue, Dallas, TX 75201", activeSitesCount: 12, totalRevenue: 1200000, createdAt: "2023-04-10" },
    { id: "COMP-003", companyName: "Premier Builders", companyType: "Subcontractor", industry: "Construction", accountOwnerBdmId: "BDM-003", accountOwnerBdmName: "Mike Johnson", status: "Active Customer", domain: "premierbuilders.com", phone: "07555 345 678", registeredAddress: "789 Pine Boulevard, Houston, TX 77001", activeSitesCount: 8, totalRevenue: 780000, createdAt: "2023-08-22" },
    { id: "COMP-004", companyName: "Smith Residence Ltd", companyType: "Other", industry: "Residential", accountOwnerBdmId: "BDM-001", accountOwnerBdmName: "John Smith", status: "Inactive", phone: "07555 456 789", registeredAddress: "555 Cedar Lane, San Antonio, TX 78201", activeSitesCount: 0, totalRevenue: 32000, createdAt: "2023-11-05" },
    { id: "COMP-005", companyName: "Downtown Office Complex", companyType: "Main Contractor", industry: "Commercial", accountOwnerBdmId: "BDM-004", accountOwnerBdmName: "Lisa Park", status: "Active Customer", domain: "downtownoffice.com", phone: "07555 567 890", registeredAddress: "321 Elm Street, Austin, TX 78702", activeSitesCount: 15, totalRevenue: 2500000, createdAt: "2022-12-01" },
    { id: "COMP-006", companyName: "Greenfield Estates", companyType: "Subcontractor", industry: "Residential", accountOwnerBdmId: "BDM-002", accountOwnerBdmName: "Sarah Chen", status: "Prospect", domain: "greenfield.com", phone: "07555 678 901", registeredAddress: "222 Willow Drive, Fort Worth, TX 76101", activeSitesCount: 0, totalRevenue: 0, createdAt: "2024-01-10" },
    { id: "COMP-007", companyName: "Metro Apartments Ltd", companyType: "Both", industry: "Commercial", accountOwnerBdmId: "BDM-003", accountOwnerBdmName: "Mike Johnson", status: "Prospect", domain: "metro.com", phone: "07555 789 012", registeredAddress: "888 Tower Road, Dallas, TX 75202", activeSitesCount: 0, totalRevenue: 0, createdAt: "2024-01-15" },
    { id: "COMP-008", companyName: "Sunrise Commercial", companyType: "Main Contractor", industry: "Construction", accountOwnerBdmId: "BDM-004", accountOwnerBdmName: "Lisa Park", status: "Active Customer", domain: "sunrise.com", phone: "07555 890 123", registeredAddress: "444 Business Park, Houston, TX 77002", activeSitesCount: 3, totalRevenue: 67000, createdAt: "2024-01-05" },
    { id: "COMP-009", companyName: "Heritage Properties", companyType: "Other", industry: "Residential", accountOwnerBdmId: "BDM-001", accountOwnerBdmName: "John Smith", status: "Archived", phone: "07555 901 234", registeredAddress: "100 Historic Lane, Austin, TX 78703", activeSitesCount: 0, totalRevenue: 150000, createdAt: "2021-06-01" },
    { id: "COMP-010", companyName: "BuildRight Inc", companyType: "Main Contractor", industry: "Construction", accountOwnerBdmId: "BDM-002", accountOwnerBdmName: "Sarah Chen", status: "Active Customer", domain: "buildright.com", phone: "07555 012 345", registeredAddress: "500 Industry Way, Dallas, TX 75203", activeSitesCount: 7, totalRevenue: 890000, createdAt: "2023-03-15" },
    { id: "COMP-011", companyName: "ABC Contractors", companyType: "Subcontractor", industry: "Commercial", accountOwnerBdmId: "BDM-003", accountOwnerBdmName: "Mike Johnson", status: "Active Customer", domain: "abccontract.com", phone: "07555 111 222", registeredAddress: "600 Contract Blvd, Houston, TX 77003", activeSitesCount: 4, totalRevenue: 340000, createdAt: "2023-05-20" },
    { id: "COMP-012", companyName: "Reliable Roofing", companyType: "Main Contractor", industry: "Construction", accountOwnerBdmId: "BDM-004", accountOwnerBdmName: "Lisa Park", status: "Prospect", domain: "reliableroofing.com", phone: "07555 222 333", registeredAddress: "700 Reliable Street, Austin, TX 78704", activeSitesCount: 0, totalRevenue: 0, createdAt: "2024-01-20" },
];

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Prospect", label: "Prospect" },
    { value: "Active Customer", label: "Active Customer" },
    { value: "Inactive", label: "Inactive" },
    { value: "Archived", label: "Archived" },
];

const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "Main Contractor", label: "Main Contractor" },
    { value: "Subcontractor", label: "Subcontractor" },
    { value: "Both", label: "Both" },
    { value: "Other", label: "Other" },
];

const industryOptions = [
    { value: "all", label: "All Industries" },
    { value: "Construction", label: "Construction" },
    { value: "Commercial", label: "Commercial" },
    { value: "Residential", label: "Residential" },
    { value: "Other", label: "Other" },
];

const bdmOptions = [
    { value: "all", label: "All BDMs" },
    ...mockBdmUsers.map(u => ({ value: u.id, label: u.name })),
];

const statusStyles: Record<CompanyStatus, string> = {
    "Prospect": STATUS_COLORS.semantic.info,
    "Active Customer": STATUS_COLORS.semantic.active,
    "Inactive": STATUS_COLORS.semantic.draft,
    "Archived": STATUS_COLORS.semantic.draft,
};

const typeStyles: Record<CompanyType, string> = {
    "Main Contractor": STATUS_COLORS.semantic.special,
    "Subcontractor": STATUS_COLORS.pipeline.negotiation,
    "Both": STATUS_COLORS.pipeline.site_visit_booked,
    "Other": STATUS_COLORS.semantic.draft,
};

// Empty State Component
function EmptyState() {
    return (
        <SharedEmptyState
            icon={Building2}
            title="No companies found"
            description="No companies match your current filters. Try adjusting your search or add a new company."
            actionLabel="Add Company"
            onAction={() => document.getElementById('add-company-btn')?.click()}
        />
    );
}

// Create Company Form Component
export function CreateCompanyForm({ onClose }: { onClose?: () => void }) {
    const [companyName, setCompanyName] = useState("");
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

    const checkDuplicate = () => {
        if (!companyName.trim()) {
            setDuplicateWarning(null);
            return;
        }
        const similar = mockCompanies.find(c =>
            c.companyName.toLowerCase().includes(companyName.toLowerCase()) ||
            companyName.toLowerCase().includes(c.companyName.toLowerCase())
        );
        if (similar) {
            setDuplicateWarning(similar.companyName);
        } else {
            setDuplicateWarning(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onBlur={checkDuplicate}
                />
                {duplicateWarning && (
                    <Alert className="mt-2 border-amber-200 bg-amber-50 text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            A company with a similar name already exists: <strong>{duplicateWarning}</strong>. Are you sure you want to create a new one?
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="type">Company Type <span className="text-destructive">*</span></Label>
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
                    <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
                    <Select>
                        <SelectTrigger id="industry">
                            <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                            {industryOptions.filter(i => i.value !== "all").map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="bdm">Business Development Manager <span className="text-destructive">*</span></Label>
                    <Select>
                        <SelectTrigger id="bdm">
                            <SelectValue placeholder="Select BDM" />
                        </SelectTrigger>
                        <SelectContent>
                            {mockBdmUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
                    <Select defaultValue="Prospect">
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="domain">Company Domain/Website</Label>
                    <Input id="domain" placeholder="www.company.com" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Company Phone</Label>
                    <Input id="phone" placeholder="07XXX XXXXXX" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="address">Registered Address</Label>
                <Textarea id="address" placeholder="Full registered address" rows={2} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="regNumber">Company Registration Number</Label>
                <Input id="regNumber" placeholder="Registration number" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Save Company</Button>
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
        <Card className="border-none shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                        <p className="text-2xl font-black mt-2">{value}</p>
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
                                <span className={`text-[12px] font-medium ${trend.up ? 'text-green-600' : 'text-amber-600'}`}>
                                    {trend.label}
                                </span>
                                <ArrowUpRight className={`h-3 w-3 ${trend.up ? 'text-green-600' : 'text-amber-600'}`} />
                            </div>
                        )}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AccountsPage() {
    const router = useRouter();
    const { openDrawer, closeDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [industryFilter, setIndustryFilter] = useState("all");
    const [bdmFilter, setBdmFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof Company>("companyName");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const itemsPerPage = 10;

    // Filter and sort companies
    const filteredCompanies = useMemo(() => {
        let result = mockCompanies.filter((company) => {
            const matchesSearch =
                company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.accountOwnerBdmName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || company.status === statusFilter;
            const matchesType = typeFilter === "all" || company.companyType === typeFilter;
            const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;
            const matchesBdm = bdmFilter === "all" || company.accountOwnerBdmId === bdmFilter;
            return matchesSearch && matchesStatus && matchesType && matchesIndustry && matchesBdm;
        });

        // Sort
        result.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });

        return result;
    }, [searchQuery, statusFilter, typeFilter, industryFilter, bdmFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const paginatedCompanies = filteredCompanies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleCreateCompany = () => {
        openDrawer({
            title: "Add New Company",
            content: <CreateCompanyForm onClose={closeDrawer} />,
            description: "Create a new company record"
        });
    };

    const handleDelete = (company: Company) => {
        openConfirmation(
            "Delete Company",
            `Are you sure you want to delete "${company.companyName}"? This will also remove all associated sites and contacts.`,
            () => console.log("Deleted:", company.id)
        );
    };

    const handleSort = (field: keyof Company) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    // Calculate totals
    const totalRevenue = mockCompanies.reduce((sum, a) => sum + a.totalRevenue, 0);
    const totalSites = mockCompanies.reduce((sum, a) => sum + a.activeSitesCount, 0);
    const activeCustomers = mockCompanies.filter(a => a.status === "Active Customer").length;

    const SortableHeader = ({ field, children }: { field: keyof Company; children: React.ReactNode }) => (
        <TableHead
            className="font-medium cursor-pointer hover:bg-muted/50 select-none"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            </div>
        </TableHead>
    );

    return (
        <>
            <Topbar title="Companies" subtitle="Manage company accounts" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Companies" value={mockCompanies.length} icon={Building2} />
                    <StatCard title="Active Customers" value={activeCustomers} icon={Globe} />
                    <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={Briefcase} trend={{ label: "+8.2%", up: true }} />
                    <StatCard title="Total Sites" value={totalSites} icon={MapPin} />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search companies..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[150px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs font-bold uppercase">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[150px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs font-bold uppercase">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                {industryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs font-bold uppercase">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={bdmFilter} onValueChange={(v) => { setBdmFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="BDM" />
                            </SelectTrigger>
                            <SelectContent>
                                {bdmOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs font-bold uppercase">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95 text-muted-foreground border-dashed">
                        <Upload className="mr-1.5 h-4 w-4" />
                        Import
                    </Button>
                    <Button id="add-company-btn" onClick={handleCreateCompany} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Company
                    </Button>
                </div>

                {/* Companies Table */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">All Companies</CardTitle>
                            <span className="text-xs text-muted-foreground">{filteredCompanies.length} companies</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {paginatedCompanies.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <SortableHeader field="companyName">Company Name</SortableHeader>
                                            <TableHead className="font-medium hidden md:table-cell">Type</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Industry</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Primary BDM</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <SortableHeader field="activeSitesCount">Sites</SortableHeader>
                                            <SortableHeader field="totalRevenue">Revenue</SortableHeader>
                                            <SortableHeader field="createdAt">Created</SortableHeader>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedCompanies.map((company) => (
                                            <TableRow
                                                key={company.id}
                                                className="group cursor-pointer hover:bg-primary/[0.02] border-slate-50"
                                                onClick={() => router.push(`/accounts/${company.id}`)}
                                            >
                                                <TableCell className="pl-6">
                                                    <span className="font-bold text-sm">{company.companyName}</span>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{company.id}</p>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary" className={cn("border-none font-bold text-[10px] uppercase", typeStyles[company.companyType])}>
                                                        {company.companyType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-sm">{company.industry}</TableCell>
                                                <TableCell className="hidden lg:table-cell text-sm">{company.accountOwnerBdmName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={cn("border-none font-bold text-[10px] uppercase", statusStyles[company.status])}>
                                                        {company.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-sm">{company.activeSitesCount}</TableCell>
                                                <TableCell className="font-medium text-sm">{formatCurrency(company.totalRevenue)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(company.createdAt)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                                                                <Link href={`/accounts/${company.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Company
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(company); }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Company
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t px-6 py-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "ghost"}
                                                        size="sm"
                                                        className="h-8 w-8"
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState />
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
