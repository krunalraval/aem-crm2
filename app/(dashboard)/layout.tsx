import { Sidebar, MobileSidebar } from "@/components/layout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header with hamburger */}
        <div className="md:hidden flex h-14 items-center border-b bg-background px-4">
          <MobileSidebar />
          <span className="ml-3 text-lg font-bold tracking-tight text-primary">AEM CRM</span>
        </div>
        {children}
      </div>
    </div>
  );
}
