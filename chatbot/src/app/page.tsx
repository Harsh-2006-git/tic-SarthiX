'use client';

import { useState, useEffect } from 'react';
import type { Itinerary, TravelItineraryInput } from '@/lib/types';
import { getItinerary } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import ItineraryForm from '@/components/itinerary-form';
import ItineraryDisplay from '@/components/itinerary-display';
import ChatAgent from '@/components/chat-agent';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription as DialogDescriptionComponent } from '@/components/ui/dialog';
import { Bot, FileText, Sparkles, Send, Calendar, MapPin as MapPinIcon } from 'lucide-react';

export default function Home() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: TravelItineraryInput) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);

    // Close any open dialogs on submit
    if (isChatOpen) setIsChatOpen(false);
    if (isFormOpen) setIsFormOpen(false);

    const result = await getItinerary(data);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.error,
      });
    } else if (result.data) {
      setItinerary(result.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const handleClose = () => setIsChatOpen(false);
    window.addEventListener('close-ai-chat', handleClose);
    return () => window.removeEventListener('close-ai-chat', handleClose);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      {/* Decorative Orbs & Rings (Static for Perf) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -left-20 w-80 h-80 bg-orange-200/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] -right-20 w-80 h-80 bg-red-200/20 rounded-full blur-[100px] animate-pulse" />

        {/* Orbital Elements - Matching Frontend */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-orange-100/30 rounded-full animate-orbit pointer-events-none opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-orange-100/20 rounded-full animate-orbit-reverse pointer-events-none opacity-20" />
      </div>

      <main className="flex-1 container mx-auto px-4 md:px-8 pt-28 pb-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 h-full">

          {/* Left Column: Interactive Cards */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 animate-fade-in-up">
            <div className="mb-4">
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Divine Planner
              </h2>
              <p className="text-slate-500 font-medium">
                Let AI craft your perfect spiritual journey
              </p>
            </div>

            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-1 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center justify-center rounded-[1.4rem] bg-white p-8 text-center transition-colors group-hover:bg-white/95 h-full min-h-[220px]">
                    <div className="mb-4 rounded-2xl bg-orange-100 p-4 text-orange-600 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Bot className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Chat with RoamAI</h3>
                    <p className="mt-2 text-slate-500 font-medium">Conversational trip planning</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-all">
                      Start Chatting <Send className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl h-[90vh] md:h-[80vh] flex flex-col p-0 overflow-hidden border-orange-100 shadow-2xl rounded-3xl">
                <DialogTitle className="sr-only">Chat with RoamAI</DialogTitle>
                <DialogDescriptionComponent className="sr-only">Get conversational help to plan your trip.</DialogDescriptionComponent>
                <ChatAgent onItineraryReady={handleFormSubmit} />
              </DialogContent>
            </Dialog>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-1 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center justify-center rounded-[1.4rem] bg-white p-8 text-center transition-colors group-hover:bg-white/95 h-full min-h-[220px]">
                    <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-600 transition-transform group-hover:scale-110 group-hover:-rotate-6">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Manual Planning</h3>
                    <p className="mt-2 text-slate-500 font-medium">Fill out your preferences</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                      Open Form <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-lg p-0 border-orange-100 shadow-2xl rounded-3xl overflow-hidden">
                <DialogTitle className="sr-only">Plan Your Trip Manually</DialogTitle>
                <DialogDescriptionComponent className="sr-only">Fill out the details yourself in this form.</DialogDescriptionComponent>
                <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              </DialogContent>
            </Dialog>

            <div className="mt-auto glass p-6 rounded-3xl border-orange-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-orange-600" />
                </div>
                <span className="font-bold text-sm text-slate-700">Journey Insights</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our AI considers crowd density, darshan timings, and local traditions to provide the most auspicious experience.
              </p>
            </div>
          </div>

          {/* Right Column: Display Area */}
          <div className="flex-1 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-orange-100/50 shadow-2xl overflow-hidden flex flex-col animate-fade-in-up delay-[200ms]">
            <div className="p-6 border-b border-orange-100/50 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Your Divine Itinerary</h3>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Preview Mode</p>
                </div>
              </div>
              {itinerary && (
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-orange-600 transition-all"
                >
                  Download PDF
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto itinerary-scrollbar p-6">
              <ItineraryDisplay
                itinerary={itinerary}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="py-6 text-center text-slate-400 text-xs font-medium">
        <p>© 2026 Divya Yatra • Created with Devotion</p>
      </footer>
    </div>
  );
}
