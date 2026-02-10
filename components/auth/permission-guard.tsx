"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { AccessDenied } from "./access-denied";
import { Topbar } from "@/components/layout";

interface PermissionGuardProps {
    children: React.ReactNode;
    permission?: string;
    fallback?: React.ReactNode;
    fullPage?: boolean;
}

export function PermissionGuard({
    children,
    permission,
    fallback,
    fullPage = true
}: PermissionGuardProps) {
    const { canAccess } = useAuth();

    if (permission && !canAccess(permission)) {
        if (fallback) return <>{fallback}</>;

        if (fullPage) {
            return (
                <div className="flex flex-col h-full w-full">
                    <Topbar title="Access Denied" />
                    <main className="flex-1 flex items-center justify-center p-8">
                        <AccessDenied />
                    </main>
                </div>
            );
        }

        return null; // For smaller components, simply hide them
    }

    return <>{children}</>;
}
