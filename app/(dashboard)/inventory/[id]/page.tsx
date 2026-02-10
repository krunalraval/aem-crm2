"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
    ArrowLeft,
    Edit,
    Package,
    MapPin,
    Building2,
    Clock,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle,
    History,
    Sparkles,
    Recycle,
    QrCode,
    Tag,
    DollarSign,
    FileText,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
} from "lucide-react";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

// Types
interface StockMovement {
    id: string;
    action: "in" | "out" | "reserved" | "released";
    quantity: number;
    previousLevel: number;
    newLevel: number;
    reason: string;
    jobRef?: string;
    siteRef?: string;
    performedBy: string;
    timestamp: string;
}

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
    movements: StockMovement[];
}

// Constants
const categories = [
    { value: "cameras", label: "Cameras" },
    { value: "recorders", label: "Recorders" },
    { value: "cabling", label: "Cabling" },
    { value: "networking", label: "Networking" },
    { value: "accessories", label: "Accessories" },
    { value: "tools", label: "Tools" },
];

const locations = ["Warehouse A", "Warehouse B", "Van Stock", "Office"];

// Mock Data
const mockItems: Record<string, InventoryItem> = {
    "INV-001": {
        id: "INV-001",
        name: "8MP Dome Camera",
        category: "cameras",
        sku: "CAM-8MP-D",
        inStock: 25,
        reserved: 8,
        condition: "new",
        lowStockThreshold: 10,
        location: "Warehouse A",
        supplier: "Hikvision UK",
        unitCost: 89.99,
        serialNumber: "HIK-2024-00125",
        qrRef: "QR-CAM-001",
        notes: "High-resolution dome cameras for indoor/outdoor use. IP67 rated.",
        lastUpdated: "2024-01-28",
        movements: [
            { id: "M-1", action: "in", quantity: 10, previousLevel: 15, newLevel: 25, reason: "Stock delivery received", performedBy: "John Doe", timestamp: "2024-01-28T14:30:00Z" },
            { id: "M-2", action: "reserved", quantity: 4, previousLevel: 4, newLevel: 8, reason: "Reserved for Job K2S-J-0001", jobRef: "K2S-J-0001", siteRef: "Johnson Roofing HQ", performedBy: "System", timestamp: "2024-01-27T09:15:00Z" },
            { id: "M-3", action: "out", quantity: 6, previousLevel: 21, newLevel: 15, reason: "Deployed to site", jobRef: "K2S-J-0099", siteRef: "Acme Construction", performedBy: "David Brown", timestamp: "2024-01-25T11:00:00Z" },
            { id: "M-4", action: "released", quantity: 2, previousLevel: 6, newLevel: 4, reason: "Job cancelled, stock released", jobRef: "K2S-J-0088", performedBy: "System", timestamp: "2024-01-20T10:00:00Z" },
            { id: "M-5", action: "in", quantity: 20, previousLevel: 1, newLevel: 21, reason: "Bulk order delivery", performedBy: "John Doe", timestamp: "2024-01-15T14:00:00Z" },
        ],
    },
    "INV-004": {
        id: "INV-004",
        name: "8-Channel NVR",
        category: "recorders",
        sku: "NVR-8CH",
        inStock: 12,
        reserved: 2,
        condition: "recycled",
        lowStockThreshold: 4,
        location: "Warehouse A",
        supplier: "Dahua Tech",
        unitCost: 180.00,
        serialNumber: "DAH-2023-NVR-042",
        lastUpdated: "2024-01-26",
        movements: [
            { id: "M-1", action: "in", quantity: 3, previousLevel: 9, newLevel: 12, reason: "Returned from decommission job", jobRef: "K2S-J-0075", siteRef: "Old Warehouse", performedBy: "Chris Martin", timestamp: "2024-01-26T16:00:00Z" },
            { id: "M-2", action: "reserved", quantity: 2, previousLevel: 0, newLevel: 2, reason: "Reserved for upcoming job", jobRef: "K2S-J-0102", performedBy: "System", timestamp: "2024-01-24T08:30:00Z" },
        ],
    },
};

// Helpers
const formatCurrency = (value?: number) => value ? `£${value.toFixed(2)}` : "-";
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const formatDateTime = (timestamp: string) => new Date(timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const getAvailable = (item: InventoryItem) => item.inStock - item.reserved;

const getStatusInfo = (item: InventoryItem) => {
    const available = getAvailable(item);
    if (available <= 0) return { status: "out_of_stock", label: "Out of Stock", style: STATUS_COLORS.semantic.error };
    if (available < item.lowStockThreshold) return { status: "low_stock", label: "Low Stock", style: STATUS_COLORS.semantic.warning };
    if (available === item.lowStockThreshold) return { status: "threshold", label: "At Threshold", style: STATUS_COLORS.semantic.warning };
    return { status: "in_stock", label: "In Stock", style: STATUS_COLORS.semantic.healthy };
};

const actionStyles: Record<string, { style: string; icon: typeof ArrowUp; label: string }> = {
    in: { style: STATUS_COLORS.semantic.healthy, icon: ArrowUp, label: "Stock In" },
    out: { style: STATUS_COLORS.semantic.error, icon: ArrowDown, label: "Stock Out" },
    reserved: { style: STATUS_COLORS.semantic.warning, icon: Lock, label: "Reserved" },
    released: { style: STATUS_COLORS.pipeline.new, icon: Unlock, label: "Released" },
};

// Info Row Component
function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
    return (
        <div className="flex items-start gap-3 py-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-words">{value || "-"}</p>
            </div>
        </div>
    );
}

