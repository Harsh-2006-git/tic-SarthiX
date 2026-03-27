'use server';
/**
 * @fileOverview A conversational AI agent for travel planning.
 *
 * - getChatbotResponse - A function that handles the conversation.
 * - ChatInput - The input type for the getChatbotResponse function.
 * - ChatOutput - The return type for the getChatbotResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  language: z.enum(['Hindi', 'English']),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const TravelItineraryInputSchema = z.object({
    origin: z.string().describe('The starting point of the travel.'),
    destination: z.string().describe('The desired travel destination.'),
    departureDate: z.string().describe('The departure date for the trip in YYYY-MM-DD format.'),
    arrivalDate: z.string().describe('The arrival date for the trip in YYYY-MM-DD format.'),
    numberOfPeople: z.number().int().min(1).describe('The number of people traveling.'),
    budget: z.string().describe('The budget for the trip (e.g., "$500", "€1000", "Luxury").'),
    style: z.string().describe('The preferred travel style (e.g., "Adventure", "Relaxing", "Cultural").'),
});

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user."),
  itineraryInput: TravelItineraryInputSchema.optional().describe("If all travel details are collected, this object will be populated."),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function getChatbotResponse(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are RoamAI, a friendly and helpful travel planning assistant. Your goal is to have a conversation with the user to gather the necessary information to plan their trip.

  You need to ask for the following details:
  - Origin (where the user is traveling from)
  - Destination
  - Departure Date
  - Arrival Date
  - Number of People
  - Budget
  - Travel Style (e.g., Adventure, Relaxing, Cultural)

  Keep your responses concise and conversational.
  Always respond in the language specified by the user: {{{language}}}.

  Here is the conversation history so far (you are 'model'):
  {{#each history}}
  {{role}}: {{{content}}}
  {{/each}}

  Based on this history, continue the conversation. Ask for the next piece of information you need. 
  If you have all the information, summarize it for the user, populate the 'itineraryInput' field in your response with the collected details, and state that you are now generating the itinerary. Do not ask for confirmation.
  `,
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output from prompt');
    }
    return output;
  }
);
