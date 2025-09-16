
'use client'

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { addProject, getClients, getProjects, LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Client = { id: string; name: string };
type Project = { 
  id: string; 
  title: string; 
  description: string | null;
  image_url: string | null;
  created_at: string;
  clients: { name: string } | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding Project..." : "Add Project"}
    </Button>
  );
}

function AddProjectForm({ clients, onProjectAdded }: { clients: Client[], onProjectAdded: () => void }) {
  const { toast } = useToast();
  const initialState: LoginState = { message: null, errors: {} };
  const [state, formAction] = useActionState(addProject, initialState);
  const [formKey, setFormKey] = useState(Date.now().toString());

  useEffect(() => {
    if (state?.message && !state.errors) {
      toast({
        title: "Success!",
        description: state.message,
      });
      // Reset form by changing key
      setFormKey(Date.now().toString());
      onProjectAdded();
    }
  }, [state?.message, state?.errors, toast, onProjectAdded]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Project</CardTitle>
        <CardDescription>
          Fill out the details below to add a new project to your portfolio.
        </CardDescription>
      </CardHeader>
      <form action={formAction} key={formKey}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" name="title" placeholder="e.g., Awesome Mobile App" required />
            {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">Client (Optional)</Label>
            <Select name="clientId">
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Client</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.clientId && <p className="text-sm text-destructive">{state.errors.clientId[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="A short description of the project."/>
             {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <Input id="image" name="image" type="file" required accept="image/*"/>
            {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
          </div>
           {state?.message && state.errors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Failed</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

function ProjectsList({ projects }: { projects: Project[] }) {
   if (projects.length === 0) {
    return <p className="text-center text-muted-foreground">No projects found. Add one above to get started.</p>;
  }

  return (
     <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                {project.image_url && (
                  <Image 
                    src={project.image_url} 
                    alt={project.title} 
                    width={64} 
                    height={64}
                    className="rounded-md object-cover h-16 w-16"
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">{project.title}</TableCell>
               <TableCell>{project.clients?.name ?? 'N/A'}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ProjectsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    const clientResult = await getClients();
    if(clientResult.error) {
      setError("Failed to load clients.");
      toast({variant: "destructive", title: "Error", description: "Could not load clients."})
    } else {
      setClients(clientResult.data || []);
    }
  };

  const fetchProjects = async () => {
    const projectResult = await getProjects();
    if(projectResult.error) {
      setError("Failed to load projects.");
      toast({variant: "destructive", title: "Error", description: "Could not load projects."})
    } else {
      setProjects(projectResult.data as any || []);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, []);

  if(error) {
    return <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  }
  
  return (
    <div className="grid gap-8">
      <AddProjectForm clients={clients} onProjectAdded={fetchProjects}/>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>A list of all your portfolio projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsList projects={projects}/>
        </CardContent>
      </Card>
    </div>
  );
}
