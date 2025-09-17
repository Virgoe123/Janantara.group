
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Instagram, Mail, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const iconMap = {
  whatsapp: <Phone className="h-8 w-8" />,
  email: <Mail className="h-8 w-8" />,
  instagram: <Instagram className="h-8 w-8" />,
};

type ContactKey = 'whatsapp' | 'email' | 'instagram';

const getLink = (key: ContactKey, value: string) => {
    if (!value) return '#';
    switch (key) {
        case 'whatsapp':
            return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
        case 'email':
            return `mailto:${value}`;
        case 'instagram':
            return `https://instagram.com/${value.replace('@', '')}`;
        default:
            return '#';
    }
}

const getLabel = (key: ContactKey, value: string) => {
    if (!value) return 'Not available';
     switch (key) {
        case 'whatsapp':
            return `+${value}`;
        case 'email':
            return value;
        case 'instagram':
            return `@${value.replace('@', '')}`;
        default:
            return value;
    }
}

const getActionText = (key: ContactKey) => {
    switch (key) {
        case 'whatsapp':
            return 'Chat on WhatsApp';
        case 'email':
            return 'Send an Email';
        case 'instagram':
            return 'Follow on Instagram';
        default:
            return 'Learn More';
    }
}


export async function Contact() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: settings } = await supabase.from('contact_settings').select('key, value');

  const contactDetails = {
    whatsapp: settings?.find(s => s.key === 'whatsapp')?.value || '',
    email: settings?.find(s => s.key === 'email')?.value || '',
    instagram: settings?.find(s => s.key === 'instagram')?.value || '',
  }

  const availableContacts = Object.entries(contactDetails).filter(([_, value]) => value) as [ContactKey, string][];

  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Get in Touch</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Ready to start your project? Reach out to us through any of the channels below. We're excited to hear from you!
            </p>
        </div>

        {availableContacts.length > 0 ? (
             <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {availableContacts.map(([key, value]) => (
                    <Card key={key} className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                         <CardHeader className="flex flex-col items-start gap-4 p-6">
                            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                {iconMap[key]}
                            </div>
                            <div className="text-left">
                                <CardTitle className="text-xl capitalize">{key}</CardTitle>
                                <CardDescription>{getLabel(key, value)}</CardDescription>
                            </div>
                        </CardHeader>
                        <div className="flex-grow"></div>
                        <div className="p-6 pt-0">
                            <Button asChild className="w-full">
                                <Link href={getLink(key, value)} target="_blank" rel="noopener noreferrer">
                                    {getActionText(key)} <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="text-center py-8">
                <p className="text-muted-foreground">Contact information is not available at the moment.</p>
             </div>
        )}

      </div>
    </section>
  );
}
