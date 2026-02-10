"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar, useDrawer, useModal } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    PoundSterling,
    TrendingUp,
    Receipt,
    CreditCard,
    Clock,
    Eye,
    ChevronRight,
    FileText,
    Users,
    Globe,
    Calendar,
    MessageSquare,
    PhoneCall,
    Send,
    AlertCircle,
    HardHat,
    CheckCircle2,
    Filter,
    ChevronLeft,
} from "lucide-react";
import { ActivityTimeline, Activity as ActivityInterface } from "@/components/activity/activity-timeline";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

// Types
type CompanyStatus = "Prospect" | "Active Customer" | "Inactive" | "Archived";
type SiteStatus = "Lead/Prospect" | "Quote Sent" | "Contract Signed" | "Pending Install" | "Active" | "Under Service" | "Decommissioned" | "Archived";
type RegionStatus = "Active" | "Dormant" | "Not Yet Approached";

interface Company {
    id: string;
    companyName: string;
    companyType: string;
    industry: string;
    accountOwnerBdmId: string;
    accountOwnerBdmName: string;
    status: CompanyStatus;
    domain?: string;
    phone?: string;
    registeredAddress?: string;
    createdAt: string;
}

interface Site {
    id: string;
    siteName: string;
    fullAddress: string;
    siteStatus: SiteStatus;
    systemType: string;
    assignedBdmName: string;
    installationDate?: string;
    totalContractValue: number;
}

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    email: string;
    mobilePhone?: string;
    preferredCommunication: string;
    regionName?: string;
    associatedSitesCount: number;
}

interface Region {
    id: string;
    regionName: string;
    regionOwnerBdmName: string;
    status: RegionStatus;
    contactsCount: number;
}

interface Activity {
    id: string;
    activityType: string;
    description: string;
    dateTime: string;
    performedByName: string;
}

interface Quote {
    id: string;
    quoteReference: string;
    contactName: string;
    totalValue: number;
    quoteStatus: string;
    dateSent?: string;
    bdmName: string;
}

// Mock BDM Users
const mockBdmUsers = [
    { id: "BDM-001", name: "John Smith" },
    { id: "BDM-002", name: "Sarah Chen" },
    { id: "BDM-003", name: "Mike Johnson" },
    { id: "BDM-004", name: "Lisa Park" },
];

// Mock Data
const mockCompanies: Record<string, Company> = {
    "COMP-001": { id: "COMP-001", companyName: "Johnson Roofing LLC", companyType: "Main Contractor", industry: "Construction", accountOwnerBdmId: "BDM-001", accountOwnerBdmName: "John Smith", status: "Active Customer", domain: "johnsonroofing.com", phone: "07555 123 456", registeredAddress: "123 Oak Street, Austin, TX 78701", createdAt: "2023-06-15" },
    "COMP-002": { id: "COMP-002", companyName: "Acme Construction", companyType: "Main Contractor", industry: "Commercial", accountOwnerBdmId: "BDM-002", accountOwnerBdmName: "Sarah Chen", status: "Active Customer", domain: "acme.com", phone: "07555 234 567", registeredAddress: "456 Main Avenue, Dallas, TX 75201", createdAt: "2023-04-10" },
};

const mockSites: Site[] = [
    { id: "SITE-001", siteName: "Main Office", fullAddress: "123 Oak Street, Austin, TX 78701", siteStatus: "Active", systemType: "Hardwired CCTV", assignedBdmName: "John Smith", installationDate: "2023-06-20", totalContractValue: 45000 },
    { id: "SITE-002", siteName: "Warehouse Facility", fullAddress: "456 Industrial Blvd, Austin, TX 78702", siteStatus: "Active", systemType: "Wireless CCTV (Ajax)", assignedBdmName: "John Smith", installationDate: "2023-08-15", totalContractValue: 32000 },
    { id: "SITE-003", siteName: "Branch Office - North", fullAddress: "789 North Ave, Round Rock, TX 78664", siteStatus: "Pending Install", systemType: "Tower System", assignedBdmName: "Mike Johnson", totalContractValue: 28000 },
    { id: "SITE-004", siteName: "Distribution Center", fullAddress: "321 Logistics Way, Austin, TX 78703", siteStatus: "Quote Sent", systemType: "Mixed", assignedBdmName: "John Smith", totalContractValue: 55000 },
];

