
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProjectCard = ({ project }: { project: any }) => {
  const Wrapper = project.link ? Link : 'div';
  const props = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper {...props}>
      <Card className="overflow-hidden h-full group">
        <div className="overflow-hidden rounded-t-lg">
          <Image
            src={project.image_url}
            alt={`Image for ${project.title}`}
            width={600}
            height={400}
            className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{project.description}</p>
        </CardContent>
      </Card>
    </Wrapper>
  )
}

export async function Projects() {
  // Supabase is removed, returning empty data
  const { data: projects, error } = { data: [], error: null };

  if (error || !projects || projects.length === 0) {
    return (
      <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Our Work</h2>
          <p className="mt-4 max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed">
            We are currently updating our portfolio. Please check back soon!
          </p>
        </div>
      </section>
    )
  }

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
        <div className="mx-auto grid max-w-5xl items-stretch gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
