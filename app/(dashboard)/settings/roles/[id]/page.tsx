"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useModal } from "@/components/layout/modal-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
    MoreHorizontal,
    Users,
    Shield,
    Save,
    Trash2,
    Copy,
    Edit,
    Clock,
    User,
    Settings as SettingsIcon,
    Activity,
    Inbox,
    CheckCircle2,
    XCircle,
    Mail,
    Lock,
} from "lucide-react";

// Types
interface RoleDetail {
    id: string;
    name: string;
    description: string;
    usersCount: number;
    createdAt: string;
    updatedAt: string;
    permissions: Record<string, Record<string, boolean>>;
    users: RoleUser[];
    activity: ActivityRecord[];
}

interface RoleUser {
    id: string;
    name: string;
    email: string;
    lastActive: string;
}

interface ActivityRecord {
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
}

// Mock Data
const modules = ["Leads", "Quotes", "Jobs", "Projects", "Finance", "Inventory", "Scheduling", "Reports", "RMS"];
const permissionTypes = ["view", "create", "edit", "delete"];

const mockRoles: Record<string, RoleDetail> = {
    "ROLE-001": {
        id: "ROLE-001",
        name: "Infrastructure Administrator",
        description: "Unrestricted access to system configuration, security protocols, and operational modules",
        usersCount: 2,
        createdAt: "2023-01-01",
        updatedAt: "2024-01-15",
        permissions: Object.fromEntries(modules.map(m => [m, { view: true, create: true, edit: true, delete: true }])),
        users: [
            { id: "USR-001", name: "John Smith", email: "john.smith@roofingpro.co.uk", lastActive: "2024-01-31T10:30:00Z" },
            { id: "USR-002", name: "Sarah Admin", email: "sarah.admin@roofingpro.co.uk", lastActive: "2024-01-31T09:45:00Z" },
        ],
        activity: [
            { id: "1", type: "permission", description: "Modified security linkage for RMS module", user: "John Smith", timestamp: "2024-01-15T14:30:00Z" },
            { id: "2", type: "user", description: "Authorized Sarah Admin for role inheritance", user: "John Smith", timestamp: "2024-01-10T10:00:00Z" },
            { id: "3", type: "edit", description: "System role nomenclature updated", user: "John Smith", timestamp: "2023-12-20T11:30:00Z" },
        ],
    },
};

const activityIcons: Record<string, React.ElementType> = {
    permission: Shield,
    user: User,
    edit: Edit,
    create: CheckCircle2,
};

const activityColors: Record<string, string> = {
    permission: "bg-blue-100 text-blue-600",
    user: "bg-emerald-100 text-emerald-600",
    edit: "bg-orange-100 text-orange-600",
    create: "bg-purple-100 text-purple-600",
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
        <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                        <p className={`text-2xl font-black mt-1.5 ${color || ''}`}>{value}</p>
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

export default function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { openConfirmation } = useModal();
    const [activeTab, setActiveTab] = useState("permissions");

    const role = mockRoles[id] || mockRoles["ROLE-001"];

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    };

    const handleDeleteRole = () => {
        openConfirmation(
            "Terminate Role",
            `Are you sure you want to terminate the "${role.name}" role? ${role.usersCount} users will lose inherited permissions.`,
            () => console.log("Deleting role:", role.id)
        );
    };

    return (
        <>
            <Topbar title="Role Controller" />
            <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-background p-6 rounded-2xl shadow-sm border border-slate-200/50">
                        <div className="flex items-center gap-4">
                            <Link href="/settings">
                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted/50 rounded-xl">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div className="h-12 w-px bg-slate-200 mx-2 hidden sm:block" />
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-black tracking-tight">{role.name}</h1>
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-none font-bold text-[10px] uppercase tracking-widest h-5 px-3">
                                        <Shield className="mr-1.5 h-3 w-3" />
                                        System Role
                                    </Badge>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground mt-1">{role.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 bg-background shadow-sm border-none font-bold text-xs">
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </Button>
                            <Button size="sm" className="h-9 font-bold text-xs group">
                                <Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                Save State
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleDeleteRole} className="text-destructive font-bold">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Terminate Role
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-4 mb-8">
                        <StatCard title="Active Users" value={role.usersCount} icon={Users} subValue="Inherited access" />
                        <StatCard title="Permission Yield" value="100%" icon={Shield} color="text-emerald-600" subValue="Unrestricted" />
                        <StatCard title="Last Modified" value="15 Jan" icon={Clock} subValue="By Auditor 01" />
                        <StatCard title="Security Rank" value="L4" icon={Lock} subValue="Critical Infrastructure" />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start h-12 p-0 mb-8">
                            <TabsTrigger value="permissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-bold uppercase tracking-widest px-6 h-full transition-all">Capabilities Matrix</TabsTrigger>
                            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-bold uppercase tracking-widest px-6 h-full transition-all">Assigned Identities</TabsTrigger>
                            <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[11px] font-bold uppercase tracking-widest px-6 h-full transition-all">Audit Trail</TabsTrigger>
                        </TabsList>

                        {/* Permissions Matrix */}
                        <TabsContent value="permissions" className="m-0">
                            <Card className="border-none shadow-sm overflow-hidden">
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
                                                <TableCell className="pl-6 py-4">
                                                    <span className="text-xs font-bold tracking-tight">{module}</span>
                                                </TableCell>
                                                {permissionTypes.map((perm) => (
                                                    <TableCell key={perm} className="text-center py-4">
                                                        <div className="flex justify-center">
                                                            <Checkbox className="h-4 w-4 data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary border-slate-200" defaultChecked={role.name === 'Infrastructure Administrator'} />
                                                        </div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        {/* Assigned Users */}
                        <TabsContent value="users" className="m-0">
                            <Card className="border-none shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="text-[11px] font-bold uppercase py-3 pl-6">Platform Identity</TableHead>
                                            <TableHead className="text-[11px] font-bold uppercase py-3">Communication</TableHead>
                                            <TableHead className="text-[11px] font-bold uppercase py-3 text-right pr-6">Management</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {role.users.map((user) => (
                                            <TableRow key={user.id} className="group hover:bg-muted/20 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-[11px] font-black text-primary">
                                                            {user.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors cursor-pointer">{user.name}</p>
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTimestamp(user.lastActive)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-xs font-medium text-slate-600 underline underline-offset-4 decoration-slate-200">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" className="h-8 text-destructive font-black text-[10px] uppercase tracking-widest">
                                                        Revoke Access
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        {/* Audit Trail */}
                        <TabsContent value="activity" className="m-0">
                            <Card className="border-none shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-20px)] before:w-px before:bg-slate-100">
                                        {role.activity.map((event) => {
                                            const Icon = activityIcons[event.type] || Activity;
                                            return (
                                                <div key={event.id} className="relative pl-12">
                                                    <div className={`absolute left-0 top-1 h-10 w-10 rounded-2xl border-4 border-background flex items-center justify-center ${activityColors[event.type]}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold tracking-tight">{event.description}</p>
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{formatTimestamp(event.timestamp)}</span>
                                                        </div>
                                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                            <User className="h-3 w-3 text-primary opacity-60" />
                                                            {event.user}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    );
}