const mockContacts: Contact[] = [
    { id: "CONT-001", firstName: "Mike", lastName: "Thompson", jobTitle: "Operations Director", email: "mike@johnsonroofing.com", mobilePhone: "07555 111 222", preferredCommunication: "Email", regionName: "Austin", associatedSitesCount: 3 },
    { id: "CONT-002", firstName: "Rachel", lastName: "Green", jobTitle: "Site Manager", email: "rachel@johnsonroofing.com", mobilePhone: "07555 222 333", preferredCommunication: "Phone", regionName: "Austin", associatedSitesCount: 1 },
    { id: "CONT-003", firstName: "David", lastName: "Brown", jobTitle: "Finance Manager", email: "david@johnsonroofing.com", mobilePhone: "07555 333 444", preferredCommunication: "Email", associatedSitesCount: 0 },
];

const mockRegions: Region[] = [
    { id: "REG-001", regionName: "Austin Metro", regionOwnerBdmName: "John Smith", status: "Active", contactsCount: 5 },
    { id: "REG-002", regionName: "North Texas", regionOwnerBdmName: "Sarah Chen", status: "Active", contactsCount: 3 },
    { id: "REG-003", regionName: "Hill Country", regionOwnerBdmName: "Mike Johnson", status: "Dormant", contactsCount: 1 },
];

const mockActivitiesData: ActivityInterface[] = [
    { id: "ACT-001", type: "call", description: "Follow-up call regarding warehouse installation", userName: "John Smith", timestamp: "2024-01-28 14:30" },
    { id: "ACT-002", type: "email_sent", description: "Sent quote for Distribution Center project", userName: "John Smith", timestamp: "2024-01-27 10:15" },
    { id: "ACT-003", type: "site_visit", description: "Site assessment at Branch Office - North", userName: "Mike Johnson", timestamp: "2024-01-25 09:00" },
    { id: "ACT-004", type: "meeting", description: "Contract negotiation meeting with Mike Thompson", userName: "John Smith", timestamp: "2024-01-22 11:00" },
    { id: "ACT-005", type: "quote_sent", description: "K2S-Q-0045 sent to Mike Thompson", userName: "John Smith", timestamp: "2024-01-20 15:45" },
    { id: "ACT-006", type: "note", description: "Client interested in expanding to 3 more sites in Q2", userName: "Sarah Chen", timestamp: "2024-01-18 16:00" },
];

const mockQuotes: Quote[] = [
    { id: "QUOTE-001", quoteReference: "K2S-Q-0045", contactName: "Mike Thompson", totalValue: 55000, quoteStatus: "Sent", dateSent: "2024-01-20", bdmName: "John Smith" },
    { id: "QUOTE-002", quoteReference: "K2S-Q-0038", contactName: "Rachel Green", totalValue: 28000, quoteStatus: "Accepted", dateSent: "2024-01-10", bdmName: "Mike Johnson" },
    { id: "QUOTE-003", quoteReference: "K2S-Q-0032", contactName: "Mike Thompson", totalValue: 32000, quoteStatus: "Accepted", dateSent: "2023-12-15", bdmName: "John Smith" },
];

const siteStatusStyles: Record<string, string> = {
    "Lead/Prospect": STATUS_COLORS.pipeline.new,
    "Quote Sent": STATUS_COLORS.pipeline.quote_sent,
    "Contract Signed": STATUS_COLORS.pipeline.site_visit_completed,
    "Pending Install": STATUS_COLORS.job.scheduled,
    "Active": STATUS_COLORS.semantic.active,
    "Under Service": STATUS_COLORS.job.in_progress,
    "Decommissioned": STATUS_COLORS.semantic.draft,
    "Archived": STATUS_COLORS.semantic.draft,
};

