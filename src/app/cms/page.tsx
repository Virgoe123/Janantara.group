
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Users, Wrench } from "lucide-react";
import Link from "next/link";

const stats = [
    { title: "Projects", value: "12", icon: <Briefcase className="h-6 w-6 text-primary" />, href: "/cms/projects" },
    { title: "Clients", value: "8", icon: <Users className="h-6 w-6 text-primary" />, href: "/cms/clients" },
    { title: "Services", value: "5", icon: <Wrench className="h-6 w-6 text-primary" />, href: "/cms/services" },
]

export default function DashboardPage() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
            <Link href={stat.href} key={stat.title}>
                <Card className="hover:border-primary/50 hover:shadow-lg transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">Managed in CMS</p>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Welcome to the CMS!</CardTitle>
          <CardDescription>This is your content management dashboard. Manage your site's projects, clients, and services from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Select a category from the sidebar to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}
