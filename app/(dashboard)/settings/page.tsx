"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    User,
    Bell,
    Shield,
    Users,
    FileText,
    Settings,
    Save,
    Camera,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Key,
    Smartphone,
    Monitor,
    LogOut,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Plus,
} from "lucide-react";

// Mock Data
const mockProfile = {
    id: "USR-001",
    name: "John Smith",
    email: "john.smith@roofingpro.co.uk",
    phone: "(0121) 555-0123",
    companyName: "RoofingPro Ltd",
    jobTitle: "Operations Manager",
};

const mockNotifications = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    frequency: "realtime",
};

const mockSecurity = {
    twoFactorEnabled: false,
    lastPasswordChange: "2023-12-15",
    sessions: [
        { id: "SES-001", device: "Chrome on MacOS", location: "Birmingham, UK", lastActive: "2024-01-31T10:30:00Z", current: true },
        { id: "SES-002", device: "Safari on iPhone", location: "Birmingham, UK", lastActive: "2024-01-30T18:45:00Z", current: false },
    ],
};

const mockRoles = [
    { id: "ROLE-001", name: "Admin", description: "Full access to all system modules and configuration", usersCount: 2 },
    { id: "ROLE-002", name: "Operations", description: "Project management and resource scheduling access", usersCount: 3 },
    { id: "ROLE-003", name: "Field Tech", description: "Task reporting and material usage logging", usersCount: 8 },
];

const modules = ["Leads", "Quotes", "Jobs", "Projects", "Finance", "Inventory", "Scheduling", "Reports", "RMS"];
const permissionTypes = ["view", "create", "edit", "delete"];

const mockTemplates = [
    { id: "TPL-001", name: "RoofingPro Standard Invoice", type: "invoice", lastModified: "2024-01-15", status: "active" },
    { id: "TPL-002", name: "Resident Quote Proposal", type: "quote", lastModified: "2024-01-10", status: "active" },
    { id: "TPL-003", name: "Milestone Alert Email", type: "email", lastModified: "2024-01-20", status: "active" },
];

const templateTypeStyles: Record<string, string> = {
    invoice: "bg-emerald-50 text-emerald-700",
    quote: "bg-blue-50 text-blue-700",
    email: "bg-indigo-50 text-indigo-700",
};