const companyStatusStyles: Record<CompanyStatus, string> = {
    "Prospect": STATUS_COLORS.semantic.info,
    "Active Customer": STATUS_COLORS.semantic.active,
    "Inactive": STATUS_COLORS.semantic.draft,
    "Archived": STATUS_COLORS.semantic.draft,
};

const regionStatusStyles: Record<RegionStatus, string> = {
    "Active": STATUS_COLORS.semantic.active,
    "Dormant": STATUS_COLORS.semantic.warning,
    "Not Yet Approached": STATUS_COLORS.semantic.draft,
};

const quoteStatusStyles: Record<string, string> = {
    "Draft": STATUS_COLORS.quote.draft,
    "Sent": STATUS_COLORS.quote.sent,
    "Awaiting Response": STATUS_COLORS.quote.awaiting_response,
    "In Negotiation": STATUS_COLORS.quote.in_negotiation,
    "Accepted": STATUS_COLORS.quote.accepted,
    "Rejected": STATUS_COLORS.quote.rejected,
    "Expired": STATUS_COLORS.quote.expired,
};

const activityIcons: Record<string, React.ElementType> = {
    "Call": PhoneCall,
    "Email Sent": Send,
    "Email Received": Mail,
    "Meeting": Users,
    "Site Visit": MapPin,
    "Note": MessageSquare,
    "Quote Sent": FileText,
    "Contract Sent": FileText,
    "Contract Signed": CheckCircle2,
    "Status Change": AlertCircle,
    "System Notification": AlertCircle,
};

