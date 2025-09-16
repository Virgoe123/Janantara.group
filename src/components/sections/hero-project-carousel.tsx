
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  image_url: string | null;
  title: string;
};

export default function HeroProjectCarousel({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) {
    return null;
  }

  // Duplicate the projects to create a seamless loop
  const duplicatedProjects = [...projects, ...projects];

  return (
    <div className="hidden md:flex w-full max-w-lg items-center justify-center">
      <div
        className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
        <ul
          className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll">
          {duplicatedProjects.map((project, index) => (
            <li key={`${project.id}-${index}`} className="flex-shrink-0">
              <div className="w-40 h-24 relative transform transition-transform duration-500 hover:scale-105">
                {project.image_url && (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