// Form Row Component
function FormRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between py-4 first:pt-0 last:pb-0">
            <div className="space-y-0.5">
                <Label className="text-sm font-bold tracking-tight">{label}</Label>
                {description && <p className="text-[11px] font-medium text-muted-foreground">{description}</p>}
            </div>
            <div className="mt-2 sm:mt-0 sm:min-w-[240px] flex justify-end">
                {children}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("profile");
    const [selectedRole, setSelectedRole] = useState("Admin");

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <>
            <Topbar title="Platform Preferences" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                <div className="max-w-5xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start h-12 p-0 mb-8 space-x-2">
                            {[
                                { id: "profile", label: "Identity", icon: User },
                                { id: "security", label: "Security", icon: Shield },
                                { id: "notifications", label: "Alerts", icon: Bell },
                                { id: "roles", label: "Permissions", icon: Users },
                                { id: "templates", label: "Documents", icon: FileText },
                                { id: "system", label: "System", icon: Settings },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-bold uppercase tracking-widest px-6 h-full transition-all"
                                >
                                    <tab.icon className="mr-2 h-3.5 w-3.5" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Profile Identity */}
                        <TabsContent value="profile" className="m-0 space-y-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" />
                                        Identity Profile
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium">Manage your personal presence on the platform</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-2">
                                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                                        <div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary relative group cursor-pointer overflow-hidden">
                                            <User className="h-10 w-10 opacity-40 group-hover:scale-110 transition-transform" />
                                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Camera className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 font-bold">
                                            <p className="text-lg tracking-tight">John Smith</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{mockProfile.jobTitle} • {mockProfile.companyName}</p>
                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest bg-background border-none shadow-sm mt-2">Replace Avatar</Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Legal Full Name</Label>
                                            <Input defaultValue={mockProfile.name} className="h-10 bg-muted/30 border-none shadow-none font-bold text-sm focus-visible:ring-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Corporate Email</Label>
                                            <Input defaultValue={mockProfile.email} className="h-10 bg-muted/30 border-none shadow-none font-bold text-sm focus-visible:ring-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Phone</Label>
                                            <Input defaultValue={mockProfile.phone} className="h-10 bg-muted/30 border-none shadow-none font-bold text-sm focus-visible:ring-primary/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Official Job Title</Label>
                                            <Input defaultValue={mockProfile.jobTitle} className="h-10 bg-muted/30 border-none shadow-none font-bold text-sm focus-visible:ring-primary/20" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button className="font-bold text-xs h-9 px-6 group">
                                            <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                            Commit Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Control */}
                        <TabsContent value="security" className="m-0 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Key className="h-3.5 w-3.5" />
                                            Access Credentials
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-2">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-slate-100">
                                            <div>
                                                <p className="text-sm font-bold tracking-tight">Account Password</p>
                                                <p className="text-[11px] font-medium text-muted-foreground">Cycle your password every 90 days for security</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest bg-background border-none shadow-sm">Rotate</Button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <div className="flex items-center gap-3">
                                                <Smartphone className="h-5 w-5 text-primary opacity-60" />
                                                <div>
                                                    <p className="text-sm font-bold tracking-tight text-primary">Two-Factor Auth</p>
                                                    <p className="text-[11px] font-bold text-primary opacity-60">High-Security protection active</p>
                                                </div>
                                            </div>
                                            <Switch />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Monitor className="h-3.5 w-3.5" />
                                            Active Linkages
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4 pt-2 text-center flex flex-col justify-center">
                                        {mockSecurity.sessions.map((session) => (
                                            <div key={session.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                        {session.device.includes('iPhone') ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Monitor className="h-4 w-4 text-muted-foreground" />}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold tracking-tight">{session.device}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{session.location} • {session.id}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <LogOut className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Alerts Tab */}
                        <TabsContent value="notifications" className="m-0 space-y-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Bell className="h-3.5 w-3.5" />
                                        Signal Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-2">
                                    <FormRow label="Corporate Email" description="Critical system alerts and weekly executive reports">
                                        <Switch defaultChecked />
                                    </FormRow>
                                    <Separator className="bg-slate-100" />
                                    <FormRow label="Browser Signals" description="Real-time activity feeds and project milestones">
                                        <Switch defaultChecked />
                                    </FormRow>
                                    <Separator className="bg-slate-100" />
                                    <FormRow label="Mobile SMS" description="Emergency weather alerts and scheduling conflicts">
                                        <Switch />
                                    </FormRow>
                                    <Separator className="bg-slate-100" />
                                    <FormRow label="Broadcast Frequency" description="Aggregate notification intensity">
                                        <Select defaultValue="realtime">
                                            <SelectTrigger className="w-40 h-8 border-none bg-muted/30 font-bold text-[11px] uppercase tracking-wider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="realtime">Real-time Pulse</SelectItem>
                                                <SelectItem value="daily">Daily Digest</SelectItem>
                                                <SelectItem value="weekly">Weekly Review</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormRow>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Permissions Control */}
                        <TabsContent value="roles" className="m-0 space-y-6">
                            <div className="grid gap-6 lg:grid-cols-3">
                                <Card className="border-none shadow-sm lg:col-span-1">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Access Roles</CardTitle>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/50">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-1.5 pt-0">
                                        {mockRoles.map((role) => (
                                            <div
                                                key={role.id}
                                                onClick={() => setSelectedRole(role.name)}
                                                className={`p-4 rounded-xl cursor-not-allowed transition-all border ${selectedRole === role.name ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-transparent border-transparent hover:bg-muted/30'}`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-sm font-black ${selectedRole === role.name ? 'text-primary' : 'text-foreground'}`}>{role.name}</span>
                                                    <Badge variant="outline" className="text-[9px] font-bold h-4 border-none bg-muted/50 uppercase tracking-widest">{role.usersCount} Linked</Badge>
                                                </div>
                                                <p className="text-[10px] font-medium text-muted-foreground line-clamp-2">{role.description}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm lg:col-span-2 overflow-hidden">
                                    <CardHeader className="border-b border-slate-100 bg-muted/20">
                                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Capabilities Matrix: {selectedRole}</CardTitle>
                                    </CardHeader>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Business Pillar</TableHead>
                                                {permissionTypes.map(p => (
                                                    <TableHead key={p} className="text-[11px] font-bold uppercase py-3 text-center">{p}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modules.map((module) => (
                                                <TableRow key={module} className="group hover:bg-muted/10 transition-colors">
                                                    <TableCell className="pl-6 py-3">
                                                        <span className="text-xs font-bold tracking-tight">{module}</span>
                                                    </TableCell>
                                                    {permissionTypes.map((perm) => (
                                                        <TableCell key={perm} className="text-center py-3">
                                                            <div className="flex justify-center">
                                                                <Checkbox className="h-4 w-4 data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary border-slate-200" defaultChecked={selectedRole === 'Admin'} />
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Document Templates */}
                        <TabsContent value="templates" className="m-0 space-y-6">
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardHeader className="border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Brand Presentation Assets</CardTitle>
                                        <Button size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest">
                                            <Plus className="mr-2 h-3.5 w-3.5" />
                                            Define Template
                                        </Button>
                                    </div>
                                </CardHeader>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Visual Asset</TableHead>
                                            <TableHead className="text-[11px] font-bold uppercase py-3">Format Type</TableHead>
                                            <TableHead className="text-[11px] font-bold uppercase py-3">Last Iteration</TableHead>
                                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Workflow</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockTemplates.map((template) => (
                                            <TableRow key={template.id} className="group hover:bg-muted/20 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline">{template.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${templateTypeStyles[template.type]} border-none font-bold text-[10px] uppercase tracking-widest h-5`}>
                                                        {template.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{template.lastModified}</TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    );
}