// Adjust Stock Form
function AdjustStockForm({ item, onClose, onSave }: { item: InventoryItem; onClose?: () => void; onSave?: (movement: Partial<StockMovement>) => void }) {
    const [action, setAction] = useState<"in" | "out">("in");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [jobRef, setJobRef] = useState("");

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
        onSave?.({
            action,
            quantity: qty,
            reason,
            jobRef: jobRef || undefined,
        });
        toast.success(`Stock ${action === "in" ? "added" : "removed"}: ${qty} units`);
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Current: {item.inStock} | Reserved: {item.reserved} | Available: {getAvailable(item)}</p>
            </div>
            <div className="space-y-1.5">
                <Label>Action</Label>
                <div className="flex gap-2">
                    <Button variant={action === "in" ? "default" : "outline"} size="sm" onClick={() => setAction("in")} className="flex-1">
                        <ArrowUpCircle className="h-4 w-4 mr-1.5" />Stock In
                    </Button>
                    <Button variant={action === "out" ? "default" : "outline"} size="sm" onClick={() => setAction("out")} className="flex-1">
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
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
                <Label>Associated Job (optional)</Label>
                <Select value={jobRef} onValueChange={setJobRef}>
                    <SelectTrigger><SelectValue placeholder="Select job..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="K2S-J-0001">K2S-J-0001 - Johnson Roofing</SelectItem>
                        <SelectItem value="K2S-J-0002">K2S-J-0002 - Acme Construction</SelectItem>
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

// Edit Item Form
function EditItemForm({ item, onClose, onSave }: { item: InventoryItem; onClose?: () => void; onSave?: (updates: Partial<InventoryItem>) => void }) {
    const [name, setName] = useState(item.name);
    const [category, setCategory] = useState(item.category);
    const [condition, setCondition] = useState(item.condition);
    const [threshold, setThreshold] = useState(String(item.lowStockThreshold));
    const [serialNumber, setSerialNumber] = useState(item.serialNumber || "");
    const [supplier, setSupplier] = useState(item.supplier || "");
    const [unitCost, setUnitCost] = useState(item.unitCost ? String(item.unitCost) : "");
    const [location, setLocation] = useState(item.location);
    const [notes, setNotes] = useState(item.notes || "");
    const [qrRef, setQrRef] = useState(item.qrRef || "");

    const handleSave = () => {
        if (!name || !category) {
            toast.error("Name and Category are required");
            return;
        }
        onSave?.({
            name,
            category,
            condition,
            lowStockThreshold: parseInt(threshold) || 5,
            serialNumber: serialNumber || undefined,
            supplier: supplier || undefined,
            unitCost: unitCost ? parseFloat(unitCost) : undefined,
            location,
            notes: notes || undefined,
            qrRef: qrRef || undefined,
        });
        toast.success("Item updated");
        onClose?.();
    };

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-1.5">
                <Label>Item Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Category <span className="text-destructive">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Condition</Label>
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
                    <Label>Low Stock Threshold</Label>
                    <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} min={1} />
                </div>
                <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {locations.map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    );
}

