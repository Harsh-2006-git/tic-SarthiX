import { format } from "date-fns";
import type { Itinerary } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Landmark, Wallet, MapPin, Calendar, Clock, Star, Car, Home as HomeIcon, Sparkles } from "lucide-react";
import ItinerarySkeleton from "./itinerary-skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

interface ItineraryDisplayProps {
  itinerary: Itinerary | null;
  isLoading: boolean;
  error: string | null;
}

export default function ItineraryDisplay({ itinerary, isLoading, error }: ItineraryDisplayProps) {
  if (isLoading) {
    return <ItinerarySkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-red-100">
        <Alert variant="destructive" className="border-none bg-transparent">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="text-xl font-bold">Divine Interruption</AlertTitle>
          <AlertDescription className="text-base font-medium opacity-80">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (itinerary) {
    const departureDate = new Date(itinerary.departureDate.replace(/-/g, '/'));
    const arrivalDate = new Date(itinerary.arrivalDate.replace(/-/g, '/'));

    return (
      <div className="space-y-8 pb-8 animate-fade-in-up">
        {/* Itinerary Hero Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500/20 p-2 rounded-lg backdrop-blur-md">
                <Star className="h-5 w-5 text-orange-400 fill-orange-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">Personalized Journey</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
              {itinerary.title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Destination</p>
                <p className="font-bold text-sm md:text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" /> {itinerary.destination}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dates</p>
                <p className="font-bold text-sm md:text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" /> {format(departureDate, "MMM d")} - {format(arrivalDate, "MMM d")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Group Size</p>
                <p className="font-bold text-sm md:text-base">
                  {itinerary.numberOfPeople} Traveler(s)
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Budget Style</p>
                <p className="font-bold text-sm md:text-base">
                  {itinerary.budget} • {itinerary.style}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Detailed Schedule</h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Clock className="h-3 w-3" /> Hourly Breakdown
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="day-1">
            {itinerary.daily_plan.sort((a, b) => a.day - b.day).map((day) => (
              <AccordionItem value={`day-${day.day}`} key={day.day} className="border-none px-6">
                <AccordionTrigger className="py-6 hover:no-underline group">
                  <div className="flex items-center gap-4 w-full text-left">
                    <div className="h-12 w-12 rounded-2xl bg-orange-100 flex flex-col items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      <span className="text-[10px] font-black leading-none uppercase">Day</span>
                      <span className="text-xl font-black leading-none">{day.day}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors">Daily Immersion</h4>
                      <p className="text-sm font-medium text-slate-400">{day.activities.length} Sacred Activities Planned</p>
                    </div>
                    <div className="pr-4 hidden md:block">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase">Est. Cost</p>
                        <p className="text-base font-bold text-slate-700">{day.estimated_cost}</p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 pt-2">
                  <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                      <h5 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                        <Sparkles className="h-3 w-3 text-orange-500" /> Activities & Rituals
                      </h5>
                      <div className="grid gap-3">
                        {day.activities.map((activity, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group/item">
                            <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0 group-hover/item:scale-150 transition-all" />
                            <p className="text-sm font-medium text-slate-700">{activity}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {day.accommodation && (
                        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                          <h5 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-orange-600 mb-4">
                            <HomeIcon className="h-3 w-3" /> Stay
                          </h5>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800 text-base">{day.accommodation.name}</p>
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                              {day.accommodation.rating && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {day.accommodation.rating}</span>}
                              {day.accommodation.price && <span>{day.accommodation.price}</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h5 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 mb-4">
                          <Car className="h-3 w-3" /> Transit
                        </h5>
                        <div className="space-y-4">
                          {day.transportation_options.map((t, i) => (
                            <div key={i} className="space-y-1">
                              <p className="text-sm font-bold text-slate-800">{t.mode}</p>
                              <p className="text-xs font-medium text-slate-500">{t.details}</p>
                              <p className="text-[10px] font-black text-orange-600 uppercase">{t.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Summary Footer */}
        <div className="glass p-8 rounded-[2rem] border-orange-200/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <Wallet className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Investment</p>
              <h3 className="text-3xl font-black text-slate-800">{itinerary.total_estimated_cost}</h3>
            </div>
          </div>

          <div className="flex-1 md:max-w-md">
            <p className="text-sm font-medium text-slate-500 italic leading-relaxed text-center md:text-right">
              "{itinerary.notes || 'May your journey be filled with divine light and infinite peace.'}"
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-pulse">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative h-full w-full rounded-full border-2 border-orange-100 flex items-center justify-center">
          <Landmark className="h-12 w-12 text-orange-500" />
        </div>
        {/* Orbital Dot */}
        <div className="absolute top-0 right-0 h-4 w-4 bg-orange-600 rounded-full animate-orbit" />
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        Awaiting Your Command
      </h2>
      <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
        The stars are aligning for your sacred journey. Start a conversation or use the form to manifest your itinerary.
      </p>
    </div>
  );
}
