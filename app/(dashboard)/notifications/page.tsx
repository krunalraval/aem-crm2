"use client";

import React, { useState, useMemo } from "react";
import { Topbar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileWarning,
    Signature,
    AlertCircle,
    UserPlus,
    CheckSquare,
    Package,
    ServerCrash,
    Search,
    Filter,
    Trash2,
    MoreHorizontal,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/components/notifications/notification-dropdown";

const allNotifications: Notification[] = [
    { id: "1", type: "task_assigned", message: "New task assigned: Review site drawings for Riverside", timeAgo: "2 minutes ago", isRead: false },
    { id: "2", type: "low_stock", message: "Low stock alert: 8MP Dome Cameras (2 remaining)", timeAgo: "45 minutes ago", isRead: false },
    { id: "3", type: "invoice_overdue", message: "Invoice INV-881 for Metro Dev is now 7 days overdue", timeAgo: "2 hours ago", isRead: false },
    { id: "4", type: "job_completed", message: "Job K2S-J-0001 (Johnson Roofing) has been completed", timeAgo: "5 hours ago", isRead: true },
    { id: "5", type: "lead_converted", message: "Lead 'Acme Corp' has been converted to an Account", timeAgo: "Yesterday", isRead: true },
    { id: "6", type: "task_overdue", message: "Task 'Contact Mike Thompson' is overdue by 2 days", timeAgo: "3 hours ago", isRead: false },
    { id: "7", type: "quote_expiring", message: "Quote Q-1003 (Acme Construction) expires in 24 hours", timeAgo: "4 hours ago", isRead: false },
    { id: "8", type: "contract_unsigned", message: "Contract for Premier Builders is still unsigned", timeAgo: "6 hours ago", isRead: false },
    { id: "9", type: "system_down", message: "RMS Alert: Connection lost with Tower Block A Site", timeAgo: "1 hour ago", isRead: false },
];

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; label: string }> = {
    task_assigned: { icon: <CheckSquare className="h-4 w-4" />, color: "text-blue-500 bg-blue-50", label: "Task Assigned" },
    task_overdue: { icon: <Clock className="h-4 w-4" />, color: "text-red-500 bg-red-50", label: "Task Overdue" },
    quote_expiring: { icon: <FileWarning className="h-4 w-4" />, color: "text-amber-500 bg-amber-50", label: "Quote Expiring" },
    invoice_overdue: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600 bg-red-50", label: "Invoice Overdue" },
    contract_unsigned: { icon: <Signature className="h-4 w-4" />, color: "text-purple-500 bg-purple-50", label: "Contract Unsigned" },
    low_stock: { icon: <Package className="h-4 w-4" />, color: "text-orange-500 bg-orange-50", label: "Low Stock Alert" },
    system_down: { icon: <ServerCrash className="h-4 w-4" />, color: "text-red-700 bg-red-100", label: "System Alert" },
    lead_converted: { icon: <UserPlus className="h-4 w-4" />, color: "text-green-500 bg-green-50", label: "Lead Converted" },
    job_completed: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600 bg-green-50", label: "Job Completed" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(allNotifications);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === "all" || n.type === typeFilter;
            const matchesStatus = statusFilter === "all" || (statusFilter === "read" ? n.isRead : !n.isRead);
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [notifications, searchQuery, typeFilter, statusFilter]);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const toggleRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    };

    return (
        <>
            <Topbar title="Notifications" subtitle="Stay updated with system alerts and activities" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white border-none shadow-sm"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="md:hidden">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-bold uppercase tracking-widest text-primary"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                        <Button size="sm" variant="destructive" className="h-9 px-4 font-bold text-xs uppercase bg-red-600 hover:bg-red-700">
                            Clear History
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="hidden lg:block space-y-6">
                        <Card className="border-none shadow-sm pb-2">
                            <CardHeader>
                                <CardTitle className="text-xs font-black uppercase tracking-widest">Filter By</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</label>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="text-xs font-bold border-muted/40">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {Object.entries(typeConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="text-xs font-bold border-muted/40">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="read">Read Only</SelectItem>
                                            <SelectItem value="unread">Unread Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Range</label>
                                    <Select defaultValue="all">
                                        <SelectTrigger className="text-xs font-bold border-muted/40">
                                            <SelectValue placeholder="Any Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Any Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="yesterday">Yesterday</SelectItem>
                                            <SelectItem value="week">Past Week</SelectItem>
                                            <SelectItem value="month">Past Month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notifications List */}
                    <div className="lg:col-span-3">
                        <Card className="border-none shadow-sm min-h-[600px]">
                            <CardContent className="p-0">
                                {filteredNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                                        <Bell className="h-12 w-12 mb-4 opacity-10" />
                                        <p className="font-bold uppercase tracking-widest text-xs">No notifications found</p>
                                        <p className="text-xs mt-1">Try adjusting your filters</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-muted/40">
                                        {filteredNotifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    "flex flex-col sm:flex-row gap-4 p-5 transition-all group relative",
                                                    !n.isRead ? "bg-primary/[0.03]" : "hover:bg-muted/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                    typeConfig[n.type].color
                                                )}>
                                                    {typeConfig[n.type].icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">
                                                            {typeConfig[n.type].label}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {n.timeAgo}
                                                        </span>
                                                        {!n.isRead && (
                                                            <Badge className="text-[8px] h-4 bg-primary px-1.5 uppercase font-black">Unread</Badge>
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-sm leading-relaxed mb-1",
                                                        !n.isRead ? "font-bold text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {n.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => toggleRead(n.id)}
                                                        title={n.isRead ? "Mark as unread" : "Mark as read"}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                        onClick={() => deleteNotification(n.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
