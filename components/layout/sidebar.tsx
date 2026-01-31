"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FileText,
    Building2,
    FolderKanban,
    Calendar,
    HardHat,
    Package,
    DollarSign,
    BarChart3,
    Video,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Quotes", href: "/quotes", icon: FileText },
    { name: "Accounts", href: "/accounts", icon: Building2 },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Scheduling", href: "/scheduling", icon: Calendar },
    { name: "Field Ops", href: "/field-ops", icon: HardHat },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Finance", href: "/finance", icon: DollarSign },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "RMS", href: "/rms", icon: Video },
];

const bottomNavItems = [
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    const NavLink = ({ item }: { item: typeof navItems[0] }) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        const linkContent = (
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                    active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                )}
            >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                {!collapsed && <span>{item.name}</span>}
            </Link>
        );

        if (collapsed) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                        {item.name}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return linkContent;
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "flex h-screen flex-col border-r bg-background transition-all duration-200",
                    collapsed ? "w-14" : "w-56"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "flex h-14 items-center border-b",
                    collapsed ? "justify-center px-2" : "justify-between px-4"
                )}>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight text-primary">
                            AEM CRM
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                    {navItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </nav>

                {/* Bottom Navigation */}
                <div className="border-t p-2">
                    {bottomNavItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>
            </aside>
        </TooltipProvider>
    );
}
