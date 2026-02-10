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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Users,
    Building2,
    Phone,
    Mail,
    Inbox,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    AlertTriangle,
    UserPlus,
} from "lucide-react";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Types
type PreferredCommunication = "Phone" | "Email" | "In-Person" | "WhatsApp";
type ContactSource = "LinkedIn" | "Referral" | "Cold Call" | "Inbound" | "Website" | "Other";

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    email: string;
    mobilePhone?: string;
    officePhone?: string;
    linkedinUrl?: string;
    preferredCommunication: PreferredCommunication;
    companyId: string;
    companyName: string;
    bdmOwnerId: string;
    bdmOwnerName: string;
    regionId?: string;
    regionName?: string;
    source: ContactSource;
    notes?: string;
    excludeFromWorkflows: boolean;
    associatedSitesCount: number;
    createdAt: string;
}

// Mock Data
const mockBdmUsers = [
    { id: "BDM-001", name: "John Smith" },
    { id: "BDM-002", name: "Sarah Chen" },
    { id: "BDM-003", name: "Mike Johnson" },
    { id: "BDM-004", name: "Lisa Park" },
];

const mockCompanies = [
    { id: "COMP-001", name: "Johnson Roofing LLC", regions: [{ id: "REG-001", name: "Austin Metro" }, { id: "REG-002", name: "North Texas" }] },
    { id: "COMP-002", name: "Acme Construction", regions: [{ id: "REG-003", name: "Dallas" }, { id: "REG-004", name: "Houston" }] },
    { id: "COMP-003", name: "Premier Builders", regions: [{ id: "REG-005", name: "Hill Country" }] },
    { id: "COMP-004", name: "Smith Residence Ltd", regions: [] },
];

