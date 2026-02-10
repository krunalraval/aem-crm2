"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Settings,
    Users,
    Briefcase,
    Target,
    ClipboardCheck,
    Package,
    Calendar,
    PenTool as Signature,
    FileText,
    LayoutDashboard,
    Lock,
    Save,
    Plus,
    Trash2,
    GripVertical,
    Check,
    X,
    Upload,
    ChevronRight,
    Edit,
    AlertCircle,
    Copy,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, getStatusStyle } from "@/lib/status-utils";
import { EmptyState as SharedEmptyState } from "@/components/ui/empty-state";

// --- Types & Data ---

const menuItems = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "users", label: "User Management", icon: Users },
    { id: "sales", label: "Sales Settings", icon: Briefcase },
    { id: "targets", label: "Target Settings", icon: Target },
    { id: "checklists", label: "Job Checklist Management", icon: ClipboardCheck },
    { id: "inventory", label: "Inventory Settings", icon: Package },
    { id: "maintenance", label: "Maintenance Scheduling", icon: Calendar },
    { id: "esignature", label: "E-Signature Settings", icon: Signature },
    { id: "quote-templates", label: "Quote Template Management", icon: FileText },
    { id: "pipelines", label: "Pipeline Customisation", icon: LayoutDashboard },
    { id: "system", label: "System Settings", icon: Lock },
];

const mockUsers = [
    { id: "U1", firstName: "John", lastName: "Smith", email: "john@roofingpro.co.uk", role: "Super Admin", color: "#2563eb", active: true, created: "2023-11-12" },
    { id: "U2", firstName: "David", lastName: "Brown", email: "david@roofingpro.co.uk", role: "BDM", color: "#16a34a", active: true, created: "2023-12-05" },
    { id: "U3", firstName: "Sarah", lastName: "Jones", email: "sarah@roofingpro.co.uk", role: "Admin-Accounts", color: "#dc2626", active: true, created: "2024-01-10" },
    { id: "U4", firstName: "Mike", lastName: "Wilson", email: "mike@roofingpro.co.uk", role: "Engineer", color: "#f59e0b", active: true, created: "2024-01-15" },
];

const mockJobTypes = [
    "Installation", "Service", "Preventative Maintenance", "Repair", "Decommission", "Camera Change", "Ad-Hoc"
];

const defaultChecklist = [
    { id: "c1", label: "Arrive on site and sign in", mandatory: true },
    { id: "c2", label: "Visual inspection of existing equipment", mandatory: true },
    { id: "c3", label: "Capture site photos", mandatory: false },
    { id: "c4", label: "Test connectivity", mandatory: true },
];

const defaultPipelineStages = [
    { id: "p1", name: "Initial Contact", color: "#60a5fa" },
    { id: "p2", name: "Site Survey", color: "#c084fc" },
    { id: "p3", name: "Proposal Sent", color: "#fbbf24" },
    { id: "p4", name: "Negotiation", color: "#4ade80" },
];

// --- Components ---

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className="flex items-center gap-3 p-3 bg-card border rounded-lg group shadow-sm">
                <div {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-4 w-4" />
                </div>
                {children}
            </div>
        </div>
    );
}

function SectionHeader({ title, description, badge }: { title: string; description?: string; badge?: string }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
                {badge && <Badge variant="secondary" className="h-5 text-[10px] font-black uppercase tracking-widest">{badge}</Badge>}
            </div>
            {description && <p className="text-xs text-muted-foreground font-medium">{description}</p>}
            <Separator className="mt-4" />
        </div>
    );
}

function SaveButton({ onSave }: { onSave?: () => void }) {
    const handleSave = () => {
        if (onSave) onSave();
        toast.success("Settings saved successfully.");
    };

    return (
        <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSave} className="font-bold text-xs h-9 px-6 bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </div>
    );
}

// --- Specific Settings Panels ---

