"use client";

import React from "react";
import Link from "next/link";
import {
    Building2,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Zap,
    Github,
    Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-stretch bg-background">
            {/* Left Side: Branding & Hero */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 bg-[#0a0a0b]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/10" />
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className="relative flex h-full flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none">AEM CRM</span>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="text-5xl font-black leading-[1.1] tracking-tight mb-6">
                            Manage your enterprise <br />
                            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent italic">with surgical precision.</span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed font-medium">
                            Experience the next generation of industrial CRM. High-fidelity analytics,
                            real-time scheduling, and seamless field operations.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: ShieldCheck, title: "Vault-Grade Security", desc: "Enterprise encryption" },
                                { icon: Zap, title: "Ultra Fast Sync", desc: "Real-time updates" },
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <feature.icon className="h-5 w-5 text-primary mb-1" />
                                    <h3 className="font-bold text-sm">{feature.title}</h3>
                                    <p className="text-xs text-slate-400 leading-snug">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0a0a0b] bg-slate-800" />
                            ))}
                        </div>
                        <p className="text-sm text-slate-400">
                            Trusted by <span className="font-bold text-white">500+</span> industry leaders
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-24 bg-[#0a0a0b]/5">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter italic uppercase text-primary leading-none">AEM CRM</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground font-medium">Enter your credentials to access the platform</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm h-11 hover:bg-slate-50 transition-all font-semibold">
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm h-11 hover:bg-slate-50 transition-all font-semibold">
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest leading-none">
                            <span className="bg-[#f8f9fa] dark:bg-slate-950 px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Work Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@aem.uk"
                                    className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                                <Link href="#" className="text-[11px] font-bold uppercase tracking-wider text-primary hover:underline font-bold">Forgot?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all text-sm font-bold uppercase tracking-widest">
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="#" className="font-bold text-primary hover:underline">Contact Admin</Link>
                    </p>
                </div>

                <div className="mt-auto pt-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                    © 2024 AEM CRM • Precision Enterprise Solutions
                </div>
            </div>
        </div>
    );
}