const mockContacts: Contact[] = [
    { id: "CONT-001", firstName: "Mike", lastName: "Thompson", jobTitle: "Operations Director", email: "mike@johnsonroofing.com", mobilePhone: "07555 111 222", preferredCommunication: "Email", companyId: "COMP-001", companyName: "Johnson Roofing LLC", bdmOwnerId: "BDM-001", bdmOwnerName: "John Smith", regionId: "REG-001", regionName: "Austin Metro", source: "Referral", associatedSitesCount: 3, excludeFromWorkflows: false, createdAt: "2023-06-15" },
    { id: "CONT-002", firstName: "Rachel", lastName: "Green", jobTitle: "Site Manager", email: "rachel@johnsonroofing.com", mobilePhone: "07555 222 333", officePhone: "0161 123 4567", preferredCommunication: "Phone", companyId: "COMP-001", companyName: "Johnson Roofing LLC", bdmOwnerId: "BDM-001", bdmOwnerName: "John Smith", source: "LinkedIn", associatedSitesCount: 1, excludeFromWorkflows: false, createdAt: "2023-08-20" },
    { id: "CONT-003", firstName: "David", lastName: "Brown", jobTitle: "Finance Manager", email: "david@johnsonroofing.com", mobilePhone: "07555 333 444", preferredCommunication: "Email", companyId: "COMP-001", companyName: "Johnson Roofing LLC", bdmOwnerId: "BDM-002", bdmOwnerName: "Sarah Chen", source: "Inbound", associatedSitesCount: 0, excludeFromWorkflows: true, createdAt: "2023-09-10" },
    { id: "CONT-004", firstName: "Sarah", lastName: "Chen", jobTitle: "Project Director", email: "sarah@acme.com", mobilePhone: "07555 444 555", linkedinUrl: "https://linkedin.com/in/sarachen", preferredCommunication: "In-Person", companyId: "COMP-002", companyName: "Acme Construction", bdmOwnerId: "BDM-002", bdmOwnerName: "Sarah Chen", regionId: "REG-003", regionName: "Dallas", source: "Cold Call", associatedSitesCount: 5, excludeFromWorkflows: false, createdAt: "2023-04-10" },
    { id: "CONT-005", firstName: "James", lastName: "Wilson", jobTitle: "QS", email: "james@premierbuilders.com", mobilePhone: "07555 555 666", preferredCommunication: "WhatsApp", companyId: "COMP-003", companyName: "Premier Builders", bdmOwnerId: "BDM-003", bdmOwnerName: "Mike Johnson", source: "Website", associatedSitesCount: 2, excludeFromWorkflows: false, createdAt: "2023-10-05" },
    { id: "CONT-006", firstName: "Emma", lastName: "Taylor", jobTitle: "Managing Director", email: "emma@smithresidence.com", mobilePhone: "07555 666 777", officePhone: "0121 987 6543", preferredCommunication: "Email", companyId: "COMP-004", companyName: "Smith Residence Ltd", bdmOwnerId: "BDM-004", bdmOwnerName: "Lisa Park", source: "Referral", associatedSitesCount: 1, excludeFromWorkflows: false, createdAt: "2023-11-15" },
    { id: "CONT-007", firstName: "Tom", lastName: "Harris", jobTitle: "Procurement Manager", email: "tom@acme.com", mobilePhone: "07555 777 888", preferredCommunication: "Phone", companyId: "COMP-002", companyName: "Acme Construction", bdmOwnerId: "BDM-002", bdmOwnerName: "Sarah Chen", regionId: "REG-004", regionName: "Houston", source: "LinkedIn", associatedSitesCount: 3, excludeFromWorkflows: false, createdAt: "2023-07-20" },
    { id: "CONT-008", firstName: "Lucy", lastName: "Adams", jobTitle: "Site Coordinator", email: "lucy@johnsonroofing.com", mobilePhone: "07555 888 999", preferredCommunication: "WhatsApp", companyId: "COMP-001", companyName: "Johnson Roofing LLC", bdmOwnerId: "BDM-001", bdmOwnerName: "John Smith", source: "Inbound", associatedSitesCount: 2, excludeFromWorkflows: false, createdAt: "2024-01-05" },
    { id: "CONT-009", firstName: "Chris", lastName: "Martin", jobTitle: "Health & Safety Officer", email: "chris@premierbuilders.com", mobilePhone: "07555 999 000", preferredCommunication: "Email", companyId: "COMP-003", companyName: "Premier Builders", bdmOwnerId: "BDM-003", bdmOwnerName: "Mike Johnson", regionId: "REG-005", regionName: "Hill Country", source: "Cold Call", associatedSitesCount: 4, excludeFromWorkflows: false, createdAt: "2023-12-01" },
    { id: "CONT-010", firstName: "Olivia", lastName: "Scott", jobTitle: "Contracts Manager", email: "olivia@acme.com", mobilePhone: "07555 000 111", preferredCommunication: "In-Person", companyId: "COMP-002", companyName: "Acme Construction", bdmOwnerId: "BDM-004", bdmOwnerName: "Lisa Park", source: "Website", associatedSitesCount: 2, excludeFromWorkflows: false, createdAt: "2024-01-10" },
    { id: "CONT-011", firstName: "Daniel", lastName: "Lee", jobTitle: "Technical Director", email: "daniel@smithresidence.com", mobilePhone: "07555 112 233", preferredCommunication: "Phone", companyId: "COMP-004", companyName: "Smith Residence Ltd", bdmOwnerId: "BDM-004", bdmOwnerName: "Lisa Park", source: "Referral", associatedSitesCount: 0, excludeFromWorkflows: true, createdAt: "2024-01-15" },
];

const preferredCommOptions = [
    { value: "all", label: "All Methods" },
    { value: "Phone", label: "Phone" },
    { value: "Email", label: "Email" },
    { value: "In-Person", label: "In-Person" },
    { value: "WhatsApp", label: "WhatsApp" },
];

const sourceOptions = [
    { value: "all", label: "All Sources" },
    { value: "LinkedIn", label: "LinkedIn" },
    { value: "Referral", label: "Referral" },
    { value: "Cold Call", label: "Cold Call" },
    { value: "Inbound", label: "Inbound" },
    { value: "Website", label: "Website" },
    { value: "Other", label: "Other" },
];

const companyOptions = [
    { value: "all", label: "All Companies" },
    ...mockCompanies.map(c => ({ value: c.id, label: c.name })),
];

const bdmOptions = [
    { value: "all", label: "All BDMs" },
    ...mockBdmUsers.map(u => ({ value: u.id, label: u.name })),
];

