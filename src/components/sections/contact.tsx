
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Instagram, Mail, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconMap = {
  whatsapp: <Phone className="h-6 w-6 text-primary" />,
  email: <Mail className="h-6 w-6 text-primary" />,
  instagram: <Instagram className="h-6 w-6 text-primary" />,
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
            return 'Chat Now';
        case 'email':
            return 'Send Email';
        case 'instagram':
            return 'Follow';
        default:
            return 'Contact Us';
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
             <div className="mx-auto max-w-3xl rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="divide-y divide-border">
                    {availableContacts.map(([key, value], index) => (
                        <Link
                            key={key}
                            href={getLink(key, value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "group flex items-center justify-between p-6 transition-colors hover:bg-muted/50",
                                index === 0 && "rounded-t-xl",
                                index === availableContacts.length - 1 && "rounded-b-xl"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {iconMap[key]}
                                <div>
                                    <p className="font-semibold text-lg capitalize">{key}</p>
                                    <p className="text-sm text-muted-foreground">{getLabel(key, value)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <span className="text-sm font-medium">{getActionText(key)}</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </Link>
                    ))}
                </div>
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
