"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalState {
    isOpen: boolean;
    title: string;
    description?: string;
    content: ReactNode | null;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

interface ModalContextType {
    openModal: (options: Omit<ModalState, "isOpen">) => void;
    closeModal: () => void;
    openConfirmation: (
        title: string,
        description: string,
        onConfirm: () => void
    ) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: "",
        description: "",
        content: null,
    });

    const openModal = (options: Omit<ModalState, "isOpen">) => {
        setModalState({ ...options, isOpen: true });
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    const openConfirmation = (
        title: string,
        description: string,
        onConfirm: () => void
    ) => {
        setModalState({
            isOpen: true,
            title,
            description,
            content: null,
            onConfirm,
            confirmText: "Confirm",
            cancelText: "Cancel",
        });
    };

    const handleConfirm = () => {
        modalState.onConfirm?.();
        closeModal();
    };

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] h-[95vh]",
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal, openConfirmation }}>
            {children}
            <Dialog open={modalState.isOpen} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className={modalState.size ? sizeClasses[modalState.size] : ""}>
                    <DialogHeader>
                        <DialogTitle>{modalState.title}</DialogTitle>
                        {modalState.description && (
                            <DialogDescription>{modalState.description}</DialogDescription>
                        )}
                    </DialogHeader>
                    {modalState.content && <div className="py-4">{modalState.content}</div>}
                    {modalState.onConfirm && (
                        <DialogFooter>
                            <Button variant="outline" onClick={closeModal}>
                                {modalState.cancelText || "Cancel"}
                            </Button>
                            <Button onClick={handleConfirm}>
                                {modalState.confirmText || "Confirm"}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </ModalContext.Provider>
    );
}
