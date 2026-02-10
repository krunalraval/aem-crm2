"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "Super Admin" | "BDM" | "Admin/Accounts" | "Engineer";

interface User {
    name: string;
    role: Role;
    email: string;
}

interface AuthContextType {
    user: User | null;
    role: Role;
    setRole: (role: Role) => void;
    canAccess: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Default to Super Admin for initial development, but can be switched
    const [role, _setRole] = useState<Role>("Super Admin");

    // Persist role in localStorage for development testing
    useEffect(() => {
        const savedRole = localStorage.getItem("crm_mock_role") as Role;
        if (savedRole) {
            _setRole(savedRole);
        }
    }, []);

    const setRole = (newRole: Role) => {
        _setRole(newRole);
        localStorage.setItem("crm_mock_role", newRole);
    };

    const user: User = {
        name: "John Smith",
        email: "john@roofingpro.co.uk",
        role: role,
    };

    const canAccess = (permission: string): boolean => {
        // Handle route-level permissions too
        const p = permission.toLowerCase();

        switch (role) {
            case "Super Admin":
                return true; // Super Admin has access to everything

            case "BDM":
                if ([
                    "create_lead", "create_quote", "create_job",
                    "view_leads", "view_quotes", "view_accounts", "view_contacts", "view_sites", "view_tasks", "view_scheduling",
                    "/leads", "/quotes", "/accounts", "/contacts", "/sites", "/tasks", "/scheduling", "/dashboard"
                ].includes(p)) return true;
                return false;

            case "Admin/Accounts":
                if ([
                    "create_job", "create_invoice", "approve_invoice", "finance_actions",
                    "view_accounts", "view_contacts", "view_sites", "view_tasks", "view_finance", "view_inventory_readonly",
                    "/accounts", "/contacts", "/sites", "/tasks", "/finance", "/inventory", "/dashboard"
                ].includes(p)) return true;
                return false;

            case "Engineer":
                if ([
                    "view_jobs", "view_scheduling_engineer", "view_inventory_readonly", "adjust_stock", "job_signoff",
                    "/jobs", "/scheduling", "/inventory", "/dashboard"
                ].includes(p)) return true;
                return false;

            default:
                return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, setRole, canAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