// Stat Card Component
function StatCard({ title, value, icon: Icon, green }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    green?: boolean;
}) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                        <p className={`text-xl font-black mt-1 ${green ? 'text-green-600' : ''}`}>{value}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Add Region Form
function AddRegionForm({ onClose }: { onClose?: () => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="regionName">Region Name <span className="text-destructive">*</span></Label>
                <Input id="regionName" placeholder="Enter region name" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="ownerBdm">Owner BDM <span className="text-destructive">*</span></Label>
                <Select>
                    <SelectTrigger id="ownerBdm">
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
                <Label htmlFor="regionStatus">Status</Label>
                <Select defaultValue="Active">
                    <SelectTrigger id="regionStatus">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Dormant">Dormant</SelectItem>
                        <SelectItem value="Not Yet Approached">Not Yet Approached</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Coverage description and notes..." rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Save Region</Button>
            </div>
        </div>
    );
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer, closeDrawer } = useDrawer();
    const [activeTab, setActiveTab] = useState("overview");
    const [siteStatusFilter, setSiteStatusFilter] = useState("all");
    const [activityTypeFilter, setActivityTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const company = mockCompanies[id] || mockCompanies["COMP-001"];

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

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
            " at " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    };

    // Filter sites
    const filteredSites = siteStatusFilter === "all"
        ? mockSites
        : mockSites.filter(s => s.siteStatus === siteStatusFilter);

    // Filter activities
    const filteredActivities = activityTypeFilter === "all"
        ? mockActivitiesData
        : mockActivitiesData.filter(a => a.type === activityTypeFilter);

    // Calculate stats
    const activeSitesCount = mockSites.filter(s => s.siteStatus === "Active").length;
    const totalContractValue = mockSites.reduce((sum, s) => sum + s.totalContractValue, 0);
    const totalRevenueInvoiced = 280000; // Mock value
    const totalOutstanding = 40000; // Mock value

    const handleAddRegion = () => {
        openDrawer({
            title: "Add New Region",
            description: "Create a new region for this company",
            content: <AddRegionForm onClose={closeDrawer} />,
        });
    };

    return (
        <>
            <Topbar title="Company Details" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href="/accounts">
                        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground -ml-2">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to Companies
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-bold leading-none">{company.companyName}</h1>
                                <Badge variant="secondary" className={cn("border-none font-bold text-[10px] uppercase h-5", companyStatusStyles[company.status])}>
                                    {company.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Primary BDM: <span className="font-medium text-foreground">{company.accountOwnerBdmName}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Edit className="mr-1.5 h-4 w-4" />
                            Edit Company
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
                                    Add Site
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    Add Contact
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Create Quote
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Company
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-4 mb-6">
                    <StatCard title="Active Sites" value={activeSitesCount} icon={MapPin} />
                    <StatCard title="Total Contract Value" value={formatCurrency(totalContractValue)} icon={PoundSterling} />
                    <StatCard title="Revenue Invoiced" value={formatCurrency(totalRevenueInvoiced)} icon={TrendingUp} green />
                    <StatCard title="Outstanding" value={formatCurrency(totalOutstanding)} icon={CreditCard} />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start overflow-x-auto no-scrollbar">
                        {["overview", "sites", "contacts", "regions", "activity", "quotes", "finance"].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3 text-[10px] font-bold uppercase tracking-widest transition-none capitalize"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Active Sites */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Sites</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("sites")}>View All</Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {mockSites.filter(s => s.siteStatus === "Active").slice(0, 3).map((site) => (
                                        <Link key={site.id} href={`/sites/${site.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{site.siteName}</p>
                                                    <p className="text-[11px] text-muted-foreground">{site.systemType}</p>
                                                </div>
                                            </div>
                                            <Badge className={cn("border-none text-[10px] font-bold uppercase", siteStatusStyles[site.siteStatus])}>
                                                {site.siteStatus}
                                            </Badge>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Key Contacts */}
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Key Contacts</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveTab("contacts")}>View All</Button>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {mockContacts.slice(0, 3).map((contact) => (
                                        <Link key={contact.id} href={`/contacts/${contact.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-slate-600">{contact.firstName[0]}{contact.lastName[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{contact.firstName} {contact.lastName}</p>
                                                    <p className="text-[11px] text-muted-foreground">{contact.jobTitle}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Sites */}
                    <TabsContent value="sites" className="mt-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">All Sites</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Select value={siteStatusFilter} onValueChange={setSiteStatusFilter}>
                                        <SelectTrigger className="h-8 w-[140px] text-xs">
                                            <Filter className="h-3 w-3 mr-1" />
                                            <SelectValue placeholder="Filter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all"><span className="text-xs">All Statuses</span></SelectItem>
                                            {Object.keys(siteStatusStyles).map((status) => (
                                                <SelectItem key={status} value={status}><span className="text-xs">{status}</span></SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button size="sm" className="h-8">
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Site
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-6 font-medium">Site Name</TableHead>
                                            <TableHead className="font-medium">Address</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium">System Type</TableHead>
                                            <TableHead className="font-medium">BDM</TableHead>
                                            <TableHead className="font-medium">Install Date</TableHead>
                                            <TableHead className="font-medium text-right">Contract Value</TableHead>
                                            <TableHead className="w-[44px] pr-6"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSites.map((site) => (
                                            <TableRow key={site.id} className="group cursor-pointer hover:bg-primary/[0.02]" onClick={() => window.location.href = `/sites/${site.id}`}>
                                                <TableCell className="pl-6 font-medium text-sm">{site.siteName}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{site.fullAddress}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", siteStatusStyles[site.siteStatus])}>
                                                        {site.siteStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{site.systemType}</TableCell>
                                                <TableCell className="text-sm">{site.assignedBdmName}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{site.installationDate ? formatDate(site.installationDate) : "—"}</TableCell>
                                                <TableCell className="text-sm font-medium text-right">{formatCurrency(site.totalContractValue)}</TableCell>
                                                <TableCell className="pr-6">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Contacts */}
                    <TabsContent value="contacts" className="mt-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">All Contacts</CardTitle>
                                <Button size="sm" className="h-8">
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Contact
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-6 font-medium">Name</TableHead>
                                            <TableHead className="font-medium">Position</TableHead>
                                            <TableHead className="font-medium">Email</TableHead>
                                            <TableHead className="font-medium">Phone</TableHead>
                                            <TableHead className="font-medium">Preferred Comm.</TableHead>
                                            <TableHead className="font-medium">Region</TableHead>
                                            <TableHead className="font-medium">Sites</TableHead>
                                            <TableHead className="w-[44px] pr-6"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockContacts.map((contact) => (
                                            <TableRow key={contact.id} className="group cursor-pointer hover:bg-primary/[0.02]" onClick={() => window.location.href = `/contacts/${contact.id}`}>
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-slate-600">{contact.firstName[0]}{contact.lastName[0]}</span>
                                                        </div>
                                                        <span className="font-medium text-sm">{contact.firstName} {contact.lastName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{contact.jobTitle || "—"}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{contact.email}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{contact.mobilePhone || "—"}</TableCell>
                                                <TableCell className="text-sm">{contact.preferredCommunication}</TableCell>
                                                <TableCell className="text-sm">{contact.regionName || "—"}</TableCell>
                                                <TableCell className="text-sm font-medium">{contact.associatedSitesCount}</TableCell>
                                                <TableCell className="pr-6">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 4: Regions */}
                    <TabsContent value="regions" className="mt-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Regions</CardTitle>
                                <Button size="sm" className="h-8" onClick={handleAddRegion}>
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Region
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-6 font-medium">Region Name</TableHead>
                                            <TableHead className="font-medium">Owner BDM</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium">Contacts</TableHead>
                                            <TableHead className="w-[44px] pr-6"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockRegions.map((region) => (
                                            <TableRow key={region.id} className="group hover:bg-primary/[0.02]">
                                                <TableCell className="pl-6 font-medium text-sm">{region.regionName}</TableCell>
                                                <TableCell className="text-sm">{region.regionOwnerBdmName}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", regionStatusStyles[region.status])}>
                                                        {region.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{region.contactsCount}</TableCell>
                                                <TableCell className="pr-6">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
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

                    {/* Tab 5: Activity */}
                    <TabsContent value="activity" className="mt-6">
                        <ActivityTimeline activities={mockActivitiesData} />
                    </TabsContent>

                    {/* Tab 6: Quotes */}
                    <TabsContent value="quotes" className="mt-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quotes</CardTitle>
                                <Button size="sm" className="h-8">
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Create Quote
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="pl-6 font-medium">Quote Ref</TableHead>
                                            <TableHead className="font-medium">Contact</TableHead>
                                            <TableHead className="font-medium text-right">Value</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="font-medium">Date Sent</TableHead>
                                            <TableHead className="font-medium">BDM</TableHead>
                                            <TableHead className="w-[44px] pr-6"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockQuotes.map((quote) => (
                                            <TableRow key={quote.id} className="group cursor-pointer hover:bg-primary/[0.02]" onClick={() => window.location.href = `/quotes/${quote.id}`}>
                                                <TableCell className="pl-6 font-bold text-sm text-primary">{quote.quoteReference}</TableCell>
                                                <TableCell className="text-sm">{quote.contactName}</TableCell>
                                                <TableCell className="text-sm font-medium text-right">{formatCurrency(quote.totalValue)}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", quoteStatusStyles[quote.quoteStatus] || STATUS_COLORS.semantic.draft)}>
                                                        {quote.quoteStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{quote.dateSent ? formatDate(quote.dateSent) : "—"}</TableCell>
                                                <TableCell className="text-sm">{quote.bdmName}</TableCell>
                                                <TableCell className="pr-6">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 7: Finance */}
                    <TabsContent value="finance" className="mt-6">
                        <Card className="border-none shadow-sm">
                            <CardContent className="py-16">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                        <Receipt className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Financial Reporting Coming Soon</h3>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                                        Financial reporting will be available once Sage integration is live.
                                        This will include invoices, payments, and revenue analytics for this company.
                                    </p>
                                    <Badge variant="outline" className="mt-4 text-xs">Phase 3</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </>
    );
}
