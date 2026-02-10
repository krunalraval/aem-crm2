"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout";
import { useDrawer } from "@/components/layout/drawer-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    MapPin,
    Building2,
    Users,
    Plus,
    ArrowUpRight,
    ChevronRight,
    Map,
} from "lucide-react";

// Import mock data
import regionsData from "@/mock-data/regions.json";
import companiesData from "@/mock-data/companies.json";
import sitesData from "@/mock-data/sites.json";

interface Region {
    id: string;
    name: string;
    companyId: string;
    manager: string;
    sitesCount: number;
    coordinates: { x: number; y: number };
    color: string;
}

const regions = regionsData as Region[];
const companies = companiesData as { id: string; name: string }[];
const sites = sitesData as { regionId: string }[];

// Metric Card
function MetricCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color?: string }) {
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                    <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Icon className={`h-3.5 w-3.5 ${color || "text-primary"}`} />
                    </div>
                </div>
                <h2 className="text-xl font-black tracking-tight mt-1.5">{value}</h2>
            </CardContent>
        </Card>
    );
}

export default function RegionsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter regions
    const filteredRegions = useMemo(() => {
        return regions.filter((region) => {
            return region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                region.manager.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [searchQuery]);

    // Get company name helper
    const getCompanyName = (companyId: string) => {
        const company = companies.find(c => c.id === companyId);
        return company?.name || "Unknown";
    };

    // Count actual sites per region
    const getSiteCount = (regionId: string) => {
        return sites.filter(s => s.regionId === regionId).length;
    };

    // Stats
    const totalRegions = regions.length;
    const totalSites = sites.length;
    const uniqueCompanies = new Set(regions.map(r => r.companyId)).size;

    return (
        <>
            <Topbar title="Regions" subtitle="Geographic territory management" />
            <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard title="Total Regions" value={String(totalRegions)} icon={Map} />
                    <MetricCard title="Total Sites" value={String(totalSites)} icon={MapPin} color="text-green-500" />
                    <MetricCard title="Companies" value={String(uniqueCompanies)} icon={Building2} color="text-blue-500" />
                    <MetricCard title="Managers" value={String(new Set(regions.map(r => r.manager)).size)} icon={Users} color="text-purple-500" />
                </div>

                {/* Filters & Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search regions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted/30 border-none"
                            />
                        </div>
                    </div>
                    <Button size="sm" className="h-9 px-4 font-black text-xs uppercase tracking-widest">
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Region
                    </Button>
                </div>

                {/* Regions Table */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">All Regions</CardTitle>
                            <span className="text-sm text-muted-foreground">{filteredRegions.length} regions</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-medium">Region</TableHead>
                                        <TableHead className="font-medium">Company</TableHead>
                                        <TableHead className="font-medium">Manager</TableHead>
                                        <TableHead className="font-medium text-center">Sites</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRegions.map((region) => (
                                        <TableRow key={region.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: `${region.color}20` }}
                                                    >
                                                        <Map className="h-4 w-4" style={{ color: region.color }} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{region.name}</p>
                                                        <p className="text-xs text-muted-foreground">{region.id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm">{getCompanyName(region.companyId)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{region.manager}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                                                    {getSiteCount(region.id)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/sites?region=${region.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
