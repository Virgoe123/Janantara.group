
'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
     <Card className="overflow-hidden group">
        <CardContent className="p-0">
          <Wrapper {...props} className="relative block">
              <div className="aspect-[4/3] w-full relative">
                {project.image_url ? (
                <Image
                    src={project.image_url}
                    alt={`Image for ${project.title}`}
                    fill
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No Image</p>
                </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                {project.link && (
                    <div className="absolute bottom-4 right-4 z-10 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                        <ArrowRight className="h-5 w-5 text-foreground" />
                    </div>
                )}
              </div>
          </Wrapper>
          <div className="p-4">
            <p className="font-semibold text-lg">{project.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
        </CardContent>
     </Card>
  )
}

const ProjectSkeleton = () => (
    <Card className="overflow-hidden">
        <CardContent className="p-0">
            <div className="aspect-[4/3] w-full bg-muted">
                <Skeleton className="w-full h-full" />
            </div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardContent>
    </Card>
)

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(9);
            
            if (error) {
                console.error("Error fetching projects:", error);
                setError("Could not load projects.");
            } else {
                setProjects(data as Project[]);
            }
            setIsLoading(false);
        }
        fetchProjects();
    }, []);

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Our Work</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Check out some of the amazing projects we've delivered for our clients.
            </p>
          </div>
        </div>

       {error && <p className="text-center text-destructive py-4">{error}</p>}
       
       <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
             {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                   <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <ProjectSkeleton />
                   </CarouselItem>
                ))
             ) : projects && projects.length > 0 ? (
                projects.map((project) => (
                    <CarouselItem key={project.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <ProjectCard project={project} />
                    </CarouselItem>
                ))
            ) : (
                 <div className="w-full text-center col-span-full py-12">
                    <p className="text-muted-foreground">No projects have been added yet.</p>
                 </div>
            )}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
