
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the CMS!</CardTitle>
          <CardDescription>This is your content management dashboard. You can manage your site from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You have successfully logged in.</p>
        </CardContent>
      </Card>
  );
}
