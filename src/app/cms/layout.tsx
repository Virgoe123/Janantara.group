import React from "react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, Home, Users, Briefcase, Wrench, Star, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LogoutButton = () => {
  return (
    <form action={logout} className="w-full">
      <SidebarMenuButton size="lg" className="w-full justify-start text-muted-foreground hover:text-destructive">
        <LogOut />
        <span className="group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">Logout</span>
      </SidebarMenuButton>
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
    { href: "/cms/services", icon: <Wrench />, label: "Services" },
    { href: "/cms/testimonials", icon: <Star />, label: "Testimonials" },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="h-16 flex items-center justify-start p-2 group-data-[state=collapsed]:justify-center">
            <Link href="/cms" className={cn(
                "flex items-center gap-2 transition-all duration-300",
                "group-data-[state=collapsed]:w-8 group-data-[state=expanded]:w-32"
            )}>
                <Image src="https://res.cloudinary.com/dye07cjmn/image/upload/v1757992101/96b46217-0642-41b8-b06a-0ba5cb0d6572.png" alt="Janantara Logo" width={32} height={32} className="shrink-0" />
                <span className="font-semibold text-lg text-sidebar-foreground group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-opacity duration-200">Janantara</span>
            </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarMenu className="gap-y-2 p-2">
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href} className="group-data-[state=collapsed]:justify-center flex">
                <SidebarMenuButton asChild size="lg" tooltip={item.label}>
                    <Link href={item.href} className="flex group-data-[state=expanded]:justify-start">
                        {React.cloneElement(item.icon, { className: "h-5 w-5 shrink-0"})}
                        <span className="group-data-[state=collapsed]:opacity-0 transition-opacity duration-200">{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarSeparator />
            <div className="flex items-center gap-3 p-2 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center">
                <Avatar className="size-8 group-data-[state=collapsed]:size-9">
                    <AvatarImage src={session.user.user_metadata.avatar_url} />
                    <AvatarFallback>
                        <User />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-col group-data-[state=collapsed]:hidden">
                    <p className="text-sm font-semibold text-sidebar-foreground leading-none">{session.user.user_metadata.full_name ?? session.user.email}</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                </div>
            </div>
           <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-secondary flex-1">
          <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/80 px-6 backdrop-blur-sm">
          <SidebarTrigger className="-ml-2"/>
          <div className="ml-auto">
              {/* Future user menu */}
          </div>
          </header>
          <main className="p-4 lg:p-8">
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
