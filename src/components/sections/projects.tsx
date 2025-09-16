
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
};

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const Wrapper = project.link ? Link : 'div';
  const props = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};
  
  // Base styles
  let baseStyles = "relative shrink-0 w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out";
  // Perspective styles based on index
  let perspectiveStyles = "";
  if (index === 0) perspectiveStyles = "md:rotate-y-15";
  if (index === 1) perspectiveStyles = "md:rotate-y-5";
  if (index === 3) perspectiveStyles = "md:rotate-y--5";
  if (index === 4) perspectiveStyles = "md:rotate-y--15";


  return (
    <div className="flex flex-col items-center gap-4 shrink-0">
        <Wrapper {...props} className={cn(baseStyles, perspectiveStyles, "group")}>
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
        </Wrapper>
        <div className="text-center">
            <p className="font-semibold text-lg">{project.title}</p>
        </div>
    </div>
  )
}

export async function Projects() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Our Work</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Check out some of the amazing projects we've delivered for our clients.
            </p>
          </div>
        </div>
      </div>

       {error && <p className="text-center text-destructive py-4">Could not load projects.</p>}
       
        {projects && projects.length > 0 ? (
            <div 
                className="relative flex items-center justify-center"
                style={{ perspective: '2000px' }}
            >
                <div className="flex items-center justify-center gap-8 md:-gap-16 lg:-gap-24 overflow-x-auto pb-8 scrollbar-hide">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>
            </div>
        ) : (
            !error && <p className="text-center text-muted-foreground py-12">No projects have been added yet.</p>
        )}
    </section>
  );
}

// Custom styles for 3D transforms - add to a global stylesheet or use a style tag if needed.
// We'll try with tailwind arbitrary values first.
// In tailwind.config.ts, under theme.extend, add:
// rotate: {
//   'y-15': 'rotateY(15deg)',
//   'y--15': 'rotateY(-15deg)',
//   'y-5': 'rotateY(5deg)',
//   'y--5': 'rotateY(-5deg)',
// }

// And add a utility for scrollbar-hide
// plugins: [
//   plugin(function({ addUtilities }) {
//     addUtilities({
//       '.scrollbar-hide': {
//         /* Firefox */
//         'scrollbar-width': 'none',
//         /* Safari and Chrome */
//         '&::-webkit-scrollbar': {
//           display: 'none'
//         }
//       }
//     })
//   })
// ],
