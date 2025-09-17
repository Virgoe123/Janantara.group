
import { Instagram, Mail, Phone } from "lucide-react";
import ContactItems from "./contact-items";

const iconMap = {
  whatsapp: <Phone className="h-6 w-6 text-primary" />,
  email: <Mail className="h-6 w-6 text-primary" />,
  instagram: <Instagram className="h-6 w-6 text-primary" />,
};

export type ContactKey = 'whatsapp' | 'email' | 'instagram';

export type ContactDetails = {
    whatsapp: string;
    email: string;
    instagram: string;
}

export const getLink = (key: ContactKey, value: string) => {
    if (!value) return '#';
    switch (key) {
        case 'whatsapp':
            return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
        case 'email':
            return `https://mail.google.com/mail/?view=cm&fs=1&to=${value}`;
        case 'instagram':
            return `https://instagram.com/${value.replace('@', '')}`;
        default:
            return '#';
    }
}

export const getLabel = (key: ContactKey, value: string) => {
    if (!value) return 'Not available';
     switch (key) {
        case 'whatsapp':
            return `WhatsApp`;
        case 'email':
            return value;
        case 'instagram':
            return `@${value.replace('@', '')}`;
        default:
            return value;
    }
}

export const getActionText = (key: ContactKey) => {
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


export async function Contact({ contactDetails }: { contactDetails: ContactDetails }) {
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
                    <ContactItems availableContacts={availableContacts} iconMap={iconMap} />
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
