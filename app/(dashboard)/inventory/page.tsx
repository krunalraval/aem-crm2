"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    Boxes,
    Warehouse,
    MapPin,
    ArrowUpCircle,
    ArrowDownCircle,
    Camera,
    Recycle,
    Sparkles,
    X,
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAuth } from "@/context/auth-context";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

// Types
interface InventoryItem {
    id: string;
    name: string;
    category: string;
    sku?: string;
    inStock: number;
    reserved: number;
    condition: "new" | "recycled";
    lowStockThreshold: number;
    location: string;
    supplier?: string;
    unitCost?: number;
    serialNumber?: string;
    qrRef?: string;
    notes?: string;
    lastUpdated: string;
}

// Constants
const categories = [
    { value: "cameras", label: "Cameras", icon: Camera },
    { value: "recorders", label: "Recorders", icon: Package },
    { value: "cabling", label: "Cabling", icon: Package },
    { value: "networking", label: "Networking", icon: Package },
    { value: "accessories", label: "Accessories", icon: Package },
    { value: "tools", label: "Tools", icon: Package },
];

const locations = ["Warehouse A", "Warehouse B", "Van Stock", "Office"];

// Mock Data
const initialInventory: InventoryItem[] = [
    { id: "INV-001", name: "8MP Dome Camera", category: "cameras", sku: "CAM-8MP-D", inStock: 25, reserved: 8, condition: "new", lowStockThreshold: 10, location: "Warehouse A", supplier: "Hikvision UK", unitCost: 89.99, lastUpdated: "2024-01-28" },
    { id: "INV-002", name: "4MP Bullet Camera", category: "cameras", sku: "CAM-4MP-B", inStock: 18, reserved: 5, condition: "new", lowStockThreshold: 8, location: "Warehouse A", supplier: "Dahua Tech", unitCost: 65.50, lastUpdated: "2024-01-27" },
    { id: "INV-003", name: "16-Channel NVR", category: "recorders", sku: "NVR-16CH", inStock: 5, reserved: 3, condition: "new", lowStockThreshold: 5, location: "Warehouse B", supplier: "Hikvision UK", unitCost: 350.00, lastUpdated: "2024-01-29" },
    { id: "INV-004", name: "8-Channel NVR", category: "recorders", sku: "NVR-8CH", inStock: 12, reserved: 2, condition: "recycled", lowStockThreshold: 4, location: "Warehouse A", supplier: "Dahua Tech", unitCost: 180.00, lastUpdated: "2024-01-26" },
    { id: "INV-005", name: "Cat6 Cable (100m)", category: "cabling", sku: "CAB-CAT6-100", inStock: 45, reserved: 10, condition: "new", lowStockThreshold: 20, location: "Warehouse A", supplier: "Cable Direct", unitCost: 45.00, lastUpdated: "2024-01-25" },
    { id: "INV-006", name: "PoE Switch 8-Port", category: "networking", sku: "POE-SW-8", inStock: 8, reserved: 6, condition: "new", lowStockThreshold: 5, location: "Warehouse B", supplier: "TP-Link", unitCost: 120.00, lastUpdated: "2024-01-28" },
    { id: "INV-007", name: "PTZ Camera 2MP", category: "cameras", sku: "CAM-PTZ-2MP", inStock: 3, reserved: 2, condition: "recycled", lowStockThreshold: 3, location: "Van Stock", supplier: "Hikvision UK", unitCost: 450.00, lastUpdated: "2024-01-29" },
    { id: "INV-008", name: "Camera Mounting Bracket", category: "accessories", sku: "ACC-MNT-01", inStock: 50, reserved: 15, condition: "new", lowStockThreshold: 25, location: "Warehouse A", supplier: "Generic Parts", unitCost: 8.50, lastUpdated: "2024-01-28" },
];

// Helpers
const formatCurrency = (value?: number) => value ? `£${value.toFixed(2)}` : "-";
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const getAvailable = (item: InventoryItem) => item.inStock - item.reserved;

const getStatusInfo = (item: InventoryItem) => {
    const available = getAvailable(item);
    if (available <= 0) return { status: "out_of_stock", label: "Out of Stock", style: STATUS_COLORS.semantic.error };
    if (available < item.lowStockThreshold) return { status: "low_stock", label: "Low Stock", style: STATUS_COLORS.semantic.warning };
    if (available === item.lowStockThreshold) return { status: "threshold", label: "At Threshold", style: STATUS_COLORS.semantic.warning };
    return { status: "in_stock", label: "In Stock", style: STATUS_COLORS.semantic.healthy };
};

const getCategoryIcon = (category: string) => {
    const found = categories.find(c => c.value === category);
    return found?.icon || Package;
};

