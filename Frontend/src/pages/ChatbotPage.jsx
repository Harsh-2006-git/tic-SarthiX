'use client';

import { useState, useEffect } from 'react';
import { getItinerary } from '../api/chatActions';
import { useToast } from '../hooks/use-toast';
import Header from '../components/chat/header';
import Footer from '../components/chat/footer';
import ItineraryForm from '../components/chat/itinerary-form';
import ItineraryDisplay from '../components/chat/itinerary-display';
import ChatAgent from '../components/chat/chat-agent';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription as DialogDescriptionComponent } from '../components/ui/dialog';
import { Bot, FileText, Sparkles, Calendar, MapPin as MapPinIcon, ArrowRight, Star } from 'lucide-react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Home() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    toast
  } = useToast();
  const handleFormSubmit = async data => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);

    // Close any open dialogs on submit
    if (isChatOpen) setIsChatOpen(false);
    if (isFormOpen) setIsFormOpen(false);
    const result = await getItinerary(data);
    if (result.error) {
      if (result.error.includes("FAILED_PRECONDITION") || result.error.includes("API key")) {
        setError("AI Service Key Missing: Please set your GEMINI_API_KEY in the chatbot/.env file.");
        toast({
          variant: "destructive",
          title: "Setup Required",
          description: "Please set your GEMINI_API_KEY in the chatbot folder's .env file."
        });
      } else {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Error Generating Itinerary",
          description: result.error
        });
      }
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
  return /*#__PURE__*/_jsxs("div", {
    className: "flex flex-col min-h-screen bg-white",
    children: [/*#__PURE__*/_jsx(Header, {}), /*#__PURE__*/_jsxs("div", {
      className: "fixed inset-0 overflow-hidden pointer-events-none z-0",
      children: [/*#__PURE__*/_jsx("div", {
        className: "absolute top-[10%] -left-20 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[120px] animate-pulse"
      }), /*#__PURE__*/_jsx("div", {
        className: "absolute bottom-[10%] -right-20 w-[500px] h-[500px] bg-red-100/20 rounded-full blur-[120px] animate-pulse",
        style: {
          animationDelay: '2s'
        }
      }), /*#__PURE__*/_jsx("div", {
        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-orange-50/50 rounded-full animate-orbit pointer-events-none opacity-40"
      }), /*#__PURE__*/_jsx("div", {
        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-orange-100/30 rounded-full animate-orbit-reverse pointer-events-none opacity-30"
      })]
    }), /*#__PURE__*/_jsx("main", {
      className: "flex-1 container mx-auto px-4 sm:px-8 lg:px-12 pt-32 pb-20 relative z-10",
      children: /*#__PURE__*/_jsxs("div", {
        className: "flex flex-col lg:flex-row gap-10",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "w-full lg:w-[400px] flex flex-col gap-8 animate-fade-in-up",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "space-y-4",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100/50",
              children: [/*#__PURE__*/_jsx(Sparkles, {
                className: "h-3.5 w-3.5 text-orange-600"
              }), /*#__PURE__*/_jsx("span", {
                className: "text-[10px] font-black uppercase tracking-[0.2em] text-orange-600",
                children: "AI Powered Pilgrimage"
              })]
            }), /*#__PURE__*/_jsxs("h2", {
              className: "text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]",
              children: ["Divine ", /*#__PURE__*/_jsx("span", {
                className: "text-orange-600",
                children: "Journey"
              }), " Planner"]
            }), /*#__PURE__*/_jsx("p", {
              className: "text-slate-500 font-medium text-lg leading-relaxed",
              children: "Let our sacred intelligence craft an auspicious itinerary for your Ujjain pilgrimage."
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "grid grid-cols-1 gap-4",
            children: [/*#__PURE__*/_jsxs(Dialog, {
              open: isChatOpen,
              onOpenChange: setIsChatOpen,
              children: [/*#__PURE__*/_jsx(DialogTrigger, {
                asChild: true,
                children: /*#__PURE__*/_jsxs("div", {
                  className: "group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white p-1 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95",
                  children: [/*#__PURE__*/_jsx("div", {
                    className: "absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  }), /*#__PURE__*/_jsxs("div", {
                    className: "relative flex flex-col items-center justify-center rounded-[1.8rem] bg-white p-8 text-center transition-colors group-hover:bg-white/95 h-full",
                    children: [/*#__PURE__*/_jsx("div", {
                      className: "mb-5 rounded-2xl bg-orange-50 p-4 text-orange-600 transition-all duration-500 group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                      children: /*#__PURE__*/_jsx(Bot, {
                        className: "h-8 w-8"
                      })
                    }), /*#__PURE__*/_jsx("h3", {
                      className: "text-xl font-bold text-slate-800",
                      children: "Sacred Chat Bot"
                    }), /*#__PURE__*/_jsx("p", {
                      className: "mt-2 text-sm text-slate-500 font-medium",
                      children: "Talk to our AI for a personalized plan"
                    }), /*#__PURE__*/_jsxs("div", {
                      className: "mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0",
                      children: ["Invoke Assistant ", /*#__PURE__*/_jsx(ArrowRight, {
                        className: "h-3.5 w-3.5"
                      })]
                    })]
                  })]
                })
              }), /*#__PURE__*/_jsxs(DialogContent, {
                className: "max-w-4xl h-[90vh] md:h-[85vh] flex flex-col p-0 overflow-hidden border-orange-100 shadow-2xl rounded-[2.5rem]",
                children: [/*#__PURE__*/_jsx(DialogTitle, {
                  className: "sr-only",
                  children: "Chat with DivyaYatra"
                }), /*#__PURE__*/_jsx(DialogDescriptionComponent, {
                  className: "sr-only",
                  children: "Get conversational help to plan your trip."
                }), /*#__PURE__*/_jsx(ChatAgent, {
                  onItineraryReady: handleFormSubmit
                })]
              })]
            }), /*#__PURE__*/_jsxs(Dialog, {
              open: isFormOpen,
              onOpenChange: setIsFormOpen,
              children: [/*#__PURE__*/_jsx(DialogTrigger, {
                asChild: true,
                children: /*#__PURE__*/_jsxs("div", {
                  className: "group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white p-1 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95",
                  children: [/*#__PURE__*/_jsx("div", {
                    className: "absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  }), /*#__PURE__*/_jsxs("div", {
                    className: "relative flex flex-col items-center justify-center rounded-[1.8rem] bg-white p-8 text-center transition-colors group-hover:bg-white/95 h-full",
                    children: [/*#__PURE__*/_jsx("div", {
                      className: "mb-5 rounded-2xl bg-slate-50 p-4 text-slate-600 transition-all duration-500 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 group-hover:-rotate-6 shadow-sm",
                      children: /*#__PURE__*/_jsx(FileText, {
                        className: "h-8 w-8"
                      })
                    }), /*#__PURE__*/_jsx("h3", {
                      className: "text-xl font-bold text-slate-800",
                      children: "Detailed Form"
                    }), /*#__PURE__*/_jsx("p", {
                      className: "mt-2 text-sm text-slate-500 font-medium",
                      children: "Fine-tune every aspect of your yatra"
                    }), /*#__PURE__*/_jsxs("div", {
                      className: "mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0",
                      children: ["Open Planner ", /*#__PURE__*/_jsx(Sparkles, {
                        className: "h-3.5 w-3.5"
                      })]
                    })]
                  })]
                })
              }), /*#__PURE__*/_jsxs(DialogContent, {
                className: "max-w-xl p-0 border-orange-100 shadow-2xl rounded-[2.5rem] overflow-hidden",
                children: [/*#__PURE__*/_jsx(DialogTitle, {
                  className: "sr-only",
                  children: "Plan Your Trip Manually"
                }), /*#__PURE__*/_jsx(DialogDescriptionComponent, {
                  className: "sr-only",
                  children: "Fill out the details yourself in this form."
                }), /*#__PURE__*/_jsx(ItineraryForm, {
                  onSubmit: handleFormSubmit,
                  isLoading: isLoading
                })]
              })]
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "bg-slate-50 border border-slate-100 p-6 rounded-[2rem] relative overflow-hidden group",
            children: [/*#__PURE__*/_jsx("div", {
              className: "absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity",
              children: /*#__PURE__*/_jsx(Star, {
                className: "h-12 w-12 text-orange-600 fill-orange-600"
              })
            }), /*#__PURE__*/_jsxs("div", {
              className: "flex items-center gap-3 mb-3",
              children: [/*#__PURE__*/_jsx("div", {
                className: "h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm",
                children: /*#__PURE__*/_jsx(MapPinIcon, {
                  className: "h-4 w-4 text-orange-600"
                })
              }), /*#__PURE__*/_jsx("span", {
                className: "font-bold text-sm text-slate-800 tracking-tight",
                children: "Vibrant Heritage"
              })]
            }), /*#__PURE__*/_jsx("p", {
              className: "text-xs text-slate-500 leading-relaxed font-medium",
              children: "\"Ujjain is not just a city, it's a cosmic center. Our AI ensures your visit aligns with the spiritual vibrations of Mahakal.\""
            })]
          })]
        }), /*#__PURE__*/_jsx("div", {
          className: "flex-1 min-h-[600px] flex flex-col animate-fade-in-up delay-[200ms]",
          children: /*#__PURE__*/_jsxs("div", {
            className: "flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "flex items-center gap-4",
                children: [/*#__PURE__*/_jsx("div", {
                  className: "h-12 w-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200",
                  children: /*#__PURE__*/_jsx(Calendar, {
                    className: "h-6 w-6"
                  })
                }), /*#__PURE__*/_jsxs("div", {
                  children: [/*#__PURE__*/_jsx("h3", {
                    className: "text-lg font-bold text-slate-900 tracking-tight",
                    children: "Divine Itinerary"
                  }), /*#__PURE__*/_jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [/*#__PURE__*/_jsxs("span", {
                      className: "relative flex h-2 w-2",
                      children: [/*#__PURE__*/_jsx("span", {
                        className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                      }), /*#__PURE__*/_jsx("span", {
                        className: "relative inline-flex rounded-full h-2 w-2 bg-green-500"
                      })]
                    }), /*#__PURE__*/_jsx("p", {
                      className: "text-[10px] uppercase tracking-[0.2em] font-black text-slate-400",
                      children: "Personalized Preview"
                    })]
                  })]
                })]
              }), itinerary && /*#__PURE__*/_jsx("button", {
                onClick: () => window.print(),
                className: "flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95",
                children: "Download PDF"
              })]
            }), /*#__PURE__*/_jsx("div", {
              className: "flex-1 overflow-y-auto itinerary-scrollbar p-8 bg-slate-50/30",
              children: /*#__PURE__*/_jsx(ItineraryDisplay, {
                itinerary: itinerary,
                isLoading: isLoading,
                error: error
              })
            })]
          })
        })]
      })
    }), /*#__PURE__*/_jsx(Footer, {})]
  });
}