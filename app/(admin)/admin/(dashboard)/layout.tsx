import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminPageTransition from "@/components/admin/AdminPageTransition";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-pearl flex flex-col md:flex-row w-full selection:bg-rose/20 selection:text-plum">
      {/* Desktop Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Sticky Top Bar */}
        <AdminTopBar />

        {/* Page Content with smooth transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AdminPageTransition>{children}</AdminPageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <AdminMobileNav />
    </div>
  );
}
