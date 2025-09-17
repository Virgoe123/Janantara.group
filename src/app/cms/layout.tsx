
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, Home, Users, Briefcase, Wrench } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

const LogoutButton = () => {
  return (
    <form action={logout} className="w-full">
      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
        <LogOut className="mr-3 h-5 w-5" />
        <span>Logout</span>
      </Button>
    </form>
  );
};

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { session }} = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const menuItems = [
    { href: "/cms", icon: <LayoutDashboard />, label: "Dashboard" },
    { href: "/cms/projects", icon: <Briefcase />, label: "Projects" },
    { href: "/cms/clients", icon: <Users />, label: "Clients" },
    { href: "/cms/services", icon: <Wrench />, label: "Services" },
    { href: "/cms/settings", icon: <Settings />, label: "Settings" },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="h-16 flex items-center justify-center">
            <Link href="/cms" className={cn(
                "flex items-center gap-2 transition-all duration-300",
                "group-data-[state=collapsed]:w-8 group-data-[state=expanded]:w-32"
            )}>
                <Image src="https://res.cloudinary.com/dye07cjmn/image/upload/v1757992101/96b46217-0642-41b8-b06a-0ba5cb0d6572.png" alt="Janantara Logo" width={32} height={32} className="shrink-0" />
                <span className="font-semibold text-lg text-sidebar-foreground group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-opacity duration-200">CMS</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="gap-y-2">
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href} className="px-2">
                <SidebarMenuButton asChild size="lg" tooltip={item.label}>
                    <Link href={item.href}>
                        {React.cloneElement(item.icon, { className: "h-5 w-5 shrink-0"})}
                        <span className="group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <Separator className="my-2 bg-sidebar-border" />
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild variant="ghost" className="text-muted-foreground" tooltip="Back to Site">
                  <Link href="/">
                    <Home className="h-5 w-5" />
                     <span className="group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">Back to Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
           <Separator className="my-2 bg-sidebar-border" />
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-secondary">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
           <SidebarTrigger className="md:hidden -ml-2"/>
           <div className="ml-auto">
             {/* Future user menu */}
           </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
