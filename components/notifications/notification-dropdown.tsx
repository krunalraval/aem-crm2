"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Bell,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    FileWarning,
    Signature,
    AlertCircle,
    UserPlus,
    CheckSquare,
    Package,
    ServerCrash
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type NotificationType =
    | "task_assigned"
    | "task_overdue"
    | "quote_expiring"
    | "invoice_overdue"
    | "contract_unsigned"
    | "low_stock"
    | "system_down"
    | "lead_converted"
    | "job_completed";

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timeAgo: string;
    isRead: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "task_assigned",
        message: "New task assigned: Review site drawings for Riverside",
        timeAgo: "2 minutes ago",
        isRead: false,
    },
    {
        id: "2",
        type: "low_stock",
        message: "Low stock alert: 8MP Dome Cameras (2 remaining)",
        timeAgo: "45 minutes ago",
        isRead: false,
    },
    {
        id: "3",
        type: "invoice_overdue",
        message: "Invoice INV-881 for Metro Dev is now 7 days overdue",
        timeAgo: "2 hours ago",
        isRead: false,
    },
    {
        id: "4",
        type: "job_completed",
        message: "Job K2S-J-0001 (Johnson Roofing) has been completed",
        timeAgo: "5 hours ago",
        isRead: true,
    },
    {
        id: "5",
        type: "lead_converted",
        message: "Lead 'Acme Corp' has been converted to an Account",
        timeAgo: "Yesterday",
        isRead: true,
    },
];

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
    task_assigned: { icon: <CheckSquare className="h-4 w-4" />, color: "text-blue-500 bg-blue-50" },
    task_overdue: { icon: <Clock className="h-4 w-4" />, color: "text-red-500 bg-red-50" },
    quote_expiring: { icon: <FileWarning className="h-4 w-4" />, color: "text-amber-500 bg-amber-50" },
    invoice_overdue: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600 bg-red-50" },
    contract_unsigned: { icon: <Signature className="h-4 w-4" />, color: "text-purple-500 bg-purple-50" },
    low_stock: { icon: <Package className="h-4 w-4" />, color: "text-orange-500 bg-orange-50" },
    system_down: { icon: <ServerCrash className="h-4 w-4" />, color: "text-red-700 bg-red-100" },
    lead_converted: { icon: <UserPlus className="h-4 w-4" />, color: "text-green-500 bg-green-50" },
    job_completed: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600 bg-green-50" },
};

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const markRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-black bg-primary text-primary-foreground border-2 border-background">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-xl border-muted/40">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-muted/50">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "flex gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer relative group",
                                        !n.isRead && "bg-primary/5"
                                    )}
                                    onClick={() => markRead(n.id)}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                        typeConfig[n.type].color
                                    )}>
                                        {typeConfig[n.type].icon}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className={cn(
                                            "text-xs leading-relaxed mb-1",
                                            !n.isRead ? "font-bold text-foreground" : "text-muted-foreground font-medium"
                                        )}>
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                            {n.timeAgo}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-3 border-t bg-muted/20 text-center">
                    <Link
                        href="/notifications"
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest block w-full"
                    >
                        View All Notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
