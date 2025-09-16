
import { cookies } from "next/headers";
import { getClients, getProjects } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ProjectsView from "./projects-view";

type Client = { id: string; name: string };
type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  created_at: string;
  clients: { name: string } | null;
};

export default async function ProjectsPage() {
  const cookieStore = cookies();
  const clientsResult = await getClients(cookieStore);
  const projectsResult = await getProjects(cookieStore);

  const error = clientsResult.error || projectsResult.error;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          {`Could not load required data: ${error.message}`}
        </AlertDescription>
      </Alert>
    );
  }

  return <ProjectsView 
            initialClients={clientsResult.data || []} 
            initialProjects={(projectsResult.data as Project[]) || []} 
         />;
}
