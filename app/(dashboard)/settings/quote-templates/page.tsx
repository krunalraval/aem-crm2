"use client";

import { useState } from "react";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    FileText,
    Camera,
    Shield,
    Settings,
    Wrench,
    ClipboardList,
} from "lucide-react";

// Types
interface QuoteTemplate {
    id: string;
    name: string;
    systemType: string;
    defaultRate: number;
    defaultUnits: number;
    billingTerms: string;
    description?: string;
    lastModified: string;
}

// Mock Data
const initialTemplates: QuoteTemplate[] = [
    { id: "TPL-001", name: "8-Camera Hardwired System", systemType: "CCTV - Hardwired", defaultRate: 450, defaultUnits: 8, billingTerms: "Monthly", description: "Standard 8-camera hardwired CCTV package for medium-sized premises.", lastModified: "2024-01-25" },
    { id: "TPL-002", name: "Wireless Tower System", systemType: "CCTV - Wireless", defaultRate: 650, defaultUnits: 4, billingTerms: "Monthly", description: "Wireless camera tower for remote locations and construction sites.", lastModified: "2024-01-22" },
    { id: "TPL-003", name: "Access Control Package", systemType: "Access Control", defaultRate: 350, defaultUnits: 2, billingTerms: "Monthly", description: "Door access control with key fobs and card readers.", lastModified: "2024-01-18" },
    { id: "TPL-004", name: "Service Visit", systemType: "Service", defaultRate: 150, defaultUnits: 1, billingTerms: "One-Off", description: "Single on-site service visit for maintenance or repairs.", lastModified: "2024-01-15" },
    { id: "TPL-005", name: "Security Audit", systemType: "Consultation", defaultRate: 500, defaultUnits: 1, billingTerms: "One-Off", description: "Comprehensive security assessment and recommendations report.", lastModified: "2024-01-10" },
];

const systemTypes = [
    { value: "CCTV - Hardwired", icon: Camera },
    { value: "CCTV - Wireless", icon: Camera },
    { value: "Access Control", icon: Shield },
    { value: "Service", icon: Wrench },
    { value: "Consultation", icon: ClipboardList },
];

const billingOptions = ["Weekly", "Fortnightly", "Monthly", "One-Off"];

// Helpers
const formatCurrency = (value: number) => `£${value.toLocaleString()}`;
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const getSystemTypeIcon = (systemType: string) => {
    const found = systemTypes.find(s => s.value === systemType);
    return found?.icon || FileText;
};

// Template Form
function TemplateForm({ template, onClose, onSave }: { template?: QuoteTemplate; onClose?: () => void; onSave?: (t: QuoteTemplate) => void }) {
    const [name, setName] = useState(template?.name || "");
    const [systemType, setSystemType] = useState(template?.systemType || "");
    const [defaultRate, setDefaultRate] = useState(template?.defaultRate || 0);
    const [defaultUnits, setDefaultUnits] = useState(template?.defaultUnits || 1);
    const [billingTerms, setBillingTerms] = useState(template?.billingTerms || "Monthly");
    const [description, setDescription] = useState(template?.description || "");

    const handleSave = () => {
        if (!name || !systemType) {
            toast.error("Name and System Type are required");
            return;
        }
        const newTemplate: QuoteTemplate = {
            id: template?.id || `TPL-${Date.now()}`,
            name,
            systemType,
            defaultRate,
            defaultUnits,
            billingTerms,
            description,
            lastModified: new Date().toISOString().split("T")[0],
        };
        onSave?.(newTemplate);
        toast.success(template ? "Template updated" : "Template created");
        onClose?.();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Template Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 8-Camera System" />
            </div>
            <div className="space-y-1.5">
                <Label>System Type <span className="text-destructive">*</span></Label>
                <Select value={systemType} onValueChange={setSystemType}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                        {systemTypes.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Default Rate</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                        <Input type="number" value={defaultRate} onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)} className="pl-7" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Default Units</Label>
                    <Input type="number" value={defaultUnits} onChange={(e) => setDefaultUnits(parseInt(e.target.value) || 1)} min={1} />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label>Billing Terms</Label>
                <Select value={billingTerms} onValueChange={setBillingTerms}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {billingOptions.map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Template description..." rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>{template ? "Update Template" : "Create Template"}</Button>
            </div>
        </div>
    );
}

export default function QuoteTemplatesPage() {
    const { openDrawer, closeDrawer } = useDrawer();
    const [templates, setTemplates] = useState<QuoteTemplate[]>(initialTemplates);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAddTemplate = () => {
        openDrawer({
            title: "Add Template",
            description: "Create a new quote template",
            content: (
                <TemplateForm
                    onClose={closeDrawer}
                    onSave={(t) => setTemplates(prev => [...prev, t])}
                />
            )
        });
    };

    const handleEditTemplate = (template: QuoteTemplate) => {
        openDrawer({
            title: "Edit Template",
            description: `Editing ${template.name}`,
            content: (
                <TemplateForm
                    template={template}
                    onClose={closeDrawer}
                    onSave={(t) => setTemplates(prev => prev.map(p => p.id === t.id ? t : p))}
                />
            )
        });
    };

    const handleDeleteTemplate = () => {
        if (!deleteId) return;
        setTemplates(prev => prev.filter(t => t.id !== deleteId));
        toast.success("Template deleted");
        setDeleteId(null);
    };

    return (
        <>
            <Topbar title="Quote Templates" subtitle="Manage quote templates for quick creation" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Back Link */}
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-muted-foreground">
                        <Link href="/settings"><ArrowLeft className="mr-1 h-4 w-4" />Back to Settings</Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-lg font-bold">Quote Templates</h1>
                        <p className="text-sm text-muted-foreground">{templates.length} templates configured</p>
                    </div>
                    <Button size="sm" onClick={handleAddTemplate}>
                        <Plus className="mr-1.5 h-4 w-4" />Add Template
                    </Button>
                </div>

                {/* Templates Table */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template Name</TableHead>
                                    <TableHead>System Type</TableHead>
                                    <TableHead className="text-right">Default Rate</TableHead>
                                    <TableHead>Billing</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.map((template) => {
                                    const Icon = getSystemTypeIcon(template.systemType);
                                    return (
                                        <TableRow key={template.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Icon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{template.name}</p>
                                                        {template.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">{template.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs font-medium">{template.systemType}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(template.defaultRate)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{template.billingTerms}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(template.lastModified)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditTemplate(template)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(template.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quote template.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
