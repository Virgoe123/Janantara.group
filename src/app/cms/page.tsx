
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Wrench } from "lucide-react";
import Link from "next/link";

const stats = [
    { title: "Projects", value: "12", icon: <Briefcase className="h-6 w-6 text-primary" />, href: "/cms/projects" },
    { title: "Services", value: "5", icon: <Wrench className="h-6 w-6 text-primary" />, href: "/cms/services" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a quick overview of your site.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
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
        <Card>
            <CardHeader>
            <CardTitle>Welcome to the Janantara CMS!</CardTitle>
            <CardDescription>This is your content management dashboard. Manage your site's projects and services from the sidebar.</CardDescription>
            </CardHeader>
            <CardContent>
            <p>Select a category from the sidebar to get started.</p>
            </CardContent>
      </Card>
    </div>
  );
}
