import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X, Bell } from 'lucide-react';

const AlertBanner = () => {
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        fetchAlerts();
        // Poll every 30 seconds for new alerts
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/v1/admin/alerts/active');
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (err) {
            // Silently fail — alerts are non-critical
        }
    };

    const dismiss = (id) => {
        setDismissed(prev => [...prev, id]);
    };

    const visibleAlerts = alerts.filter(a => !dismissed.includes(a.alert_id));

    if (visibleAlerts.length === 0) return null;

    const getStyle = (severity) => {
        switch (severity) {
            case 'critical':
                return {
                    bg: 'bg-gradient-to-r from-rose-600 to-red-600',
                    icon: AlertCircle,
                    text: 'text-white',
                    close: 'hover:bg-white/20 text-white/70 hover:text-white'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
                    icon: AlertTriangle,
                    text: 'text-white',
                    close: 'hover:bg-white/20 text-white/70 hover:text-white'
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
                    icon: Info,
                    text: 'text-white',
                    close: 'hover:bg-white/20 text-white/70 hover:text-white'
                };
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {visibleAlerts.slice(0, 3).map((alert, idx) => {
                const style = getStyle(alert.severity);
                const Icon = style.icon;
                return (
                    <div key={alert.alert_id}
                        className={`${style.bg} ${style.text} rounded-2xl p-4 shadow-2xl pointer-events-auto animate-in slide-in-from-right fade-in duration-500 border border-white/10`}
                        style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="font-black text-sm truncate">{alert.title}</h4>
                                </div>
                                <p className="text-xs opacity-90 leading-relaxed line-clamp-2">{alert.message}</p>
                                <p className="text-[9px] opacity-60 mt-1 font-bold uppercase tracking-wider">
                                    {new Date(alert.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button onClick={() => dismiss(alert.alert_id)}
                                className={`p-1 rounded-lg ${style.close} transition-all shrink-0`}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AlertBanner;
