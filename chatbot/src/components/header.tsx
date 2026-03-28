'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, Compass, User, LogOut, MapPin, ChevronDown, CreditCard, Shield, Crown, Star } from "lucide-react";

const Header = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [imgError, setImgError] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const guideRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);


    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Home", target: "http://localhost:5173/" },
        { name: "Services", target: "http://localhost:5173/#services" },
        { name: "Parking", target: "http://localhost:5173/parking" },
        { name: "AI Planner", target: "/", internal: true },
        { name: "Map", target: "http://localhost:5173/map" },
        { name: "Contact", target: "http://localhost:5173/#contact" },
    ];

    const getDevoteeIcon = (level: string) => {
        // According to screenshot, the icon is orange shield or small dot
        return <Shield size={10} className="text-orange-500" />;
    };

    const logo = "/logo.png";

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 transition-all duration-300 ${isScrolled ? "py-2 shadow-md" : "py-3 shadow-sm"}`}
        >
            <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center box-border">
                {/* Logo & Brand Identity */}
                <div className="flex items-center flex-shrink-0">
                    <Link href="http://localhost:5173/" className="flex items-center gap-1 sm:gap-2 active:scale-95 transition-transform">
                        <div className="h-10 w-10 sm:h-12 lg:h-14 lg:w-14 rounded-full overflow-hidden flex items-center justify-center border border-gray-100 bg-white shadow-sm flex-shrink-0">
                            {!imgError ? (
                                <img src={logo} alt="Logo" className="h-full w-full object-cover" onError={() => setImgError(true)} />
                            ) : (
                                <div className="text-xl sm:text-2xl lg:text-4xl text-orange-600 font-bold">🕉</div>
                            )}
                        </div>
                        <span className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 whitespace-nowrap">
                            Divya<span className="text-orange-600">Yatra</span>
                        </span>
                    </Link>
                </div>

                {/* Center Desktop Nav */}
                <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
                    {navItems.map((item) => (
                        item.internal ? (
                            <Link key={item.name} href={item.target} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${pathname === item.target ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-orange-600 hover:bg-white/50"}`}>
                                {item.name}
                            </Link>
                        ) : (
                            <a key={item.name} href={item.target} className="px-5 py-2 rounded-xl text-sm font-bold transition-all text-slate-500 hover:text-orange-600 hover:bg-white/50">
                                {item.name}
                            </a>
                        )
                    ))}
                </nav>

                {/* Right Side: Identity Box & Action */}
                {/* Right Side Elements */}
                <div className="flex items-center gap-1.5 sm:gap-6 flex-shrink-0">
                    {/* Desktop Action Button */}
                    <a href="http://localhost:5173/ticket" className="hidden xl:flex bg-[#0f172a] hover:bg-orange-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 leading-none h-[42px] flex items-center">
                        Book Tickets
                    </a>

                    {/* Mobile Hamburger */}
                    <button onClick={toggleMenu} className="xl:hidden p-2 rounded-full border border-gray-100 bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-75 flex-shrink-0">
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`xl:hidden fixed inset-0 z-[60] transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`absolute right-0 top-0 bottom-0 w-[280px] xs:w-80 bg-white shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center border border-orange-100 flex-shrink-0">
                                    <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                                </div>
                                <span className="text-lg font-bold tracking-tight text-slate-800">Divya<span className="text-orange-600">Yatra</span></span>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-orange-600">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Spiritual Navigation</p>
                            {navItems.map((item) => (
                                item.internal ? (
                                    <Link key={item.name} href={item.target} onClick={() => setIsMenuOpen(false)} className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-orange-50 group transition-all">
                                        <span className="font-bold text-slate-800 group-hover:text-orange-600">{item.name}</span>
                                        <Compass size={18} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                                    </Link>
                                ) : (
                                    <a key={item.name} href={item.target} className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-orange-50 group transition-all">
                                        <span className="font-bold text-slate-800 group-hover:text-orange-600">{item.name}</span>
                                        <Compass size={18} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                                    </a>
                                )
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
