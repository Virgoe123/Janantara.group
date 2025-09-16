
'use client'

import { useEffect, useState, useCallback, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addTeamMember, getTeamMembers, deleteTeamMember, LoginState } from "@/lib/actions";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type TeamMember = { 
  id: string; 
  name: string; 
  role: string;
  image_url: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding Member..." : "Add Member"}
    </Button>
  );
}

function AddTeamMemberForm({ onMemberAdded }: { onMemberAdded: () => void }) {
  const { toast } = useToast();
  const initialState: LoginState = { message: null, errors: {}, success: false };
  const [state, formAction] = useActionState(addTeamMember, initialState);
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
        onMemberAdded();
    }
  }, [state, onMemberAdded, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Team Member</CardTitle>
        <CardDescription>
          Fill out the details to add a new member to your team.
        </CardDescription>
      </CardHeader>
      <form action={formAction} key={formKey}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" placeholder="e.g., Lead Developer" required />
            {state?.errors?.role && <p className="text-sm text-destructive">{state.errors.role[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Photo</Label>
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

function TeamList({ members, onMemberDeleted, isLoading }: { members: TeamMember[], onMemberDeleted: (id: string) => void, isLoading: boolean }) {
   const [isDeleting, setIsDeleting] = useState<string|null>(null);
   const { toast } = useToast();
 
   const handleDelete = async (id: string, imageUrl: string | null) => {
     setIsDeleting(id);
     const result = await deleteTeamMember(id, imageUrl || '');
     if (result.success) {
       toast({ title: "Success", description: result.message });
       onMemberDeleted(id);
     } else {
       toast({ variant: "destructive", title: "Error", description: result.message });
     }
     setIsDeleting(null);
   };

   if(isLoading) {
     return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
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

   if (members.length === 0) {
    return <p className="text-center text-muted-foreground pt-4">No team members found. Add one above to get started.</p>;
  }

  return (
     <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className={isDeleting === member.id ? 'opacity-50' : ''}>
              <TableCell>
                  <Avatar>
                    <AvatarImage src={member.image_url || undefined} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
              </TableCell>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.role}</TableCell>
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
                        This action cannot be undone. This will permanently delete the team member "{member.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(member.id, member.image_url)}
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

export default function TeamView({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    const memberResult = await getTeamMembers();
    if(memberResult.error) {
      toast({variant: "destructive", title: "Error", description: "Could not refresh team members."})
    } else {
      setMembers(memberResult.data || []);
    }
    setIsLoading(false);
  }, [toast]);
  
  const handleMemberDeleted = (deletedId: string) => {
    setMembers(prev => prev.filter(m => m.id !== deletedId));
  }

  return (
    <div className="grid gap-8">
      <AddTeamMemberForm onMemberAdded={fetchMembers}/>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>A list of all team members.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamList members={members} onMemberDeleted={handleMemberDeleted} isLoading={isLoading}/>
        </CardContent>
      </Card>
    </div>
  );
}

    