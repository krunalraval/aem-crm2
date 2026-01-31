"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Package,
    AlertTriangle,
    PackageX,
    Inbox,
    Boxes,
    TrendingDown,
    Warehouse,
    MapPin,
    Tag,
} from "lucide-react";

// Types
interface InventoryItem {
    id: string;
    partName: string;
    sku: string;
    stockLevel: number;
    reorderLevel: number;
    unitCost: number;
    location: string;
    supplier: string;
    status: string;
    lastUpdated: string;
}

// Mock Data
const mockInventory: InventoryItem[] = [
    { id: "INV-001", partName: "Clay Roof Tiles - Terracotta", sku: "CRT-001", stockLevel: 2500, reorderLevel: 500, unitCost: 1.85, location: "Warehouse A - Bay 1", supplier: "British Clay Tiles Ltd", status: "in_stock", lastUpdated: "2024-01-28" },
    { id: "INV-002", partName: "Slate Roof Tiles - Welsh Grey", sku: "SRT-002", stockLevel: 1200, reorderLevel: 300, unitCost: 3.50, location: "Warehouse A - Bay 2", supplier: "Welsh Slate Co", status: "in_stock", lastUpdated: "2024-01-27" },
    { id: "INV-003", partName: "EPDM Rubber Membrane 1.2mm", sku: "ERM-003", stockLevel: 45, reorderLevel: 80, unitCost: 12.00, location: "Warehouse B - Bay 1", supplier: "Roofing Supplies UK", status: "low_stock", lastUpdated: "2024-01-29" },
    { id: "INV-004", partName: "Lead Flashing Roll 150mm", sku: "LFR-004", stockLevel: 85, reorderLevel: 20, unitCost: 45.00, location: "Warehouse A - Bay 3", supplier: "Midland Lead", status: "in_stock", lastUpdated: "2024-01-26" },
    { id: "INV-005", partName: "Roofing Felt Type 1F", sku: "RFT-005", stockLevel: 0, reorderLevel: 30, unitCost: 28.50, location: "Warehouse B - Bay 2", supplier: "IKO PLC", status: "out_of_stock", lastUpdated: "2024-01-25" },
    { id: "INV-006", partName: "Ridge Tiles - Terracotta", sku: "RTT-006", stockLevel: 320, reorderLevel: 100, unitCost: 4.20, location: "Warehouse A - Bay 1", supplier: "British Clay Tiles Ltd", status: "in_stock", lastUpdated: "2024-01-28" },
];

const allLocations = [...new Set(mockInventory.map(i => i.location.split(" - ")[0]))];

const statusStyles: Record<string, string> = {
    in_stock: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    low_stock: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    out_of_stock: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
};

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subValue }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subValue?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className={`text-2xl font-semibold mt-1.5 ${color || ''}`}>{value}</p>
                        {subValue && <p className="text-[11px] text-muted-foreground mt-1 font-medium">{subValue}</p>}
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Add Item Form
function AddItemForm() {
    return (
        <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="partName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Part Name</Label>
                    <Input id="partName" placeholder="e.g. Clay Roof Tiles" className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="sku" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU / Part No</Label>
                    <Input id="sku" placeholder="e.g. CRT-001" className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="supplier" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Supplier</Label>
                    <Input id="supplier" placeholder="e.g. British Clay Tiles" className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="stockLevel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Stock</Label>
                    <Input id="stockLevel" type="number" placeholder="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="reorderLevel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reorder Point</Label>
                    <Input id="reorderLevel" type="number" placeholder="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="unitCost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Cost (£)</Label>
                    <Input id="unitCost" type="number" step="0.01" placeholder="0.00" className="h-9" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                    <Input id="location" placeholder="e.g. Wh A - Bay 1" className="h-9" />
                </div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-6">
                <Button variant="outline" size="sm" className="h-9 px-4">Cancel</Button>
                <Button size="sm" className="h-9 px-4">Create Item</Button>
            </div>
        </div>
    );
}

// Adjust Stock Form
function AdjustStockForm({ item }: { item: InventoryItem }) {
    const [adjustment, setAdjustment] = useState(0);
    return (
        <div className="space-y-6 pt-2">
            <div className="bg-muted/30 p-4 rounded-xl border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.sku}</p>
                <p className="text-base font-semibold mt-1">{item.partName}</p>
                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{item.stockLevel}</span>
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Units in Stock</span>
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adjustment Quantity</Label>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAdjustment(a => a - 10)} className="h-9 w-12">-10</Button>
                    <Button variant="outline" size="sm" onClick={() => setAdjustment(a => a - 1)} className="h-9 w-10">-1</Button>
                    <Input
                        type="number"
                        value={adjustment}
                        onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                        className="text-center h-9 font-bold"
                    />
                    <Button variant="outline" size="sm" onClick={() => setAdjustment(a => a + 1)} className="h-9 w-10">+1</Button>
                    <Button variant="outline" size="sm" onClick={() => setAdjustment(a => a + 10)} className="h-9 w-12">+10</Button>
                </div>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">PROJECTED STOCK</span>
                <span className={`text-xl font-bold ${item.stockLevel + adjustment < item.reorderLevel ? 'text-amber-600' : 'text-primary'}`}>
                    {item.stockLevel + adjustment} units
                </span>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" size="sm" className="h-9 px-4">Cancel</Button>
                <Button size="sm" className="h-9 px-4" disabled={adjustment === 0}>Confirm Adjustment</Button>
            </div>
        </div>
    );
}

