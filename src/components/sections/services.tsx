import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Codepen, Smartphone, PenTool } from "lucide-react";

const services = [
  {
    icon: <Codepen className="h-10 w-10 text-primary" />,
    title: "Web Development",
    description: "Building responsive, high-performance websites and web applications tailored to your business needs.",
  },
  {
    icon: <Smartphone className="h-10 w-10 text-primary" />,
    title: "Mobile Apps",
    description: "Creating intuitive and engaging mobile experiences for iOS and Android platforms.",
  },
  {
    icon: <PenTool className="h-10 w-10 text-primary" />,
    title: "UI/UX Design",
    description: "Designing beautiful, user-centric interfaces that are both functional and delightful to use.",
  },
];

export function Services() {
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
            <Card key={service.title} className="text-center">
              <CardHeader className="items-center">
                {service.icon}
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
