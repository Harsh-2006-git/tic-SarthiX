import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Ticket,
  Zap,
  Compass,
  BarChart3,
  Video,
  Search,
  Bot
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const HomePage2 = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (heroRef.current) {
            heroRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.4}px, 0) scale(1.1)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (target) => {
    if (target.startsWith("http")) {
      window.location.href = target;
      return;
    }

    const section = document.getElementById(target);
    if (section) {
      const offset = 100; // adjust this value to match your navbar height
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: sectionTop - offset,
        behavior: "smooth",
      });
      return;
    }

    // Otherwise, navigate as usual
    navigate(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const services = [
    {
      title: "Priority Ticketing System",
      description:
        "Book your yatra tickets with priority allocation and time slots",
      icon: <Ticket className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />,
      features: ["Time-slot booking", "VIP priority", "Real-time availability"],
    },
    {
      title: "Urban Mobility & Planning",
      description: "Real-time tracking of crowd density in each zone.",
      icon: <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />,
      features: [
        "Zone-wise Density Monitoring",
        "Smart Alerts & Notifications",
        "RFID-based Entry & Exit",
      ],
    },
    {
      title: "Routes & Maps",
      description:
        "Interactive maps to navigate temples, ghats, and nearby facilities",
      icon: <Compass className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />,
      features: [
        "Temple & ghat navigation",
        "Parking info",
        "Shortest path guidance",
      ],
    },
    {
      title: "Crowd Detection & Alerts",
      description: "Monitor crowd density in temples & ghats for safety",
      icon: <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />,
      features: [
        "Real-time heatmaps",
        "Density alerts",
        "Prevent overcrowding",
      ],
    },
    {
      title: "Live Darshan",
      description: "Watch temple ceremonies from anywhere with HD streaming",
      icon: <Video className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />,
      features: [
        "Multiple camera views",
        "24/7 streaming",
        "Mobile-friendly access",
      ],
    },
    {
      title: "AI-based Lost & Found",
      description:
        "Locate lost items with AI-powered tracking and notifications",
      icon: <Search className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />,
      features: ["Item registration", "AI image matching", "Real-time alerts"],
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 text-gray-800 leading-relaxed font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center lg:justify-start text-white overflow-hidden">
        <div
          ref={heroRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage:
              'url("https://img.freepik.com/premium-photo/indian-historical-temple-painting-watercolor-effect_181203-26134.jpg")',
            transform: "translate3d(0, 0, 0) scale(1.1)",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-orange-900/30 to-black/70 lg:bg-gradient-to-r lg:from-black/60 lg:to-transparent"></div>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-300/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-3 text-center lg:text-left animate-fadeInUp">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent leading-tight">
                Welcome to Divya Yatra
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-lg font-light">
                Begin Your Sacred Journey to the Holy City
              </p>
              <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto lg:mx-0 opacity-90 leading-relaxed">
                Experience divine blessings at Mahakaleshwar Jyotirlinga and immerse
                yourself in centuries of spiritual heritage
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => handleNavigation("/ticket")}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-base transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform"
                >
                  Start Your Journey
                </button>
                <button
                  onClick={() => handleNavigation("darshan")}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-1 transform backdrop-blur-md"
                >
                  Watch Live Darshan
                </button>

              </div>
            </div>

            {/* Right Side Decorative Content (Desktop Only) */}
            <div className="lg:col-span-2 hidden lg:flex justify-end relative items-center">
              <div className="relative w-96 h-96 flex items-center justify-center">
                {/* Decorative Glowing Rings */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute w-full h-full border-2 border-orange-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute w-[80%] h-[80%] border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                {/* Floating Round Logo Centerpiece */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-orange-500/30 shadow-[0_0_50px_rgba(234,88,12,0.3)] bg-transparent">
                    <img src={logo} alt="Divya Yatra Logo" className="w-full h-full object-cover filter brightness-110" />
                  </div>
                  {/* Small line and quote below the logo */}
                  <div className="flex flex-col items-center mt-6 z-30">
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-3 shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
                    <p className="text-xs text-orange-100 font-extrabold tracking-[0.25em] uppercase whitespace-nowrap drop-shadow-md">
                      Faith • Peace • Devotion
                    </p>
                  </div>
                </div>
                {/* Subtle outer glow ring */}
                <div className="absolute inset-0 rounded-full border border-orange-500/20 scale-125 animate-pulse"></div>
              </div>

              {/* Multiple Slowed Orbital Rings */}
              {/* Ring 1 - Outer */}
              <div className="absolute inset-0 animate-[orbit_15s_linear_infinite] flex items-center justify-center pointer-events-none">
                <div className="relative w-96 h-96 border border-white/5 rounded-full flex items-center justify-center">
                  <div className="absolute top-0 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.6)]">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Ring 2 - Middle */}
              <div className="absolute inset-0 animate-[orbit_25s_linear_infinite_reverse] flex items-center justify-center pointer-events-none">
                <div className="relative w-[320px] h-[320px] border border-white/10 rounded-full">
                  <div className="absolute bottom-10 left-10 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                </div>
              </div>

              {/* Ring 3 - Inner */}
              <div className="absolute inset-0 animate-[orbit_20s_linear_infinite] flex items-center justify-center pointer-events-none">
                <div className="relative w-[240px] h-[240px] border border-white/5 rounded-full">
                  <div className="absolute top-1/2 -right-2 w-2 h-2 bg-orange-300 rounded-full"></div>
                </div>
              </div>

              {/* Floating Orbs */}
              <div className="absolute top-0 right-10 w-4 h-4 bg-orange-400 rounded-full blur-sm animate-ping"></div>
              <div className="absolute bottom-10 left-0 w-3 h-3 bg-red-400 rounded-full blur-sm animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        {/* Services Section */}
        <section id="services" className="mb-20 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Our Sacred Services
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete spiritual experience with personalized care and devotion
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group relative bg-white rounded-xl md:rounded-3xl p-3 md:p-6 border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                onClick={() => {
                  if (service.title === "Routes & Maps") {
                    navigate("/map");
                  }
                  if (service.title === "Crowd Detection & Alerts") {
                    navigate("/crowd-detection");
                  }
                  if (service.title === "Live Darshan") {
                    navigate("/live-darshan");
                  }
                  if (service.title === "AI-based Lost & Found") {
                    navigate("/lostFound");
                  }
                  if (service.title === "Priority Ticketing System") {
                    navigate("/ticket");
                  }
                  if (service.title === "Urban Mobility & Planning") {
                    navigate("/dencity");
                  }
                }}
              >
                <div className="flex flex-col md:flex-row items-start gap-3 md:gap-5 mb-3 md:mb-5 font-sans">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-inner">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-xs md:text-xl font-bold text-slate-800 mb-1 group-hover:text-orange-600 transition-colors leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-[10px] md:text-sm text-slate-500 line-clamp-2 leading-relaxed hidden md:block">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2 mt-auto">
                  <div className="grid grid-cols-1 gap-1 md:gap-2">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors"
                      >
                        <div className="w-1 h-1 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 md:pt-4 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Go
                    </span>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-orange-500 group-hover:text-white transition-all text-xs md:text-base">
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section >
        {/* VR Temple Experience Section */}
        <section id="darshan" className="mb-12 lg:mb-20 px-4 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-3 lg:space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Virtual Experience
              </h2>

              <div className="w-16 h-1 lg:w-20 bg-gradient-to-r from-orange-500 to-red-500 mx-auto lg:mx-0 rounded-full"></div>

              <p className="text-xs md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:max-w-none">
                Immerse yourself in the sacred atmosphere of Mahakaleshwar
                Temple from anywhere. Move your phone or drag with
                your mouse to enjoy a{" "}
                <span className="font-semibold text-orange-600">
                  360° divine darshan
                </span>
                as if you are standing inside.
              </p>

              <ul className="space-y-2 lg:space-y-3 text-gray-700 text-xs md:text-base">
                <li className="flex items-center gap-2 lg:gap-3 justify-center lg:justify-start">
                  <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-orange-500 rounded-full"></span>
                  360° Virtual Reality Darshan
                </li>
                <li className="flex items-center gap-2 lg:gap-3 justify-center lg:justify-start">
                  <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-orange-500 rounded-full"></span>
                  Works on Mobile & Desktop
                </li>
                <li className="flex items-center gap-2 lg:gap-3 justify-center lg:justify-start">
                  <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-orange-500 rounded-full"></span>
                  Fullscreen immersive mode supported
                </li>
              </ul>
            </div>

            {/* Right Content - Video */}
            <div className="relative w-full aspect-video rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border-2 lg:border-4 border-orange-100">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/A5YdinFdV54?si=Q5olgTQ7ppu14T5d"
                title="Mahakaleshwar Temple VR Darshan"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; vr"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mb-12 lg:mb-20">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              About Divya Yatra
            </h2>
            <div className="w-16 h-1 lg:w-24 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-10 shadow-lg lg:shadow-xl border border-orange-100">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 text-orange-800">
                Our Mission
              </h3>
              <p className="text-sm lg:text-lg text-gray-700 leading-relaxed mb-6">
                We are dedicated to facilitating meaningful spiritual journeys
                to the sacred city of Ujjain. With over a decade of experience,
                we ensure every devotee experiences the divine grace of
                Mahakaleshwar and the rich cultural heritage of this holy city.
              </p>
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1 lg:mb-2">
                    10+
                  </div>
                  <div className="text-xs lg:text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1 lg:mb-2">
                    50K+
                  </div>
                  <div className="text-xs lg:text-gray-600">Happy Pilgrims</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-6 lg:p-10 shadow-lg lg:shadow-xl">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 text-orange-800">
                Why Choose Us?
              </h3>
              <div className="space-y-3 lg:space-y-4">
                {[
                  "Expert knowledge of temple traditions",
                  "Comfortable and clean accommodations",
                  "24/7 customer support",
                  "Authentic spiritual experiences",
                  "Affordable and transparent pricing",
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 lg:gap-3">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm lg:text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notice Section */}
        <section className="mb-12 lg:mb-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 lg:p-10 text-white text-center shadow-2xl">
            <h2 className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6">🔔 Important Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-left lg:text-center">
                <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">Simhastha Kumbh 2028</h3>
                <p className="text-xs lg:text-base">
                  Book early for the grand spiritual gathering. Limited
                  accommodations available.
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-left lg:text-center">
                <h3 className="text-lg lg:text-xl font-bold mb-2 lg:mb-3">
                  Special Darshan Timings
                </h3>
                <p className="text-xs lg:text-base">
                  Extended hours during Shravan month. Check our live updates
                  for real-time information.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main >

      <Footer />

      {/* AI Chatbot Floating Action Button */}
      <button
        onClick={() => handleNavigation("http://localhost:9002")}
        className="fixed bottom-8 left-8 z-50 group flex items-center justify-center"
        aria-label="AI Travel Planner"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative h-14 w-14 bg-black/60 backdrop-blur-xl border border-white/20 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95">
          <Bot size={28} className="text-indigo-300" />
        </div>
      </button>

      {/* Stylish Floating Live Darshan Button */}
      <button
        onClick={() => handleNavigation("/live-darshan")}
        className="hidden sm:flex fixed bottom-8 right-8 z-50 group items-center"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/20 text-white px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-105 group-active:scale-95">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="relative w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
          </div>
          <span className="text-sm font-black tracking-widest uppercase">Live Darshan</span>
        </div>
      </button>


      {/* Custom Styles */}
      < style jsx > {`
        /* Extra CSS (if not using Tailwind) */
        .floating-bot-btn {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 9999;
          background: #eb651eff;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s ease-in-out;
        }
        .floating-bot-btn img {
          width: 48px;
          height: 48px;
        }
        @media (max-width: 768px) {
          .floating-bot-btn img {
            width: 36px;
            height: 36px;
          }
        }
        .floating-bot-btn:hover {
          transform: scale(1.05);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #ea580c, #dc2626);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style >
    </div >
  );
};

export default HomePage2;
