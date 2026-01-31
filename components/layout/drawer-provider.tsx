"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface DrawerState {
  isOpen: boolean;
  title: string;
  description?: string;
  content: ReactNode | null;
}

interface DrawerContextType {
  drawerState: DrawerState;
  openDrawer: (title: string, content: ReactNode, description?: string) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [drawerState, setDrawerState] = useState<DrawerState>({
    isOpen: false,
    title: "",
    description: "",
    content: null,
  });

  const openDrawer = (title: string, content: ReactNode, description?: string) => {
    setDrawerState({ isOpen: true, title, description, content });
  };

  const closeDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <DrawerContext.Provider value={{ drawerState, openDrawer, closeDrawer }}>
      {children}
      <Sheet open={drawerState.isOpen} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col gap-0 border-none shadow-2xl">
          <SheetHeader className="p-6 bg-muted/20 border-b border-slate-100 space-y-1">
            <SheetTitle className="text-xl font-black tracking-tight">{drawerState.title}</SheetTitle>
            {drawerState.description && (
              <SheetDescription className="text-xs font-medium text-muted-foreground">{drawerState.description}</SheetDescription>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {drawerState.content}
          </div>
        </SheetContent>
      </Sheet>
    </DrawerContext.Provider>
  );
}