export default function InventoryPage() {
    const { openDrawer } = useDrawer();
    const { openModal, openConfirmation } = useModal();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");

    // Filter and sort
    const filteredItems = useMemo(() => {
        return mockInventory.filter((item) => {
            const matchesSearch =
                item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || item.status === statusFilter;
            const matchesLocation = locationFilter === "all" || item.location.startsWith(locationFilter);
            return matchesSearch && matchesStatus && matchesLocation;
        });
    }, [searchQuery, statusFilter, locationFilter]);

    // Stats
    const totalValue = mockInventory.reduce((sum, i) => sum + (i.stockLevel * i.unitCost), 0);
    const lowStockCount = mockInventory.filter(i => i.status === "low_stock").length;
    const outOfStockCount = mockInventory.filter(i => i.status === "out_of_stock").length;

    const handleAddItem = () => {
        openDrawer({
            title: "Add Inventory Item",
            description: "Register a new part or material to stock control",
            content: <AddItemForm />,
        });
    };

    const handleAdjustStock = (item: InventoryItem) => {
        openModal({
            title: "Stock Adjustment",
            description: "Update inventory levels for stock-take or consumption",
            content: <AdjustStockForm item={item} />,
        });
    };

    const handleDelete = (item: InventoryItem) => {
        openConfirmation(
            "Delete Inventory Item",
            `Are you sure you want to remove "${item.partName}" from the system? This cannot be undone.`,
            () => console.log("Deleted:", item.id)
        );
    };

    return (
        <>
            <Topbar title="Inventory Management" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <StatCard title="Total Inventory Value" value={`£${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Warehouse} />
                    <StatCard title="Total SKU Categories" value={mockInventory.length} icon={Boxes} />
                    <StatCard title="Low Stock Items" value={lowStockCount} icon={AlertTriangle} color="text-amber-600" subValue={`${lowStockCount} items below reorder point`} />
                    <StatCard title="Out of Stock" value={outOfStockCount} icon={PackageX} color="text-red-600" subValue="Immediate restock required" />
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search part name, SKU..."
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
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {allLocations.map((loc) => (
                                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleAddItem} size="sm" className="h-9">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                {/* Inventory Table */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base font-medium">Stock Control</CardTitle>
                            <CardDescription className="text-xs">Manage material levels and reorder points</CardDescription>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{filteredItems.length} active SKUs</span>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {filteredItems.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-medium">Part Details</TableHead>
                                            <TableHead className="font-medium text-right">Stock Level</TableHead>
                                            <TableHead className="font-medium text-right hidden md:table-cell">Reorder</TableHead>
                                            <TableHead className="font-medium text-right hidden md:table-cell">Unit Cost</TableHead>
                                            <TableHead className="font-medium">Location</TableHead>
                                            <TableHead className="font-medium">Status</TableHead>
                                            <TableHead className="w-[44px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.map((item) => (
                                            <TableRow key={item.id} className="group">
                                                <TableCell>
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="mt-1 h-8 w-8 flex shrink-0 items-center justify-center rounded bg-muted/50 border group-hover:bg-background transition-colors">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <Link href={`/inventory/${item.id}`} className="font-medium text-sm hover:underline block truncate">
                                                                {item.partName}
                                                            </Link>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                <Tag className="h-3 w-3" />
                                                                {item.sku}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-medium text-sm">{item.stockLevel.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell className="text-right hidden md:table-cell">
                                                    <span className="text-xs text-muted-foreground">{item.reorderLevel.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell className="text-right hidden md:table-cell">
                                                    <span className="text-sm font-medium">£{item.unitCost.toFixed(2)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {item.location}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`${statusStyles[item.status]} font-normal h-5`}>
                                                        {item.status.replace("_", " ").toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[180px]">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/inventory/${item.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Lifecycle
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAdjustStock(item)}>
                                                                <TrendingDown className="mr-2 h-4 w-4" />
                                                                Adjust Stock
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Item
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
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <Inbox className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <h3 className="text-sm font-medium">No materials found</h3>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
