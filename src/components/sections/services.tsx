
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type IconName = keyof typeof LucideIcons;

type Service = {
    id: number;
    title: string;
    description: string;
    icon: string;
};

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle className={className} />;
  }
  return <LucideIcon className={className} />;
};

export async function Services() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: services, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });

  return (
    <section id="services" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Our Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We provide a wide range of digital services to help your business grow and succeed in the online world.
            </p>
          </div>
        </div>
        {error && <p className="text-center text-destructive py-4">Could not load services.</p>}
        {services && services.length > 0 ? (
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
            {services.map((service: Service) => (
                <Card key={service.id} className="text-left h-full flex flex-col">
                  <CardHeader>
                      <Icon name={service.icon as IconName} className="h-8 w-8 text-foreground mb-4" />
                      <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
            ))}
            </div>
        ) : (
            !error && <p className="text-center text-muted-foreground py-12">No services have been added yet.</p>
        )}
      </div>
    </section>
  );
}
