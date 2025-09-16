'use server';

/**
 * @fileOverview An AI agent that suggests a Lucide icon based on a service title.
 *
 * - suggestServiceIcon - A function that suggests an icon name.
 * - SuggestServiceIconInput - The input type for the suggestServiceIcon function.
 * - SuggestServiceIconOutput - The return type for the suggestServiceIcon function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as LucideIcons from 'lucide-react';

// Get all available Lucide icon names
const availableIcons = Object.keys(LucideIcons);

const SuggestServiceIconInputSchema = z.object({
  serviceTitle: z.string().describe('The title of the service for which to suggest an icon.'),
});
export type SuggestServiceIconInput = z.infer<typeof SuggestServiceIconInputSchema>;

const SuggestServiceIconOutputSchema = z.object({
  iconName: z.string().describe(`The name of the most relevant lucide-react icon. The name must be one of the available icons.`),
});
export type SuggestServiceIconOutput = z.infer<typeof SuggestServiceIconOutputSchema>;

export async function suggestServiceIcon(input: SuggestServiceIconInput): Promise<SuggestServiceIconOutput> {
  return suggestServiceIconFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestServiceIconPrompt',
  input: { schema: SuggestServiceIconInputSchema },
  output: { schema: SuggestServiceIconOutputSchema },
  prompt: `You are an expert in UI/UX design and have a deep knowledge of the 'lucide-react' icon library.
  
  Your task is to suggest the most appropriate icon for a given service title.
  
  The service title is: {{{serviceTitle}}}
  
  Here is a list of all available icons in lucide-react:
  ${availableIcons.join(', ')}
  
  From the list above, choose the single best icon name that represents the service title. The icon name must be an exact match from the list.
  For example, if the service title is "Web Development", a good icon name would be "Code". For "Marketing", a good icon would be "Megaphone".
  `,
});

const suggestServiceIconFlow = ai.defineFlow(
  {
    name: 'suggestServiceIconFlow',
    inputSchema: SuggestServiceIconInputSchema,
    outputSchema: SuggestServiceIconOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Fallback in case the model returns an invalid icon name
    if (!output || !availableIcons.includes(output.iconName)) {
        return { iconName: 'Cog' }; // Default to a generic icon
    }
    return output;
  }
);
