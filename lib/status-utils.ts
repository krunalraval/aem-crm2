import { BadgeProps } from "@/components/ui/badge";

export type StatusColorMode = "solid" | "subtle" | "outline";

export interface StatusStyle {
    variant: BadgeProps["variant"];
    className: string;
}

export const STATUS_COLORS = {
    // Pipeline Stages
    pipeline: {
        new: "bg-blue-50 text-blue-700 border-blue-200",
        contacted: "bg-amber-50 text-amber-700 border-amber-200",
        follow_up: "bg-purple-50 text-purple-700 border-purple-200",
        site_visit_booked: "bg-cyan-50 text-cyan-700 border-cyan-200",
        site_visit_completed: "bg-teal-50 text-teal-700 border-teal-200",
        quote_sent: "bg-orange-50 text-orange-700 border-orange-200",
        awaiting_response: "bg-yellow-50 text-yellow-700 border-yellow-200",
        negotiation: "bg-indigo-50 text-indigo-700 border-indigo-200",
        won: "bg-green-50 text-green-700 border-green-200",
        lost: "bg-slate-100 text-slate-500 border-slate-200",
    },
    // Quote Statuses (matching pipeline where applicable)
    quote: {
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        sent: "bg-blue-50 text-blue-700 border-blue-200",
        awaiting_response: "bg-amber-50 text-amber-700 border-amber-200",
        in_negotiation: "bg-purple-50 text-purple-700 border-purple-200",
        revised: "bg-cyan-50 text-cyan-700 border-cyan-200",
        accepted: "bg-green-50 text-green-700 border-green-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        expired: "bg-slate-200 text-slate-500 border-slate-300",
    },
    // Semantics (Draft=grey, Healthy=green, Warning=amber, Error=red, Info=blue, Special=purple)
    semantic: {
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        inactive: "bg-slate-100 text-slate-500 border-slate-200",
        archived: "bg-slate-100 text-slate-400 border-slate-200",
        active: "bg-green-50 text-green-700 border-green-200",
        healthy: "bg-green-50 text-green-700 border-green-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-red-50 text-red-700 border-red-200",
        overdue: "bg-red-50 text-red-700 border-red-200",
        info: "bg-blue-50 text-blue-700 border-blue-200",
        sent: "bg-blue-50 text-blue-700 border-blue-200",
        special: "bg-purple-50 text-purple-700 border-purple-200",
    },
    // Priority Badges
    priority: {
        low: "bg-slate-100 text-slate-500 border-slate-200",
        normal: "bg-slate-100 text-slate-700 border-slate-200",
        medium: "bg-amber-50 text-amber-700 border-amber-200",
        high: "bg-orange-50 text-orange-700 border-orange-200",
        urgent: "bg-red-50 text-red-700 border-red-200",
        critical: "bg-red-50 text-red-700 border-red-200",
        "VIP/Big Deal": "bg-purple-50 text-purple-700 border-purple-200",
    },
    // Job Statuses
    job: {
        scheduled: "bg-blue-50 text-blue-700 border-blue-200",
        in_transit: "bg-amber-50 text-amber-700 border-amber-200",
        in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
        awaiting_signoff: "bg-cyan-50 text-cyan-700 border-cyan-200",
        complete: "bg-green-50 text-green-700 border-green-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
        rescheduled: "bg-purple-50 text-purple-700 border-purple-200",
    },
    // Invoice Statuses
    invoice: {
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
        sent: "bg-blue-50 text-blue-700 border-blue-200",
        paid: "bg-green-50 text-green-700 border-green-200",
        overdue: "bg-red-50 text-red-700 border-red-200",
        disputed: "bg-purple-50 text-purple-700 border-purple-200",
        credited: "bg-orange-50 text-orange-700 border-orange-200",
    }
};

export function getStatusStyle(type: keyof typeof STATUS_COLORS, status: string): string {
    const config = STATUS_COLORS[type] as Record<string, string>;
    return config[status] || config["default"] || "bg-slate-100 text-slate-700";
}
