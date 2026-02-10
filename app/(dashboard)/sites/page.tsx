"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
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
    Edit,
    Trash2,
    Inbox,
    MapPin,
    Building2,
    List,
    Map,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Camera,
    Calendar,
    DollarSign,
    ExternalLink,
} from "lucide-react";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Types
type SiteStatus = "Active" | "Lead" | "Pending Install" | "Decommissioned";
type SystemType = "CCTV" | "Access Control" | "Intruder Alarm" | "Fire Alarm" | "Integrated";
type BillingFrequency = "Monthly" | "Quarterly" | "Annually";

interface Site {
    id: string;
    name: string;
    companyId: string;
    companyName: string;
    address: string;
    lat: number;
    lng: number;
    status: SiteStatus;
    systemType: SystemType;
    camerasCount: number;
    bdmId: string;
    bdmName: string;
    bdmColor: string;
    installDate: string;
    billingFrequency: BillingFrequency;
    rate: number;
    contractValue: number;
    createdAt: string;
}

// Mock Data
const mockBdmUsers = [
    { id: "BDM-001", name: "John Smith", color: "#3B82F6" },
    { id: "BDM-002", name: "Sarah Chen", color: "#10B981" },
    { id: "BDM-003", name: "Mike Johnson", color: "#F59E0B" },
    { id: "BDM-004", name: "Lisa Park", color: "#8B5CF6" },
];

const mockCompanies = [
    { id: "COMP-001", name: "Johnson Roofing LLC" },
    { id: "COMP-002", name: "Acme Construction" },
    { id: "COMP-003", name: "Premier Builders" },
    { id: "COMP-004", name: "Metro Properties" },
];

