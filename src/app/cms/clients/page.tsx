
'use client'

import { useEffect, useState, useCallback, useActionState, useRef } from "react";
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
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SubmitButton({onClose}: {onClose: () => void}) {
    const { pending } = useFormStatus();
    
    useEffect(() => {
        if (!pending) {
            // onClose(); This closes the dialog immediately, we want to wait for success
        }
    }, [pending]);


    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adding Client..." : "Add Client"}
        </Button>
    )
}

function AddClientForm({ onClientAdded }: { onClientAdded: () => void }) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const dialogCloseRef = useRef<HTMLButtonElement>(null);
    const initialState: LoginState = { message: null };
    const [state, formAction] = useActionState(addClient, initialState);

    useEffect(() => {
        if (state?.success) {
            toast({
              title: "Success!",
              description: state.message,
            });
            formRef.current?.reset();
            onClientAdded();
            dialogCloseRef.current?.click(); // Close dialog on success
        } else if (state?.message && !state.success) {
            toast({
              variant: "destructive",
              title: "Action Failed",
              description: state.message,
            });
        }
    }, [state, onClientAdded, toast]);

    return (
        <Dialog>
             <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        Enter the name of the new client to add them to your list.
                    </DialogDescription>
                 </DialogHeader>
                 <form action={formAction} ref={formRef} className="space-y-4 py-4">
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
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                         </DialogClose>
                        <SubmitButton onClose={() => dialogCloseRef.current?.click()} />
                    </DialogFooter>
                 </form>
                 <DialogClose ref={dialogCloseRef} className="hidden" />
            </DialogContent>
        </Dialog>
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

  const ListContent = () => {
    if (isLoading) {
        return (
            <TableBody>
                {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    if (clients.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No clients found. Add one to get started.
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
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
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <ListContent />
      </Table>
    </Card>
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
    fetchClients();
  }

  const handleClientDeleted = (deletedId: string) => {
    setClients(prevClients => prevClients.filter(c => c.id !== deletedId));
  }


  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Clients</h1>
                <p className="text-muted-foreground">Manage your client list.</p>
            </div>
            <AddClientForm onClientAdded={handleClientAdded} />
        </div>
        <ClientList clients={clients} onClientDeleted={handleClientDeleted} isLoading={isLoading}/>
    </div>
  );
}
