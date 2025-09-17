
import { getTestimonials } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TestimonialsView from "./testimonials-view";

export type Testimonial = {
  id: string;
  name: string;
  title: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  created_at: string;
};

export default async function TestimonialsPage() {
  const testimonialsResult = await getTestimonials();

  if (testimonialsResult.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          {`Could not load required data: ${testimonialsResult.error.message}`}
        </AlertDescription>
      </Alert>
    );
  }

  return <TestimonialsView 
            initialTestimonials={(testimonialsResult.data as Testimonial[]) || []} 
         />;
}
