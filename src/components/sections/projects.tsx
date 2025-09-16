
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
};

const ProjectCard = ({ project }: { project: Project }) => {
  const Wrapper = project.link ? Link : 'div';
  const props = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper {...props}>
       <Card className="overflow-hidden h-full group relative flex flex-col justify-end text-white min-h-[350px]">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={`Image for ${project.title}`}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-muted z-0 flex items-center justify-center">
            <p className="text-muted-foreground">No Image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        <div className="p-6 z-20">
          <h3 className="text-2xl font-bold">{project.title}</h3>
          {project.description && <p className="mt-2 text-white/80 line-clamp-2">{project.description}</p>}
           {project.link && (
            <div className="mt-4 flex items-center text-sm font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              View Project <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </div>
      </Card>
    </Wrapper>
  )
}

export async function Projects() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Our Work</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Check out some of the amazing projects we've delivered for our clients.
            </p>
          </div>
        </div>
         {error && <p className="text-center text-destructive py-4">Could not load projects.</p>}
        {projects && projects.length > 0 ? (
            <div className="mx-auto grid max-w-5xl items-stretch gap-6 py-12 sm:grid-cols-2 md:gap-8 lg:max-w-none lg:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        ) : (
            !error && <p className="text-center text-muted-foreground py-12">No projects have been added yet.</p>
        )}
      </div>
    </section>
  );
}
