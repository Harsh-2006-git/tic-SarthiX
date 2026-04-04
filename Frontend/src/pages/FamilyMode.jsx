import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import {
  Shield, Users, Navigation, MapPin,
  LocateFixed, Activity, AlertTriangle, XCircle,
  CheckCircle2, Sparkles, ChevronRight, UserCheck,
  Bell, UserPlus, ArrowLeft, RefreshCw, Radio, Route
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSocket } from '../context/SocketContext';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v1';

/* ─────── tiny helpers ─────── */
const speak = (msg) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 1.1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }
};

const playAlarm = () => {
  try {
    const a = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3');
    a.volume = 1;
    a.play().catch(() => {});
  } catch (_) {}
};

/* ─────── COMPONENT ─────── */
const FamilyMode = () => {
  const {
    sendLocation, triggerSOS, startTracking, stopTracking,
    activeTrackingSesssion, lastLocation, sosAlerts
  } = useSocket();

  /* refs */
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeRef = useRef(null);        // suggested route (orange)
  const rescueRouteRef = useRef(null);   // rescue route (red)
  const watchRef = useRef(null);
  const srcMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const liveMarkerRef = useRef(null);
  const guardianMarkerRef = useRef(null);
  const trailPolyRef = useRef(null);     // actual trail (blue dots)
  const trailPointsRef = useRef([]);

  /* state */
  const [role, setRoleState] = useState(localStorage.getItem('family_role') || null);
  const setRole = (val) => {
    setRoleState(val);
    if (val) localStorage.setItem('family_role', val);
    else localStorage.removeItem('family_role');
  };
  const [status, setStatus] = useState('');

  // pilgrim
  const [guardians, setGuardians] = useState([]);
  const [selectedGuardian, setSelectedGuardian] = useState('');
  const [startInput, setStartInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [srcPos, setSrcPos] = useState(null);      // selected start
  const [fixedSrcPos, setFixedSrcPos] = useState(null); // locked start
  const [destPos, setDestPos] = useState(null);    // selected dest
  const [livePos, setLivePos] = useState(null);    // current GPS
  const [tracking, setTracking] = useState(false);
  const [tempPin, setTempPin] = useState(null);
  const [routeLocked, setRouteLocked] = useState(false);

  // trip stats
  const [tripStats, setTripStats] = useState({
    distance: 0, // meters
    eta: 0,      // minutes
    speed: 0     // km/h
  });

  // guardian
  const [protégés, setProtégés] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedProtégé, setSelectedProtégé] = useState(null);
  const [protégePos, setProtégePos] = useState(null);
  const [guardianPos, setGuardianPos] = useState(null);
  const [sosActive, setSosActive] = useState(false);

  /* ─── Data Fetching ─── */
  const fetchGuardians = async () => {
    try {
      const t = localStorage.getItem('token');
      const r = await axios.get(`${API_URL}/location/my-guardians`, { headers: { Authorization: `Bearer ${t}` } });
      setGuardians(r.data.filter(g => g.is_approved));
    } catch (_) {}
  };

  const fetchProtégés = async () => {
    try {
      const t = localStorage.getItem('token');
      const r = await axios.get(`${API_URL}/location/tracking-list`, { headers: { Authorization: `Bearer ${t}` } });
      setProtégés(r.data);
    } catch (_) {}
  };

  const fetchPending = async () => {
    try {
      const t = localStorage.getItem('token');
      const r = await axios.get(`${API_URL}/location/pending-requests`, { headers: { Authorization: `Bearer ${t}` } });
      setPending(r.data);
    } catch (_) {}
  };

  const approve = async (userId) => {
    try {
      const t = localStorage.getItem('token');
      await axios.post(`${API_URL}/location/approve`, { userId }, { headers: { Authorization: `Bearer ${t}` } });
      fetchPending();
      fetchProtégés();
      setStatus('Association approved ✓');
    } catch (_) {
      setStatus('Approval failed');
    }
  };

  /* ─── Map Init ─── */
  const initMap = useCallback(() => {
    if (mapInstance.current || !mapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([23.1765, 75.7849], 14);
    
    if (role === 'pilgrim') {
      // Standard Leaflet Tiles for Pilgrim (Lightweight)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
    } else {
      // Google Maps Style Tiles for Guardian
      const streets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);
      const satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      });
      L.control.layers({ "Streets": streets, "Satellite": satellite }, null, { position: 'bottomright' }).addTo(map);
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstance.current = map;

    // click-to-set-destination (pilgrim only)
    map.on('click', (e) => {
      // only allow in pilgrim mode and not currently tracking
      if (role !== 'pilgrim') return;
      const { lat, lng } = e.latlng;
      setTempPin({ lat, lng });

      if (window._tempMarker) map.removeLayer(window._tempMarker);
      window._tempMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:#6366f1;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(99,102,241,.5);animation:pulse 1.5s infinite">🎯</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14]
        })
      }).addTo(map);
      setStatus('Tap "Set Destination" to confirm this pin.');
    });
  }, [role]);

  /* ─── Role change setup ─── */
  useEffect(() => {
    if (!role) return;

    // small delay so DOM is ready for map container
    const t = setTimeout(() => {
      initMap();
      if (role === 'pilgrim') {
        fetchGuardians();
      } else {
        fetchProtégés();
        fetchPending();
        // Prime speechSynthesis with user gesture (required by browsers)
        if ('speechSynthesis' in window) {
          const primer = new SpeechSynthesisUtterance('');
          primer.volume = 0;
          window.speechSynthesis.speak(primer);
        }
        getMyLocation((pos) => {
          setGuardianPos(pos);
          // Guardian marker removed to avoid confusion with Indore
        });
      }
    }, 150);

    return () => {
      clearTimeout(t);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
      // cleanup markers
      srcMarkerRef.current = null;
      destMarkerRef.current = null;
      liveMarkerRef.current = null;
      guardianMarkerRef.current = null;
      trailPolyRef.current = null;
      trailPointsRef.current = [];
      routeRef.current = null;
      rescueRouteRef.current = null;
      window._tempMarker = null;
    };
  }, [role]);

  /* ─── GUARDIAN: React to incoming live location ─── */
  useEffect(() => {
    if (role !== 'guardian' || !lastLocation) return;
    const uid = lastLocation.userId;

    // If we already selected someone and this isn't them, skip
    if (selectedProtégé && uid !== selectedProtégé) return;

    // Auto-select: accept ANY incoming location if no one is selected yet
    if (!selectedProtégé) {
      setSelectedProtégé(uid);
    }

    const pos = [lastLocation.lat, lastLocation.lng];
    setProtégePos(pos);

    if (!mapInstance.current) return;

    // update / create marker
    const gpos = [lastLocation.lat, lastLocation.lng];
    if (liveMarkerRef.current) {
      liveMarkerRef.current.setLatLng(gpos);
    } else {
      addMarker(gpos, '#f43f5e', '📍', 'live');
    }
    setLivePos(gpos);
  }, [lastLocation, role, selectedProtégé]);

  /* ─── GUARDIAN: React to tracking-started event ─── */
  useEffect(() => {
    if (role !== 'guardian' || !activeTrackingSesssion) return;
    const { userId, userName, src, dest } = activeTrackingSesssion;
    setSelectedProtégé(userId);
    setStatus(`🟢 ${userName} is now being tracked live.`);
    speak(`Alert! ${userName} has started a tracking session.`);
    playAlarm();

    // draw their planned route on the map
    if (mapInstance.current && src && dest) {
      drawRoute(
        [src.lat, src.lng],
        [dest.lat, dest.lng],
        '#f97316', 6, true, 'suggested'
      );
      // Add start and end pins for guardian context
      addMarker([src.lat, src.lng], '#f97316', '📍', 'src');
      addMarker([dest.lat, dest.lng], '#2563eb', '🏁', 'dest');
      // Set view to the pilgrims starting point/route
      mapInstance.current.setView([src.lat, src.lng], 14);
    }
  }, [activeTrackingSesssion, role]);

  /* ─── GUARDIAN: React to SOS ─── */
  useEffect(() => {
    if (role !== 'guardian') return;
    const relevant = sosAlerts.find(a => a.userId === selectedProtégé);
    if (relevant && !sosActive) {
      setSosActive(true);
      const ppos = [relevant.lat, relevant.lng];
      setProtégePos(ppos);
      setStatus(`🚨 SOS from ${relevant.userName}! Immediate action required.`);
      speak('Emergency! SOS alert received. Immediate action required.');
      playAlarm();

      // AUTO-DRAW RESCUE ROUTE (Fixed points mission)
      if (mapInstance.current && guardianPos) {
        drawRoute(guardianPos, ppos, '#ef4444', 8, true, 'rescue');
      }
    }
  }, [sosAlerts, selectedProtégé, role, guardianPos]);

  /* ─── PILGRIM: Draw route when both src & dest set ─── */
  useEffect(() => {
    if (role !== 'pilgrim' || !srcPos || !destPos || !mapInstance.current) return;
    drawRoute([srcPos.lat, srcPos.lng], [destPos.lat, destPos.lng], '#f97316', 6, true, 'suggested');
  }, [srcPos, destPos]);

  /* ─── Map Helpers ─── */
  const getMyLocation = (cb, retries = 3) => {
    const attempt = (n) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const { latitude, longitude, accuracy } = p.coords;
          console.log(`GPS attempt ${4-n}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | accuracy: ${accuracy.toFixed(0)}m`);
          if (accuracy > 200 && n > 1) {
            setStatus(`Low accuracy (${accuracy.toFixed(0)}m), retrying…`);
            setTimeout(() => attempt(n - 1), 800);
          } else {
            cb([latitude, longitude], accuracy);
          }
        },
        (err) => {
          if (n > 1) {
            setTimeout(() => attempt(n - 1), 500);
          } else {
            setStatus(err.code === 1 ? 'GPS permission denied. Allow location in browser settings.' : 'GPS unavailable. Are you indoors?');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    };
    attempt(retries);
  };

  const addMarker = (pos, color, emoji, type) => {
    if (!mapInstance.current) return;
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:${color};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 15px ${color}80">${emoji}</div>`,
      iconSize: [36, 36], iconAnchor: [18, 18]
    });
    const m = L.marker(pos, { icon }).addTo(mapInstance.current);
    if (type === 'src') {
      if (srcMarkerRef.current) mapInstance.current.removeLayer(srcMarkerRef.current);
      srcMarkerRef.current = m;
    }
    if (type === 'dest') {
      if (destMarkerRef.current) mapInstance.current.removeLayer(destMarkerRef.current);
      destMarkerRef.current = m;
    }
    if (type === 'live') {
      if (liveMarkerRef.current) mapInstance.current.removeLayer(liveMarkerRef.current);
      liveMarkerRef.current = m;
    }
    return m;
  };

  const drawRoute = (from, to, color, weight, fit, tag) => {
    if (!mapInstance.current) return;
    // remove old
    if (tag === 'suggested' && routeRef.current) {
      mapInstance.current.removeControl(routeRef.current);
      routeRef.current = null;
    }
    if (tag === 'rescue' && rescueRouteRef.current) {
      mapInstance.current.removeControl(rescueRouteRef.current);
      rescueRouteRef.current = null;
    }

    const ctrl = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: { styles: [{ color, opacity: 0.85, weight }] },
      createMarker: () => null,
      addWaypoints: false,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      draggableWaypoints: false,
      fitSelectedRoutes: fit,
      show: false
    }).addTo(mapInstance.current);

    // Get initial trip stats from the real road path
    ctrl.on('routesfound', (e) => {
      const summary = e.routes[0].summary;
      const d = summary.totalDistance; // in meters
      const t = Math.ceil(summary.totalTime / 60); // in minutes
      if (tag === 'suggested') {
        setTripStats(prev => ({ ...prev, distance: d, eta: t }));
      }
    });

    if (tag === 'suggested') routeRef.current = ctrl;
    if (tag === 'rescue') rescueRouteRef.current = ctrl;
  };

  /* ─── Pilgrim Actions ─── */
  const geocode = async (query) => {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const d = await r.json();
    if (d.length > 0) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon), name: d[0].display_name };
    return null;
  };

  const handleDetectLocation = () => {
    setStatus('📡 Locking GPS signal — stay still for best accuracy…');
    getMyLocation((pos, accuracy) => {
      const loc = { lat: pos[0], lng: pos[1], name: `Live GPS (±${accuracy.toFixed(0)}m)` };
      setSrcPos(loc);
      setStartInput(loc.name);
      addMarker(pos, '#f97316', '📍', 'src');
      mapInstance.current?.setView(pos, 17);
      if (accuracy > 100) {
        setStatus(`⚠️ Accuracy is ${accuracy.toFixed(0)}m — move near a window or go outdoors for better GPS.`);
      } else {
        setStatus(`✅ Location locked — accuracy: ${accuracy.toFixed(0)}m`);
      }
    });
  };

  const handleSearchStart = async () => {
    if (!startInput.trim()) return;
    setStatus('Searching…');
    const r = await geocode(startInput);
    if (r) {
      setSrcPos(r);
      setStartInput(r.name);
      addMarker([r.lat, r.lng], '#f97316', '📍', 'src');
      mapInstance.current?.setView([r.lat, r.lng], 15);
      setStatus('Start point set.');
    } else { setStatus('Location not found.'); }
  };

  const handleSearchDest = async () => {
    if (!destInput.trim()) return;
    setStatus('Searching…');
    const r = await geocode(destInput);
    if (r) {
      setDestPos(r);
      setDestInput(r.name);
      addMarker([r.lat, r.lng], '#2563eb', '🏁', 'dest');
      mapInstance.current?.setView([r.lat, r.lng], 15);
      setStatus('Destination set.');
    } else { setStatus('Location not found.'); }
  };

  const confirmTempPin = () => {
    if (!tempPin) return;
    const r = { lat: tempPin.lat, lng: tempPin.lng, name: `Pin (${tempPin.lat.toFixed(4)}, ${tempPin.lng.toFixed(4)})` };
    setDestPos(r);
    setDestInput(r.name);
    if (window._tempMarker) { mapInstance.current?.removeLayer(window._tempMarker); window._tempMarker = null; }
    addMarker([r.lat, r.lng], '#2563eb', '🏁', 'dest');
    setTempPin(null);
    setStatus('Destination locked from map pin.');
  };

  const handleToggleLock = () => {
    const newLockState = !routeLocked;
    setRouteLocked(newLockState);
    if (newLockState) {
       setFixedSrcPos(srcPos);
       setStatus('Route finalized. Starting point and Path are now fixed.');
    } else {
       setFixedSrcPos(null);
       setStatus('Route configuration unlocked.');
    }
  };

  const backupIntervalRef = useRef(null);

  const handleStartTracking = () => {
    if (!selectedGuardian || !srcPos || !destPos) {
      setStatus('Set route + guardian first!');
      return;
    }
    startTracking(selectedGuardian, srcPos, destPos);
    setTracking(true);
    setStatus('🔴 LIVE — broadcasting to guardian');

    // request wake lock so phone screen stays on
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {});

    const onPosition = (p) => {
      const { latitude: lat, longitude: lng, accuracy, speed } = p.coords;
      console.log(`TRACK: ${lat.toFixed(6)}, ${lng.toFixed(6)} | ±${accuracy.toFixed(0)}m`);
      sendLocation(lat, lng);
      setLivePos([lat, lng]);
      setStatus(`🔴 LIVE — ±${accuracy.toFixed(0)}m | ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

      // Update statistics (REAL Road Distance & ETA)
      // We use a light fetch to OSRM directly for road distance to avoid drawing lines
      const dest = destPos;
      if (dest) {
        fetch(`https://router.project-osrm.org/route/v1/driving/${lng},${lat};${dest.lng},${dest.lat}?overview=false`)
          .then(r => r.json())
          .then(data => {
            if (data.routes && data.routes[0]) {
              const summary = data.routes[0];
              setTripStats({
                distance: summary.distance,
                eta: Math.ceil(summary.duration / 60),
                speed: speed ? (speed * 3.6).toFixed(1) : 0
              });
            }
          })
          .catch(() => {
            // fallback to displacement if road routing fails
            const d = mapInstance.current?.distance([lat, lng], [dest.lat, dest.lng]);
            if (d) setTripStats(prev => ({ ...prev, distance: d }));
          });
      }

      // move ONLY the live marker
      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng([lat, lng]);
      } else {
        addMarker([lat, lng], '#f43f5e', '📍', 'live');
      }
    };

    // PRIMARY: watchPosition fires on every GPS change
    watchRef.current = navigator.geolocation.watchPosition(
      onPosition,
      (err) => console.warn('watchPosition error:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    // BACKUP: force-poll every 3 seconds to eliminate gaps
    backupIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        onPosition,
        () => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }, 3000);
  };

  const handleStopTracking = () => {
    stopTracking(selectedGuardian);
    setTracking(false);
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (backupIntervalRef.current) clearInterval(backupIntervalRef.current);
    setStatus('Tracking stopped.');
  };

  const handleSOS = () => {
    // 0. BROADCAST IMMEDIATELY (Zero latency)
    // If we have ANY location (even slightly old), send it NOW.
    if (livePos) {
      triggerSOS(livePos[0], livePos[1]);
      setStatus('🚨 SOS BROADCASTED! Sending location...');
    } else {
      setStatus('🚨 SOS INITIATED! Locking GPS...');
    }

    // 1. Play feedback sounds/voice (Backgrounded)
    speak('Emergency SOS has been sent. Authorities and your guardian are being notified.');
    playAlarm();

    // 2. Aggressive Fresh GPS Lock (Parallel)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude } = p.coords;
        // Broadcast fresh position
        triggerSOS(latitude, longitude); 
        setLivePos([latitude, longitude]);
        
        if (liveMarkerRef.current) {
          liveMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          addMarker([latitude, longitude], '#f43f5e', '📍', 'live');
        }
        setStatus('🚨 SOS UPDATED with fresh precise coordinates!');
      },
      (err) => {
        console.error("SOS GPS Error:", err);
        if (!livePos) setStatus('🚨 SOS ALERT SENT, but could not get GPS lock.');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  /* Guardian: Quick Finder SOS Open in Google Maps */
  const openExternalGoogleMaps = () => {
    if (!guardianPos || !protégePos) {
      setStatus('Location markers not set. Cannot open Google Maps.');
      return;
    }
    const [glat, glng] = guardianPos;
    const [plat, plng] = protégePos;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${glat},${glng}&destination=${plat},${plng}&travelmode=driving`;
    window.open(url, '_blank');
    setStatus('Navigating in external Google Maps…');
  };

  /* ─────────────────────────────────────────────────── */
  /*                   ROLE SELECTOR                     */
  /* ─────────────────────────────────────────────────── */
  if (!role) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 mt-24 mb-16 relative overflow-hidden">
          <div className="max-w-3xl w-full relative">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="text-center mb-10 md:mb-12 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white border border-slate-200 text-orange-600 mb-4 md:mb-6 shadow-sm">
                <Sparkles size={14} className="md:w-4 md:h-4" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Family Safety Network</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 md:mb-3 tracking-tighter uppercase leading-none">
                Choose Your <span className="text-orange-500">Role</span>
              </h2>
              <p className="text-[10px] md:text-sm text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest">
                Are you travelling or watching over someone?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6 relative z-10">
              {/* Traveller */}
              <button onClick={() => setRole('pilgrim')}
                className="group relative bg-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 hover:border-orange-500 transition-all text-center overflow-hidden h-auto aspect-square md:aspect-auto md:h-[300px] flex flex-col justify-center shadow-xl shadow-slate-200/50">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-orange-50 text-orange-600 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner group-hover:scale-110">
                  <Users className="w-6 h-6 md:w-10 md:h-10" />
                </div>
                <h3 className="text-xs md:text-2xl font-black text-slate-900 mb-1 md:mb-2 uppercase tracking-tight">I'm Travelling</h3>
                <p className="text-[9px] md:text-xs text-slate-400 font-bold leading-relaxed line-clamp-2 md:line-clamp-none">Get tracked live.</p>
                <div className="mt-4 hidden md:flex items-center justify-center gap-2 text-orange-600 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Pilgrim Mode <ChevronRight size={12} />
                </div>
              </button>

              {/* Guardian */}
              <button onClick={() => setRole('guardian')}
                className="group relative bg-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 hover:border-blue-600 transition-all text-center overflow-hidden h-auto aspect-square md:aspect-auto md:h-[300px] flex flex-col justify-center shadow-xl shadow-slate-200/50">
                <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:scale-110">
                  <Shield className="w-6 h-6 md:w-10 md:h-10" />
                </div>
                <h3 className="text-xs md:text-2xl font-black text-slate-900 mb-1 md:mb-2 uppercase tracking-tight">I'm a Guardian</h3>
                <p className="text-[9px] md:text-xs text-slate-400 font-bold leading-relaxed line-clamp-2 md:line-clamp-none">Monitor family.</p>
                <div className="mt-4 hidden md:flex items-center justify-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Command Center <ChevronRight size={12} />
                </div>
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────── */
  /*                  MAIN DASHBOARD                     */
  /* ─────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <style>{`
        .glass{background:rgba(255,255,255,.85);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.3)}
        .pulse-red{animation:pr 2s infinite}
        @keyframes pr{0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}70%{box-shadow:0 0 0 20px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
        .custom-scroll::-webkit-scrollbar{width:4px}
        .custom-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
      `}</style>

      <Header />

      <div className="flex-1 pt-32 pb-24 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto w-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => { setRole(null); setTracking(false); }}
              className="p-3 bg-white rounded-2xl shadow-sm text-slate-500 hover:text-orange-600 transition-all border border-slate-100 hover:scale-105">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                {role === 'pilgrim' ? 'Pilgrim Mode' : 'Guardian Command'}
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity size={12} className={role === 'pilgrim' ? 'text-orange-500' : 'text-blue-500'} />
                {tracking ? 'LIVE TRACKING ACTIVE' : 'READY'}
              </p>
            </div>
          </div>
          <button onClick={() => window.location.reload()}
            className="p-3 bg-white rounded-2xl shadow-sm text-slate-500 hover:text-blue-600 transition-all border border-slate-100">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Main Grid: Sidebar + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ──── LEFT SIDEBAR ──── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {role === 'pilgrim' ? (
              /* ─── PILGRIM SIDEBAR ─── */
              <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100">
                {/* Route Config */}
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Route size={16} className="text-orange-500" /> Route
                </h3>

                <div className="space-y-3">
                  {/* Start */}
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400" size={16} />
                    <input 
                      value={startInput} 
                      onChange={e => setStartInput(e.target.value)}
                      disabled={routeLocked || tracking}
                      onKeyDown={e => e.key === 'Enter' && handleSearchStart()}
                      placeholder="Start location…"
                      className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-orange-500 focus:bg-white transition-all font-bold text-xs outline-none disabled:opacity-60" />
                    {!routeLocked && !tracking && (
                      <button onClick={handleDetectLocation}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 hover:scale-110 active:scale-95">
                        <LocateFixed size={16} />
                      </button>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="relative">
                    <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                    <input 
                      value={destInput} 
                      onChange={e => setDestInput(e.target.value)}
                      disabled={routeLocked || tracking}
                      onKeyDown={e => e.key === 'Enter' && handleSearchDest()}
                      placeholder="Destination… (or click map)"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all font-bold text-xs outline-none disabled:opacity-60" />
                  </div>

                  {!routeLocked && !tracking && (
                    <button onClick={() => { handleSearchStart(); handleSearchDest(); }}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black active:scale-95 transition-all">
                      Search & Map Route
                    </button>
                  )}

                  {srcPos && destPos && !tracking && (
                    <button 
                      onClick={handleToggleLock}
                      className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                        routeLocked 
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {routeLocked ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      {routeLocked ? 'Unlock Route Config' : 'Finalize & Lock Route'}
                    </button>
                  )}
                </div>

                {/* Guardian Selection */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <UserCheck size={16} className="text-emerald-500" /> Select Guardian
                  </h3>
                  <div className="space-y-2 custom-scroll overflow-y-auto max-h-[200px] pr-1">
                    {guardians.length === 0 ? (
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                        <p className="text-[10px] font-bold text-orange-700">No approved guardians. Add them from your Profile.</p>
                      </div>
                    ) : guardians.map(g => (
                      <button key={g.mapping_id}
                        onClick={() => setSelectedGuardian(g.guardian.client_id)}
                        className={`w-full p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                          selectedGuardian === g.guardian.client_id
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                        }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                          selectedGuardian === g.guardian.client_id ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}>{g.guardian.name[0]}</div>
                        <div className="text-left flex-1">
                          <p className="text-[11px] font-black text-slate-800 uppercase">{g.guardian.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold">{g.guardian.phone}</p>
                        </div>
                        {selectedGuardian === g.guardian.client_id && <CheckCircle2 size={16} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                  {/* SOS and Tracking Status */}
                  <div className="mt-8 space-y-3">
                    {tracking ? (
                      <button onClick={handleStopTracking}
                        className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 active:scale-95 shadow-lg">
                        <XCircle size={18} /> Stop Tracking
                      </button>
                    ) : (
                      <button onClick={handleStartTracking}
                        disabled={!selectedGuardian || !srcPos || !destPos || !routeLocked}
                        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-500/40">
                        <Sparkles size={18} /> Start Tracking
                      </button>
                    )}

                    <button onClick={handleSOS}
                      className="group relative w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 border-4 border-red-200 overflow-hidden transition-all hover:bg-red-700 active:scale-95 shadow-xl shadow-red-600/20">
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                      <AlertTriangle size={22} className="animate-pulse" /> EMERGENCY PANIC
                    </button>
                  </div>
              </div>
            ) : (
              /* ─── GUARDIAN SIDEBAR ─── */
              <>
                {/* Pending */}
                {pending.length > 0 && (
                  <div className="bg-white p-5 rounded-[2rem] shadow-lg border border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Bell size={16} className="text-orange-500" /> Pending Requests
                      <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">{pending.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {pending.map(req => (
                        <div key={req.mapping_id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-500 font-bold text-sm">{req.user.name[0]}</div>
                          <div className="flex-1">
                            <p className="text-[11px] font-black text-slate-800 uppercase">{req.user.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold italic">Wants you as guardian</p>
                          </div>
                          <button onClick={() => approve(req.user.client_id)}
                            className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Protégés */}
                <div className="bg-white p-5 rounded-[2rem] shadow-lg border border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" /> My Network
                  </h3>
                  <div className="space-y-2 custom-scroll overflow-y-auto max-h-[250px]">
                    {protégés.length === 0 ? (
                      <p className="text-[10px] font-bold text-slate-400 text-center py-6">No one in your network yet.</p>
                    ) : protégés.map(p => (
                      <button key={p.mapping_id}
                        onClick={() => {
                          if (trailPolyRef.current) { mapInstance.current?.removeLayer(trailPolyRef.current); trailPolyRef.current = null; }
                          if (srcMarkerRef.current) { mapInstance.current?.removeLayer(srcMarkerRef.current); srcMarkerRef.current = null; }
                          if (destMarkerRef.current) { mapInstance.current?.removeLayer(destMarkerRef.current); destMarkerRef.current = null; }
                          setSosActive(false);
                          setProtégePos(null);
                          setStatus(`Watching ${p.user.name}…`);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                          selectedProtégé === p.user.client_id
                            ? 'border-blue-600 bg-blue-50/50'
                            : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                          selectedProtégé === p.user.client_id ? 'bg-blue-600' : 'bg-slate-400'
                        }`}><Users size={18} /></div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.user.name}</p>
                            {lastLocation?.userId === p.user.client_id && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />}
                          </div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{p.user.phone}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </button>
                    ))}
                  </div>

                  {/* Live Info + Rescue */}
                  {selectedProtégé && (
                    <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                      <div className="bg-slate-900 p-5 rounded-2xl text-white">
                        <div className="flex gap-3 items-center">
                          <div className="flex-1">
                            <p className="text-lg font-black">{protégePos ? 'Online' : 'Waiting for signal…'}</p>
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                              {protégePos ? `${protégePos[0].toFixed(4)}, ${protégePos[1].toFixed(4)}` : '—'}
                            </p>
                          </div>
                          {protégePos && (
                            <div className="p-2.5 bg-blue-600 rounded-xl shadow-xl">
                              <Radio size={18} className="animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>

                      {sosActive && (
                        <button onClick={openExternalGoogleMaps}
                          className="pulse-red w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-red-500/40 animate-bounce flex items-center justify-center gap-3 border-4 border-red-100">
                          <Navigation size={22} /> Open in Google Maps
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Status Bar */}
            <div className={`p-5 rounded-[2rem] flex items-start gap-3 transition-all ${
              sosActive ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 text-white'
            }`}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><Activity size={18} /></div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Status</h4>
                <p className="text-xs font-bold leading-snug">{status || 'Ready.'}</p>
              </div>
            </div>
          </div>

          {/* ──── RIGHT: MAP ──── */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="bg-white p-2.5 rounded-[3rem] shadow-2xl border border-slate-100 ring-8 ring-slate-50/50 h-[550px] lg:h-[750px] relative overflow-hidden group">
              <div ref={mapRef} className="w-full h-full rounded-[2.5rem] z-0 shadow-inner" />

              {/* FLOATING TRACKING DASHBOARD (SMALL BOX) */}
              {(tracking || protégePos) && (
                <div className="absolute top-6 left-6 z-[1000] animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl w-64">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE Tracking</span>
                      </div>
                      {tripStats.speed > 0 && (
                        <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black tracking-widest">
                          {tripStats.speed} KM/H
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Distance */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">D-Remaining</p>
                        <p className="text-lg font-black text-white tracking-tight">
                          {(tripStats.distance / 1000).toFixed(1)} <span className="text-xs text-slate-500">KM</span>
                        </p>
                      </div>
                      {/* ETA */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time to Dest</p>
                        <p className="text-lg font-black text-emerald-400 tracking-tight">
                          {tripStats.eta} <span className="text-xs text-emerald-600">MINS</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Destination ETA</p>
                      <p className="text-[9px] font-black text-slate-300">
                        {new Date(Date.now() + tripStats.eta * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Map overlay badges */}
              <div className="absolute top-6 right-6 z-[500] flex flex-col gap-2">
                <div className="glass px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                  <div className={`w-2 h-2 rounded-full ${tracking || protégePos ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">
                    {tracking || protégePos ? 'Live' : 'Idle'}
                  </span>
                </div>
                {tracking && (
                  <div className="bg-orange-600 text-white px-5 py-2.5 rounded-full shadow-lg animate-pulse">
                    <span className="text-[9px] font-black uppercase tracking-widest">Broadcasting</span>
                  </div>
                )}
              </div>

              {/* Set Dest from pin */}
              {role === 'pilgrim' && tempPin && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
                  <button onClick={confirmTempPin}
                    className="bg-indigo-600 text-white px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_15px_40px_rgba(99,102,241,.4)] border-4 border-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <MapPin size={18} /> Set as Destination
                  </button>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-6 left-6 z-[500] glass px-5 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-orange-500 rounded-full" />Suggested</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-blue-500 rounded-full" style={{ borderBottom: '2px dashed #3b82f6' }} />Actual Trail</span>
                  {sosActive && <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-red-500 rounded-full" />Rescue</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FamilyMode;
