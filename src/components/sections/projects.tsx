
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
  image_urls: string[] | null;
  link: string | null;
};

const ProjectGallery = ({ images, title }: { images: string[], title: string }) => {
  return (
    <Dialog>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((url, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video relative">
                  <Image src={url} alt={`${title} image ${index + 1}`} fill className="object-contain rounded-md" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};


const ProjectCard = ({ project }: { project: Project }) => {
  const hasImages = project.image_urls && project.image_urls.length > 0;
  const coverImage = hasImages ? project.image_urls![0] : null;

  return (
    <Dialog>
        <Card className="overflow-hidden group h-full flex flex-col">
            <DialogTrigger asChild>
              <div className="relative block cursor-pointer">
                  <div className="aspect-[4/3] w-full relative">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
              </div>
            </DialogTrigger>
          <CardContent className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
              <p className="font-semibold text-lg">{project.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            </div>
            {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-4 flex items-center gap-1">
                    View Project <ArrowRight className="w-4 h-4" />
                </a>
            )}
          </CardContent>
        </Card>

        {hasImages && (
            <DialogContent className="max-w-4xl p-0 border-0">
                <Carousel className="w-full">
                <CarouselContent>
                    {project.image_urls!.map((url, index) => (
                    <CarouselItem key={index}>
                        <div className="aspect-video relative">
                        <Image src={url} alt={`${project.title} image ${index + 1}`} fill className="object-contain" />
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                {project.image_urls!.length > 1 && (
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
    <Card className="overflow-hidden">
        <div className="aspect-[4/3] w-full bg-muted">
            <Skeleton className="w-full h-full" />
        </div>
        <CardContent className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
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
              Check out some of the amazing projects we've delivered for our clients. Click on a project to see more.
            </p>
          </div>
        </div>

       {error && <p className="text-center text-destructive py-4">{error}</p>}
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
                <ProjectSkeleton key={index} />
            ))
            ) : projects && projects.length > 0 ? (
            projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))
            ) : (
                <div className="w-full text-center col-span-full py-12">
                    <p className="text-muted-foreground">No projects have been added yet.</p>
                </div>
            )}
        </div>
      </div>
    </section>
  );
}
