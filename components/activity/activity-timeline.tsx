"use client";

import React, { useState } from "react";
import {
    Phone,
    Send,
    Inbox,
    Users,
    MapPin,
    FileText,
    FileUp,
    Signature,
    CheckCircle2,
    ArrowRight,
    Bell,
    Plus,
    Filter,
    Search,
    Clock,
    User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDrawer } from "@/components/layout/drawer-provider";
import { LogActivityForm } from "./log-activity-form";

export type ActivityType =
    | "call"
    | "email_sent"
    | "email_received"
    | "meeting"
    | "site_visit"
    | "note"
    | "quote_sent"
    | "contract_sent"
    | "contract_signed"
    | "status_change"
    | "system_notification";

export interface Activity {
    id: string;
    type: ActivityType;
    description: string;
    userName: string;
    userAvatar?: string;
    timestamp: string;
    isSystem?: boolean;
    outcome?: string;
    duration?: number;
    attachments?: string[];
}

const typeConfig: Record<ActivityType, { icon: React.ReactNode; color: string; label: string }> = {
    call: { icon: <Phone className="h-4 w-4" />, color: "bg-blue-500", label: "Call" },
    email_sent: { icon: <Send className="h-4 w-4" />, color: "bg-indigo-500", label: "Email Sent" },
    email_received: { icon: <Inbox className="h-4 w-4" />, color: "bg-purple-500", label: "Email Received" },
    meeting: { icon: <Users className="h-4 w-4" />, color: "bg-amber-500", label: "Meeting" },
    site_visit: { icon: <MapPin className="h-4 w-4" />, color: "bg-emerald-500", label: "Site Visit" },
    note: { icon: <FileText className="h-4 w-4" />, color: "bg-slate-500", label: "Note" },
    quote_sent: { icon: <FileUp className="h-4 w-4" />, color: "bg-blue-600", label: "Quote Sent" },
    contract_sent: { icon: <Signature className="h-4 w-4" />, color: "bg-purple-600", label: "Contract Sent" },
    contract_signed: { icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-green-600", label: "Contract Signed" },
    status_change: { icon: <ArrowRight className="h-4 w-4" />, color: "bg-slate-400", label: "Status Change" },
    system_notification: { icon: <Bell className="h-4 w-4" />, color: "bg-red-400", label: "System Notification" },
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
    const { openDrawer, closeDrawer } = useDrawer();
    const [filter, setFilter] = useState("all");

    const filteredActivities = activities.filter(a => filter === "all" || a.type === filter);

    const handleLogActivity = () => {
        openDrawer({
            title: "Log Activity",
            description: "Record a new interaction or update",
            content: <LogActivityForm onClose={closeDrawer} />
        });
    };

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest">Activity History</CardTitle>
                <Button onClick={handleLogActivity} size="sm" className="h-8 px-3 font-bold text-xs uppercase">
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Log Activity
                </Button>
            </CardHeader>
            <CardContent>
                {/* Filter Bar */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className="h-7 text-[10px] font-bold uppercase tracking-tight px-3 rounded-full"
                    >
                        All
                    </Button>
                    {Object.entries(typeConfig).map(([key, config]) => (
                        <Button
                            key={key}
                            variant={filter === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(key)}
                            className="h-7 text-[10px] font-bold uppercase tracking-tight px-3 rounded-full shrink-0"
                        >
                            {config.label}
                        </Button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                    {filteredActivities.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground italic text-xs">
                            No activities recorded yet.
                        </div>
                    ) : (
                        filteredActivities.map((activity) => (
                            <div key={activity.id} className="relative group">
                                {/* Activity Icon Dot */}
                                <div className={cn(
                                    "absolute -left-8 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white z-10",
                                    typeConfig[activity.type].color
                                )}>
                                    {typeConfig[activity.type].icon}
                                </div>

                                <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-muted/40 bg-muted/5 group-hover:bg-muted/10 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5 border border-white shadow-sm">
                                                <AvatarImage src={activity.userAvatar} />
                                                <AvatarFallback className="text-[8px] font-black bg-primary/20 text-primary">
                                                    {activity.userName.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-bold">{activity.userName}</span>
                                            {activity.isSystem && (
                                                <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase font-black bg-slate-100 text-slate-500 border-slate-200">
                                                    System
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                                            <Clock className="h-3 w-3" />
                                            {activity.timestamp}
                                        </div>
                                    </div>

                                    <div className="text-sm leading-relaxed">
                                        <p className="inline font-bold text-primary mr-1.5 uppercase tracking-tight text-[10px]">
                                            {typeConfig[activity.type].label}:
                                        </p>
                                        <span className="text-foreground/90">{activity.description}</span>
                                    </div>

                                    {(activity.outcome || activity.duration) && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {activity.outcome && (
                                                <Badge variant="secondary" className="text-[9px] h-4 uppercase font-bold bg-muted/50">
                                                    Outcome: {activity.outcome}
                                                </Badge>
                                            )}
                                            {activity.duration && (
                                                <Badge variant="secondary" className="text-[9px] h-4 uppercase font-bold bg-muted/50">
                                                    Duration: {activity.duration}m
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {activity.attachments && activity.attachments.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {activity.attachments.map((file, i) => (
                                                <div key={i} className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-white border text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                                                    <FileText className="h-3 w-3" />
                                                    {file}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
