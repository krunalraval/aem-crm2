"use client";

import React, { useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SignatureCapture } from "@/components/ui/signature-capture";
import { toast } from "sonner";
import {
    FileText,
    Calendar,
    MapPin,
    Building2,
    CheckCircle2,
    ShieldCheck,
    Download,
    ArrowRight
} from "lucide-react";

// Mock Contract Data
const mockContract = {
    id: "CONT-12345",
    title: "Service Agreement - CCTV & Access Control",
    companyName: "Johnson Roofing LLC",
    siteAddress: "123 Oak Street, Austin, TX 78701",
    dateIssued: "2024-02-10",
    value: "£3,200.00",
    terms: [
        "The system will be installed as per the agreed survey specification.",
        "Maintenance is included for the first 12 months.",
        "Payment is due within 14 days of successful installation.",
        "24/7 monitoring is active from the date of handover.",
    ]
};

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [signature, setSignature] = useState("");
    const [signedName, setSignedName] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSigned, setIsSigned] = useState(false);

    const handleSign = async () => {
        if (!signature || !signedName || !agreedToTerms) {
            toast.error("Please fill in all required fields and provide a signature.");
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSigned(true);
        toast.success("Contract signed successfully!");
    };

    if (isSigned) {
        return (
            <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-none shadow-xl text-center p-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-2xl font-black">Signature Confirmed</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Thank you, {signedName}. The service agreement has been signed and a copy has been sent to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4 pt-4">
                        <Button variant="outline" className="w-full h-12 font-bold uppercase tracking-widest text-xs">
                            <Download className="mr-2 h-4 w-4" /> Download Signed Copy
                        </Button>
                        <p className="text-xs text-muted-foreground pt-4 flex items-center justify-center gap-1.5 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            Securely signed with AEM CRM E-Sign
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">A</div>
                        <h1 className="font-black text-sm uppercase tracking-widest">AEM CRM <span className="text-muted-foreground font-medium">E-Sign</span></h1>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] py-1 px-3">
                        Awaiting Signature
                    </Badge>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Contract Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Service Agreement</p>
                                    <CardTitle className="text-2xl font-black">{mockContract.title}</CardTitle>
                                </div>
                                <FileText className="h-8 w-8 text-primary/40" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">Client</p>
                                            <p className="text-sm font-bold">{mockContract.companyName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">Site Address</p>
                                            <p className="text-sm font-bold">{mockContract.siteAddress}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">Date Issued</p>
                                            <p className="text-sm font-bold">{mockContract.dateIssued}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">Contract Value</p>
                                            <p className="text-sm font-black text-primary">{mockContract.value}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-xs font-black uppercase tracking-widest">Key Terms & Conditions</h3>
                                <div className="space-y-3">
                                    {mockContract.terms.map((term, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-bold">
                                                {i + 1}
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">{term}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-xl text-xs text-muted-foreground leading-relaxed italic">
                                By signing this document, you acknowledge that you have read and understood the full terms and conditions associated with this service agreement. This electronic signature is legally binding.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Signing Form */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl lg:sticky lg:top-24 overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Sign Document</CardTitle>
                            <CardDescription className="text-xs">Provide your details and signature below</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                <Input
                                    placeholder="Enter your full name"
                                    className="h-11 font-bold border-muted/50 focus:border-primary/50"
                                    value={signedName}
                                    onChange={(e) => setSignedName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Draw Signature</Label>
                                <SignatureCapture
                                    onSave={setSignature}
                                    onClear={() => setSignature("")}
                                    height={160}
                                />
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                                <Checkbox
                                    id="terms"
                                    className="mt-0.5"
                                    checked={agreedToTerms}
                                    onCheckedChange={(v) => setAgreedToTerms(v as boolean)}
                                />
                                <Label htmlFor="terms" className="text-xs font-medium leading-relaxed cursor-pointer select-none">
                                    I agree to the terms and conditions and understand that this signature is legally binding.
                                </Label>
                            </div>

                            <Button
                                className="w-full h-14 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                                onClick={handleSign}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Processing..." : (
                                    <>Sign & Confirm <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground pt-2 flex items-center justify-center gap-1.5">
                                <ShieldCheck className="h-3 w-3 text-primary" />
                                Securely Handled by AEM CRM
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
