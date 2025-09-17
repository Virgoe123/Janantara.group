
import { getContactSettings } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ContactSettingsForm from "./contact-settings-form";

export type ContactSettings = {
  whatsapp: string;
  email: string;
  instagram: string;
}

export default async function ContactSettingsPage() {
  const result = await getContactSettings();

  if (result.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          {`Could not load contact settings: ${result.error.message}`}
        </AlertDescription>
      </Alert>
    );
  }

  const settings: ContactSettings = result.data.reduce((acc, { key, value }) => {
    acc[key as keyof ContactSettings] = value || '';
    return acc;
  }, {} as ContactSettings);
  
  return <ContactSettingsForm initialSettings={settings} />;
}
