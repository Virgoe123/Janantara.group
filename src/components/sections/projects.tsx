import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const projects = [
  {
    id: "project-1",
    title: "E-commerce Platform",
    description: "A scalable e-commerce solution with a custom CMS and payment gateway integration.",
  },
  {
    id: "project-2",
    title: "Corporate Website Redesign",
    description: "A modern, responsive redesign for a major financial services firm, improving user engagement by 40%.",
  },
  {
    id: "project-3",
    title: "Mobile Banking App",
    description: "A secure and user-friendly mobile banking app for iOS and Android, featuring biometric authentication.",
  },
  {
    id: "project-4",
    title: "Data Visualization Dashboard",
    description: "An interactive dashboard for analyzing complex datasets, built with D3.js and React.",
  },
];

export function Projects() {
  const projectImages = PlaceHolderImages.filter(img => img.id.startsWith("project-"));

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Our Work</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Check out some of the amazing projects we've delivered for our clients.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2">
          {projects.map((project, index) => {
            const image = projectImages.find(img => img.id === project.id) ?? projectImages[index % projectImages.length];
            return (
              <Card key={project.id} className="overflow-hidden">
                <div className="overflow-hidden rounded-t-lg">
                  <Image
                    src={image.imageUrl}
                    alt={`Image for ${project.title}`}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                </div>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{project.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
