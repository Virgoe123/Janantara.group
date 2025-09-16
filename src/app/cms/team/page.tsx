
'use server';

import { getTeamMembers } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TeamView from "./team-view";
import { cookies } from "next/headers";

export default async function TeamPage() {
  const cookieStore = cookies();
  const { data: initialMembers, error } = await getTeamMembers(cookieStore);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          Could not load team members. There might be a problem with your database connection or security policies.
        </AlertDescription>
      </Alert>
    );
  }

  return <TeamView initialMembers={initialMembers || []} />;
}
