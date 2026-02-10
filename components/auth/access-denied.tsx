"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Access Restricted</h2>
            <p className="text-muted-foreground max-w-md mb-8 font-medium">
                You do not have the required permissions to access this module. Please contact your system administrator if you believe this is an error.
            </p>
            <Button asChild className="font-bold px-8 shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
    );
}
