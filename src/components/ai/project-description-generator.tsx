"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateProjectDescription, GenerateProjectDescriptionInput } from "@/ai/flows/generate-project-description";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles } from "lucide-react";

const formSchema = z.object({
  projectName: z.string().min(2, "Project name is required."),
  clientName: z.string().min(2, "Client name is required."),
  projectType: z.string().min(2, "Project type is required."),
  keyTechnologies: z.string().min(2, "Please list key technologies."),
  projectGoals: z.string().min(10, "Project goals must be at least 10 characters."),
  projectResults: z.string().min(10, "Project results must be at least 10 characters."),
});

export default function ProjectDescriptionGenerator() {
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateProjectDescriptionInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      projectType: "",
      keyTechnologies: "",
      projectGoals: "",
      projectResults: "",
    },
  });

  const onSubmit = async (values: GenerateProjectDescriptionInput) => {
    setIsLoading(true);
    setGeneratedDescription(null);
    try {
      const result = await generateProjectDescription(values);
      setGeneratedDescription(result.projectDescription);
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating the project description. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedDescription) {
      navigator.clipboard.writeText(generatedDescription);
      toast({
        title: "Copied to clipboard!",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="projectName" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl><Input placeholder="e.g., E-commerce Platform" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="clientName" render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl><Input placeholder="e.g., Innovate Inc." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="projectType" render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type</FormLabel>
              <FormControl><Input placeholder="e.g., Web Application" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="keyTechnologies" render={({ field }) => (
            <FormItem>
              <FormLabel>Key Technologies</FormLabel>
              <FormControl><Input placeholder="e.g., React, Next.js, Tailwind CSS" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="projectGoals" render={({ field }) => (
            <FormItem>
              <FormLabel>Project Goals</FormLabel>
              <FormControl><Textarea placeholder="Describe the project's main objectives..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="projectResults" render={({ field }) => (
            <FormItem>
              <FormLabel>Project Results</FormLabel>
              <FormControl><Textarea placeholder="Summarize the project's impact and outcomes..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>
        </form>
      </Form>
      {(isLoading || generatedDescription) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Description</CardTitle>
            <CardDescription>
              Here is the AI-generated description for your project. You can copy it or refine it as needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              </div>
            ) : (
              <div className="relative">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedDescription}</p>
                <Button variant="ghost" size="icon" className="absolute top-0 right-0" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