function GeneralSettings() {
    return (
        <div className="space-y-6">
            <SectionHeader title="General Settings" description="Corporate identity and localization preferences" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Company Name</Label>
                    <Input defaultValue="RoofingPro Ltd" className="h-10 bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Corporate Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20 overflow-hidden relative group">
                            <Upload className="h-5 w-5 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase">Browse Files</Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Default Currency</Label>
                    <Select defaultValue="GBP">
                        <SelectTrigger className="h-10 bg-muted/30 border-none font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Timezone</Label>
                    <Select defaultValue="Europe/London">
                        <SelectTrigger className="h-10 bg-muted/30 border-none font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Europe/London">London (GMT +0:00)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET +1:00)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Date Format</Label>
                    <Select defaultValue="DD/MM/YYYY">
                        <SelectTrigger className="h-10 bg-muted/30 border-none font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK)</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <SaveButton />
        </div>
    );
}

function UserManagement() {
    const [users, setUsers] = useState(mockUsers);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <SectionHeader title="User Management" description="Manage access control and BDM identities" />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button id="add-user-btn" size="sm" className="h-9 font-bold bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="h-4 w-4 mr-2" /> Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-black uppercase">Create New Platform User</DialogTitle>
                            <DialogDescription className="text-xs">Provide identity and role details for the new user.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">First Name</Label>
                                <Input placeholder="e.g. John" className="h-9 font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Last Name</Label>
                                <Input placeholder="e.g. Doe" className="h-9 font-bold" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Corporate Email</Label>
                                <Input placeholder="email@company.com" type="email" className="h-9 font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">System Role</Label>
                                <Select>
                                    <SelectTrigger className="h-9 font-bold">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Super Admin</SelectItem>
                                        <SelectItem value="bdm">BDM</SelectItem>
                                        <SelectItem value="accounts">Admin-Accounts</SelectItem>
                                        <SelectItem value="engineer">Engineer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Assigned Colour</Label>
                                <div className="flex items-center gap-2">
                                    <Input type="color" className="p-0 h-9 w-12 border-none bg-transparent" defaultValue="#2563eb" />
                                    <span className="text-[10px] font-medium text-muted-foreground italic">For BDM Map & Pipeline</span>
                                </div>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phone number (Optional)</Label>
                                <Input placeholder="+44 121..." className="h-9 font-bold" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" className="font-bold uppercase text-[10px]">Cancel</Button>
                            <Button type="submit" size="sm" className="font-bold uppercase text-[10px]" onClick={() => { toast.success("User added successfully"); }}>Add User</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">Identity</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest">Role</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Active</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest">Joined</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right pr-6">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id} className="group hover:bg-muted/10 border-b border-muted/50 last:border-0">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full flex items-center justify-center font-black text-sm shadow-sm border border-white" style={{ backgroundColor: `${user.color}20`, color: user.color }}>
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{user.firstName} {user.lastName}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-baseline gap-2">
                                        <Badge className={cn("text-[9px] font-bold uppercase tracking-widest h-5 border-none",
                                            user.role === "Super Admin" ? STATUS_COLORS.priority.critical :
                                                user.role === "BDM" ? STATUS_COLORS.pipeline.contacted :
                                                    user.role === "Admin-Accounts" ? STATUS_COLORS.pipeline.new :
                                                        STATUS_COLORS.priority.medium)}>
                                            {user.role}
                                        </Badge>
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: user.color }} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Switch checked={user.active} />
                                </TableCell>
                                <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{user.created}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function SalesSettings() {
    return (
        <div className="space-y-6">
            <SectionHeader title="Sales Settings" description="Sales pipeline and deal parameters" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                        VIP/Big Deal Threshold (£) <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    </Label>
                    <Input type="number" min="0" defaultValue="100000" className="h-10 bg-muted/30 border-none font-bold" />
                    <p className="text-[10px] text-muted-foreground">Automatically flag leads as VIP/Big Deal when estimated value exceeds this amount</p>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">VIP Follow-Up Frequency</Label>
                    <Select defaultValue="daily">
                        <SelectTrigger className="h-10 bg-muted/30 border-none font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="every2">Every 2 Days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">How often to generate follow-up reminders for VIP deals</p>
                </div>
                <div className="space-y-2 border-t pt-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Quote Validity Period (Days)</Label>
                    <Input type="number" min="1" defaultValue="30" className="h-10 bg-muted/30 border-none font-bold" />
                    <p className="text-[10px] text-muted-foreground">Default number of days a quote remains valid</p>
                </div>
                <div className="space-y-2 border-t pt-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Quote Expiry Warning (Days)</Label>
                    <Input type="number" min="1" defaultValue="5" className="h-10 bg-muted/30 border-none font-bold" />
                    <p className="text-[10px] text-muted-foreground">Show expiry warning this many days before a quote expires</p>
                </div>
                <div className="space-y-2 col-span-full bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <Label className="text-[10px] font-bold uppercase text-primary">Automated Follow-Up Threshold</Label>
                    <div className="flex items-center gap-4 mt-1">
                        <Input type="number" min="1" defaultValue="3" className="w-32 h-10 bg-white border-primary/20 font-bold" />
                        <span className="text-[10px] text-muted-foreground font-medium">Number of failed contact attempts before automated follow-up email is sent</span>
                    </div>
                </div>
            </div>
            <SaveButton />
        </div>
    );
}

