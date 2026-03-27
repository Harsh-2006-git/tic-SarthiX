'use server';

/**
 * @fileOverview A travel itinerary generator AI agent.
 *
 * - generateTravelItinerary - A function that handles the travel itinerary generation process.
 * - TravelItineraryInput - The input type for the generateTravelItinerary function.
 * - TravelItineraryOutput - The return type for the generateTravelItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// You will need to get an API key from serpapi.com and add it to your .env file.
// For example: SERP_API_KEY="your_api_key_here"
const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_API_ENDPOINT = 'https://serpapi.com/search.json';

const TravelItineraryInputSchema = z.object({
  origin: z.string().describe('The starting point of the travel.'),
  destination: z.string().describe('The desired travel destination.'),
  departureDate: z.string().describe('The departure date for the trip in YYYY-MM-DD format.'),
  arrivalDate: z.string().describe('The arrival date for the trip in YYYY-MM-DD format.'),
  numberOfPeople: z.number().int().min(1).describe('The number of people traveling.'),
  budget: z.string().describe('The budget for the trip (e.g., "$500", "€1000", "Luxury").'),
  style: z.string().describe('The preferred travel style (e.g., "Adventure", "Relaxing", "Cultural").'),
  language: z.enum(['Hindi', 'English']).optional().default('English').describe('The language for the itinerary generation.'),
});

export type TravelItineraryInput = z.infer<typeof TravelItineraryInputSchema>;

const HotelSuggestionSchema = z.object({
    name: z.string().describe('Name of the suggested hotel.'),
    price: z.string().describe('Estimated price per night.'),
    rating: z.string().optional().describe('Star rating of the hotel.'),
});

const TransportationSuggestionSchema = z.object({
    mode: z.string().describe('Mode of transportation (e.g., Train, Flight, Bus).'),
    details: z.string().describe('Specific details like train number, flight number, or bus service name.'),
    price: z.string().describe('Estimated cost of the transportation.'),
});

const DailyPlanSchema = z.object({
    day: z.number().describe('The day number of the itinerary.'),
    activities: z.array(z.string()).describe('A list of activities planned for the day.'),
    accommodation: z.preprocess(
      (val) => (!val || (typeof val === 'object' && Object.keys(val).length === 0) ? undefined : val),
      HotelSuggestionSchema.optional().describe('Accommodation suggestion for the day. This should be omitted if no accommodation is needed (e.g., on the last day of travel).')
    ),
    transportation_options: z.array(TransportationSuggestionSchema).describe('A list of transportation options for the day.'),
    estimated_cost: z.string().describe('Estimated cost for the day.'),
});

const ItinerarySchema = z.object({
  title: z.string().describe('The title of the travel itinerary.'),
  destination: z.string().describe('The travel destination.'),
  departureDate: z.string().describe('The departure date of the trip in YYYY-MM-DD format.'),
  arrivalDate: z.string().describe('The arrival date of the trip in YYYY-MM-DD format.'),
  numberOfPeople: z.number().int().min(1).describe('The number of people traveling.'),
  budget: z.string().describe('The budget for the trip.'),
  style: z.string().describe('The travel style.'),
  daily_plan: z.array(DailyPlanSchema).describe('A detailed daily plan in a structured format.'),
  total_estimated_cost: z.string().describe('The total estimated cost for the trip.'),
  notes: z.string().optional().describe('Additional notes or tips for the trip.')
});


const TravelItineraryOutputSchema = z.object({
  itinerary: ItinerarySchema.describe('A detailed travel itinerary.'),
});

export type TravelItineraryOutput = z.infer<typeof TravelItineraryOutputSchema>;

export async function generateTravelItinerary(input: TravelItineraryInput): Promise<TravelItineraryOutput> {
  return generateTravelItineraryFlow(input);
}

// Helper function to call the SerpApi.com API
async function searchSerpApi(query: string): Promise<string> {
  if (!SERP_API_KEY) {
    // Return a mock response if the API key is not set, so the app can still function.
    return `No API key found. Returning mock data for "${query}". [Result 1, Result 2, Result 3]`;
  }
  
  try {
    const params = new URLSearchParams({
        q: query,
        api_key: SERP_API_KEY,
        engine: 'google',
    });
    const response = await fetch(`${SERP_API_ENDPOINT}?${params.toString()}`);

    if (!response.ok) {
      const errorBody = await response.text();
      return `Error: API request failed with status ${response.status}. Body: ${errorBody}`;
    }

    const data = await response.json();
    
    let results: any[] = [];
    if (data.organic_results) {
        results = data.organic_results;
    } else if (data.local_results) {
        results = data.local_results;
    }

    if (results.length > 0) {
      return results
        .slice(0, 5) // Limit to top 5 results for brevity
        .map((result: any) => {
            if (result.title && result.snippet) {
                return `${result.title}: ${result.snippet}`;
            }
            if (result.title && result.address) {
                return `${result.title}: ${result.address}`;
            }
            return result.title || '';
        })
        .filter(Boolean)
        .join('\n');
    } else {
      return 'No results found.';
    }
  } catch (error) {
    console.error('SERP API call failed:', error);
    return 'Error: Failed to fetch data from the SERP API.';
  }
}

const searchHotels = ai.defineTool({
    name: 'searchHotels',
    description: 'Searches for hotels at a given location.',
    inputSchema: z.object({
        location: z.string().describe('The location to search for hotels.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    console.log(`Searching hotels at ${input.location} using SERP API.`);
    const query = `best hotels in ${input.location}`;
    return await searchSerpApi(query);
  }
);

const searchTrains = ai.defineTool({
    name: 'searchTrains',
    description: 'Searches for trains between two locations.',
    inputSchema: z.object({
        from: z.string().describe('The origin location.'),
        to: z.string().describe('The destination location.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    console.log(`Searching trains from ${input.from} to ${input.to} using SERP API.`);
    const query = `trains from ${input.from} to ${input.to}`;
    return await searchSerpApi(query);
  }
);

const searchNearbyAttractions = ai.defineTool({
    name: 'searchNearbyAttractions',
    description: 'Useful for searching nearby attractions at a specific location.',
    inputSchema: z.object({
        location: z.string().describe('The location to search for attractions.'),
        query: z.string().describe('The type of attractions to search for (e.g., museums, restaurants, parks).'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    console.log(`Searching nearby attractions at ${input.location} for ${input.query} using SERP API.`);
    const query = `${input.query} in ${input.location}`;
    return await searchSerpApi(query);
  }
);

const prompt = ai.definePrompt({
  name: 'travelPlannerPrompt',
  input: {schema: TravelItineraryInputSchema},
  output: {schema: TravelItineraryOutputSchema},
  prompt: `You are a travel agent specializing in creating personalized travel itineraries.
Use the 'searchHotels', 'searchTrains', and 'searchNearbyAttractions' tools to find real-time information and include it in your suggestions.
The user wants the output in a structured, tabular format. You must populate the 'daily_plan' array. For each day, provide a list of activities, a specific hotel suggestion, and a list of transportation options.
The entire response, including all text in the generated itinerary, should be in the user's specified language: {{{language}}}.

You have the following information from the user:
- Origin: {{{origin}}}
- Destination: {{{destination}}}
- Departure Date: {{{departureDate}}}
- Arrival Date: {{{arrivalDate}}}
- Number of People: {{{numberOfPeople}}}
- Budget: {{{budget}}}
- Style: {{{style}}}

Based on this, generate a detailed travel itinerary. Cater the plan for the number of people specified. This includes suggesting appropriate accommodation (e.g. family rooms, multiple rooms), transportation, and activities suitable for a group of that size.
For each day in the 'daily_plan':
- Provide specific hotel suggestions using the 'searchHotels' tool.
- Provide specific transportation suggestions (like train details) using the 'searchTrains' tool.
- Use the 'searchNearbyAttractions' tool for activity ideas.
- Provide cost estimates for each item.
- You MUST provide an estimated cost for each day.
You MUST provide a 'total_estimated_cost' for the entire trip. This is very important.
The itinerary should be tailored to the user's preferences and budget. It is CRUCIAL that the 'total_estimated_cost' does not exceed the user's provided 'budget'. If the budget is not sufficient for the requested duration and style, you should suggest a shorter trip or a different style that fits the budget and reflect this in the itinerary output.
`,
    tools: [searchHotels, searchTrains, searchNearbyAttractions],
});

const generateTravelItineraryFlow = ai.defineFlow(
  {
    name: 'generateTravelItineraryFlow',
    inputSchema: TravelItineraryInputSchema,
    outputSchema: TravelItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate a valid itinerary. The model response was empty or did not match the required format.');
    }
    return output;
  }
);
