
'use client'

import React, { useActionState, useRef, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { getTestimonials, deleteTestimonial, addTestimonial, updateTestimonial, LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { Star, Trash2, PlusCircle, User, Edit, EyeOff, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export type Testimonial = {
  id: string;
  name: string;
  title: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  is_published: boolean;
  created_at: string;
};


function SubmitButton({ pendingText, text }: { pendingText: string, text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : text}
    </Button>
  );
}

function AddTestimonialForm({ onTestimonialAdded }: { onTestimonialAdded: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const initialState: LoginState = { message: null };
  const [state, formAction] = useActionState(addTestimonial, initialState);
  const [rating, setRating] = useState(0);


  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add Testimonial"}
      </Button>
    );
  }

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success!",
        description: state.message,
      });
      formRef.current?.reset();
      setRating(0);
      onTestimonialAdded();
      dialogCloseRef.current?.click();
    } else if (state?.message && !state.success) {
        toast({
            variant: "destructive",
            title: "Action Failed",
            description: state.message,
        });
    }
  }, [state, onTestimonialAdded, toast]);

  return (
    <Dialog>
      <DialogTrigger asChild>
          <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Testimonial
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Testimonial</DialogTitle>
          <DialogDescription>
            Fill out the details to add a new testimonial. It will be published immediately.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <input type="hidden" name="rating" value={rating} />
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Client Name</Label>
                    <Input id="name" name="name" placeholder="e.g., Sarah Johnson" required />
                    {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Client Title / Company</Label>
                    <Input id="title" name="title" placeholder="e.g., CEO, Innovate Inc." />
                    {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote">Quote</Label>
              <Textarea id="quote" name="quote" placeholder="The final product exceeded all our expectations..." required />
              {state?.errors?.quote && <p className="text-sm text-destructive">{state.errors.quote[0]}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                     <Label>Rating</Label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            onClick={() => setRating(star)}
                            className={rating >= star ? "h-6 w-6 cursor-pointer text-yellow-400 fill-yellow-400" : "h-6 w-6 cursor-pointer text-muted-foreground/50"}
                        />
                        ))}
                    </div>
                    {state?.errors?.rating && <p className="text-sm text-destructive">{state.errors.rating[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar Image (Optional)</Label>
                    <Input id="avatar" name="avatar" type="file" accept="image/*" className="file:text-foreground"/>
                    {state?.errors?.avatar && <p className="text-sm text-destructive">{state.errors.avatar[0]}</p>}
                </div>
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

function EditTestimonialForm({ testimonial, onTestimonialUpdated }: { testimonial: Testimonial, onTestimonialUpdated: () => void }) {
  const { toast } = useToast();
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const initialState: LoginState = { message: null };
  const [state, formAction] = useActionState(updateTestimonial, initialState);

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success!",
        description: state.message,
      });
      onTestimonialUpdated();
      dialogCloseRef.current?.click();
    } else if (state?.message && !state.success) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: state.message,
        });
    }
  }, [state, onTestimonialUpdated, toast]);

  return (
    <Dialog>
      <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Testimonial</DialogTitle>
          <DialogDescription>
            Update the testimonial details.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={testimonial.id} />
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name-edit">Client Name</Label>
                    <Input id="name-edit" name="name" defaultValue={testimonial.name} required />
                    {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title-edit">Client Title / Company</Label>
                    <Input id="title-edit" name="title" defaultValue={testimonial.title} required />
                    {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-edit">Quote</Label>
              <Textarea id="quote-edit" name="quote" defaultValue={testimonial.quote} required />
              {state?.errors?.quote && <p className="text-sm text-destructive">{state.errors.quote[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="rating-edit">Rating (1-5)</Label>
                <Input id="rating-edit" name="rating" type="number" min="1" max="5" defaultValue={testimonial.rating} required />
                {state?.errors?.rating && <p className="text-sm text-destructive">{state.errors.rating[0]}</p>}
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild ref={dialogCloseRef}>
                <Button type="button" variant="secondary">
                    Cancel
                </Button>
              </DialogClose>
            <SubmitButton pendingText="Saving..." text="Save Changes" />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TestimonialsList({ testimonials, onTestimonialDeleted, onTestimonialUpdated, isLoading }: { testimonials: Testimonial[], onTestimonialDeleted: (id:string) => void, onTestimonialUpdated: () => void, isLoading: boolean }) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string, avatarUrl: string | null) => {
    setIsDeleting(id);
    const result = await deleteTestimonial(id, avatarUrl || '');
    if (result.success) {
      toast({ title: "Success", description: result.message });
      onTestimonialDeleted(id);
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
                        <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 inline-block" /></TableCell>
                   </TableRow>
                ))}
            </TableBody>
           )
       }

      if (testimonials.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No testimonials found. Add one to get started.
                    </TableCell>
                </TableRow>
            </TableBody>
        );
      }

      return (
         <TableBody>
          {testimonials.map((testimonial) => (
            <TableRow key={testimonial.id} className={isDeleting === testimonial.id ? 'opacity-50' : ''}>
              <TableCell>
                <Avatar>
                    <AvatarImage src={testimonial.avatar_url || undefined} alt={testimonial.name} />
                    <AvatarFallback>
                        <User />
                    </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{testimonial.name}</TableCell>
              <TableCell>{testimonial.title}</TableCell>
              <TableCell className="max-w-xs truncate">{testimonial.quote}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{testimonial.rating}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                    <EditTestimonialForm testimonial={testimonial} onTestimonialUpdated={onTestimonialUpdated} />
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
                            This action cannot be undone. This will permanently delete the testimonial from "{testimonial.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(testimonial.id, testimonial.avatar_url)}
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
     <Card className="shadow-md w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Quote</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <ListContent />
      </Table>
    </Card>
  )
}

export default function TestimonialsView({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(initialTestimonials);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const fetchTestimonials = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getTestimonials();

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: "Could not refresh testimonials." });
    } else {
      setTestimonials(result.data as any || []);
    }
    setIsLoading(false);
  }, [toast]);
  
  const handleTestimonialDeleted = (deletedId: string) => {
      setTestimonials(prev => prev.filter(p => p.id !== deletedId));
  }
  
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold font-headline tracking-tight">Testimonials</h1>
                <p className="text-muted-foreground">Manage client testimonials. All testimonials are published automatically.</p>
            </div>
            <AddTestimonialForm onTestimonialAdded={fetchTestimonials}/>
        </div>
        <TestimonialsList 
            testimonials={testimonials} 
            onTestimonialDeleted={handleTestimonialDeleted} 
            onTestimonialUpdated={fetchTestimonials}
            isLoading={isLoading}
        />
    </div>
  );
}