function TargetSettings() {
    return (
        <div className="space-y-6">
            <SectionHeader title="Target Settings" description="BDM sales targets and quotas" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2 p-4 bg-muted/30 rounded-xl">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Global Monthly Target per BDM</Label>
                    <div className="flex items-center gap-3">
                        <Input type="number" min="0" defaultValue="4" className="w-32 h-10 bg-white border-none font-black text-xl" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Sites / Month</span>
                    </div>
                </div>
                <div className="space-y-2 p-4 bg-muted/30 rounded-xl">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Stretch Target per BDM</Label>
                    <div className="flex items-center gap-3">
                        <Input type="number" min="0" defaultValue="10" className="w-32 h-10 bg-white border-none font-black text-xl text-primary" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Bonus Peak</span>
                    </div>
                </div>
            </div>

            <p className="text-[11px] font-black uppercase text-muted-foreground mb-4 px-1">Per-BDM Override Matrix</p>
            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">BDM Identity</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Monthly Target</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Stretch Target</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right pr-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUsers.filter(u => u.role === "BDM").map(user => (
                            <TableRow key={user.id} className="hover:bg-muted/10 border-b border-muted/50 last:border-0">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: user.color }} />
                                        <p className="text-sm font-bold">{user.firstName} {user.lastName}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input type="number" defaultValue="4" className="w-20 mx-auto h-8 text-[11px] font-bold text-center bg-muted/20 border-none focus-visible:ring-primary/20" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Input type="number" defaultValue="10" className="w-20 mx-auto h-8 text-[11px] font-bold text-center bg-muted/20 border-none focus-visible:ring-primary/20" />
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase shadow-sm">Set Individual Target</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            <SaveButton />
        </div>
    );
}

