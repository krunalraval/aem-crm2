"use client";

import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ActivityType } from "./activity-timeline";
import {
    Phone,
    Send,
    Inbox,
    Users,
    MapPin,
    FileText,
    FileUp,
    Signature,
    CheckCircle2,
    ArrowRight,
    Bell,
    Upload
} from "lucide-react";
import { toast } from "sonner";

export function LogActivityForm({ onClose }: { onClose: () => void }) {
    const [type, setType] = useState<ActivityType>("call");
    const [description, setDescription] = useState("");
    const [outcome, setOutcome] = useState("");
    const [duration, setDuration] = useState("");
    const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(`${type.split("_").join(" ")} logged successfully`);
        onClose();
    };

    const typeIcons: Record<string, React.ReactNode> = {
        call: <Phone className="h-4 w-4 mr-2" />,
        email_sent: <Send className="h-4 w-4 mr-2" />,
        email_received: <Inbox className="h-4 w-4 mr-2" />,
        meeting: <Users className="h-4 w-4 mr-2" />,
        site_visit: <MapPin className="h-4 w-4 mr-2" />,
        note: <FileText className="h-4 w-4 mr-2" />,
        quote_sent: <FileUp className="h-4 w-4 mr-2" />,
        contract_sent: <Signature className="h-4 w-4 mr-2" />,
        contract_signed: <CheckCircle2 className="h-4 w-4 mr-2" />,
        status_change: <ArrowRight className="h-4 w-4 mr-2" />,
        system_notification: <Bell className="h-4 w-4 mr-2" />,
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Activity Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                    <SelectTrigger className="font-bold border-muted/40">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="call"><div className="flex items-center"><Phone className="h-4 w-4 mr-2 text-blue-500" /> Call</div></SelectItem>
                        <SelectItem value="email_sent"><div className="flex items-center"><Send className="h-4 w-4 mr-2 text-indigo-500" /> Email Sent</div></SelectItem>
                        <SelectItem value="email_received"><div className="flex items-center"><Inbox className="h-4 w-4 mr-2 text-purple-500" /> Email Received</div></SelectItem>
                        <SelectItem value="meeting"><div className="flex items-center"><Users className="h-4 w-4 mr-2 text-amber-500" /> Meeting</div></SelectItem>
                        <SelectItem value="site_visit"><div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-emerald-500" /> Site Visit</div></SelectItem>
                        <SelectItem value="note"><div className="flex items-center"><FileText className="h-4 w-4 mr-2 text-slate-500" /> Note</div></SelectItem>
                        <SelectItem value="quote_sent"><div className="flex items-center"><FileUp className="h-4 w-4 mr-2 text-blue-600" /> Quote Sent</div></SelectItem>
                        <SelectItem value="contract_sent"><div className="flex items-center"><Signature className="h-4 w-4 mr-2 text-purple-600" /> Contract Sent</div></SelectItem>
                        <SelectItem value="contract_signed"><div className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Contract Signed</div></SelectItem>
                        <SelectItem value="status_change"><div className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-slate-400" /> Status Change</div></SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Description</Label>
                <Textarea
                    placeholder="Enter activity details..."
                    className="min-h-[100px] border-muted/40 font-medium"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Date & Time</Label>
                    <Input
                        type="datetime-local"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        className="border-muted/40 font-bold text-xs"
                    />
                </div>

                {/* Conditional Field: Duration (for Call & Meeting) */}
                {(type === "call" || type === "meeting") && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Duration (min)</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 15"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="border-muted/40 font-bold"
                        />
                    </div>
                )}
            </div>

            {/* Conditional Field: Outcome (for Call Only) */}
            {type === "call" && (
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Outcome</Label>
                    <Select value={outcome} onValueChange={setOutcome}>
                        <SelectTrigger className="font-bold border-muted/40">
                            <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Successful">Successful</SelectItem>
                            <SelectItem value="No Answer">No Answer</SelectItem>
                            <SelectItem value="Voicemail Left">Voicemail Left</SelectItem>
                            <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Attachments</Label>
                <div className="border-2 border-dashed border-muted rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/5 transition-colors cursor-pointer">
                    <Upload className="h-6 w-6 mb-2 opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Click or drag files here</p>
                </div>
            </div>

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <Button variant="outline" type="button" onClick={onClose} className="flex-1 font-bold uppercase text-xs h-10">
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 font-bold uppercase text-xs h-10 bg-primary hover:bg-primary/90">
                    Save Activity
                </Button>
            </div>
        </form>
    );
}
