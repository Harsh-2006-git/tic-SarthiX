import React, { useState, useEffect } from 'react';
import {
    Users,
    Activity,
    Package,
    Ticket,
    Monitor,
    Settings,
    BarChart3,
    ArrowUpRight,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    ChevronRight,
    ShieldCheck,
    Zap,
    LayoutDashboard
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeTickets: 0,
        reportedItems: 0,
        crowdAlerts: 0,
        revenue: '₹0.0L'
    });

    const [users, setUsers] = useState([]);
    const [lostItems, setLostItems] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [zoneData, setZoneData] = useState([]);

    const BACKEND_URL = 'http://localhost:3001/api/v1/admin';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // Fetch Stats
            const statsRes = await fetch(`${BACKEND_URL}/stats`, { headers });
            const statsJson = await statsRes.json();
            setStats({
                totalUsers: statsJson.totalUsers,
                activeTickets: statsJson.totalTickets,
                reportedItems: statsJson.totalLostItems,
                crowdAlerts: 0,
                revenue: statsJson.revenue
            });

            // Fetch Users
            const usersRes = await fetch(`${BACKEND_URL}/users`, { headers });
            setUsers(await usersRes.json());

            // Fetch Lost Items
            const lostRes = await fetch(`${BACKEND_URL}/lostfound`, { headers });
            setLostItems(await lostRes.json());

            // Fetch Tickets/Bookings
            const ticketsRes = await fetch(`${BACKEND_URL}/tickets`, { headers });
            setBookings(await ticketsRes.json());

            // Fetch Density
            const densityRes = await fetch(`${BACKEND_URL}/density`, { headers });
            setZoneData(await densityRes.json());

        } catch (error) {
            console.error("Master Console Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        // If the path doesn't already contain /uploads/ and isn't a direct filename that should be in uploads
        // Note: lostFoundController stores just filename, while authController stores /uploads/filename
        if (!normalizedPath.startsWith('/uploads/')) {
            return `http://localhost:3001/uploads${normalizedPath}`;
        }
        return `http://localhost:3001${normalizedPath}`;
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Devotees', icon: Users },
        { id: 'crowd', label: 'Flow & Crowd', icon: Activity },
        { id: 'lostfound', label: 'Lost & Found', icon: Package },
        { id: 'bookings', label: 'Bookings', icon: Ticket },
        { id: 'signage', label: 'Digital Board', icon: Monitor }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800">
            <Header />

            <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-slate-900 text-white p-2 rounded-xl">
                                <ShieldCheck size={24} />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic">
                                Master <span className="text-orange-600">Console</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium">Control Center for Ujjain Smart Pilgrim Management</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" /> System Live
                        </button>
                        <button className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center gap-2">
                            <Zap size={16} /> Force Update
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-3 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-xl translate-x-2'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <tab.icon size={20} className={activeTab === tab.id ? 'text-orange-400' : ''} />
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                            </button>
                        ))}

                        <div className="mt-10 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">Security Audit</h4>
                                <p className="text-xs text-slate-400 mb-4">Last scan completed 12 mins ago. No threats detected.</p>
                                <button className="w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">View Logs</button>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40">
                                <div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with AI Core...</p>
                            </div>
                        ) : activeTab === 'overview' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                                    {[
                                        { label: 'Total Devotees', val: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Active Bookings', val: stats.activeTickets, icon: Ticket, color: 'text-orange-600', bg: 'bg-orange-50' },
                                        { label: 'Cloud Density', val: 'Low', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Net Revenue', val: stats.revenue, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' }
                                    ].map((s, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                                            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                <s.icon size={20} />
                                            </div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                                            <h3 className="text-2xl font-black text-slate-800">{s.val}</h3>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Charts/Tables Placeholder */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-xl font-bold">Flow Distribution</h3>
                                            <button className="text-xs font-bold text-orange-600 hover:underline">Full Map</button>
                                        </div>
                                        <div className="space-y-6">
                                            {[
                                                { zone: 'Main Sanctum', count: 420, cap: 500, color: 'bg-orange-500' },
                                                { zone: 'Nandi Hall', count: 180, cap: 300, color: 'bg-blue-500' },
                                                { zone: 'Mahakal Corridor', count: 1200, cap: 5000, color: 'bg-emerald-500' },
                                                { zone: 'Outer Entry', count: 85, cap: 200, color: 'bg-purple-500' }
                                            ].map((z, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-slate-600">{z.zone}</span>
                                                        <span className="text-slate-400">{z.count} / {z.cap}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                                        <div className={`h-full ${z.color} transition-all duration-1000`} style={{ width: `${(z.count / z.cap) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-xl font-bold">Live Activity Log</h3>
                                            <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase">{lostItems.length} Recent Events</span>
                                        </div>
                                        <div className="space-y-4">
                                            {lostItems.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className={`p-4 ${item.status === 'found' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'} border rounded-2xl flex gap-4 animate-in fade-in slide-in-from-right duration-500`} style={{ animationDelay: `${idx * 150}ms` }}>
                                                    <div className={`w-10 h-10 ${item.status === 'found' ? 'bg-emerald-500' : 'bg-orange-500'} text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                                                        {item.status === 'found' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${item.status === 'found' ? 'text-emerald-900' : 'text-orange-900'} leading-tight capitalize`}>New {item.status} Item: {item.title}</p>
                                                        <p className={`text-xs ${item.status === 'found' ? 'text-emerald-600' : 'text-orange-600'} mt-1 truncate max-w-[200px]`}>{item.description || 'No description provided.'}</p>
                                                    </div>
                                                    <span className="ml-auto text-[10px] font-bold text-slate-400">{new Date(item.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ))}
                                            {lostItems.length === 0 && (
                                                <div className="py-10 text-center text-slate-400 text-sm">No recent activity logged.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <h3 className="text-2xl font-black">All Devotees</h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="Search by name or ID..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-orange-500 outline-none w-64 shadow-sm" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <th className="px-8 py-5">Devotee</th>
                                                <th className="px-8 py-5">Category</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Entry Time</th>
                                                <th className="px-8 py-5">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {users.map(u => (
                                                <tr key={u.client_id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm">
                                                                {u.profile_image ? (
                                                                    <img
                                                                        src={getImageUrl(u.profile_image)}
                                                                        alt={u.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                                        {u.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{u.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-mono">ID-{u.client_id.toString().padStart(6, '0')}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.userType === 'Premium' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                                            {u.userType}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            <span className="text-xs font-bold text-slate-600">Registered</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="px-8 py-5">
                                                        <button className="p-2 hover:bg-white rounded-lg text-slate-300 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'signage' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center mb-6">
                                        <Monitor size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 tracking-tight">Main Gateway Signage</h3>
                                    <p className="text-slate-500 text-sm mb-8">Current active board: <strong>Safety & Density Alerts</strong></p>

                                    <div className="w-full space-y-3">
                                        <button className="w-full py-4 bg-orange-50 text-orange-700 rounded-2xl font-bold flex items-center justify-center gap-3">
                                            Push Crowd Alert Board
                                        </button>
                                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3">
                                            Show Route Guidance
                                        </button>
                                        <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-3">
                                            Emergency Evacuation Mode
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative flex flex-col">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Live Preview
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Board #04</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-slate-800 rounded-[2rem] p-6 bg-slate-950/50">
                                        <h2 className="text-3xl font-black text-white text-center mb-4 leading-tight italic">
                                            SANCTUM <span className="text-orange-500 underline decoration-4 underline-offset-8 font-serif">DARSHAN</span> OPEN
                                        </h2>
                                        <div className="grid grid-cols-2 gap-4 w-full mt-6">
                                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Queue Time</p>
                                                <p className="text-xl font-bold text-orange-400">12 MINS</p>
                                            </div>
                                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Density</p>
                                                <p className="text-xl font-bold text-emerald-400 italic">LIGHT</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Hardware ID: OREO-DISPLAY-01-V2</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lostfound' && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <h3 className="text-2xl font-black">Lost & Found Repository</h3>
                                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                        <Search size={14} /> Filter Reports
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <th className="px-8 py-5">Item Preview</th>
                                                <th className="px-8 py-5">Title & Desc</th>
                                                <th className="px-8 py-5">Contact Details</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Reported At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-sm">
                                            {lostItems.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        {item.image ? (
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                                                                <img
                                                                    src={getImageUrl(item.image)}
                                                                    alt="Item"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                                                <Package size={24} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-slate-800">{item.title}</p>
                                                        <p className="text-xs text-slate-400 line-clamp-1 italic">{item.description || 'No description'}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-500">
                                                        <p className="text-sm font-bold">{item.reportedByPhone}</p>
                                                        <p className="text-[10px] opacity-60 italic">{item.reportedByEmail}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${item.status === 'found' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-400 font-medium">
                                                        {new Date(item.uploadedAt).toLocaleDateString()}<br />
                                                        {new Date(item.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <h3 className="text-2xl font-black">Ticket Bookings</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <th className="px-8 py-5">Ticket ID</th>
                                                <th className="px-8 py-5">Devotee</th>
                                                <th className="px-8 py-5">Date / Time</th>
                                                <th className="px-8 py-5">Tickets</th>
                                                <th className="px-8 py-5">Temple</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-sm">
                                            {bookings.map(b => (
                                                <tr key={b.ticket_id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-5 font-mono font-bold text-orange-600">#{b.ticket_id}</td>
                                                    <td className="px-8 py-5 font-bold text-slate-800">{b.Client?.name || 'Unknown'}</td>
                                                    <td className="px-8 py-5 text-slate-500">{b.date} | {b.time}</td>
                                                    <td className="px-8 py-5 font-black">{b.no_of_tickets}</td>
                                                    <td className="px-8 py-5 text-slate-400">{b.temple}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'crowd' && (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <h3 className="text-2xl font-black">Zone Capacity Monitoring</h3>
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {zoneData.map((zone, idx) => (
                                        <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-black text-slate-900">Zone #{zone.zone_id}</h4>
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${zone.count > 10 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {zone.count > 10 ? 'High' : 'Optimal'}
                                                </span>
                                            </div>
                                            <div className="text-4xl font-black text-orange-600 mb-2">{zone.count}</div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Devotees</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AdminPage;
