// This is a server-side file.
'use server';

/**
 * @fileOverview Dynamically categorizes menu items using AI based on their description.
 *
 * - categorizeMenuItems - A function that categorizes menu items.
 * - CategorizeMenuItemsInput - The input type for the categorizeMenuItems function.
 * - CategorizeMenuItemsOutput - The return type for the categorizeMenuItems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const MenuItemSchema = z.object({
  name: z.string().describe('The name of the menu item.'),
  description: z.string().describe('A detailed description of the menu item.'),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

const CategorizeMenuItemsInputSchema = z
  .array(z.object({ name: z.string() }))
  .describe('An array of menu items to categorize.');
export type CategorizeMenuItemsInput = z.infer<
  typeof CategorizeMenuItemsInputSchema
>;

const CategorizedMenuItemsOutputSchema = z
  .record(z.string(), z.array(z.object({ name: z.string() })))
  .describe('A record of menu items, with the keys being the categories.');
export type CategorizeMenuItemsOutput = z.infer<
  typeof CategorizedMenuItemsOutputSchema
>;

export async function categorizeMenuItems(
  input: CategorizeMenuItemsInput
): Promise<CategorizeMenuItemsOutput> {
  return categorizeMenuItemsFlow(input);
}

const categorizeMenuItemsPrompt = ai.definePrompt({
  name: 'categorizeMenuItemsPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: CategorizeMenuItemsInputSchema },
  output: { schema: CategorizedMenuItemsOutputSchema },
  prompt: `You are an expert menu organizer. Given a list of menu items, categorize them into appropriate categories such as "Appetizers", "Main Courses", "Desserts", "Drinks", etc. Be creative and consider the content of the menu items.

Menu Items:
{{#each this}}
- Name: {{name}}
{{/each}}

Return a JSON object where the keys are the categories and the values are arrays of menu items (name only) belonging to that category.
`,
});

const categorizeMenuItemsFlow = ai.defineFlow(
  {
    name: 'categorizeMenuItemsFlow',
    inputSchema: CategorizeMenuItemsInputSchema,
    outputSchema: CategorizedMenuItemsOutputSchema,
  },
  async (input) => {
    const { output } = await categorizeMenuItemsPrompt(input);
    return output!;
  }
);
