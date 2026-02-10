"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

interface SignatureCaptureProps {
    onSave: (dataUrl: string) => void;
    onClear?: () => void;
    width?: number;
    height?: number;
    className?: string;
}

export function SignatureCapture({
    onSave,
    onClear,
    width = 400,
    height = 200,
    className = "",
}: SignatureCaptureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Line styles
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Prevent scrolling when touching the canvas
        const preventDefault = (e: TouchEvent) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        };

        document.addEventListener("touchstart", preventDefault, { passive: false });
        document.addEventListener("touchend", preventDefault, { passive: false });
        document.addEventListener("touchmove", preventDefault, { passive: false });

        return () => {
            document.removeEventListener("touchstart", preventDefault);
            document.removeEventListener("touchend", preventDefault);
            document.removeEventListener("touchmove", preventDefault);
        };
    }, []);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        // Account for CSS scaling
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            if (hasSignature && canvasRef.current) {
                onSave(canvasRef.current.toDataURL());
            }
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        if (onClear) onClear();
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="relative group border-2 border-muted hover:border-primary/30 transition-colors rounded-xl overflow-hidden bg-white shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full h-auto cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 select-none">
                        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Sign here</p>
                    </div>
                )}
                {hasSignature && (
                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-sm opacity-80">
                        <Check className="h-3 w-3 text-white" />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center px-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {hasSignature ? "Signature captured" : "Awaiting signature"}
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 text-[10px] uppercase font-bold tracking-widest hover:text-destructive"
                >
                    <RotateCcw className="h-3 w-3 mr-1.5" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
