export type TravelItineraryInput = {
  origin: string;
  destination: string;
  departureDate: Date;
  arrivalDate: Date;
  numberOfPeople: number;
  budget: string;
  style: string;
  language: 'Hindi' | 'English';
};

export type HotelSuggestion = {
  name: string;
  price: string;
  rating?: string;
};

export type TransportationSuggestion = {
  mode: string;
  details: string;
  price: string;
};

export type DailyPlan = {
  day: number;
  activities: string[];
  accommodation?: HotelSuggestion;
  transportation_options: TransportationSuggestion[];
  estimated_cost: string;
};

export type Itinerary = {
  title: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  numberOfPeople: number;
  budget: string;
  style: string;
  daily_plan: DailyPlan[];
  total_estimated_cost: string;
  notes?: string;
};
