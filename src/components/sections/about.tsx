
import Image from "next/image";

export async function About() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto grid items-center justify-center gap-10 px-4 text-center md:px-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">About Janantara</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            We are a passionate team of developers and designers dedicated to building exceptional digital products. Our mission is to combine innovative technology with creative design to solve complex problems and deliver outstanding results for our clients.
          </p>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our core values are integrity, collaboration, and a relentless pursuit of quality. We believe in building strong partnerships and fostering a culture of continuous learning and improvement.
          </p>
        </div>
      </div>
    </section>
  );
}
