
'use client'

import React, { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { getProjects, deleteProject, addProject, updateProject, LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { Link as LinkIcon, Trash2, PlusCircle, Edit, X as XIcon, FileImage, ImagePlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "./page";

function SubmitButton({ text, pendingText }: { text: string, pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : text}
    </Button>
  );
}

function AddProjectForm({ onProjectAdded }: { onProjectAdded: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const initialState: LoginState = { message: null };
  const [state, formAction] = useActionState(addProject, initialState);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(previews);
    }
  };

  const resetPreviews = () => {
    setThumbnailPreview(null);
    setGalleryPreviews([]);
  }

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.message });
      formRef.current?.reset();
      resetPreviews();
      onProjectAdded();
      dialogCloseRef.current?.click();
    } else if (state?.message && !state.success) {
      toast({ variant: "destructive", title: "Action Failed", description: state.message });
    }
  }, [state, onProjectAdded, toast]);

  return (
    <Dialog onOpenChange={(open) => { if (!open) { formRef.current?.reset(); resetPreviews(); } }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>Fill out the details to add a new project.</DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
              <Textarea id="description" name="description" placeholder="A short description of the project." />
              {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input id="thumbnail" name="thumbnail" type="file" required accept="image/*" className="file:text-foreground" onChange={handleThumbnailChange} />
              {state?.errors?.thumbnail && <p className="text-sm text-destructive">{Array.isArray(state.errors.thumbnail) ? state.errors.thumbnail.join(', ') : state.errors.thumbnail}</p>}
            </div>
            {thumbnailPreview && (
              <div className="p-2 border rounded-md w-fit">
                <Image src={thumbnailPreview} alt="Thumbnail Preview" width={100} height={75} className="rounded-md object-cover w-24 h-auto" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="images">Gallery Images (Optional)</Label>
              <Input id="images" name="images" type="file" multiple accept="image/*" className="file:text-foreground" onChange={handleGalleryChange} />
              {state?.errors?.images && <p className="text-sm text-destructive">{Array.isArray(state.errors.images) ? state.errors.images.join(', '): state.errors.images}</p>}
            </div>
            {galleryPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {galleryPreviews.map((src, i) => <Image key={i} src={src} alt="Preview" width={80} height={80} className="rounded-md object-cover w-20 h-20" />)}
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild ref={dialogCloseRef}><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <SubmitButton text="Add Project" pendingText="Adding..." />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditProjectForm({ project, onProjectUpdated }: { project: Project, onProjectUpdated: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const initialState: LoginState = { message: null };
  const [state, formAction] = useActionState(updateProject, initialState);
  
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(project.thumbnail_url);
  const [galleryImages, setGalleryImages] = useState(project.image_urls || []);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveGalleryImage = (url: string) => {
    setGalleryImages(prev => prev.filter(imgUrl => imgUrl !== url));
  };
  
  const handleNewGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewGalleryPreviews(previews);
    }
  };

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.message });
      onProjectUpdated();
      dialogCloseRef.current?.click();
    } else if (state?.message && !state.success) {
      toast({ variant: "destructive", title: "Update Failed", description: state.message });
    }
  }, [state, onProjectUpdated, toast]);

  const resetFormState = () => {
    setThumbnailPreview(project.thumbnail_url);
    setGalleryImages(project.image_urls || []);
    setNewGalleryPreviews([]);
    formRef.current?.reset();
  }

  return (
    <Dialog onOpenChange={(open) => { if(!open) resetFormState() }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update the details for "{project.title}".</DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="existing_gallery_images" value={galleryImages.join(',')} />

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor={`title-edit-${project.id}`}>Project Title</Label>
              <Input id={`title-edit-${project.id}`} name="title" defaultValue={project.title} required />
              {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`link-edit-${project.id}`}>Project Link (Optional)</Label>
              <Input id={`link-edit-${project.id}`} name="link" defaultValue={project.link || ''} />
               {state?.errors?.link && <p className="text-sm text-destructive">{state.errors.link[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`description-edit-${project.id}`}>Description (Optional)</Label>
              <Textarea id={`description-edit-${project.id}`} name="description" defaultValue={project.description || ''} />
              {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`new_thumbnail-${project.id}`}>Thumbnail Image</Label>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                    <Image src={thumbnailPreview} alt="Thumbnail" width={100} height={75} className="rounded-md object-cover border" />
                ): (
                     <div className="h-20 w-24 rounded-md bg-muted flex items-center justify-center text-muted-foreground"><FileImage /></div>
                )}
                <Input id={`new_thumbnail-${project.id}`} name="new_thumbnail" type="file" accept="image/*" className="file:text-foreground" onChange={handleThumbnailChange} />
              </div>
              {state?.errors?.new_thumbnail && <p className="text-sm text-destructive">{Array.isArray(state.errors.new_thumbnail) ? state.errors.new_thumbnail.join(', ') : state.errors.new_thumbnail}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Current Gallery Images</Label>
              {galleryImages.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {galleryImages.map((url) => (
                    <div key={url} className="relative w-20 h-20">
                      <Image src={url} alt="Existing" layout="fill" className="rounded-md object-cover" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => handleRemoveGalleryImage(url)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No gallery images.</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`new_gallery_images-${project.id}`}>Add New Gallery Images (Optional)</Label>
              <Input id={`new_gallery_images-${project.id}`} name="new_gallery_images" type="file" multiple accept="image/*" className="file:text-foreground" onChange={handleNewGalleryImagesChange} />
              {state?.errors?.new_gallery_images && <p className="text-sm text-destructive">{Array.isArray(state.errors.new_gallery_images) ? state.errors.new_gallery_images.join(', ') : state.errors.new_gallery_images}</p>}
            </div>
             {newGalleryPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {newGalleryPreviews.map((src, i) => <Image key={i} src={src} alt="New Preview" width={80} height={80} className="rounded-md object-cover w-20 h-20" />)}
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild ref={dialogCloseRef}><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <SubmitButton text="Save Changes" pendingText="Saving..." />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


function ProjectsList({ projects, onProjectDeleted, onProjectUpdated, isLoading }: { projects: Project[], onProjectDeleted: (id:string) => void, onProjectUpdated: () => void, isLoading: boolean }) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteProject(id);
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
                {project.thumbnail_url ? (
                  <Image 
                    src={project.thumbnail_url} 
                    alt={project.title} 
                    width={64} 
                    height={64}
                    className="rounded-md object-cover h-16 w-16"
                  />
                ) : <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground"><FileImage /></div>}
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
                <div className="flex justify-end items-center">
                  <EditProjectForm project={project} onProjectUpdated={onProjectUpdated} />
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
                          This action cannot be undone. This will permanently delete the project "{project.title}" and all its images.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
        <ProjectsList 
            projects={projects} 
            onProjectDeleted={handleProjectDeleted} 
            onProjectUpdated={fetchProjects}
            isLoading={isLoadingProjects}
        />
    </div>
  );
}
