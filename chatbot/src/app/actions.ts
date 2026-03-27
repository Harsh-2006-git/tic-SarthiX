"use server";

import { generateTravelItinerary } from "@/ai/flows/generate-travel-itinerary";
import { getChatbotResponse } from "@/ai/flows/chat";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import type { Itinerary, TravelItineraryInput } from "@/lib/types";
import type { ChatInput, ChatOutput } from "@/ai/flows/chat";
import type { TextToSpeechInput, TextToSpeechOutput } from "@/ai/flows/text-to-speech";
import { format } from "date-fns";


export async function getItinerary(input: TravelItineraryInput): Promise<{ data?: Itinerary, error?: string }> {
  try {
    // TODO: Get user from Firebase Auth
    const formattedInput = {
      ...input,
      departureDate: format(input.departureDate, "yyyy-MM-dd"),
      arrivalDate: format(input.arrivalDate, "yyyy-MM-dd"),
    };
    const result = await generateTravelItinerary(formattedInput);
    
    const parsedItinerary: Itinerary = result.itinerary;

    // TODO: Save itinerary to Firestore for the authenticated user

    return { data: parsedItinerary };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `Failed to generate itinerary. ${errorMessage}` };
  }
}

export async function getChatResponse(input: ChatInput): Promise<{ data?: ChatOutput, error?: string }> {
  try {
    const result = await getChatbotResponse(input);
    return { data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `Failed to get chat response. ${errorMessage}` };
  }
}

export async function getTextToSpeech(input: TextToSpeechInput): Promise<{ data?: TextToSpeechOutput, error?: string }> {
    try {
        const result = await textToSpeech(input);
        return { data: result };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { error: `Failed to synthesize speech. ${errorMessage}` };
    }
}
