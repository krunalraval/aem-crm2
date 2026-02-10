"use client";

import { Bell, Search, Plus, Users, Building2, UserCircle, FileText, CheckSquare, HardHat, LogOut, UserCog, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDrawer } from "@/components/layout/drawer-provider";
import { useAuth, Role } from "@/context/auth-context";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

interface TopbarProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
}

export function Topbar({ title = "Dashboard", subtitle, children }: TopbarProps) {
    const { openDrawer } = useDrawer();
    const { role, setRole, canAccess } = useAuth();

    const handleCreateNew = (type: string) => {
        openDrawer({
            title: `New ${type}`,
            description: `Create a new ${type.toLowerCase()} record`,
            content: (
                <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">Form for creating a new {type.toLowerCase()} would appear here.</p>
                </div>
            ),
        });
    };

    return (
        <header className="flex h-14 items-center justify-between border-b bg-background px-6">
            {/* Page Title */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold leading-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {children}

                {/* Role Switcher (TESTING ONLY) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 px-3 border-dashed border-primary/50 text-primary hover:bg-primary/5 hidden lg:flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{role}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Switch Role (Testing)</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(["Super Admin", "BDM", "Admin/Accounts", "Engineer"] as Role[]).map((r) => (
                            <DropdownMenuItem key={r} onClick={() => setRole(r)} className="cursor-pointer font-bold text-xs uppercase tracking-tight">
                                {r}
                                {role === r && <Badge className="ml-auto bg-primary text-[8px] h-4">Active</Badge>}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Global Search */}
                <div className="relative hidden xl:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search records..."
                        className="w-48 pl-9 h-9 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                </div>

                {/* Create New Dropdown */}
                {(canAccess("create_lead") || canAccess("create_quote") || canAccess("create_job")) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="h-9 px-3 font-bold text-xs">
                                <Plus className="h-4 w-4 mr-1.5" />
                                Create
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {canAccess("create_lead") && (
                                <DropdownMenuItem onClick={() => handleCreateNew("Lead")} className="cursor-pointer">
                                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                    New Lead
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleCreateNew("Contact")} className="cursor-pointer">
                                <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                                New Contact
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateNew("Company")} className="cursor-pointer">
                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                New Company
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreateNew("Task")} className="cursor-pointer">
                                <CheckSquare className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                New Task
                            </DropdownMenuItem>
                            {canAccess("create_quote") && (
                                <DropdownMenuItem onClick={() => handleCreateNew("Quote")} className="cursor-pointer">
                                    <FileText className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                    New Quote
                                </DropdownMenuItem>
                            )}
                            {canAccess("create_job") && (
                                <DropdownMenuItem onClick={() => handleCreateNew("Job")} className="cursor-pointer">
                                    <HardHat className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                    New Job
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Notifications */}
                <NotificationDropdown />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 px-2 h-9">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src="/avatar.png" />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                    JS
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:flex flex-col items-start">
                                <span className="text-sm font-medium leading-none">John Smith</span>
                                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{role}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">John Smith</p>
                                <p className="text-xs text-muted-foreground">{role}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="lg:hidden cursor-pointer" onClick={() => { }}>
                            <ArrowRightLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                            Switch Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
