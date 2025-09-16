
'use client'

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { addClient, getClients, LoginState } from "@/lib/actions";
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
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adding..." : "Add Client"}
        </Button>
    )
}

function AddClientForm() {
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
        // By changing the key, we force React to re-mount the form, thus clearing it.
        setFormKey(Date.now().toString());
      }
    }, [state, toast]);

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

async function ClientList() {
  // This component will re-render when the path is revalidated
  const clientsResult = await getClients();

  if (clientsResult.error) {
    return <p className="text-destructive">Error loading clients: {clientsResult.error.message}</p>
  }
  
  const clients = clientsResult.data;

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ClientsPage() {
  const [key, setKey] = useState(Date.now());

  // This is a bit of a hack to force the ClientList to re-fetch on state change from the form
  // A more robust solution might involve a global state manager or context
  const revalidateList = () => {
    setKey(Date.now());
  };

  return (
    <div className="grid gap-8">
      <AddClientForm />
      
      <Card>
        <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>A list of all your clients.</CardDescription>
        </CardHeader>
        <CardContent>
           <ClientList key={key} />
        </CardContent>
      </Card>
    </div>
  );
}
