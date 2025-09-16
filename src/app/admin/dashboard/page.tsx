import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Admin Dashboard!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You have successfully logged in.</p>
        </CardContent>
      </Card>
    </div>
  );
}
