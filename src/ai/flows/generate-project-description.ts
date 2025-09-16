'use server';

/**
 * @fileOverview A project description generator AI agent.
 *
 * - generateProjectDescription - A function that handles the project description generation process.
 * - GenerateProjectDescriptionInput - The input type for the generateProjectDescription function.
 * - GenerateProjectDescriptionOutput - The return type for the generateProjectDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectDescriptionInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  clientName: z.string().describe('The name of the client for whom the project was done.'),
  projectType: z.string().describe('The type of project (e.g., web application, mobile app, marketing campaign).'),
  keyTechnologies: z.string().describe('A comma-separated list of the key technologies used in the project.'),
  projectGoals: z.string().describe('A brief description of the project goals and objectives.'),
  projectResults: z.string().describe('A summary of the results and impact of the project.'),
});
export type GenerateProjectDescriptionInput = z.infer<typeof GenerateProjectDescriptionInputSchema>;

const GenerateProjectDescriptionOutputSchema = z.object({
  projectDescription: z.string().describe('A compelling description of the project.'),
});
export type GenerateProjectDescriptionOutput = z.infer<typeof GenerateProjectDescriptionOutputSchema>;

export async function generateProjectDescription(
  input: GenerateProjectDescriptionInput
): Promise<GenerateProjectDescriptionOutput> {
  return generateProjectDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectDescriptionPrompt',
  input: {schema: GenerateProjectDescriptionInputSchema},
  output: {schema: GenerateProjectDescriptionOutputSchema},
  prompt: `You are a marketing expert specializing in creating engaging project descriptions for a company portfolio website.

  Based on the following information, generate a concise and compelling project description to attract potential clients:

  Project Name: {{{projectName}}}
  Client Name: {{{clientName}}}
  Project Type: {{{projectType}}}
  Key Technologies: {{{keyTechnologies}}}
  Project Goals: {{{projectGoals}}}
  Project Results: {{{projectResults}}}
  `,
});

const generateProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProjectDescriptionFlow',
    inputSchema: GenerateProjectDescriptionInputSchema,
    outputSchema: GenerateProjectDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
