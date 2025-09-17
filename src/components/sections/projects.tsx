
'use client';

import Image from "next/image";
import { ArrowRight, FileImage } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Project = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  image_urls: string[] | null;
};

const ProjectCard = ({ project }: { project: Project }) => {
  const hasGallery = project.image_urls && project.image_urls.length > 0;
  const coverImage = project.thumbnail_url;

  return (
    <Dialog>
      <Card className="overflow-hidden group h-full flex flex-col md:flex-row">
        <DialogTrigger asChild disabled={!hasGallery && !coverImage} className="md:w-2/5">
          <div className="aspect-[4/3] md:aspect-auto w-full relative" role={hasGallery || coverImage ? 'button' : 'img'}>
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`Cover image for ${project.title}`}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <FileImage className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-none"></div>
          </div>
        </DialogTrigger>
        <div className="flex flex-col flex-grow md:w-3/5">
          <CardContent className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
              <p className="font-semibold text-lg">{project.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View Project <ArrowRight className="w-4 h-4" />
                  </a>
              )}
               {(hasGallery || coverImage) && (
                  <DialogTrigger asChild>
                    <button className="text-sm text-primary hover:underline font-semibold">View Gallery</button>
                  </DialogTrigger>
               )}
            </div>
          </CardContent>
        </div>
      </Card>

      {(hasGallery || coverImage) && (
          <DialogContent className="max-w-4xl p-2 sm:p-4 border-0">
            <DialogHeader>
                <DialogTitle>{project.title}</DialogTitle>
            </DialogHeader>
              <Carousel className="w-full">
              <CarouselContent>
                  {coverImage && !hasGallery && (
                    <CarouselItem>
                         <div className="aspect-video relative">
                            <Image src={coverImage} alt={`${project.title} image 1`} fill className="object-contain" />
                         </div>
                    </CarouselItem>
                  )}
                  {hasGallery && project.image_urls!.map((url, index) => (
                  <CarouselItem key={index}>
                      <div className="aspect-video relative">
                      <Image src={url} alt={`${project.title} image ${index + 1}`} fill className="object-contain" />
                      </div>
                  </CarouselItem>
                  ))}
              </CarouselContent>
              {hasGallery && project.image_urls!.length > 1 && (
                  <>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                  </>
              )}
              </Carousel>
          </DialogContent>
      )}
    </Dialog>
  )
}

const ProjectSkeleton = () => (
    <Card className="overflow-hidden flex flex-col md:flex-row h-[200px] md:h-[250px]">
        <div className="md:w-2/5 bg-muted h-full">
            <Skeleton className="w-full h-full" />
        </div>
        <div className="md:w-3/5 p-4 flex flex-col">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="mt-auto">
              <Skeleton className="h-5 w-24" />
            </div>
        </div>
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
              Check out some of the amazing projects we've delivered for our clients. Click on a project to see more.
            </p>
          </div>
        </div>

       {error && <p className="text-center text-destructive py-4">{error}</p>}
       
       {isLoading ? (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 2 }).map((_, index) => (
                <ProjectSkeleton key={index} />
            ))}
         </div>
       ) : projects && projects.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: projects.length > 2,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {projects.map((project) => (
                <CarouselItem key={project.id} className="pl-4 md:basis-1/2">
                  <div className="h-[250px]">
                     <ProjectCard project={project} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
       ) : (
          <div className="w-full text-center col-span-full py-12">
              <p className="text-muted-foreground">No projects have been added yet.</p>
          </div>
       )}
      </div>
    </section>
  );
}
