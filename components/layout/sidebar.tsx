"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FileText,
    Building2,
    Calendar,
    HardHat,
    Package,
    DollarSign,
    Settings,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    MapPin,
    UserCircle,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth, Role } from "@/context/auth-context";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/leads", icon: Users },
    { name: "Accounts", href: "/accounts", icon: Building2 },
    { name: "Contacts", href: "/contacts", icon: UserCircle },
    { name: "Sites", href: "/sites", icon: MapPin },
    { name: "Quotes", href: "/quotes", icon: FileText },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Scheduling", href: "/scheduling", icon: Calendar },
    { name: "Jobs", href: "/jobs", icon: HardHat },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Finance", href: "/finance", icon: DollarSign },
];

const bottomNavItems = [
    { name: "Settings", href: "/settings", icon: Settings },
];

const getVisibleItems = (items: typeof navItems, role: Role) => {
    return items.filter(item => {
        if (role === "Super Admin") return true;

        if (role === "BDM") {
            return ["Dashboard", "Leads", "Accounts", "Contacts", "Sites", "Quotes", "Tasks", "Scheduling"].includes(item.name);
        }

        if (role === "Admin/Accounts") {
            return ["Dashboard", "Accounts", "Contacts", "Sites", "Tasks", "Finance", "Inventory"].includes(item.name);
        }

        if (role === "Engineer") {
            return ["Dashboard", "Jobs", "Scheduling", "Inventory"].includes(item.name);
        }

        return false;
    });
};

// Desktop Sidebar Component
export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { role } = useAuth();

    const visibleNavItems = getVisibleItems(navItems, role);
    const visibleBottomItems = getVisibleItems(bottomNavItems, role);

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard" || pathname === "/";
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
            {/* Desktop Sidebar - hidden on mobile */}
            <aside
                className={cn(
                    "hidden md:flex h-screen flex-col border-r bg-background transition-all duration-200",
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
                    {visibleNavItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </nav>

                {/* Bottom Navigation */}
                {visibleBottomItems.length > 0 && (
                    <div className="border-t p-2">
                        {visibleBottomItems.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>
                )}
            </aside>
        </TooltipProvider>
    );
}

// Mobile Sidebar (Hamburger Menu) Component
export function MobileSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { role } = useAuth();

    const visibleNavItems = getVisibleItems(navItems, role);
    const visibleBottomItems = getVisibleItems(bottomNavItems, role);

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard" || pathname === "/";
        }
        return pathname.startsWith(href);
    };

    const MobileNavLink = ({ item }: { item: typeof navItems[0] }) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
            <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                    active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                <span>{item.name}</span>
            </Link>
        );
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-9 w-9"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {/* Logo Header */}
                <div className="flex h-14 items-center justify-between border-b px-4">
                    <span className="text-lg font-bold tracking-tight text-primary">
                        AEM CRM
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                    {visibleNavItems.map((item) => (
                        <MobileNavLink key={item.href} item={item} />
                    ))}
                </nav>

                {/* Bottom Navigation */}
                {visibleBottomItems.length > 0 && (
                    <div className="border-t p-2">
                        {visibleBottomItems.map((item) => (
                            <MobileNavLink key={item.href} item={item} />
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