const preferredCommStyles: Record<PreferredCommunication, string> = {
    "Phone": STATUS_COLORS.semantic.info,
    "Email": STATUS_COLORS.semantic.active,
    "In-Person": STATUS_COLORS.semantic.special,
    "WhatsApp": STATUS_COLORS.semantic.healthy,
};

const sourceStyles: Record<ContactSource, string> = {
    "LinkedIn": STATUS_COLORS.semantic.info,
    "Referral": STATUS_COLORS.pipeline.contacted,
    "Cold Call": STATUS_COLORS.semantic.draft,
    "Inbound": STATUS_COLORS.semantic.active,
    "Website": STATUS_COLORS.semantic.special,
    "Other": STATUS_COLORS.semantic.draft,
};

// Stat Card Component
function StatCard({ title, value, icon: Icon }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
}) {
    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                        <p className="text-2xl font-black mt-1">{value}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Create Contact Form Component
function CreateContactForm({ onClose }: { onClose?: () => void }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [duplicateContact, setDuplicateContact] = useState<Contact | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

    const selectedCompany = mockCompanies.find(c => c.id === selectedCompanyId);
    const filteredRegions = selectedCompany?.regions || [];

    const checkDuplicateEmail = () => {
        if (!email.trim()) return;
        const existing = mockContacts.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            setDuplicateContact(existing);
            setShowDuplicateDialog(true);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                        <Input id="firstName" placeholder="First name" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                        <Input id="lastName" placeholder="Last name" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={checkDuplicateEmail}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="company">Associated Company <span className="text-destructive">*</span></Label>
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                        <SelectTrigger id="company">
                            <SelectValue placeholder="Search company..." />
                        </SelectTrigger>
                        <SelectContent>
                            {mockCompanies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="bdm">Contact Owner BDM <span className="text-destructive">*</span></Label>
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
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" placeholder="e.g. Operations Director" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="mobilePhone">Mobile Phone</Label>
                        <Input id="mobilePhone" placeholder="07XXX XXXXXX" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="officePhone">Office Phone</Label>
                        <Input id="officePhone" placeholder="0XXX XXX XXXX" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="preferredComm">Preferred Communication</Label>
                        <Select>
                            <SelectTrigger id="preferredComm">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Phone">Phone</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="In-Person">In-Person</SelectItem>
                                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="region">Associated Region</Label>
                        <Select disabled={!selectedCompanyId || filteredRegions.length === 0}>
                            <SelectTrigger id="region">
                                <SelectValue placeholder={filteredRegions.length === 0 ? "No regions" : "Select region"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredRegions.map((region) => (
                                    <SelectItem key={region.id} value={region.id}>
                                        {region.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="source">Source</Label>
                    <Select>
                        <SelectTrigger id="source">
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Cold Call">Cold Call</SelectItem>
                            <SelectItem value="Inbound">Inbound</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes..." rows={3} />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="excludeWorkflows" />
                    <label htmlFor="excludeWorkflows" className="text-sm text-muted-foreground cursor-pointer">
                        Exclude from automated workflows
                    </label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button>Save Contact</Button>
                </div>
            </div>

            {/* Duplicate Email Alert Dialog */}
            <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Duplicate Email Detected
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            A contact with this email already exists:
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                                <p className="font-semibold">{duplicateContact?.firstName} {duplicateContact?.lastName}</p>
                                <p className="text-sm text-muted-foreground">Owned by {duplicateContact?.bdmOwnerName} at {duplicateContact?.companyName}</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            setShowDuplicateDialog(false);
                            if (duplicateContact) {
                                router.push(`/contacts/${duplicateContact.id}`);
                            }
                        }}>
                            View Existing Contact
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ContactsPage() {
    const router = useRouter();
    const { openDrawer, closeDrawer } = useDrawer();
    const { openConfirmation } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [companyFilter, setCompanyFilter] = useState("all");
    const [bdmFilter, setBdmFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [preferredCommFilter, setPreferredCommFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof Contact>("lastName");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const itemsPerPage = 10;

    // Filter and sort contacts
    const filteredContacts = useMemo(() => {
        let result = mockContacts.filter((contact) => {
            const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.companyName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCompany = companyFilter === "all" || contact.companyId === companyFilter;
            const matchesBdm = bdmFilter === "all" || contact.bdmOwnerId === bdmFilter;
            const matchesSource = sourceFilter === "all" || contact.source === sourceFilter;
            const matchesPreferred = preferredCommFilter === "all" || contact.preferredCommunication === preferredCommFilter;
            return matchesSearch && matchesCompany && matchesBdm && matchesSource && matchesPreferred;
        });

        result.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return 0;
        });

        return result;
    }, [searchQuery, companyFilter, bdmFilter, sourceFilter, preferredCommFilter, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCreateContact = () => {
        openDrawer({
            title: "Add New Contact",
            content: <CreateContactForm onClose={closeDrawer} />,
            description: "Create a new contact record"
        });
    };

    const handleDelete = (contact: Contact) => {
        openConfirmation(
            "Delete Contact",
            `Are you sure you want to delete "${contact.firstName} ${contact.lastName}"?`,
            () => console.log("Deleted:", contact.id)
        );
    };

    const handleSort = (field: keyof Contact) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const SortableHeader = ({ field, children }: { field: keyof Contact; children: React.ReactNode }) => (
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
            <Topbar title="Contacts" subtitle="Manage contact relationships" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Contacts" value={mockContacts.length} icon={Users} />
                    <StatCard title="Active This Month" value={5} icon={UserPlus} />
                    <StatCard title="Companies" value={mockCompanies.length} icon={Building2} />
                    <StatCard title="Total Site Links" value={mockContacts.reduce((sum, c) => sum + c.associatedSitesCount, 0)} icon={MessageSquare} />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search name, email, company..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={companyFilter} onValueChange={(v) => { setCompanyFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[150px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={bdmFilter} onValueChange={(v) => { setBdmFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="BDM" />
                            </SelectTrigger>
                            <SelectContent>
                                {bdmOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={preferredCommFilter} onValueChange={(v) => { setPreferredCommFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Preferred" />
                            </SelectTrigger>
                            <SelectContent>
                                {preferredCommOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="text-xs">{option.label}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button id="add-contact-btn" onClick={handleCreateContact} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Contact
                    </Button>
                </div>

                {/* Contacts Table */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">All Contacts</CardTitle>
                            <span className="text-xs text-muted-foreground">{filteredContacts.length} contacts</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {paginatedContacts.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <SortableHeader field="lastName">Full Name</SortableHeader>
                                            <TableHead className="font-medium">Company</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Job Title</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Email</TableHead>
                                            <TableHead className="font-medium hidden lg:table-cell">Phone</TableHead>
                                            <TableHead className="font-medium hidden md:table-cell">Preferred</TableHead>
                                            <TableHead className="font-medium hidden xl:table-cell">BDM Owner</TableHead>
                                            <TableHead className="font-medium hidden xl:table-cell">Source</TableHead>
                                            <SortableHeader field="createdAt">Created</SortableHeader>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedContacts.map((contact) => (
                                            <TableRow
                                                key={contact.id}
                                                className="group cursor-pointer hover:bg-primary/[0.02] border-slate-50"
                                                onClick={() => router.push(`/contacts/${contact.id}`)}
                                            >
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-primary">
                                                                {contact.firstName[0]}{contact.lastName[0]}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-sm">{contact.firstName} {contact.lastName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/accounts/${contact.companyId}`}
                                                        className="text-sm text-primary hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {contact.companyName}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">{contact.jobTitle || "—"}</TableCell>
                                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                                    <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                                                        {contact.email}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                                    {contact.mobilePhone ? (
                                                        <a href={`tel:${contact.mobilePhone.replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                                                            {contact.mobilePhone}
                                                        </a>
                                                    ) : "—"}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", preferredCommStyles[contact.preferredCommunication])}>
                                                        {contact.preferredCommunication}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell text-sm">{contact.bdmOwnerName}</TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", sourceStyles[contact.source])}>
                                                        {contact.source}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(contact.createdAt)}</TableCell>
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
                                                                <Link href={`/contacts/${contact.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Contact
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(contact); }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Contact
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
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
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
                            <SharedEmptyState
                                icon={Inbox}
                                title="No contacts found"
                                description="No contacts match your current filters. Try adjusting your search or add a new contact."
                                actionLabel="Add Contact"
                                onAction={() => document.getElementById('add-contact-btn')?.click()}
                            />
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
