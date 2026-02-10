"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
    isPrimary?: boolean;
    isBold?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    return (
        <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                    {item.href ? (
                        <Link href={item.href} className="hover:text-foreground transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className={`
                            ${item.isPrimary ? 'text-primary' : 'text-foreground'} 
                            ${item.isBold ? 'font-black' : 'font-medium'}
                        `}>
                            {item.label}
                        </span>
                    )}
                    {index < items.length - 1 && (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </div>
            ))}
        </div>
    );
}