// Create Item Form
function CreateItemForm({ onClose, onSave }: { onClose?: () => void; onSave?: (item: Partial<InventoryItem>) => void }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [initialQty, setInitialQty] = useState("0");
    const [condition, setCondition] = useState<"new" | "recycled">("new");
    const [threshold, setThreshold] = useState("5");
    const [serialNumber, setSerialNumber] = useState("");
    const [supplier, setSupplier] = useState("");
    const [unitCost, setUnitCost] = useState("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [qrRef, setQrRef] = useState("");

    const handleSave = () => {
        if (!name || !category) {
            toast.error("Name and Category are required");
            return;
        }
        onSave?.({
            id: `INV-${Date.now()}`,
            name,
            category,
            inStock: parseInt(initialQty) || 0,
            reserved: 0,
            condition,
            lowStockThreshold: parseInt(threshold) || 5,
            location: location || "Warehouse A",
            supplier: supplier || undefined,
            unitCost: unitCost ? parseFloat(unitCost) : undefined,
            serialNumber: serialNumber || undefined,
            qrRef: qrRef || undefined,
            notes: notes || undefined,
            lastUpdated: new Date().toISOString().split("T")[0],
        });
        toast.success("Item added to inventory");
        onClose?.();
    };

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-1.5">
                <Label>Item Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 8MP Dome Camera" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Condition <span className="text-destructive">*</span></Label>
                    <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="recycled">Recycled/Refurbished</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Initial Quantity <span className="text-destructive">*</span></Label>
                    <Input type="number" value={initialQty} onChange={(e) => setInitialQty(e.target.value)} min={0} />
                </div>
                <div className="space-y-1.5">
                    <Label>Low Stock Threshold <span className="text-destructive">*</span></Label>
                    <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} min={1} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Serial Number</Label>
                    <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>QR/Barcode Ref</Label>
                    <Input value={qrRef} onChange={(e) => setQrRef(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Supplier</Label>
                    <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Unit Cost (£)</Label>
                    <Input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} step="0.01" />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                        {locations.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Add Item</Button>
            </div>
        </div>
    );
}

// Adjust Stock Form
function AdjustStockForm({ item, onClose, onSave }: { item: InventoryItem; onClose?: () => void; onSave?: (qty: number, reason: string) => void }) {
    const [action, setAction] = useState<"in" | "out">("in");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [jobId, setJobId] = useState("");

    const handleSave = () => {
        const qty = parseInt(quantity) || 0;
        if (qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        if (!reason) {
            toast.error("Reason is required");
            return;
        }
        const adjustedQty = action === "in" ? qty : -qty;
        onSave?.(adjustedQty, reason);
        toast.success(`Stock ${action === "in" ? "added" : "removed"}: ${qty} units`);
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Current Stock: {item.inStock} | Available: {getAvailable(item)}</p>
            </div>
            <div className="space-y-1.5">
                <Label>Action</Label>
                <div className="flex gap-2">
                    <Button
                        variant={action === "in" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAction("in")}
                        className="flex-1"
                    >
                        <ArrowUpCircle className="h-4 w-4 mr-1.5" />Stock In
                    </Button>
                    <Button
                        variant={action === "out" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAction("out")}
                        className="flex-1"
                    >
                        <ArrowDownCircle className="h-4 w-4 mr-1.5" />Stock Out
                    </Button>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Quantity <span className="text-destructive">*</span></Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min={1} />
            </div>
            <div className="space-y-1.5">
                <Label>Reason <span className="text-destructive">*</span></Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Stock delivery, Job allocation..." rows={2} />
            </div>
            <div className="space-y-1.5">
                <Label>Associated Job (optional)</Label>
                <Select value={jobId} onValueChange={setJobId}>
                    <SelectTrigger><SelectValue placeholder="Select job..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="JOB-001">K2S-J-0001 - Johnson Roofing</SelectItem>
                        <SelectItem value="JOB-002">K2S-J-0002 - Acme Construction</SelectItem>
                        <SelectItem value="JOB-003">K2S-J-0003 - Premier Builders</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Confirm Adjustment</Button>
            </div>
        </div>
    );
}

export default function InventoryPage() {
    const { openDrawer, closeDrawer } = useDrawer();
    const { role, canAccess } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // Stats
    const stats = useMemo(() => {
        const totalInStock = inventory.reduce((sum, i) => sum + i.inStock, 0);
        const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
        const totalAvailable = inventory.reduce((sum, i) => sum + getAvailable(i), 0);
        const lowStockCount = inventory.filter(i => getAvailable(i) < i.lowStockThreshold).length;
        const newItems = inventory.filter(i => i.condition === "new").length;
        const recycledItems = inventory.filter(i => i.condition === "recycled").length;
        return { totalInStock, totalReserved, totalAvailable, lowStockCount, newItems, recycledItems };
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
            const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
            const matchesLocation = locationFilter === "all" || item.location === locationFilter;

            const statusInfo = getStatusInfo(item);
            let matchesStatus = true;
            if (statusFilter === "in_stock") matchesStatus = statusInfo.status === "in_stock";
            if (statusFilter === "low_stock") matchesStatus = statusInfo.status === "low_stock" || statusInfo.status === "threshold";
            if (statusFilter === "out_of_stock") matchesStatus = statusInfo.status === "out_of_stock";

            const matchesLowStock = !showLowStockOnly || getAvailable(item) < item.lowStockThreshold;

            return matchesSearch && matchesCategory && matchesCondition && matchesStatus && matchesLocation && matchesLowStock;
        });
    }, [inventory, searchQuery, categoryFilter, conditionFilter, statusFilter, locationFilter, showLowStockOnly]);

    const handleAddItem = () => {
        openDrawer({
            title: "Add Inventory Item",
            description: "Add a new item to stock",
            content: (
                <CreateItemForm
                    onClose={closeDrawer}
                    onSave={(item) => setInventory(prev => [...prev, item as InventoryItem])}
                />
            )
        });
    };

    const handleAdjustStock = (item: InventoryItem) => {
        openDrawer({
            title: "Adjust Stock",
            description: "Manual stock adjustment",
            content: (
                <AdjustStockForm
                    item={item}
                    onClose={closeDrawer}
                    onSave={(qty, reason) => {
                        setInventory(prev => prev.map(i =>
                            i.id === item.id ? { ...i, inStock: Math.max(0, i.inStock + qty), lastUpdated: new Date().toISOString().split("T")[0] } : i
                        ));
                    }}
                />
            )
        });
    };

    const clearLowStockFilter = () => {
        setShowLowStockOnly(false);
    };

    return (
        <PermissionGuard permission="/inventory">
            <Topbar title="Inventory" subtitle="Stock management and tracking" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Low Stock Alert Banner */}
                {stats.lowStockCount > 0 && (
                    <div
                        className={`mb-4 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${showLowStockOnly ? "bg-red-100 dark:bg-red-950/50 border-2 border-red-500" : "bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/50"}`}
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <span className="font-medium text-amber-800 dark:text-amber-300">
                                {stats.lowStockCount} items below minimum stock levels
                            </span>
                        </div>
                        {showLowStockOnly ? (
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearLowStockFilter(); }} className="h-7">
                                <X className="h-4 w-4 mr-1" />Clear Filter
                            </Button>
                        ) : (
                            <Badge variant="secondary" className="text-xs">Click to filter</Badge>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Boxes className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalInStock.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Total In Stock</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalReserved.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Reserved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Warehouse className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalAvailable.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Available</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.newItems} <span className="text-sm font-normal text-muted-foreground">/ {stats.recycledItems}</span></p>
                                    <p className="text-xs text-muted-foreground">New / Recycled</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Bar */}
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[120px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(c => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={conditionFilter} onValueChange={setConditionFilter}>
                            <SelectTrigger className="w-[120px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="Condition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Conditions</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="recycled">Recycled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[120px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs bg-muted/30 border-none">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {locations.map(l => (
                                    <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {role === "Super Admin" && (
                        <Button id="add-inventory-item-btn" onClick={handleAddItem} size="sm" className="h-9 px-4 font-bold text-xs uppercase transition-all active:scale-95 shadow-sm">
                            <Plus className="mr-1.5 h-4 w-4" />Add Item
                        </Button>
                    )}
                </div>

                {/* Inventory Table */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">In Stock</TableHead>
                                    <TableHead className="text-right">Reserved</TableHead>
                                    <TableHead className="text-right">Available</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Unit Cost</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInventory.map(item => {
                                    const available = getAvailable(item);
                                    const statusInfo = getStatusInfo(item);
                                    const Icon = getCategoryIcon(item.category);
                                    return (
                                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell>
                                                <Link href={`/inventory/${item.id}`} className="font-medium text-primary hover:underline">
                                                    {item.name}
                                                </Link>
                                                {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm capitalize">{item.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">{item.inStock}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{item.reserved}</TableCell>
                                            <TableCell className="text-right font-bold">{available}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn("border-none text-[10px] font-bold uppercase py-0.5", item.condition === "new" ? STATUS_COLORS.pipeline.new : STATUS_COLORS.pipeline.contacted)}
                                                >
                                                    {item.condition === "new" ? (
                                                        <><Sparkles className="h-3 w-3 mr-0.5" />New</>
                                                    ) : (
                                                        <><Recycle className="h-3 w-3 mr-0.5" />Recycled</>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{item.lowStockThreshold}</TableCell>
                                            <TableCell>
                                                <Badge className={cn("border-none text-[10px] font-bold uppercase", statusInfo.style)}>
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    {item.location}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm">{formatCurrency(item.unitCost)}</TableCell>
                                            <TableCell>
                                                {canAccess("adjust_stock") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={(e) => { e.stopPropagation(); handleAdjustStock(item); }}
                                                    >
                                                        Adjust
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </PermissionGuard>
    );
}
