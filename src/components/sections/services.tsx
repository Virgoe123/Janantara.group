
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const services = [
  {
    id: 1,
    title: "Web Development",
    description: "We build responsive, high-performance websites and web applications tailored to your business needs.",
    icon: "Codepen"
  },
  {
    id: 2,
    title: "Mobile App Development",
    description: "From iOS to Android, we create seamless mobile experiences that engage your users and drive growth.",
    icon: "Smartphone"
  },
  {
    id: 3,
    title: "UI/UX Design",
    description: "Our design team crafts intuitive and beautiful user interfaces that provide an exceptional user experience.",
    icon: "PenTool"
  },
    {
    id: 4,
    title: "Digital Marketing",
    description: "We help you reach your target audience and grow your brand through strategic digital marketing campaigns.",
    icon: "Target"
  },
  {
    id: 5,
    title: "Cloud Solutions",
    description: "Leverage the power of the cloud with our scalable and secure infrastructure solutions.",
    icon: "Cloud"
  },
  {
    id: 6,
    title: "AI Integration",
    description: "Integrate cutting-edge AI technology into your products to unlock new capabilities and efficiencies.",
    icon: "BrainCircuit"
  },
];


const Icon = ({ name, className }: { name: IconName; className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <LucideIcons.AlertCircle className={className} />;
  }
  return <LucideIcon className={className} />;
};

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
          {services.map((service: any) => (
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