const mockSites: Site[] = [
    { id: "SITE-001", name: "Main Office", companyId: "COMP-001", companyName: "Johnson Roofing LLC", address: "123 Oak Street, Austin, TX 78701", lat: 30.2672, lng: -97.7431, status: "Active", systemType: "CCTV", camerasCount: 16, bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", installDate: "2023-06-15", billingFrequency: "Monthly", rate: 450, contractValue: 16200, createdAt: "2023-06-15" },
    { id: "SITE-002", name: "Warehouse Facility", companyId: "COMP-001", companyName: "Johnson Roofing LLC", address: "456 Industrial Blvd, Austin, TX 78702", lat: 30.2750, lng: -97.7350, status: "Active", systemType: "Integrated", camerasCount: 32, bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", installDate: "2023-08-20", billingFrequency: "Quarterly", rate: 1800, contractValue: 21600, createdAt: "2023-08-20" },
    { id: "SITE-003", name: "Branch Office North", companyId: "COMP-001", companyName: "Johnson Roofing LLC", address: "789 North Ave, Round Rock, TX 78664", lat: 30.5083, lng: -97.6789, status: "Pending Install", systemType: "CCTV", camerasCount: 8, bdmId: "BDM-003", bdmName: "Mike Johnson", bdmColor: "#F59E0B", installDate: "2024-02-15", billingFrequency: "Monthly", rate: 250, contractValue: 9000, createdAt: "2024-01-05" },
    { id: "SITE-004", name: "HQ Tower", companyId: "COMP-002", companyName: "Acme Construction", address: "456 Main Avenue, Dallas, TX 75201", lat: 32.7767, lng: -96.7970, status: "Active", systemType: "Access Control", camerasCount: 24, bdmId: "BDM-002", bdmName: "Sarah Chen", bdmColor: "#10B981", installDate: "2023-04-10", billingFrequency: "Annually", rate: 8500, contractValue: 25500, createdAt: "2023-04-10" },
    { id: "SITE-005", name: "Distribution Centre", companyId: "COMP-002", companyName: "Acme Construction", address: "100 Logistics Way, Dallas, TX 75202", lat: 32.7850, lng: -96.7800, status: "Active", systemType: "CCTV", camerasCount: 48, bdmId: "BDM-002", bdmName: "Sarah Chen", bdmColor: "#10B981", installDate: "2023-06-01", billingFrequency: "Monthly", rate: 850, contractValue: 30600, createdAt: "2023-06-01" },
    { id: "SITE-006", name: "South Branch", companyId: "COMP-002", companyName: "Acme Construction", address: "200 Commerce Dr, Houston, TX 77001", lat: 29.7604, lng: -95.3698, status: "Lead", systemType: "Intruder Alarm", camerasCount: 0, bdmId: "BDM-004", bdmName: "Lisa Park", bdmColor: "#8B5CF6", installDate: "", billingFrequency: "Monthly", rate: 350, contractValue: 12600, createdAt: "2023-09-15" },
    { id: "SITE-007", name: "Downtown Complex", companyId: "COMP-003", companyName: "Premier Builders", address: "500 Congress Ave, Austin, TX 78701", lat: 30.2700, lng: -97.7400, status: "Active", systemType: "Fire Alarm", camerasCount: 12, bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", installDate: "2023-07-20", billingFrequency: "Quarterly", rate: 1200, contractValue: 14400, createdAt: "2023-07-20" },
    { id: "SITE-008", name: "Riverwalk Properties", companyId: "COMP-003", companyName: "Premier Builders", address: "300 River Walk, San Antonio, TX 78205", lat: 29.4241, lng: -98.4936, status: "Decommissioned", systemType: "CCTV", camerasCount: 6, bdmId: "BDM-003", bdmName: "Mike Johnson", bdmColor: "#F59E0B", installDate: "2022-11-01", billingFrequency: "Monthly", rate: 200, contractValue: 0, createdAt: "2022-11-01" },
    { id: "SITE-009", name: "Metro Tower", companyId: "COMP-004", companyName: "Metro Properties", address: "800 Metro Blvd, Austin, TX 78703", lat: 30.2900, lng: -97.7600, status: "Active", systemType: "Integrated", camerasCount: 64, bdmId: "BDM-004", bdmName: "Lisa Park", bdmColor: "#8B5CF6", installDate: "2023-10-15", billingFrequency: "Annually", rate: 12000, contractValue: 36000, createdAt: "2023-10-15" },
    { id: "SITE-010", name: "West Campus Office", companyId: "COMP-004", companyName: "Metro Properties", address: "1200 West Ave, Austin, TX 78701", lat: 30.2850, lng: -97.7550, status: "Lead", systemType: "Access Control", camerasCount: 0, bdmId: "BDM-002", bdmName: "Sarah Chen", bdmColor: "#10B981", installDate: "", billingFrequency: "Quarterly", rate: 900, contractValue: 10800, createdAt: "2024-01-10" },
    { id: "SITE-011", name: "East Industrial Park", companyId: "COMP-001", companyName: "Johnson Roofing LLC", address: "2500 East Industrial, Austin, TX 78702", lat: 30.2600, lng: -97.7100, status: "Pending Install", systemType: "CCTV", camerasCount: 20, bdmId: "BDM-001", bdmName: "John Smith", bdmColor: "#3B82F6", installDate: "2024-03-01", billingFrequency: "Monthly", rate: 550, contractValue: 19800, createdAt: "2024-01-15" },
];

const statusStyles: Record<SiteStatus, string> = {
    "Active": STATUS_COLORS.semantic.active,
    "Lead": STATUS_COLORS.pipeline.new,
    "Pending Install": STATUS_COLORS.pipeline.site_visit_booked,
    "Decommissioned": STATUS_COLORS.semantic.draft,
};

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Lead", label: "Lead" },
    { value: "Pending Install", label: "Pending Install" },
    { value: "Decommissioned", label: "Decommissioned" },
];

const systemTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "CCTV", label: "CCTV" },
    { value: "Access Control", label: "Access Control" },
    { value: "Intruder Alarm", label: "Intruder Alarm" },
    { value: "Fire Alarm", label: "Fire Alarm" },
    { value: "Integrated", label: "Integrated" },
];

const billingOptions = [
    { value: "all", label: "All Frequencies" },
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Annually", label: "Annually" },
];

const companyOptions = [
    { value: "all", label: "All Companies" },
    ...mockCompanies.map(c => ({ value: c.id, label: c.name })),
];

const bdmOptions = [
    { value: "all", label: "All BDMs" },
    ...mockBdmUsers.map(u => ({ value: u.id, label: u.name })),
];

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