export default function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openDrawer, closeDrawer } = useDrawer();
    const [item, setItem] = useState<InventoryItem | null>(null);

    // Initialize item
    if (!item) {
        const foundItem = mockItems[id] || mockItems["INV-001"];
        setItem(foundItem);
        return null;
    }

    const available = getAvailable(item);
    const statusInfo = getStatusInfo(item);

    const handleAdjustStock = () => {
        openDrawer({
            title: "Adjust Stock",
            description: "Manual stock adjustment",
            content: (
                <AdjustStockForm
                    item={item}
                    onClose={closeDrawer}
                    onSave={(movement) => {
                        const qty = movement.action === "in" ? movement.quantity! : -movement.quantity!;
                        setItem(prev => prev ? {
                            ...prev,
                            inStock: Math.max(0, prev.inStock + qty),
                            movements: [{
                                id: `M-${Date.now()}`,
                                action: movement.action!,
                                quantity: movement.quantity!,
                                previousLevel: prev.inStock,
                                newLevel: Math.max(0, prev.inStock + qty),
                                reason: movement.reason!,
                                jobRef: movement.jobRef,
                                performedBy: "Current User",
                                timestamp: new Date().toISOString(),
                            }, ...prev.movements],
                        } : null);
                    }}
                />
            )
        });
    };

    const handleEditItem = () => {
        openDrawer({
            title: "Edit Item",
            description: "Update item details",
            content: (
                <EditItemForm
                    item={item}
                    onClose={closeDrawer}
                    onSave={(updates) => {
                        setItem(prev => prev ? { ...prev, ...updates } : null);
                    }}
                />
            )
        });
    };

    return (
        <>
            <Topbar title="Inventory Item" subtitle={item.sku || item.id} />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
                {/* Back */}
                <Button variant="ghost" size="sm" asChild className="mb-4 h-8 px-2 text-muted-foreground">
                    <Link href="/inventory"><ArrowLeft className="mr-1 h-4 w-4" />Back to Inventory</Link>
                </Button>

                {/* Header */}
                <Card className="mb-4 border-none shadow-sm">
                    <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg md:text-xl font-bold">{item.name}</h1>
                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", item.condition === "new" ? STATUS_COLORS.pipeline.new : STATUS_COLORS.pipeline.contacted)}>
                                        {item.condition === "new" ? <><Sparkles className="h-3 w-3 mr-0.5" />New</> : <><Recycle className="h-3 w-3 mr-0.5" />Recycled</>}
                                    </Badge>
                                    <Badge className={cn("border-none text-[10px] font-bold uppercase", statusInfo.style)}>
                                        {statusInfo.label}
                                    </Badge>
                                </div>
                                {item.sku && <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleEditItem}>
                                    <Edit className="h-4 w-4 mr-1.5" />Edit Item
                                </Button>
                                <Button size="sm" onClick={handleAdjustStock}>
                                    <ArrowUpCircle className="h-4 w-4 mr-1.5" />Adjust Stock
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Stock Levels */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold">Stock Levels</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-2xl font-bold">{item.inStock}</p>
                                        <p className="text-xs text-muted-foreground">In Stock</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                        <p className="text-2xl font-bold text-amber-700">{item.reserved}</p>
                                        <p className="text-xs text-muted-foreground">Reserved</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${available < item.lowStockThreshold ? "bg-red-50 dark:bg-red-950/30" : "bg-green-50 dark:bg-green-950/30"}`}>
                                        <p className={`text-2xl font-bold ${available < item.lowStockThreshold ? "text-red-700" : "text-green-700"}`}>{available}</p>
                                        <p className="text-xs text-muted-foreground">Available</p>
                                    </div>
                                </div>
                                {available < item.lowStockThreshold && (
                                    <div className="mt-3 p-2 bg-red-100 dark:bg-red-950/50 rounded-lg flex items-center gap-2 text-sm text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        Below threshold of {item.lowStockThreshold}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Item Details */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold">Item Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InfoRow label="Category" value={<span className="capitalize">{item.category}</span>} icon={Tag} />
                                <InfoRow label="Location" value={item.location} icon={MapPin} />
                                <InfoRow label="Supplier" value={item.supplier} icon={Building2} />
                                <InfoRow label="Unit Cost" value={formatCurrency(item.unitCost)} icon={DollarSign} />
                                <InfoRow label="Low Stock Threshold" value={item.lowStockThreshold} icon={AlertTriangle} />
                                <InfoRow label="Serial Number" value={item.serialNumber} icon={FileText} />
                                <InfoRow label="QR/Barcode Ref" value={item.qrRef} icon={QrCode} />
                                <InfoRow label="Last Updated" value={formatDate(item.lastUpdated)} icon={Clock} />
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {item.notes && (
                            <Card className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Movement History */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <History className="h-4 w-4" />Stock Movement History
                                    </CardTitle>
                                    <span className="text-xs text-muted-foreground">{item.movements.length} records</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Job/Site</TableHead>
                                            <TableHead>By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {item.movements.map(movement => {
                                            const style = actionStyles[movement.action];
                                            const Icon = style.icon;
                                            return (
                                                <TableRow key={movement.id}>
                                                    <TableCell className="text-sm">{formatDateTime(movement.timestamp)}</TableCell>
                                                    <TableCell>
                                                        <Badge className={cn("border-none text-[10px] uppercase font-bold", style.style)}>
                                                            <Icon className="h-3 w-3 mr-0.5" />{style.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        {movement.action === "in" || movement.action === "released" ? "+" : "-"}{movement.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-sm max-w-[200px] truncate">{movement.reason}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {movement.jobRef && (
                                                            <Link href={`/jobs/${movement.jobRef}`} className="text-primary hover:underline">
                                                                {movement.jobRef}
                                                            </Link>
                                                        )}
                                                        {movement.siteRef && <span className="text-xs block">{movement.siteRef}</span>}
                                                    </TableCell>
                                                    <TableCell className="text-sm">{movement.performedBy}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
