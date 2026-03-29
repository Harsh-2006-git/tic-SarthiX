import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Hospital, 
  Hotel, 
  Utensils, 
  Shield, 
  MapPin, 
  Navigation, 
  Search, 
  Loader2,
  ExternalLink,
  Milestone,
  LocateFixed,
  Wifi,
  Map as MapIcon,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Leaflet Marker Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Category Icons with ACTUAL Lucide SVG paths for clarity
const getCategoryIcon = (category) => {
  const colors = { 
    hospital: '#ef4444', 
    hotel: '#8b5cf6', 
    restaurant: '#f59e0b', 
    police: '#2563eb', 
    temple: '#db2777' 
  };
  
  const iconShapes = {
    hospital: '<path d="M19 14c1.66 0 3-1.34 3-3s-1.34-3-3-3H5c-1.66 0-3 1.34-3 3s1.34 3 3 3"/><path d="M17 14V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v10"/><path d="M5 22v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M12 7v4"/><path d="M10 9h4"/>',
    hotel: '<path d="M2 22v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M19 17V11a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 15V9"/><path d="M9 11v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>',
    restaurant: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    police: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    temple: '<path d="m12 2 10 10-10 10L2 12Z"/><path d="m12 22 5-5"/><path d="m12 22-5-5"/><path d="m12 2 5 5"/><path d="m12 2-5 5"/>'
  };

  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div class="marker-wrapper shadow-2xl" style="background:${colors[category] || '#64748b'};">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${iconShapes[category] || ''}
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const NearbyServices = () => {
  const [userLocation, setUserLocation] = useState([0, 0]); // Initial empty
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, granted, denied
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('hospital');
  const [radius, setRadius] = useState(2000);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);

  const categories = useMemo(() => [
    { id: 'hospital', name: 'Hospitals', icon: <Hospital size={20} />, color: '#ef4444' },
    { id: 'hotel', name: 'Hotels', icon: <Hotel size={20} />, color: '#8b5cf6' },
    { id: 'restaurant', name: 'Food', icon: <Utensils size={20} />, color: '#f59e0b' },
    { id: 'police', name: 'Police', icon: <Shield size={20} />, color: '#2563eb' },
    { id: 'temple', name: 'Temples', icon: <Milestone size={20} />, color: '#db2777' },
  ], []);

  const radii = [
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' },
    { value: 10000, label: '10km' },
    { value: 20000, label: '20km' },
  ];

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationStatus('granted');
        },
        (err) => {
          console.error(err);
          setLocationStatus('denied');
          // Fallback to Ujjain if user denies but we need to show something
          setUserLocation([23.1765, 75.7885]); 
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationStatus('unsupported');
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => { 
    if (userLocation[0] !== 0) fetchPlaces(); 
  }, [category, radius, userLocation]);

  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${apiUrl}/api/v1/nearby`, {
        params: { category, lat: userLocation[0], lng: userLocation[1], radius }
      });
      setPlaces(response.data);
    } catch (err) {
      setError("Trouble connecting to satellites. Retrying...");
    } finally { setLoading(false); }
  };

  const handleDirections = (p) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, '_blank');

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900 overflow-hidden">
      <Header />
      
      <div className="flex flex-col lg:flex-row flex-grow h-[calc(100vh-80px)] mt-[80px]">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-[450px] bg-slate-50 border-r border-slate-200 flex flex-col z-10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
          
          <div className="p-8 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between mb-8">
               <h1 className="text-3xl font-black tracking-tighter text-slate-900 group">
                  Explorer
                  <div className="h-1 w-8 bg-orange-600 rounded-full mt-1 transition-all group-hover:w-full"></div>
               </h1>
               <button 
                 onClick={detectLocation}
                 className={`p-3 rounded-2xl transition-all ${locationStatus === 'granted' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse'}`}
                 title="Refresh Location"
               >
                 <LocateFixed size={20} />
               </button>
            </div>
            
            <div className="space-y-8">
              {/* Category Grid */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Select Interest</label>
                <div className="grid grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all ${
                        category === cat.id 
                        ? `bg-slate-900 border-slate-900 text-white shadow-xl scale-110 z-10` 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}
                      title={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Filter */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Search Radius</label>
                <div className="flex p-1.5 bg-slate-100 rounded-[1.25rem] border border-slate-200 shadow-inner overflow-x-auto hide-scrollbar">
                  {radii.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRadius(r.value)}
                      className={`flex-none px-6 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap ${
                        radius === r.value ? 'bg-white text-slate-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results List Area */}
          <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
            {locationStatus === 'detecting' ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                 <Loader2 className="animate-spin text-orange-600" size={32} />
                 <p className="font-bold text-xs uppercase tracking-widest">Triangulating Location...</p>
              </div>
            ) : locationStatus === 'denied' && userLocation[0] === 23.1765 ? (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-4 animate-in bounce-in">
                 <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
                 <div className="space-y-1">
                    <p className="text-xs font-black text-orange-900 uppercase">Location Access Denied</p>
                    <p className="text-[10px] text-orange-700 font-semibold leading-relaxed">Defaulting to Ujjain. Enable browser location for results in your actual area.</p>
                 </div>
              </div>
            ) : null}

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <Wifi className="animate-pulse text-slate-300 mb-4" size={48} />
                <p className="font-bold uppercase tracking-widest text-[10px]">Pinging Nearby Sites...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-24 text-slate-400 italic">
                <MapIcon size={64} className="mx-auto mb-6 opacity-5" />
                <p className="font-bold text-sm">Territory Unexplored</p>
                <p className="text-[10px] uppercase font-bold tracking-widest mt-2">No {category}s found within {radius/1000}km</p>
              </div>
            ) : (
              <div className="space-y-5">
                {places.map((place, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { setSelectedPlace(place); setMapZoom(17); }}
                    className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                      selectedPlace?.name === place.name 
                      ? 'bg-white border-slate-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-slate-900/5' 
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg group'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-black text-lg tracking-tighter leading-none flex-1 pr-4 truncate text-slate-900 group-hover:text-orange-600 transition-colors uppercase italic">{place.name}</h3>
                      <span className="text-[11px] font-black text-white bg-slate-900 px-3 py-1 rounded-full shadow-lg">
                        {place.distance >= 1000 ? `${(place.distance/1000).toFixed(1)}km` : `${Math.round(place.distance)}m`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-5 leading-normal font-bold lowercase tracking-tight italic opacity-80">{place.address}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDirections(place); }}
                      className="w-full bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-900 h-14 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                    >
                      <Navigation size={18} className="fill-current" />
                      Dispatch Guide
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* MAP CANVAS PANEL */}
        <main className="flex-grow relative z-0">
          {userLocation[0] !== 0 ? (
            <MapContainer 
              center={userLocation} 
              zoom={mapZoom} 
              zoomControl={false}
              style={{ height: '100%', width: '100%' }}
              className="focus:outline-none"
            >
              <ChangeView center={selectedPlace ? [selectedPlace.lat, selectedPlace.lng] : userLocation} zoom={mapZoom} />
              
              <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              
              <ZoomControl position="bottomright" />

              {/* LIVE USER PULSE */}
              <Marker 
                position={userLocation}
                icon={L.divIcon({
                  className: 'user-marker',
                  html: `<div class="user-pulse shadow-2xl"></div><div class="user-center border-4 border-white transition-all"></div>`,
                  iconSize: [24, 24]
                })}
              >
                <Popup className="premium-popup-light">
                  <div className="p-3 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Nexus</span>
                    <p className="font-bold text-xs mt-1">Your Live Position</p>
                  </div>
                </Popup>
              </Marker>

              {/* SERVICE NODES */}
              {places.map((place, idx) => (
                <Marker 
                  key={idx}
                  position={[place.lat, place.lng]}
                  icon={getCategoryIcon(place.category)}
                  eventHandlers={{ click: () => setSelectedPlace(place) }}
                >
                  <Popup className="premium-popup-light">
                    <div className="p-5 text-slate-900 min-w-[280px]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: categories.find(c => c.id === place.category)?.color }}>
                           {categories.find(c => c.id === place.category)?.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validated Entity</span>
                      </div>
                      <h4 className="font-black text-xl mb-1 tracking-tighter italic uppercase">{place.name}</h4>
                      <p className="text-[11px] text-slate-500 mb-6 font-bold leading-relaxed">{place.address}</p>
                      <button 
                        onClick={() => handleDirections(place)}
                        className="w-full bg-slate-900 text-white text-[10px] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl active:scale-95"
                      >
                        Launch Navigation
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center flex-col space-y-6">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <LocateFixed size={40} className="text-orange-500" />
               </div>
               <div className="text-center">
                  <h3 className="font-black text-xl uppercase tracking-widest">Waiting for Signal...</h3>
                  <p className="text-slate-400 text-xs mt-2 font-bold">Please allow location access to continue</p>
               </div>
            </div>
          )}

          {/* MAP LEGEND - FIXED UI CLARITY */}
          <div className="absolute top-6 left-6 z-[500] pointer-events-none">
             <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] pointer-events-auto">
                <div className="flex items-center gap-2 mb-4">
                   <HelpCircle size={16} className="text-slate-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Entity Legend</span>
                </div>
                <div className="space-y-3">
                   {categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-4">
                         <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transform transition-transform hover:scale-110" style={{ background: cat.color }}>
                            {cat.icon}
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-tight text-slate-600">{cat.name}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* RE-CENTER MAP CONTROL */}
          <div className="absolute bottom-10 right-10 z-[500]">
             <button 
                onClick={() => { setSelectedPlace(null); detectLocation(); setMapZoom(14); }}
                className="w-16 h-16 bg-white border border-slate-100 rounded-3xl shadow-2xl flex items-center justify-center text-orange-600 hover:text-white hover:bg-orange-600 transition-all active:scale-90"
             >
                <LocateFixed size={32} />
             </button>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ping {
          75%, 100% { transform: scale(3.5); opacity: 0; }
        }
        .user-pulse {
          position: absolute;
          width: 48px;
          height: 48px;
          background: rgba(249, 115, 22, 0.2);
          border-radius: 50%;
          animation: user-ping 3s infinite;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .user-center {
          position: absolute;
          width: 14px;
          height: 14px;
          background: #f97316;
          border-radius: 50%;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          z-index: 5;
        }
        @keyframes user-ping {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        .marker-wrapper {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .marker-wrapper:hover {
          transform: scale(1.2) rotate(10deg);
          z-index: 1000;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .premium-popup-light .leaflet-popup-content-wrapper {
          border-radius: 2.5rem;
          padding: 0;
          overflow: hidden;
          background: white;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.25);
        }
        .premium-popup-light .leaflet-popup-content {
          margin: 0;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .leaflet-container {
          background: #f8fafc;
        }
      `}} />
      <Footer />
    </div>
  );
};

export default NearbyServices;
