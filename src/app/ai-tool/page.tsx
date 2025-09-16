import ProjectDescriptionGenerator from "@/components/ai/project-description-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AiToolPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">AI Project Description Tool</CardTitle>
          <CardDescription className="max-w-2xl mx-auto">
            Input the details of your project below, and our AI will generate a compelling, client-facing description for your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectDescriptionGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
