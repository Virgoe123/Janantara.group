
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices } from "@/lib/actions";
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <LucideIcons.AlertCircle className={className} />;
  }
  return <LucideIcon className={className} />;
};

export async function Services() {
  const { data: services, error } = await getServices();

  if (error || !services || services.length === 0) {
    return (
      <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Our Services</h2>
          <p className="mt-4 max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed">
            We are currently defining our service offerings. Please check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Our Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We provide a wide range of digital services to help your business grow and succeed in the online world.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="text-center">
              <CardHeader className="items-center">
                <Icon name={service.icon as IconName} className="h-10 w-10 text-primary" />
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
