
'use client'

import React, { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateContactSettings, LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type ContactSettings } from "./page";
import { Instagram, Mail, Phone } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? "Saving..." : "Save Settings"}
    </Button>
  );
}

export default function ContactSettingsForm({ initialSettings }: { initialSettings: ContactSettings }) {
  const { toast } = useToast();
  const initialState: LoginState = { message: null };
  const [state, formAction] = useActionState(updateContactSettings, initialState);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success!", description: state.message });
    } else if (state?.message && !state.success) {
      toast({ variant: "destructive", title: "Update Failed", description: state.message });
    }
  }, [state, toast]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Contact Settings</h1>
          <p className="text-muted-foreground">Update the contact information displayed on your website.</p>
      </div>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              Enter the details that clients can use to reach you. For WhatsApp, use the international format without '+', e.g., 6281234567890.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="whatsapp" name="whatsapp" defaultValue={initialSettings.whatsapp} placeholder="e.g., 6281234567890" className="pl-10" />
              </div>
              {state?.errors?.whatsapp && <p className="text-sm text-destructive">{state.errors.whatsapp[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" name="email" type="email" defaultValue={initialSettings.email} placeholder="e.g., contact@yourcompany.com" className="pl-10" />
              </div>
              {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Username</Label>
               <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="instagram" name="instagram" defaultValue={initialSettings.instagram} placeholder="e.g., yourcompany" className="pl-10" />
              </div>
              {state?.errors?.instagram && <p className="text-sm text-destructive">{state.errors.instagram[0]}</p>}
            </div>
            
            <div className="flex justify-end">
                 <SubmitButton />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
