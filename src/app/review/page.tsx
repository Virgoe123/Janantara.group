
import ReviewForm from "@/components/review-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReviewPage() {
  return (
    <div className="bg-secondary min-h-screen py-12 md:py-24 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl px-4 md:px-6">
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-primary">Share Your Experience</CardTitle>
            <CardDescription className="max-w-md mx-auto text-lg">
              We value your feedback! Please take a moment to tell us about your experience with our services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