function JobChecklistManagement() {
    const [selectedType, setSelectedType] = useState("Installation");
    const [items, setItems] = useState(defaultChecklist);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((i) => i.id === active.id);
                const newIndex = prev.findIndex((i) => i.id === over?.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const toggleMandatory = (id: string) => {
        setItems(items.map(i => i.id === id ? { ...i, mandatory: !i.mandatory } : i));
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const addItem = () => {
        const newId = `c${items.length + 1}-${Date.now()}`;
        setItems([...items, { id: newId, label: "New Checklist Item", mandatory: false }]);
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Job Checklist Management" description="Standardized operational checklists across job types" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 mb-2 block">System Job Types</Label>
                    <div className="space-y-1">
                        {mockJobTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={cn(
                                    "w-full text-left p-3 rounded-xl text-xs font-bold transition-all border",
                                    selectedType === type
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                        : "bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-black uppercase text-primary mb-1">{selectedType} Checklist Builder</CardTitle>
                                    <CardDescription className="text-xs font-medium">Define steps required for technicians to complete this job.</CardDescription>
                                </div>
                                <Badge variant="secondary" className="h-5 text-[10px] font-black">{items.length} Steps</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-6">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <SortableItem key={item.id} id={item.id}>
                                                <div className="flex-1 flex items-center gap-4">
                                                    <Input
                                                        defaultValue={item.label}
                                                        className="flex-1 h-8 bg-transparent border-none text-xs font-bold focus-visible:ring-0 px-0"
                                                    />
                                                    <div className="flex items-center gap-6 shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black uppercase text-muted-foreground">Mandatory</span>
                                                            <Switch
                                                                checked={item.mandatory}
                                                                onCheckedChange={() => toggleMandatory(item.id)}
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-red-600 transition-colors"
                                                            onClick={() => deleteItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </SortableItem>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <Button variant="outline" className="w-full h-12 border-dashed border-2 mt-4 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary transition-all" onClick={addItem}>
                                <Plus className="h-4 w-4 mr-2" /> Add Selection Item
                            </Button>
                        </CardContent>
                    </Card>
                    <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 italic">
                        <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium">Changes will apply to newly created jobs. Existing jobs retain their original checklist to maintain auditing integrity.</p>
                    </div>
                    <div className="mt-6">
                        <SaveButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InventorySettings() {
    return (
        <div className="space-y-6">
            <SectionHeader title="Inventory Settings" description="Global stock control parameters" />
            <div className="max-w-md space-y-6">
                <Card className="border-none shadow-sm p-6 bg-muted/20">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground">Default Low Stock Threshold</Label>
                            <div className="flex items-center gap-4">
                                <Input type="number" min="0" defaultValue="5" className="w-32 h-10 bg-white border-primary/20 font-black text-lg" />
                                <Badge variant="secondary" className="h-5 text-[10px] font-bold">Recommended: 10% of SKU</Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                                Initial minimum stock level for newly created inventory items.
                                <span className="block font-bold mt-1 text-primary">Note: Per-item thresholds can be specifically overridden on individual inventory items.</span>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            <SaveButton />
        </div>
    );
}

function MaintenanceScheduling() {
    return (
        <div className="space-y-6">
            <SectionHeader title="Maintenance Scheduling" description="Automated service visit parameters" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/5 transition-all">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">First Service Interval</Label>
                    <div className="flex items-baseline gap-2 mt-1">
                        <Input type="number" min="1" defaultValue="6" className="w-24 h-10 bg-white font-black text-xl" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Months after Install</span>
                    </div>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/5 transition-all">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Recurring Interval</Label>
                    <div className="flex items-baseline gap-2 mt-1">
                        <Input type="number" min="1" defaultValue="12" className="w-24 h-10 bg-white font-black text-xl" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Months between visits</span>
                    </div>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/5 transition-all">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Engineer Lead Time</Label>
                    <div className="flex items-baseline gap-2 mt-1">
                        <Input type="number" min="1" defaultValue="14" className="w-24 h-10 bg-white font-black text-xl" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Days Notification</span>
                    </div>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/5 transition-all">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Client Lead Time</Label>
                    <div className="flex items-baseline gap-2 mt-1">
                        <Input type="number" min="1" defaultValue="7" className="w-24 h-10 bg-white font-black text-xl" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Days Preparation</span>
                    </div>
                </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-500" />
                <p className="text-[10px] font-bold text-amber-700">Service intervals generate automated scheduling drafts in the Task module. Per-site overrides can be set on individual site records.</p>
            </div>
            <SaveButton />
        </div>
    );
}

function ESignatureSettings() {
    return (
        <div className="space-y-6">
            <SectionHeader title="E-Signature Settings" description="Contract and document signing parameters" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100 flex flex-col justify-between">
                    <div>
                        <Label className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Unsigned Reminder Trigger</Label>
                        <p className="text-[10px] text-muted-foreground font-medium mb-4">Days after sending before a reminder is triggered for unsigned documents</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <Input type="number" min="1" defaultValue="7" className="w-24 h-10 bg-white font-black text-xl" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Days</span>
                    </div>
                </div>
                <div className="space-y-2 p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100 flex flex-col justify-between">
                    <div>
                        <Label className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Signing Link Expiry</Label>
                        <p className="text-[10px] text-muted-foreground font-medium mb-4">Duration before a secure signing link becomes inactive and requires re-issuance</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <Input type="number" min="1" defaultValue="14" className="w-24 h-10 bg-white font-black text-xl" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">Days</span>
                    </div>
                </div>
            </div>
            <SaveButton />
        </div>
    );
}

function QuoteTemplateManagement() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <SectionHeader title="Quote Templates" description="Standardized document blueprints for rapid proposal generation" />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button id="add-quote-template-btn" size="sm" className="h-9 font-bold bg-primary shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="h-4 w-4 mr-2" /> Add Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-sm font-black uppercase">Create Proposal Template</DialogTitle>
                            <DialogDescription className="text-xs">Define a reusable blueprint for quotes and service agreements.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Template Name</Label>
                                <Input placeholder="e.g. Standard Security System" className="h-9 font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">System Category</Label>
                                <Select>
                                    <SelectTrigger className="h-9 font-bold font-bold">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cctv">CCTV</SelectItem>
                                        <SelectItem value="alarm">Intruder Alarm</SelectItem>
                                        <SelectItem value="access">Access Control</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Default Base Rate (£)</Label>
                                <Input type="number" placeholder="0.00" className="h-9 font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Billing Terms</Label>
                                <Select>
                                    <SelectTrigger className="h-9 font-bold">
                                        <SelectValue placeholder="Select Terms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="net30">Net 30 Days</SelectItem>
                                        <SelectItem value="upfront">100% Upfront</SelectItem>
                                        <SelectItem value="split">50/50 Split</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Standard Duration</Label>
                                <Input placeholder="e.g. 1 Day" className="h-9 font-bold" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Internal Notes / Description</Label>
                                <textarea className="w-full h-24 p-2 rounded-md border border-input bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-primary outline-none" placeholder="Technical specifications or exclusions..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" size="sm" className="font-bold uppercase text-[10px]">Cancel</Button>
                            <Button size="sm" className="font-bold uppercase text-[10px]" onClick={() => { toast.success("Template created"); }}>Save Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">Visual Blueprint</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest">System Architecture</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest">Default Unit Fee</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest">Last Version</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right pr-6">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[
                            { name: "Standard Installation Mk.II", type: "Digital CCTV", rate: 1250, date: "15 Jan 2024" },
                            { name: "Maintenance Tier 1", type: "Security System", rate: 450, date: "20 Jan 2024" },
                            { name: "Enterprise Access Grid", type: "Access Control", rate: 3800, date: "02 Feb 2024" },
                        ].map((tpl, i) => (
                            <TableRow key={i} className="group hover:bg-muted/10 border-b border-muted/50 last:border-0 hover:border-primary/20 transition-all">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm animate-pulse-slow">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black tracking-tight">{tpl.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">APPROVED VERSION</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn("text-[9px] font-bold uppercase tracking-widest border-none", STATUS_COLORS.pipeline.follow_up)}>
                                        {tpl.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs font-black text-slate-900">£{tpl.rate.toLocaleString()}</TableCell>
                                <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tpl.date}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary"><Copy className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function PipelineCustomisation() {
    const [leadsStages, setLeadsStages] = useState(defaultPipelineStages);
    const [quotesStages, setQuotesStages] = useState([
        { id: "q1", name: "Draft", color: "#94a3b8" },
        { id: "q2", name: "Client Review", color: "#0ea5e9" },
        { id: "q3", name: "Accepted", color: "#10b981" },
        { id: "q4", name: "Invoiced", color: "#6366f1" },
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent, type: "leads" | "quotes") => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const setter = type === "leads" ? setLeadsStages : setQuotesStages;
            setter((prev) => {
                const oldIndex = prev.findIndex((i) => i.id === active.id);
                const newIndex = prev.findIndex((i) => i.id === over?.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const PipelineEditor = ({ stages, type }: { stages: any[], type: "leads" | "quotes" }) => (
        <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-tight">{type} Pipeline Topology</CardTitle>
                        <CardDescription className="text-xs font-medium">Reorder stages to define the visual workflow journey.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-black uppercase tracking-widest border-2">
                        <Plus className="h-3.5 w-3.5 mr-2" /> Add Stage
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, type)}>
                    <SortableContext items={stages.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {stages.map(stage => (
                                <SortableItem key={stage.id} id={stage.id}>
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Input type="color" defaultValue={stage.color} className="p-0 h-6 w-8 border-none bg-transparent shadow-sm rounded cursor-pointer" />
                                            <Input defaultValue={stage.name} className="h-8 bg-transparent border-none font-bold text-sm focus-visible:ring-0 px-0 min-w-[150px]" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50" onClick={() => {
                                                if (window.confirm("Removing a stage will require reassigning any items currently in that stage. Proceed?")) {
                                                    toast.info("Deletion is a restricted super-admin action in this build.");
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl mt-4">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">Stage modifications affect global Kanban board visibility.</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <SectionHeader title="Pipeline Customisation" description="Visual sales workflow stages and funnel orchestration" />

            <Tabs defaultValue="leads" className="space-y-6">
                <TabsList className="bg-muted/30 p-1 rounded-xl h-11 border-none shadow-inner w-fit">
                    <TabsTrigger value="leads" className="rounded-lg h-9 font-black text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Lead Pipeline</TabsTrigger>
                    <TabsTrigger value="quotes" className="rounded-lg h-9 font-black text-[10px] uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Quote Pipeline</TabsTrigger>
                </TabsList>

                <TabsContent value="leads">
                    <PipelineEditor stages={leadsStages} type="leads" />
                </TabsContent>

                <TabsContent value="quotes">
                    <PipelineEditor stages={quotesStages} type="quotes" />
                </TabsContent>
            </Tabs>
            <SaveButton />
        </div>
    );
}

function SystemSettings() {
    return (
        <div className="space-y-6">
            <SectionHeader title="System Settings" description="Global platform security and core infrastructure configs" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm p-6 bg-muted/20">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Session Timeout</Label>
                        <div className="flex items-baseline gap-3">
                            <Input type="number" min="5" defaultValue="30" className="w-24 h-12 bg-white border-2 border-primary/10 font-black text-2xl text-center" />
                            <span className="text-xs font-bold text-muted-foreground uppercase">Inactive Minutes</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                            Platform will automatically trigger a secure logout for any user exceeding this inactivity threshold.
                        </p>
                    </div>
                </Card>

                <Card className="border-none shadow-sm p-1 overflow-hidden">
                    <div className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-primary/5 to-primary/10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-primary" />
                                <Label className="text-[11px] font-black uppercase text-primary">BDM Visual Identity</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mb-4 leading-relaxed">
                                Colour assignment for BDMs is critical for Map visualisations and Pipeline card ownership clusters.
                            </p>
                        </div>
                        <Button variant="outline" className="w-full bg-white font-black text-[10px] uppercase tracking-widest h-9 border-none shadow-sm">
                            Configure via Users List <ChevronRight className="h-3.5 w-3.5 ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="space-y-4 pt-4">
                <p className="text-[11px] font-black uppercase text-muted-foreground ml-1">Critical Operations</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-10 text-[10px] font-black uppercase bg-white/50 border-dashed">Flush System Cache</Button>
                    <Button variant="outline" className="h-10 text-[10px] font-black uppercase bg-white/50 border-dashed">Re-Index Search Data</Button>
                    <Button variant="outline" className="h-10 text-[10px] font-black uppercase text-destructive border-destructive/20 hover:bg-red-50">Master System Lock</Button>
                </div>
            </div>
            <SaveButton />
        </div>
    );
}

// --- Main Settings Layout ---

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState("general");

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Topbar title="Super Admin Control Panel" />
            <div className="flex-1 flex overflow-hidden">
                {/* Fixed Sidebar */}
                <aside className="w-72 bg-white dark:bg-slate-900 border-r flex flex-col pt-6 overflow-y-auto no-scrollbar shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] z-10">
                    <div className="px-6 mb-6">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Control Centre</p>
                                <p className="text-sm font-black text-primary">v2.0.4 r27</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 space-y-1 pb-12">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all relative group",
                                    activeSection === item.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02] z-20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", activeSection === item.id ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                                {item.label}
                                {activeSection === item.id && (
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-l-full" />
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <section className="flex-1 overflow-y-auto bg-slate-50/50">
                    <div className="max-w-4xl mx-auto p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {activeSection === "general" && <GeneralSettings />}
                        {activeSection === "users" && <UserManagement />}
                        {activeSection === "sales" && <SalesSettings />}
                        {activeSection === "targets" && <TargetSettings />}
                        {activeSection === "checklists" && <JobChecklistManagement />}
                        {activeSection === "inventory" && <InventorySettings />}
                        {activeSection === "maintenance" && <MaintenanceScheduling />}
                        {activeSection === "esignature" && <ESignatureSettings />}
                        {activeSection === "quote-templates" && <QuoteTemplateManagement />}
                        {activeSection === "pipelines" && <PipelineCustomisation />}
                        {activeSection === "system" && <SystemSettings />}
                    </div>
                </section>
            </div>
        </div>
    );
}
