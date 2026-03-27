import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  Orbit,
  Activity,
  ShieldCheck,
  XCircle,
  LayoutDashboard
} from "lucide-react";
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Auth = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("initial"); // initial, registering
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    userType: "Civilian",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Mahakaleshwar",
      subtitle: "The Eternal Light",
      description: "Witness the divine Bhasma Aarti and connect with the cosmic energy of Lord Shiva.",
      accent: "#f97316",
      image: "https://tse1.mm.bing.net/th/id/OIP.Bw-3Z-3hOTRsZwLlHBtitQHaNK?w=900&h=1600&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      title: "Shipra Banks",
      subtitle: "Flow of Grace",
      description: "Where the sacred river washes away worldly ties, inviting spiritual purification.",
      accent: "#3b82f6",
      image: "https://tse3.mm.bing.net/th/id/OIP.GuZnKQM0tx7ajnUAPZMjRwHaFB?w=560&h=380&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const response = await fetch("http://localhost:3001/api/v1/auth/profile", {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setIsAuthenticated(true);
        navigate("/");
      } else if (response.status === 404 || response.status === 401) {
        setFormData({
          name: user.displayName || "",
          email: user.email || "",
          phone: "",
          userType: "Civilian",
        });
        setStep("registering");
      } else {
        throw new Error("Divine connection lost");
      }
    } catch (error) {
      console.error(error);
      setMessage("Service temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0c] overflow-hidden font-['Outfit'] select-none">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Static Image Underlay for Flash Pre-render */}
        <img 
          src={slides[currentSlide].image} 
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-105 transition-all duration-[2000ms]"
          alt=""
        />
        
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0c]/90 via-[#0a0a0c]/60 to-[#0a0a0c]/90"></div>
      </div>

      {/* Main Glass Container */}
      <div className="relative w-full max-w-7xl h-[85vh] mx-4 md:mx-12 rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex animate-in fade-in zoom-in-95 duration-700">
        
        {/* Left Section: Immersive Visuals */}
        <div className="hidden lg:flex w-1/2 relative h-full flex-col p-12 justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center rotate-3 border border-orange-400/30">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Divya Yatra</span>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-[2px] bg-orange-500"></div>
                <p className="text-orange-500 font-black uppercase text-[10px] tracking-[0.4em]">Spirituality Meets Smart Tech</p>
              </div>
              <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tighter">
                Discover the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-orange-400">
                  Divine Realm
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed pt-2">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
             <div className="flex gap-4">
                {slides.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-12 bg-orange-500' : 'w-3 bg-white/20'}`}></div>
                ))}
             </div>
             <div className="flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Activity size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Live Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Secured Portal</span>
                </div>
             </div>
          </div>

          {/* Abstract Geometric Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full opacity-30 pointer-events-none">
            <Orbit className="w-full h-full text-white/5 animate-slow-spin" />
          </div>
        </div>

        {/* Right Section: Interactive Portal */}
        <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-8 lg:p-20 relative bg-white/[0.02] border-l border-white/5">
          
          <div className="w-full max-w-sm space-y-10">
            {/* Header Content */}
            <div className="text-center lg:text-left space-y-3">
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                {step === "initial" ? "Divine Entry" : "Sacred Protocol"}
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                {step === "initial" 
                  ? "Access the ultimate pilgrim assistant platform with one click." 
                  : "Complete your identity to join the spiritual network."}
              </p>
            </div>

            {/* Auth Actions */}
            <div className="space-y-6">
              {step === "initial" ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full group relative flex items-center justify-center h-16 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-300 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-slate-200 border-t-orange-600 rounded-full animate-spin"></div>
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Connecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <GoogleIcon />
                        <span className="text-[#1a1a1c] font-black text-lg">Continue with Google</span>
                      </div>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-4 py-4">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Access</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold transition-all gap-2">
                       <User size={18} className="text-orange-500" /> Administrative
                    </button>
                    <button className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white font-bold transition-all gap-2">
                       <LayoutDashboard size={18} className="text-blue-500" /> Dashboards
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        readOnly
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-14 pr-6 text-white font-bold outline-none cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-14 pr-6 text-white font-bold outline-none cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div className="relative group">
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500 group-focus-within:scale-110 transition-transform">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        autoFocus
                        className="w-full bg-white/10 border border-white/20 focus:border-orange-500/50 rounded-2xl h-16 pl-14 pr-6 text-white font-bold outline-none transition-all placeholder:text-slate-600 focus:bg-white/[0.15] text-lg"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      setIsLoading(true);
                      try {
                        const response = await fetch("http://localhost:3001/api/v1/auth/register", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...formData, password: 'firebase_auth' }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                          localStorage.setItem("user", JSON.stringify(data.user));
                          localStorage.setItem("token", data.token);
                          setIsAuthenticated(true);
                          navigate("/");
                        } else { setMessage(data.message); }
                      } catch (err) { setMessage("An error occurred. Please try again."); }
                      finally { setIsLoading(false); }
                    }}
                    className="w-full h-16 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    Enter the Sanctum
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setStep("initial")}
                    className="w-full text-center text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em] pt-4"
                  >
                    Cancel Registration
                  </button>
                </form>
              )}

              {message && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold animate-in bounce-in duration-300">
                  <XCircle size={18} />
                  {message}
                </div>
              )}
            </div>

            {/* Footer Attributes */}
            <div className="pt-10 flex flex-col items-center lg:items-start opacity-40">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Master Server Online</span>
               </div>
               <p className="text-white text-[9px] font-medium tracking-tight">© 2026 Divya Yatra | Smart Pilgrim Assistant Ecosystem</p>
            </div>
          </div>

          {/* Glowing Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 blur-[60px]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 blur-[60px]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 30s linear infinite;
        }
        ::-webkit-scrollbar {
          width: 0;
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Auth;