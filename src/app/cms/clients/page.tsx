
'use client'

import { useActionState, useEffect, useState, useTransition } from "react";
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
    const initialState: LoginState = { message: null, errors: {} };
    const [state, formAction] = useActionState(addClient, initialState);
    const [formKey, setFormKey] = useState(Date.now().toString());

    useEffect(() => {
      if (state?.message && !state.errors) {
        toast({
          title: "Success!",
          description: state.message,
        });
        setFormKey(Date.now().toString());
        onClientAdded();
      }
    }, [state?.message, state?.errors, toast, onClientAdded]);

    return (
         <Card>
            <CardHeader>
            <CardTitle>Add New Client</CardTitle>
            <CardDescription>
                Enter the name of the new client to add them to your list.
            </CardDescription>
            </CardHeader>
            <form action={formAction} key={formKey}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Innovate Inc."
                    required
                />
                {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                </div>
                 {state?.message && state.errors && (
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

function ClientList({ clients, onClientDeleted }: { clients: {id: string, name: string, created_at: string}[], onClientDeleted: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteClient(id);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        onClientDeleted();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  if (!clients || clients.length === 0) {
    return <p className="text-center text-muted-foreground">No clients found. Add one above to get started.</p>;
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
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    const clientsResult = await getClients();
    if (clientsResult.error) {
      setError("Failed to load clients.");
      toast({variant: "destructive", title: "Error", description: "Could not load clients."});
    } else {
      setClients(clientsResult.data || []);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-8">
      <AddClientForm onClientAdded={fetchClients} />
      
      <Card>
        <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>A list of all your clients.</CardDescription>
        </CardHeader>
        <CardContent>
           <ClientList clients={clients} onClientDeleted={fetchClients}/>
        </CardContent>
      </Card>
    </div>
  );
}
