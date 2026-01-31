"use client";

import { Topbar } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const mockWorkOrders = [
    { id: "WO-001", site: "123 Oak Street", task: "Roof Inspection", technician: "Mike Johnson", status: "in_progress", priority: "high", eta: "10:30 AM" },
    { id: "WO-002", site: "456 Main Ave", task: "Material Delivery", technician: "Tom Brown", status: "pending", priority: "medium", eta: "11:00 AM" },
    { id: "WO-003", site: "789 Pine Blvd", task: "Installation", technician: "Sarah White", status: "completed", priority: "low", eta: "Completed" },
    { id: "WO-004", site: "321 Elm Street", task: "Emergency Repair", technician: "John Doe", status: "in_progress", priority: "urgent", eta: "ASAP" },
];

const statusColors: Record<string, string> = {
    pending: "bg-gray-500/20 text-gray-600",
    in_progress: "bg-blue-500/20 text-blue-600",
    completed: "bg-green-500/20 text-green-600",
};

const priorityColors: Record<string, string> = {
    low: "bg-gray-500/20 text-gray-600",
    medium: "bg-yellow-500/20 text-yellow-600",
    high: "bg-orange-500/20 text-orange-600",
    urgent: "bg-red-500/20 text-red-600",
};

export default function FieldOpsPage() {
    return (
        <>
            <Topbar title="Field Operations" />
            <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
                {/* Stats */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Work Orders</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">12</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Field Technicians</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">8 / 10</div><p className="text-sm text-muted-foreground">On duty</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">7</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Urgent Issues</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-500">2</div></CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="workorders" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="workorders">Work Orders</TabsTrigger>
                        <TabsTrigger value="map">Map View</TabsTrigger>
                        <TabsTrigger value="technicians">Technicians</TabsTrigger>
                    </TabsList>

                    <TabsContent value="workorders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Work Orders</CardTitle>
                                <CardDescription>Real-time status of field operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockWorkOrders.map((wo) => (
                                        <div key={wo.id} className="flex items-center gap-4 rounded-lg border p-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                                {wo.status === "completed" ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : wo.priority === "urgent" ? <AlertCircle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{wo.task}</p>
                                                    <Badge className={priorityColors[wo.priority]} variant="secondary">{wo.priority}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{wo.site}</span>
                                                    <span>{wo.technician}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={statusColors[wo.status]} variant="secondary">{wo.status.replace("_", " ")}</Badge>
                                                <p className="mt-1 text-sm text-muted-foreground">{wo.eta}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="map"><Card><CardContent className="py-20 text-center text-muted-foreground">Interactive map with technician locations would appear here</CardContent></Card></TabsContent>
                    <TabsContent value="technicians"><Card><CardContent className="py-10 text-center text-muted-foreground">Technician status and availability view</CardContent></Card></TabsContent>
                </Tabs>
            </main>
        </>
    );
}
