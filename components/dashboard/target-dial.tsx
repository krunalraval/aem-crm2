"use client";

import { cn } from "@/lib/utils";

interface TargetDialProps {
    value: number;
    target: number;
    stretchTarget?: number;
    label?: string;
    className?: string;
    size?: number;
}

export function TargetDial({
    value,
    target,
    stretchTarget = 10,
    label = "sites this month",
    className,
    size = 160
}: TargetDialProps) {
    const percentage = Math.min(100, (value / target) * 100);
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = (p: number) => {
        if (p >= 75) return "text-green-500";
        if (p >= 50) return "text-amber-500";
        return "text-red-500";
    };

    const colorClass = getColor(percentage);

    return (
        <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="rotate-[-90deg]"
            >
                {/* Background path */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress path */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-1000 ease-in-out", colorClass)}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black">{value}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground max-w-[80px] leading-tight">
                    of {target} {label}
                </span>
                {stretchTarget && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                        Stretch: {stretchTarget}
                    </span>
                )}
            </div>
        </div>
    );
}
