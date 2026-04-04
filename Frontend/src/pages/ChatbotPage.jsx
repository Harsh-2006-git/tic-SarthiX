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
import { Bot, Sparkles, ArrowRight, FileText, Calendar, Download } from 'lucide-react';

export default function ChatbotPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setFormOpen(false); // Close the form dialog

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

  const downloadPDF = () => {
    if (!itinerary) return;
    const itn = itinerary.itinerary || itinerary;

    const dailyPlanHTML = (itn.daily_plan || [])
      .sort((a, b) => a.day - b.day)
      .map(day => `
        <div class="day-card">
          <div class="day-header">
            <div class="day-badge">
              <span class="day-label">DAY</span>
              <span class="day-num">${day.day}</span>
            </div>
            <div class="day-info">
              <h3>Daily Immersion</h3>
              <p>${day.activities.length} Sacred Activities Planned</p>
            </div>
            <div class="day-cost">
              <span class="cost-label">EST. COST</span>
              <span class="cost-val">${day.estimated_cost || 'N/A'}</span>
            </div>
          </div>

          <div class="day-body">
            <div class="activities-col">
              <h4 class="section-label">&#10022; ACTIVITIES &amp; RITUALS</h4>
              ${day.activities.map(act => `<div class="activity-item"><span class="dot"></span><span>${act}</span></div>`).join('')}
            </div>

            <div class="sidebar-col">
              ${day.accommodation ? `
              <div class="info-card orange-card">
                <h4 class="section-label" style="color:#ea580c;">&#127968; STAY</h4>
                <p class="info-name">${day.accommodation.name}</p>
                <p class="info-sub">${day.accommodation.rating ? `&#11088; ${day.accommodation.rating}` : ''} ${day.accommodation.price ? `&bull; ${day.accommodation.price}` : ''}</p>
              </div>` : ''}

              ${day.transportation_options && day.transportation_options.length ? `
              <div class="info-card grey-card">
                <h4 class="section-label">&#128663; TRANSIT</h4>
                ${day.transportation_options.map(t => `
                  <div class="transit-item">
                    <p class="info-name">${t.mode}</p>
                    <p class="info-sub">${t.details}</p>
                    <p class="transit-price">${t.price}</p>
                  </div>
                `).join('')}
              </div>` : ''}
            </div>
          </div>
        </div>
      `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${itn.title || 'Sacred Itinerary'} - DivyaYatra</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #1e293b;
      font-size: 13px;
      line-height: 1.6;
    }

    .pdf-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #7c2d12 100%);
      color: white;
      padding: 40px 48px 36px;
      position: relative;
      overflow: hidden;
    }
    .pdf-header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 280px; height: 280px;
      background: rgba(234,88,12,0.15);
      border-radius: 50%;
      filter: blur(60px);
    }
    .header-brand {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #f97316;
      margin-bottom: 16px;
      position: relative; z-index: 1;
    }
    .header-title {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 24px;
      position: relative; z-index: 1;
    }
    .header-meta {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.12);
      position: relative; z-index: 1;
    }
    .meta-item .meta-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .meta-item .meta-value {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
    }

    .pdf-body { padding: 36px 48px; }

    .cost-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #fff7ed, #fef3c7);
      border: 1px solid #fed7aa;
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 32px;
    }
    .total-label {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #92400e;
      margin-bottom: 4px;
    }
    .total-value {
      font-size: 28px;
      font-weight: 900;
      color: #1e293b;
    }
    .notes-text {
      font-size: 12px;
      font-style: italic;
      color: #78350f;
      max-width: 380px;
      text-align: right;
      line-height: 1.6;
    }

    .schedule-heading {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .schedule-heading::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .day-card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .day-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .day-badge {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #ea580c, #dc2626);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .day-label { font-size: 7px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
    .day-num { font-size: 20px; font-weight: 900; line-height: 1; }
    .day-info h3 { font-size: 15px; font-weight: 800; color: #0f172a; }
    .day-info p { font-size: 10px; color: #64748b; font-weight: 600; margin-top: 2px; }
    .day-cost { margin-left: auto; text-align: right; }
    .cost-label { display: block; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
    .cost-val { font-size: 14px; font-weight: 800; color: #1e293b; }

    .day-body {
      display: grid;
      grid-template-columns: 1fr 260px;
    }
    .activities-col { padding: 20px; border-right: 1px solid #f1f5f9; }
    .sidebar-col { padding: 20px; background: #fafafa; }

    .section-label {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 10px;
    }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 9px 12px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 7px;
      font-size: 12px;
      color: #334155;
      font-weight: 500;
    }
    .dot {
      width: 7px; height: 7px;
      background: #ea580c;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .info-card { border-radius: 12px; padding: 14px; margin-bottom: 10px; }
    .orange-card { background: #fff7ed; border: 1px solid #fed7aa; }
    .grey-card { background: #f8fafc; border: 1px solid #e2e8f0; }
    .info-name { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
    .info-sub { font-size: 11px; color: #64748b; font-weight: 500; }
    .transit-item { margin-bottom: 10px; }
    .transit-price { font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase; margin-top: 2px; }

    .pdf-footer {
      margin: 32px 48px 0;
      padding: 18px 0;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand { font-size: 10px; font-weight: 900; color: #ea580c; letter-spacing: 0.15em; text-transform: uppercase; }
    .tagline { font-size: 10px; color: #94a3b8; }

    @media print {
      @page { size: A4; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .day-card { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>

  <div class="pdf-header">
    <div class="header-brand">&#10022; DivyaYatra &mdash; Personalized Sacred Journey</div>
    <h1 class="header-title">${itn.title || 'Sacred Pilgrimage Itinerary'}</h1>
    <div class="header-meta">
      <div class="meta-item">
        <div class="meta-label">Destination</div>
        <div class="meta-value">&#128205; ${itn.destination || '&mdash;'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Departure</div>
        <div class="meta-value">&#128197; ${itn.departureDate || '&mdash;'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Return</div>
        <div class="meta-value">&#128197; ${itn.arrivalDate || '&mdash;'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Travelers</div>
        <div class="meta-value">&#128101; ${itn.numberOfPeople || 1} &bull; ${itn.budget || ''} &bull; ${itn.style || ''}</div>
      </div>
    </div>
  </div>

  <div class="pdf-body">
    <div class="cost-banner">
      <div>
        <div class="total-label">Total Estimated Investment</div>
        <div class="total-value">${itn.total_estimated_cost || 'N/A'}</div>
      </div>
      <div class="notes-text">&ldquo;${itn.notes || 'May your journey be filled with divine light and infinite peace.'}&rdquo;</div>
    </div>

    <div class="schedule-heading">Daily Schedule</div>
    ${dailyPlanHTML}
  </div>

  <div class="pdf-footer">
    <span class="brand">DivyaYatra</span>
    <span class="tagline">Generated by RoamAI &bull; Sacred Pilgrimage Intelligence</span>
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=960,height=800');
    if (!printWin) {
      toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups for this site to download the PDF.' });
      return;
    }
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-red-50 text-slate-800 leading-relaxed font-sans overflow-x-hidden">
      <Header />

      <div className="pt-[100px] flex-grow flex flex-col items-center">
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

        <section className="container mx-auto px-6 py-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <div onClick={() => setFormOpen(true)} className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-xl transition-all hover:shadow-orange-200/50 hover:-translate-y-2 transform duration-300 border border-white">
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
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
              <div className="flex-1 p-8 bg-slate-50/20">
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