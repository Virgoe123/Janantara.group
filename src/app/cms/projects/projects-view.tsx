
'use client'

import { useState, useTransition, useCallback, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { getClients, getProjects, deleteProject, LoginState, addProject } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { AlertCircle, Link as LinkIcon, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

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
  const initialState: LoginState = { message: null, errors: {}, success: false };
  const [state, formAction] = useActionState(addProject, initialState);
  const [formKey, setFormKey] = useState(Date.now().toString());

  useEffect(() => {
    if (state.success) {
      if (state.message) {
        toast({
          title: "Success!",
          description: state.message,
        });
      }
      setFormKey(Date.now().toString());
      onProjectAdded();
    }
  }, [state, onProjectAdded, toast]);

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
            <Label htmlFor="link">Project Link (Optional)</Label>
            <Input id="link" name="link" placeholder="https://example.com" />
            {state?.errors?.link && <p className="text-sm text-destructive">{state.errors.link[0]}</p>}
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" name="description" placeholder="A short description of the project."/>
             {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <Input id="image" name="image" type="file" required accept="image/*"/>
            {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
          </div>
           {state?.message && !state.success && (
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

function ProjectsList({ projects, onProjectDeleted, isLoading }: { projects: Project[], onProjectDeleted: (id:string) => void, isLoading: boolean }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string, imageUrl: string | null) => {
    setIsDeleting(id);
    const result = await deleteProject(id, imageUrl || '');
    if (result.success) {
      toast({ title: "Success", description: result.message });
      onProjectDeleted(id);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsDeleting(null);
  };

   if (isLoading) {
       return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
       )
   }

   if (projects.length === 0) {
    return <p className="text-center text-muted-foreground pt-4">No projects found. Add one above to get started.</p>;
  }

  return (
     <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className={isDeleting === project.id ? 'opacity-50' : ''}>
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
               <TableCell>
                {project.link ? (
                  <Link href={project.link} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-4 w-4" />
                  </Link>
                ) : 'N/A'}
               </TableCell>
              <TableCell>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!!isDeleting}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the project "{project.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(project.id, project.image_url)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ProjectsView({ initialClients, initialProjects }: { initialClients: Client[], initialProjects: Project[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const { toast } = useToast();

  const fetchClientsAndProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    const [clientResult, projectResult] = await Promise.all([
        getClients(),
        getProjects()
    ]);
    
    if (clientResult.error) {
      toast({ variant: "destructive", title: "Error", description: "Could not refresh clients." });
    } else {
      setClients(clientResult.data || []);
    }

    if (projectResult.error) {
      toast({ variant: "destructive", title: "Error", description: "Could not refresh projects." });
    } else {
      setProjects(projectResult.data as any || []);
    }
    setIsLoadingProjects(false);
  }, [toast]);
  
  const handleProjectDeleted = (deletedId: string) => {
      setProjects(prev => prev.filter(p => p.id !== deletedId));
  }
  
  return (
    <div className="grid gap-8">
      <AddProjectForm clients={clients} onProjectAdded={fetchClientsAndProjects}/>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>A list of all your portfolio projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsList projects={projects} onProjectDeleted={handleProjectDeleted} isLoading={isLoadingProjects}/>
        </CardContent>
      </Card>
    </div>
  );
}

    