// Map Component
function SitesMapView({ sites, onViewDetails }: { sites: Site[]; onViewDetails: (id: string) => void }) {
    const [mapReady, setMapReady] = useState(false);
    const [L, setL] = useState<typeof import("leaflet") | null>(null);

    useEffect(() => {
        import("leaflet").then((leaflet) => {
            setL(leaflet.default);
            setMapReady(true);
        });
    }, []);

    if (!mapReady || !L) {
        return (
            <div className="h-[600px] bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
            </div>
        );
    }

    const getMarkerIcon = (site: Site) => {
        const statusShapes: Record<SiteStatus, string> = {
            "Active": "●",
            "Lead": "◆",
            "Pending Install": "■",
            "Decommissioned": "✕",
        };

        return L.divIcon({
            className: "custom-marker",
            html: `<div style="background-color: ${site.bdmColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${statusShapes[site.status]}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
        });
    };

    const center: [number, number] = [30.2672, -97.7431]; // Austin, TX

    return (
        <div className="h-[600px] rounded-xl overflow-hidden border">
            <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {sites.map((site) => (
                    <Marker key={site.id} position={[site.lat, site.lng]} icon={getMarkerIcon(site)}>
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{site.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{site.companyName}</p>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", statusStyles[site.status])}>
                                        {site.status}
                                    </span>
                                    <span className="text-xs">{site.systemType}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: site.bdmColor }}></div>
                                    {site.bdmName}
                                </div>
                                <Button size="sm" className="w-full h-7 text-xs" onClick={() => onViewDetails(site.id)}>
                                    View Details
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

// Create Site Form Component
function CreateSiteForm({ onClose }: { onClose?: () => void }) {
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [rate, setRate] = useState("");
    const [billingFrequency, setBillingFrequency] = useState("");
    const [contractMonths, setContractMonths] = useState("36");

    const calculateContractValue = () => {
        if (!rate || !billingFrequency) return 0;
        const rateNum = parseFloat(rate);
        const months = parseInt(contractMonths);
        const multipliers: Record<string, number> = { "Monthly": 1, "Quarterly": 3, "Annually": 12 };
        const periodsPerYear = 12 / (multipliers[billingFrequency] || 1);
        return rateNum * periodsPerYear * (months / 12);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="siteName">Site Name <span className="text-destructive">*</span></Label>
                <Input id="siteName" placeholder="e.g., Main Office" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="address">Full Address <span className="text-destructive">*</span></Label>
                <Input id="address" placeholder="123 Street, City, State ZIP" />
            </div>
            <div className="space-y-1.5">
                <Label>Associated Company <span className="text-destructive">*</span></Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Search company..." />
                    </SelectTrigger>
                    <SelectContent>
                        {mockCompanies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Site Status <span className="text-destructive">*</span></Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Pending Install">Pending Install</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Assigned BDM <span className="text-destructive">*</span></Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select BDM" />
                        </SelectTrigger>
                        <SelectContent>
                            {mockBdmUsers.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="what3words">What3Words</Label>
                <Input id="what3words" placeholder="///word.word.word" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>System Type</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CCTV">CCTV</SelectItem>
                            <SelectItem value="Access Control">Access Control</SelectItem>
                            <SelectItem value="Intruder Alarm">Intruder Alarm</SelectItem>
                            <SelectItem value="Fire Alarm">Fire Alarm</SelectItem>
                            <SelectItem value="Integrated">Integrated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="cameras">Number of Cameras</Label>
                    <Input id="cameras" type="number" placeholder="0" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="installDate">Installation Date</Label>
                    <Input id="installDate" type="date" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="contractEnd">Contract End Date</Label>
                    <Input id="contractEnd" type="date" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label>Billing Frequency</Label>
                    <Select value={billingFrequency} onValueChange={setBillingFrequency}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Annually">Annually</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="rate">Rate (£)</Label>
                    <Input id="rate" type="number" placeholder="0" value={rate} onChange={(e) => setRate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Contract Value</Label>
                    <div className="h-9 px-3 rounded-md border bg-muted/30 flex items-center text-sm font-medium">
                        £{calculateContractValue().toLocaleString()}
                    </div>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="accessInstructions">Special Access Instructions</Label>
                <Textarea id="accessInstructions" placeholder="Gate codes, parking info, etc." rows={2} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes..." rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Create Site</Button>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
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

function SitesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { openDrawer, closeDrawer } = useDrawer();

    const viewMode = searchParams.get("view") || "list";
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [systemTypeFilter, setSystemTypeFilter] = useState("all");
    const [bdmFilter, setBdmFilter] = useState("all");
    const [companyFilter, setCompanyFilter] = useState("all");
    const [billingFilter, setBillingFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof Site>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const itemsPerPage = 10;

    const filteredSites = useMemo(() => {
        let result = mockSites.filter((site) => {
            const matchesSearch =
                site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                site.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                site.address.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || site.status === statusFilter;
            const matchesSystemType = systemTypeFilter === "all" || site.systemType === systemTypeFilter;
            const matchesBdm = bdmFilter === "all" || site.bdmId === bdmFilter;
            const matchesCompany = companyFilter === "all" || site.companyId === companyFilter;
            const matchesBilling = billingFilter === "all" || site.billingFrequency === billingFilter;
            return matchesSearch && matchesStatus && matchesSystemType && matchesBdm && matchesCompany && matchesBilling;
        });

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
    }, [searchQuery, statusFilter, systemTypeFilter, bdmFilter, companyFilter, billingFilter, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
    const paginatedSites = filteredSites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleCreateSite = () => {
        openDrawer({
            title: "Add New Site",
            content: <CreateSiteForm onClose={closeDrawer} />,
            description: "Create a new site record"
        });
    };

    const handleSort = (field: keyof Site) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const toggleView = (view: string) => {
        router.push(`/sites?view=${view}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const formatCurrency = (value: number) => `£${value.toLocaleString()}`;

    const SortableHeader = ({ field, children }: { field: keyof Site; children: React.ReactNode }) => (
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

    // Stats
    const activeSites = mockSites.filter(s => s.status === "Active").length;
    const totalContractValue = mockSites.reduce((sum, s) => sum + s.contractValue, 0);
    const totalCameras = mockSites.reduce((sum, s) => sum + s.camerasCount, 0);

    return (
        <>
            <Topbar title="Sites" subtitle="Manage site locations and installations" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard title="Total Sites" value={mockSites.length} icon={MapPin} />
                    <StatCard title="Active Sites" value={activeSites} icon={Building2} />
                    <StatCard title="Total Cameras" value={totalCameras} icon={Camera} />
                    <StatCard title="Contract Value" value={formatCurrency(totalContractValue)} icon={DollarSign} />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search sites..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}><span className="text-xs">{opt.label}</span></SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={systemTypeFilter} onValueChange={(v) => { setSystemTypeFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {systemTypeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}><span className="text-xs">{opt.label}</span></SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={bdmFilter} onValueChange={(v) => { setBdmFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[120px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="BDM" />
                            </SelectTrigger>
                            <SelectContent>
                                {bdmOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}><span className="text-xs">{opt.label}</span></SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={companyFilter} onValueChange={(v) => { setCompanyFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none">
                                <SelectValue placeholder="Company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companyOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}><span className="text-xs">{opt.label}</span></SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border bg-muted/30 p-1">
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3"
                                onClick={() => toggleView("list")}
                            >
                                <List className="h-4 w-4 mr-1" />
                                List
                            </Button>
                            <Button
                                variant={viewMode === "map" ? "default" : "ghost"}
                                size="sm"
                                className="h-7 px-3"
                                onClick={() => toggleView("map")}
                            >
                                <Map className="h-4 w-4 mr-1" />
                                Map
                            </Button>
                        </div>
                        <Button id="add-site-btn" onClick={handleCreateSite} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Site
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === "map" ? (
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sites Map</CardTitle>
                                <div className="flex items-center gap-4 text-xs">
                                    {mockBdmUsers.map((bdm) => (
                                        <div key={bdm.id} className="flex items-center gap-1">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: bdm.color }}></div>
                                            <span>{bdm.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SitesMapView sites={filteredSites} onViewDetails={(id) => router.push(`/sites/${id}`)} />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">All Sites</CardTitle>
                                <span className="text-xs text-muted-foreground">{filteredSites.length} sites</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {paginatedSites.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <SortableHeader field="name">Site Name</SortableHeader>
                                                <TableHead className="font-medium">Company</TableHead>
                                                <TableHead className="font-medium hidden lg:table-cell">Address</TableHead>
                                                <TableHead className="font-medium">Status</TableHead>
                                                <TableHead className="font-medium hidden md:table-cell">System</TableHead>
                                                <TableHead className="font-medium hidden md:table-cell text-center">Cameras</TableHead>
                                                <TableHead className="font-medium hidden xl:table-cell">BDM</TableHead>
                                                <TableHead className="font-medium hidden xl:table-cell">Install Date</TableHead>
                                                <SortableHeader field="contractValue">Contract</SortableHeader>
                                                <TableHead className="w-[44px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedSites.map((site) => (
                                                <TableRow
                                                    key={site.id}
                                                    className="group cursor-pointer hover:bg-primary/[0.02] border-slate-50"
                                                    onClick={() => router.push(`/sites/${site.id}`)}
                                                >
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <span className="font-bold text-sm">{site.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={`/accounts/${site.companyId}`}
                                                            className="text-sm text-primary hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {site.companyName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{site.address}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border-none text-[10px] font-bold uppercase", statusStyles[site.status])}>
                                                            {site.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm">{site.systemType}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-center text-sm">{site.camerasCount}</TableCell>
                                                    <TableCell className="hidden xl:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: site.bdmColor }}>
                                                                {site.bdmName.split(" ").map(n => n[0]).join("")}
                                                            </div>
                                                            <span className="text-sm">{site.bdmName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{formatDate(site.installDate)}</TableCell>
                                                    <TableCell className="text-sm font-medium">{formatCurrency(site.contractValue)}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/sites/${site.id}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Site
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete Site
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
                                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSites.length)} of {filteredSites.length} sites
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="h-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                                    Previous
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                                    Next
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <Inbox className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-sm font-medium">No sites found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">No sites match your current filters.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Leaflet CSS */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        </>
    );
}

export default function SitesPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading sites...</p>
                </div>
            </div>
        }>
            <SitesPageContent />
        </Suspense>
    );
}
