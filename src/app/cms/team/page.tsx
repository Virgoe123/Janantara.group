
'use server';

import { getTeamMembers } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TeamView from "./team-view";

type TeamMember = { 
  id: string; 
  name: string; 
  role: string;
  image_url: string | null;
  created_at: string;
};

export default async function TeamPage() {
  const { data: initialMembers, error } = await getTeamMembers();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          Could not load team members: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return <TeamView initialMembers={(initialMembers as TeamMember[]) || []} />;
}

    