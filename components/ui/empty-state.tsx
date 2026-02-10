import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-muted bg-muted/10",
            className
        )}>
            {Icon && (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-muted-foreground opacity-40" />
                </div>
            )}
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground font-medium max-w-[200px] mx-auto">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="outline"
                    size="sm"
                    className="mt-6 h-9 font-bold uppercase text-[10px] tracking-widest shadow-sm"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
