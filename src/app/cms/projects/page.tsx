

import { getProjects } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ProjectsView from "./projects-view";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type Project = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  image_urls: string[] | null;
  link: string | null;
  created_at: string;
};

export default async function ProjectsPage() {
  const projectsResult = await getProjects();

  if (projectsResult.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          {`Could not load required data: ${projectsResult.error.message}`}
        </AlertDescription>
      </Alert>
    );
  }

  return <ProjectsView 
            initialProjects={(projectsResult.data as Project[]) || []} 
         />;
}
