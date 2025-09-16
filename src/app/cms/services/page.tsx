
'use client'

import { useEffect, useState, useCallback, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addService, getServices, deleteService, LoginState } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


type IconName = keyof typeof LucideIcons;

type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle className={className} />;
  }
  return <LucideIcon className={className} />;
};


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adding Service..." : "Add Service"}
        </Button>
    )
}

function AddServiceForm({ onServiceAdded }: { onServiceAdded: () => void }) {
    const { toast } = useToast();
    const initialState: LoginState = { message: null, errors: {}, success: false };
    const [state, formAction] = useActionState(addService, initialState);
    const [formKey, setFormKey] = useState(Date.now().toString());

    useEffect(() => {
      if (state.success) {
        if(state.message) {
            toast({
              title: "Success!",
              description: state.message,
            });
        }
        setFormKey(Date.now().toString());
        onServiceAdded();
      }
    }, [state, onServiceAdded, toast]);

    return (
         <Card>
            <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>
                Fill out the details for the new service. The icon name must match a name from 'lucide-react'.
            </CardDescription>
            </CardHeader>
            <form action={formAction} key={formKey}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Web Development" required />
                    {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Describe the service..." required />
                    {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input id="icon" name="icon" placeholder="e.g., Codepen, Smartphone, PenTool" required />
                     {state?.errors?.icon && <p className="text-sm text-destructive">{state.errors.icon[0]}</p>}
                </div>
                 {state?.message && !state.success && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Action Failed</AlertTitle>
                        <AlertDescription>
                        {state.message}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
            </form>
        </Card>
    )
}

function ServiceList({ services, onServiceDeleted, isLoading }: { services: Service[], onServiceDeleted: (id: string) => void, isLoading: boolean }) {
  const [isDeleting, setIsDeleting] = useState<string|null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteService(id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      onServiceDeleted(id);
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
                    <TableHead className="w-[50px]">Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
  }

  if (services.length === 0) {
    return <p className="text-center text-muted-foreground pt-4">No services found. Add one above to get started.</p>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Icon</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id} className={isDeleting === service.id ? 'opacity-50' : ''}>
              <TableCell>
                  <Icon name={service.icon as IconName} className="h-5 w-5" />
              </TableCell>
              <TableCell className="font-medium">{service.title}</TableCell>
              <TableCell>{service.description}</TableCell>
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
                        This action cannot be undone. This will permanently delete the service "{service.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(service.id)}
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
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    const servicesResult = await getServices();
    if (servicesResult.error) {
      toast({variant: "destructive", title: "Error", description: "Could not load services."});
    } else {
      setServices(servicesResult.data || []);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  const handleServiceAdded = () => {
      fetchServices();
  }
  
  const handleServiceDeleted = (deletedId: string) => {
      setServices(prev => prev.filter(s => s.id !== deletedId));
  }

  return (
    <div className="grid gap-8">
      <AddServiceForm onServiceAdded={handleServiceAdded} />
      
      <Card>
        <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>A list of all your offered services.</CardDescription>
        </CardHeader>
        <CardContent>
           <ServiceList services={services} onServiceDeleted={handleServiceDeleted} isLoading={isLoading}/>
        </CardContent>
      </Card>
    </div>
  );
}

    