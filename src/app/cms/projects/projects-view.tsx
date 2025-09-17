
'use client'

import { useActionState, useRef, useEffect, useState, useCallback } from "react";
import React from 'react';
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { getClients, getProjects, deleteProject, addProject, LoginState } from "@/lib/actions";
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
import { Link as LinkIcon, Trash2 } from "lucide-react";
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
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Adding Project..." : "Add Project"}
    </Button>
  );
}

function AddProjectForm({ clients, onProjectAdded }: { clients: Client[], onProjectAdded: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: LoginState = { message: null };
  const [state, formAction] = useActionState(addProject, initialState);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success!",
        description: state.message,
      });
      formRef.current?.reset();
      onProjectAdded();
    } else if (state?.message && !state.success) {
        toast({
            variant: "destructive",
            title: "Action Failed",
            description: state.message,
        });
    }
  }, [state, onProjectAdded, toast]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Add New Project</CardTitle>
        <CardDescription>
          Fill out the details to add a new project.
        </CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <SelectItem value="no-client">No Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.clientId && <p className="text-sm text-destructive">{state.errors.clientId[0]}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Project Link (Optional)</Label>
            <Input id="link" name="link" placeholder="https://example.com" />
            {state?.errors?.link && <p className="text-sm text-destructive">{state.errors.link[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" name="description" placeholder="A short description of the project."/>
             {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="image">Project Image</Label>
            <Input id="image" name="image" type="file" required accept="image/*" className="file:text-foreground"/>
            {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

function ProjectsList({ projects, onProjectDeleted, isLoading }: { projects: Project[], onProjectDeleted: (id:string) => void, isLoading: boolean }) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
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
        <Card className="shadow-md p-4">
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2 flex-grow">
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
       )
   }

   if (projects.length === 0) {
    return <Card className="flex items-center justify-center p-12 shadow-md"><p className="text-center text-muted-foreground">No projects found. Add one to get started.</p></Card>;
  }

  return (
     <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
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
                  <Link href={project.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <LinkIcon className="h-4 w-4" />
                  </Link>
                ) : <span className="text-muted-foreground">N/A</span>}
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
    </Card>
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
    <div className="space-y-8">
        <AddProjectForm clients={clients} onProjectAdded={fetchClientsAndProjects}/>
        <ProjectsList projects={projects} onProjectDeleted={handleProjectDeleted} isLoading={isLoadingProjects}/>
    </div>
  );
}
