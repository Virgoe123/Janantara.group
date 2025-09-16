
'use client'

import { useEffect, useState, useTransition, useCallback } from "react";
import { useForm, useFormState } from "react-hook-form";
import { useFormStatus } from "react-dom";
import { addClient, getClients, deleteClient, LoginState } from "@/lib/actions";
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
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adding..." : "Add Client"}
        </Button>
    )
}

function AddClientForm({ onClientAdded }: { onClientAdded: () => void }) {
    const { toast } = useToast();
    const [formKey, setFormKey] = useState(Date.now().toString());
    
    const { control, reset, formState: { isSubmitSuccessful } } = useForm();
    const { isSubmitting, errors, result } = useFormState({ control });

    useEffect(() => {
        if (isSubmitSuccessful && result?.success) {
            if(result.message) {
                toast({
                  title: "Success!",
                  description: result.message,
                });
            }
            reset(); 
            onClientAdded();
        }
    }, [isSubmitSuccessful, result, onClientAdded, toast, reset]);

    return (
         <Card>
            <CardHeader>
            <CardTitle>Add New Client</CardTitle>
            <CardDescription>
                Enter the name of the new client to add them to your list.
            </CardDescription>
            </CardHeader>
            <form action={addClient}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Client Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Innovate Inc."
                            required
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
                        {result?.errors?.name && <p className="text-sm text-destructive">{result.errors.name[0]}</p>}
                    </div>
                    {result?.message && !result.success && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Action Failed</AlertTitle>
                            <AlertDescription>
                            {result.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Client"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

function ClientList({ clients, onClientDeleted, isLoading }: { clients: {id: string, name: string, created_at: string}[], onClientDeleted: (id: string) => void, isLoading: boolean }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteClient(id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      onClientDeleted(id);
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
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
  }

  if (clients.length === 0) {
    return <p className="text-center text-muted-foreground pt-4">No clients found. Add one above to get started.</p>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className={isDeleting === client.id ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}</TableCell>
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
                        This action cannot be undone. This will permanently delete the client "{client.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(client.id)}
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

export default function ClientsPage() {
  const [clients, setClients] = useState<{id: string, name: string, created_at: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    const clientsResult = await getClients();
    if (clientsResult.error) {
      toast({variant: "destructive", title: "Error", description: "Could not load clients."});
    } else {
      setClients(clientsResult.data || []);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);


  const handleClientAdded = () => {
    // No need to setIsLoading(true) here as revalidation will trigger a re-render
    // But we still need to call it to get the latest data
    fetchClients();
  }

  const handleClientDeleted = (deletedId: string) => {
    setClients(prevClients => prevClients.filter(c => c.id !== deletedId));
  }


  return (
    <div className="grid gap-8">
      <AddClientForm onClientAdded={handleClientAdded} />
      
      <Card>
        <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>A list of all your clients.</CardDescription>
        </CardHeader>
        <CardContent>
           <ClientList clients={clients} onClientDeleted={handleClientDeleted} isLoading={isLoading}/>
        </CardContent>
      </Card>
    </div>
  );
}
