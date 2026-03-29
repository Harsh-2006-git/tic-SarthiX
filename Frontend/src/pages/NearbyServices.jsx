import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  ChevronRight,
  Info,
  ExternalLink,
  Milestone
} from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Fix for default leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for categories
const getCategoryIcon = (category) => {
  const iconBase = {
    shadowUrl: markerShadow,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  };

  switch (category) {
    case 'hospital':
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ef4444; border-radius: 50%; padding: 8px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.66 0 3-1.34 3-3s-1.34-3-3-3H5c-1.66 0-3 1.34-3 3s1.34 3 3 3"/><path d="M17 14V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v10"/><path d="M5 22v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M12 7v4"/><path d="M10 9h4"/></svg></div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      });
    case 'hotel':
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #8b5cf6; border-radius: 50%; padding: 8px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M19 17V11a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 15V9"/><path d="M9 11v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg></div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      });
    case 'restaurant':
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #f59e0b; border-radius: 50%; padding: 8px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      });
    case 'police':
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; border-radius: 50%; padding: 8px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      });
    case 'temple':
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ec4899; border-radius: 50%; padding: 8px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 10-10 10L2 12Z"/><path d="m12 22 5-5"/><path d="m12 22-5-5"/><path d="m12 2 5 5"/><path d="m12 2-5 5"/></svg></div>`,
        iconSize: [35, 35],
        iconAnchor: [17, 35]
      });
    default:
      return DefaultIcon;
  }
};

// Component to recenter map when location or categories change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const NearbyServices = () => {
  const [userLocation, setUserLocation] = useState([23.1765, 75.7885]); // Default Ujjain
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('hospital');
  const [radius, setRadius] = useState(2000);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);

  const categories = [
    { id: 'hospital', name: 'Hospitals', icon: <Hospital size={18} />, color: 'bg-red-500' },
    { id: 'hotel', name: 'Hotels', icon: <Hotel size={18} />, color: 'bg-purple-500' },
    { id: 'restaurant', name: 'Restaurants', icon: <Utensils size={18} />, color: 'bg-amber-500' },
    { id: 'police', name: 'Police', icon: <Shield size={18} />, color: 'bg-blue-500' },
    { id: 'temple', name: 'Temples', icon: <Milestone size={18} />, color: 'bg-pink-500' },
  ];

  const radii = [
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' },
  ];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
          setError('Could not get your location. Using default location (Ujjain).');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [category, radius, userLocation]);

  const fetchPlaces = async () => {
    if (userLocation[0] === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/nearby`, {
        params: {
          category,
          lat: userLocation[0],
          lng: userLocation[1],
          radius
        }
      });
      setPlaces(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load nearby services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  const getRelativeDistance = (distance) => {
    if (distance < 1000) return `${Math.round(distance)}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Side Panel */}
        <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
              <MapPin className="text-blue-500" />
              Nearby Services
            </h1>
            
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        category === cat.id 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {cat.icon}
                      <span className="text-[10px] mt-1 font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Filter */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Search Radius</label>
                <div className="flex bg-slate-800 rounded-lg p-1">
                  {radii.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRadius(r.value)}
                      className={`flex-1 py-1 text-sm rounded-md transition-all ${
                        radius === r.value 
                        ? 'bg-blue-600' 
                        : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p>Finding nearest {category}s...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl text-center">
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button 
                  onClick={fetchPlaces}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p>No results found in this area.</p>
                <p className="text-xs">Try increasing the radius.</p>
              </div>
            ) : (
              places.map((place, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSelectedPlace(place);
                    setMapZoom(16);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                    selectedPlace?.name === place.name 
                    ? 'bg-blue-600/10 border-blue-500' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {place.name}
                    </h3>
                    <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-medium">
                      {getRelativeDistance(place.distance)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {place.address}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirections(place);
                      }}
                      className="flex-1 bg-slate-700 hover:bg-blue-600 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Navigation size={12} />
                      Navigate
                    </button>
                    <button className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <Info size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Display */}
        <div className="flex-grow relative">
          {userLocation[0] !== 0 && (
            <MapContainer 
              center={userLocation} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
              className="z-0"
              scrollWheelZoom={true}
            >
              <ChangeView center={selectedPlace ? [selectedPlace.lat, selectedPlace.lng] : userLocation} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {/* User Location Marker */}
              <Marker 
                position={userLocation}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `<div class="pulse-ring"></div><div class="user-dot"></div>`,
                  iconSize: [24, 24]
                })}
              >
                <Popup>
                  <div className="text-slate-900 font-bold">You are here</div>
                </Popup>
              </Marker>

              {/* Places Markers */}
              {places.map((place, idx) => (
                <Marker 
                  key={idx}
                  position={[place.lat, place.lng]}
                  icon={getCategoryIcon(place.category)}
                  eventHandlers={{
                    click: () => setSelectedPlace(place),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 text-slate-900 min-w-[200px]">
                      <h4 className="font-bold text-sm mb-0.5">{place.name}</h4>
                      <p className="text-[11px] text-slate-600 mb-2 leading-tight">{place.address}</p>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-[10px] font-bold text-blue-600">
                          {getRelativeDistance(place.distance)} away
                        </span>
                        <button 
                          onClick={() => handleDirections(place)}
                          className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors"
                        >
                          Directions <ExternalLink size={10} />
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Floating UI Elements */}
          <div className="absolute top-4 right-4 z-10 space-y-2">
            <button 
              onClick={() => {
                setMapZoom(14);
                setSelectedPlace(null);
              }}
              className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all text-blue-400"
              title="Reset View"
            >
              <Navigation size={20} />
            </button>
          </div>

          {!selectedPlace && !loading && places.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <div className="bg-blue-600 px-4 py-2 rounded-full shadow-xl text-xs font-bold flex items-center gap-2">
                <Search size={14} />
                Found {places.length} nearby locations
              </div>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .user-location-marker {
          background: none;
          border: none;
        }
        .user-dot {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px #3b82f6;
        }
        .pulse-ring {
          width: 24px;
          height: 24px;
          background: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}} />
      <Footer />
    </div>
  );
};

export default NearbyServices;
