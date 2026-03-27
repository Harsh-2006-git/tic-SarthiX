import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Compass, User, LogOut, MapPin, ChevronDown, CreditCard } from "lucide-react";
import GuidePage from "../pages/guide";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

import logo from "../assets/logo.png";

const Header = () => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const guideRef = useRef(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/auth";
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNavigation = (target) => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);

        if (target.startsWith("http")) {
            window.location.href = target;
            return;
        }

        if (target.startsWith("/")) {
            navigate(target);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        if (location.pathname === "/") {
            const section = document.getElementById(target);
            if (section) {
                const offset = 100;
                const sectionTop = section.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: sectionTop - offset,
                    behavior: "smooth",
                });
                return;
            }
        }

        navigate("/#" + target);
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (guideRef.current && !guideRef.current.contains(event.target)) {
                setShowGuide(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { name: "Home", target: "/" },
        { name: "Services", target: "services" },

        { name: "Parking", target: "/parking" },
        { name: "AI Planner", target: "http://localhost:9002" },
        // { name: "Simulation", target: "/crowd-simulation" },
        { name: "Map", target: "/map" },
        { name: "Contact", target: "contact" },
    ];


    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                body { overflow-x: hidden; width: 100%; position: relative; }
            `}} />

            <header
                className={`fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100 transition-all duration-300 ${isScrolled
                    ? "py-2 shadow-md"
                    : "py-3 shadow-sm"
                    }`}
            >
                <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center box-border">

                    {/* Logo & Brand Identity */}
                    <div className="flex items-center flex-shrink-0">
                        <button
                            onClick={() => handleNavigation("/")}
                            className="flex items-center gap-1.5 sm:gap-3 active:scale-95 transition-transform"
                        >
                            <div className="h-11 w-11 sm:h-12 lg:h-14 lg:w-14 rounded-full overflow-hidden flex items-center justify-center border-2 border-orange-50 bg-white shadow-sm flex-shrink-0">
                                {!imgError ? (
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className="h-full w-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="text-xl sm:text-2xl lg:text-4xl text-orange-600 font-bold">🕉</div>
                                )}
                            </div>
                            <span className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-700 whitespace-nowrap">
                                Divya<span className="text-orange-600">Yatra</span>
                            </span>
                        </button>
                    </div>

                    {/* Center Desktop Nav */}
                    <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item.target)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${(location.pathname === item.target || (location.pathname === '/' && location.hash === `#${item.target}`))
                                    ? "bg-white text-orange-600 shadow-sm"
                                    : "text-slate-500 hover:text-orange-600 hover:bg-white/50"
                                    }`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </nav>

                    {/* Right Side: Identity Box & Action */}
                    <div className="flex items-center gap-1.5 sm:gap-6 flex-shrink-0">

                        {/* Profile Dropdown */}
                        <div className="relative group/profile">
                            <button
                                onClick={() => {
                                    if (window.innerWidth < 1280) {
                                        setIsProfileOpen(!isProfileOpen);
                                    }
                                }}
                                className="flex items-center gap-2 sm:gap-3 pl-1 pr-1 lg:pr-5 py-1 rounded-full border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all active:scale-95 xl:group-hover/profile:border-orange-500"
                            >
                                <div className="h-10 w-10 sm:h-11 rounded-full overflow-hidden border-2 border-orange-50 bg-orange-100 flex-shrink-0">
                                    {user?.profile_image || user?.photo ? (
                                        <img
                                            src={user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:3001${user.profile_image}`) : user.photo}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-600 text-sm sm:text-lg font-bold">
                                            {user?.name?.[0]?.toUpperCase() || "Y"}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase leading-none mb-1">Pass Holder</span>
                                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                                        {user?.name || "Guest Devotee"}
                                    </span>
                                </div>
                                <ChevronDown size={14} className="hidden lg:block text-slate-400 xl:group-hover/profile:rotate-180 transition-transform" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 top-full pt-2 w-56 transition-all duration-300 z-50 transform 
                                ${isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
                                xl:group-hover/profile:opacity-100 xl:group-hover/profile:visible xl:group-hover/profile:translate-y-0
                            `}>
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                    <div className="p-3 bg-slate-50 border-b border-gray-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 pr-1 flex justify-between">
                                            <span>Account</span>
                                            <button onClick={() => setIsProfileOpen(false)} className="xl:hidden"><X size={12} /></button>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-base">
                                                {user?.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Devotee"}</p>
                                                <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email || "ujjain.yatra@auth"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-1.5 bg-white space-y-0.5">
                                        <button
                                            onClick={() => handleNavigation("/profile")}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold text-xs transition-all"
                                        >
                                            <User size={16} className="text-slate-400" />
                                            My Profile
                                        </button>
                                        <button
                                            onClick={() => setShowGuide(!showGuide)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold text-xs transition-all"
                                        >
                                            <Compass size={16} className="text-slate-400" />
                                            Navigator
                                        </button>
                                        <div className="pt-1.5 mt-1.5 border-t border-slate-50">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold text-xs transition-all"
                                            >
                                                <LogOut size={16} />
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Action Button */}
                        <button
                            onClick={() => handleNavigation("/ticket")}
                            className="hidden xl:flex bg-slate-900 hover:bg-orange-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                        >
                            Book Tickets
                        </button>

                        {/* Mobile Hamburger (Only visible below XL) */}
                        <button
                            onClick={toggleMenu}
                            className="xl:hidden p-2 rounded-full border border-gray-100 bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-75 flex-shrink-0"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar (Fixed Right Side) */}
                <div className={`xl:hidden fixed inset-0 z-[60] transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>

                    {/* Sidebar Content (From Right) */}
                    <div className={`absolute right-0 top-0 bottom-0 w-[280px] xs:w-80 bg-white shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex flex-col h-full bg-white">
                            {/* Sidebar Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center border border-orange-100 flex-shrink-0">
                                        {!imgError ? (
                                            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-lg text-orange-600 font-bold">🕉</div>
                                        )}
                                    </div>
                                    <span className="text-lg font-bold tracking-tight text-slate-700">Divya<span className="text-orange-600">Yatra</span></span>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-orange-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Sidebar Nav Links */}
                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Spiritual Navigation</p>
                                {navItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => handleNavigation(item.target)}
                                        className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-orange-50 group transition-all"
                                    >
                                        <span className="font-bold text-slate-800 group-hover:text-orange-600">{item.name}</span>
                                        <Compass size={18} className="text-slate-200 group-hover:text-orange-500 transition-colors" />
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleNavigation("/ticket")}
                                    className="w-full mt-4 bg-orange-600 text-white p-4 rounded-2xl font-black flex items-center justify-between shadow-lg shadow-orange-500/20 active:scale-95"
                                >
                                    <span>BOOK TICKETS</span>
                                    <CreditCard size={18} />
                                </button>
                            </nav>

                            {/* Sidebar Bottom (Profile & Logout) */}
                            <div className="p-6 border-t border-gray-100 bg-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Settings</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleNavigation("/profile")}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-orange-500 transition-all text-left"
                                    >
                                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-orange-50 bg-orange-100 flex-shrink-0">
                                            {user?.profile_image || user?.photo ? (
                                                <img
                                                    src={user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:3001${user.profile_image}`) : user.photo}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-600 text-sm font-bold">
                                                    {user?.name?.[0]?.toUpperCase() || "Y"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "Guest"}</p>
                                            <p className="text-[11px] text-slate-500">View Profile Dashboard</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-all"
                                    >
                                        <LogOut size={16} />
                                        Logout Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Guide Box (Universal) */}
            {showGuide && (
                <div
                    ref={guideRef}
                    className="fixed top-24 right-4 sm:right-10 z-[70] w-[calc(100%-2rem)] sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                >
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Compass className="text-orange-500" size={18} />
                            <span className="font-black uppercase tracking-widest text-xs">Yatra Support</span>
                        </div>
                        <button onClick={() => setShowGuide(false)} className="hover:text-orange-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-slate-50 p-2 hide-scrollbar">
                        <GuidePage />
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
