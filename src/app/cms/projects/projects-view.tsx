
'use client'

import React, { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { getProjects, deleteProject, addProject, LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Link as LinkIcon, Trash2, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Project = { 
  id: string; 
  title: string; 
  description: string | null;
  image_url: string | null;
  link: string | null;
  created_at: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding Project..." : "Add Project"}
    </Button>
  );
}

function AddProjectForm({ onProjectAdded }: { onProjectAdded: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
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
      dialogCloseRef.current?.click();
    } else if (state?.message && !state.success) {
        toast({
            variant: "destructive",
            title: "Action Failed",
            description: state.message,
        });
    }
  }, [state, onProjectAdded, toast]);

  return (
    <Dialog>
      <DialogTrigger asChild>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Fill out the details to add a new project.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <div className="space-y-4 py-4">
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
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" name="description" placeholder="A short description of the project."/>
              {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Project Image</Label>
              <Input id="image" name="image" type="file" required accept="image/*" className="file:text-foreground"/>
              {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Cancel
                </Button>
              </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
        <DialogClose ref={dialogCloseRef} className="hidden" />
      </DialogContent>
    </Dialog>
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

  const ListContent = () => {
       if (isLoading) {
           return (
             <TableBody>
                {[...Array(3)].map((_, i) => (
                   <TableRow key={i}>
                        <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                   </TableRow>
                ))}
            </TableBody>
           )
       }

      if (projects.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No projects found. Add one to get started.
                    </TableCell>
                </TableRow>
            </TableBody>
        );
      }

      return (
         <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className={isDeleting === project.id ? 'opacity-50' : ''}>
              <TableCell>
                {project.image_url ? (
                  <Image 
                    src={project.image_url} 
                    alt={project.title} 
                    width={64} 
                    height={64}
                    className="rounded-md object-cover h-16 w-16"
                  />
                ) : <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
              </TableCell>
              <TableCell className="font-medium">{project.title}</TableCell>
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
      )
  }

  return (
     <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <ListContent />
      </Table>
    </Card>
  )
}

export default function ProjectsView({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects);
  const [isLoadingProjects, setIsLoadingProjects] = React.useState(false);
  const { toast } = useToast();

  const fetchProjects = React.useCallback(async () => {
    setIsLoadingProjects(true);
    const projectResult = await getProjects();

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
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold font-headline tracking-tight">Projects</h1>
                <p className="text-muted-foreground">Manage your portfolio projects.</p>
            </div>
            <AddProjectForm onProjectAdded={fetchProjects}/>
        </div>
        <ProjectsList projects={projects} onProjectDeleted={handleProjectDeleted} isLoading={isLoadingProjects}/>
    </div>
  );
}
