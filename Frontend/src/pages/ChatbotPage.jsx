import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItineraryForm from '../components/chat/itinerary-form';
import ItineraryDisplay from '../components/chat/itinerary-display';
import ChatAgent from '../components/chat/chat-agent';
import { getItinerary } from '../api/chatActions';
import { useToast } from '../hooks/use-toast';
import {
  Dialog, DialogContent, DialogTrigger,
  DialogTitle, DialogDescription as DialogDescriptionComponent,
} from '../components/ui/dialog';
import { Bot, Sparkles, ArrowRight, FileText, Calendar } from 'lucide-react';

export default function ChatbotPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);

    const result = await getItinerary(data);
    if (result.error) {
      setError(result.error);
      toast({ variant: 'destructive', title: 'Plan Failed', description: result.error });
    } else if (result.data) {
      setItinerary(result.data);
      toast({ title: 'Plan Generated!', description: 'Your sacred itinerary is ready.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-red-50 text-slate-800 leading-relaxed font-sans overflow-x-hidden">
      <Header />

      <div className="pt-[100px] flex-grow flex flex-col items-center">
        {/* ORIGINAL HERO CONTENT - COMPACT DESIGN */}
        <section className="text-center py-6 md:py-10 px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-orange-100/50 shadow-sm mb-4 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">AI Powered Pilgrimage</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none mb-4">
            Divine <span className="text-orange-600">Journey Planner</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Let our sacred intelligence craft an auspicious itinerary for your pilgrimage.
          </p>
        </section>

        {/* ORIGINAL WORDING - COMPACT TWO-CARD GRID */}
        <section className="container mx-auto px-6 py-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

            {/* Box 1: Detailed Form (SMALL) */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-xl transition-all hover:shadow-orange-200/50 hover:-translate-y-2 transform duration-300 border border-white">
                  <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-10 transition-all duration-700" />
                  <div className="relative rounded-[2.2rem] bg-slate-50/20 p-8 text-center border-2 border-white h-full flex flex-col items-center justify-center">
                    <div className="mb-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-600 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 border border-slate-50">
                      <FileText size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Yatraa Planner</h2>
                    <p className="text-slate-500 font-bold mb-6 text-[11px] leading-snug max-w-[200px] mx-auto">
                      Enter your travel details here.
                    </p>
                    <div className="mt-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl group-hover:bg-orange-600 transition-colors">
                      Open Planner <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-xl p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/95 backdrop-blur-xl">
                <DialogTitle className="sr-only">Detailed Planner Form</DialogTitle>
                <DialogDescriptionComponent className="sr-only">Enter your travel details here.</DialogDescriptionComponent>
                <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              </DialogContent>
            </Dialog>

            {/* Box 2: Sacred Chat Bot (SMALL) */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-xl transition-all hover:shadow-orange-200/50 hover:-translate-y-2 transform duration-300 border border-white">
                  <div className="absolute inset-0 bg-orange-100 opacity-0 group-hover:opacity-10 transition-all duration-700" />
                  <div className="relative rounded-[2.2rem] bg-slate-50/20 p-8 text-center border-2 border-white h-full flex flex-col items-center justify-center">
                    <div className="mb-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-orange-600 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 border border-orange-50">
                      <Bot size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Sacred Chat Bot</h2>
                    <p className="text-slate-500 font-bold mb-6 text-[11px] leading-snug max-w-[200px] mx-auto">
                      Talk to our AI for a personalized plan
                    </p>
                    <div className="mt-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl group-hover:bg-orange-600 transition-colors">
                      Start Chat <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white/95 backdrop-blur-xl">
                <DialogTitle className="sr-only">Conversational Assistant</DialogTitle>
                <DialogDescriptionComponent className="sr-only">Talk to our assistant for a custom plan.</DialogDescriptionComponent>
                <ChatAgent onItineraryReady={handleFormSubmit} />
              </DialogContent>
            </Dialog>

          </div>
        </section>

        {/* ITINERARY PREVIEW - REMAINS AVAILABLE */}
        {itinerary && (
          <section className="container mx-auto px-6 py-12 animate-fadeInUp max-w-4xl">
            <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] border border-white shadow-2xl overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-white shadow-xl shadow-orange-100">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase mb-1 leading-none italic">Sacred Itinerary</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest font-sans">Ready For You</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Download PDF
                </button>
              </div>
              <div className="flex-1 max-h-[600px] overflow-y-auto p-8 custom-scrollbar bg-slate-50/20">
                <ItineraryDisplay itinerary={itinerary} isLoading={isLoading} error={error} />
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
      `}} />
    </div>
  );
}