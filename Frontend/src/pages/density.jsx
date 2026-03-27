import React, { useEffect, useState, useRef } from "react";
import jsQR from "jsqr";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Map, ScanLine } from "lucide-react";

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [scanData, setScanData] = useState({ unique_code: "", zone_id: "" });
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "scanner"
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Fetch zone density data
  const fetchZoneData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/v1/zone/density");
      const data = await response.json();
      setZones(data.zones || data || []);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  // Handle zone scan
  const handleZoneScan = async (e) => {
    if (e) e.preventDefault();
    if (!scanData.unique_code || !scanData.zone_id) {
      setScanResult({ message: "Please enter both unique code and zone ID" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/v1/zone/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanData),
      });

      const result = await response.json();
      setScanResult(result);

      if (response.ok) {
        fetchZoneData();
        setScanData({ unique_code: "", zone_id: "" });
        stopScanner();
      }
    } catch (error) {
      console.error("Error scanning zone:", error);
      setScanResult({ message: "Error scanning zone" });
    }
  };

  // Handle zone exit
  const handleZoneExit = async (unique_code) => {
    try {
      const response = await fetch("http://localhost:3001/api/v1/zone/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_code }),
      });

      const result = await response.json();
      setScanResult(result);

      if (response.ok) fetchZoneData();
    } catch (error) {
      console.error("Error exiting zone:", error);
      setScanResult({ message: "Error exiting zone" });
    }
  };

  // QR code detection
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      try {
        const parsed = JSON.parse(code.data);
        return parsed.unique_code || code.data;
      } catch {
        return code.data;
      }
    }
    return null;
  };

  // Start QR scanner
  const startScanner = async () => {
    setIsScanning(true);
    setScannerError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      scanInterval.current = setInterval(() => {
        const qrCode = detectQRCode();
        if (qrCode) {
          setScanData((prev) => ({ ...prev, unique_code: qrCode }));
          setScanResult({ message: `✅ QR Code detected: ${qrCode}` });
        }
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setScannerError("Cannot access camera. Check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchZoneData();
      setLoading(false);
    };

    loadData();
    const intervalId = setInterval(fetchZoneData, 5000);

    return () => {
      clearInterval(intervalId);
      stopScanner();
    };
  }, []);

  const getDensityStatus = (density) => {
    if (density === 0) return { text: "Low", color: "bg-green-500" };
    if (density < 3) return { text: "Moderate", color: "bg-yellow-500" };
    return { text: "High", color: "bg-red-500" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="pt-24 pb-8 md:pt-28 md:pb-10 px-6 text-center bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 mb-3 animate-fade-in-up">
            <span className="text-[10px] font-bold uppercase tracking-wider">Live Zone Status</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight text-gray-900">
            Monitor <span className="text-orange-600">Crowd Density</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            Real-time tracking of devotee flow at Mahakaleshwar Temple.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Tab Navigation */}
        {/* Stylish Centered Tab Switcher - Mobile Optimized */}
        <div className="mb-8 px-4">
          <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 flex w-full max-w-[320px] mx-auto relative z-10">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 py-3 rounded-full font-bold text-sm transition-all duration-300 text-center ${activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-md"
                : "text-gray-500 hover:text-slate-900 hover:bg-gray-50"
                }`}
            >
              Live Map
            </button>

            <button
              onClick={() => setActiveTab("scanner")}
              className={`flex-1 py-3 rounded-full font-bold text-sm transition-all duration-300 text-center ${activeTab === "scanner"
                ? "bg-slate-900 text-white shadow-md"
                : "text-gray-500 hover:text-slate-900 hover:bg-gray-50"
                }`}
            >
              QR Scanner
            </button>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 pb-16">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Zone Map */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Temple Zone Map</h2>
                    <p className="text-gray-500 font-medium">Interactive vector monitoring & density tracking</p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Live Data</span>
                  </div>
                </div>

                <div className="">
                  <div className="relative">
                    <img
                      src="https://archive.org/download/ujjain_district_madhya_pradesh_election_2018_map/ujjain_district_madhya_pradesh_election_2018_map.jpg"
                      alt="Ujjain Map"
                      className="rounded-xl w-full border-2 border-orange-100"
                    />
                    <div className="absolute inset-0">
                      {zones.map((zone) => (
                        <div
                          key={zone.zone_id}
                          className={`absolute w-12 h-12 rounded-full text-white flex items-center justify-center font-bold cursor-pointer shadow-lg border-2 border-white transition-all duration-300 hover:scale-110 ${getDensityStatus(zone.density).color
                            }`}
                          style={{
                            top: `${15 + zone.zone_id * 10}%`,
                            left: `${15 + zone.zone_id * 5}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onClick={() => setSelectedZone(zone)}
                        >
                          {zone.zone_id}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 bg-orange-50 p-4 rounded-xl">
                    <h3 className="font-bold text-orange-700 mb-3 text-center">
                      Density Legend
                    </h3>
                    <div className="flex justify-center space-x-6">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Low
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Moderate
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">
                          High
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone List */}
              {/* Zone List */}
              <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">Zone Overview</h2>
                <p className="text-slate-400 text-sm mb-6 relative z-10">Real-time density metrics</p>

                <div className="mt-4 md:mt-0 md:p-6">
                  {loading ? (
                    <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-orange-600 font-medium">
                        Loading zone data...
                      </p>
                    </div>
                  ) : zones.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-orange-600 font-medium">
                        No zones available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {zones.map((zone) => {
                        const status = getDensityStatus(zone.density);
                        return (
                          <div
                            key={zone.zone_id}
                            className={`p-3 rounded-xl shadow-lg cursor-pointer border-l-4 ${status.color} bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 transform hover:scale-[1.02]`}
                            onClick={() => setSelectedZone(zone)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-base text-orange-700">
                                  {zone.zone_name}
                                </h3>
                                <p className="text-xs text-orange-600">
                                  Zone ID:{" "}
                                  <span className="font-bold">
                                    {zone.zone_id}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-3 py-1 text-xs font-bold rounded-full ${status.color} text-white shadow-md`}
                                >
                                  {status.text}
                                </span>
                                <p className="text-xl font-bold text-gray-700 mt-1">
                                  {zone.density}
                                </p>
                                <p className="text-xs text-gray-500">
                                  devotees
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Tab Content */}
        {activeTab === "scanner" && (
          <div className="w-full pb-24">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
                  Visitor Scanner
                </h2>
                <p className="text-gray-500 text-center mt-1 text-sm">
                  Entry & Exit Management Portal
                </p>
              </div>

              <div className="p-4 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Camera Section - Full Width on Mobile */}
                  <div className="w-full lg:w-1/2 flex flex-col items-center space-y-4">
                    <div className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden relative shadow-lg">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas
                        ref={canvasRef}
                        width="640"
                        height="480"
                        className="hidden"
                      />

                      {/* Status Indicator */}
                      <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isScanning
                              ? "bg-green-500 animate-pulse"
                              : "bg-red-500"
                              }`}
                          ></div>
                          <span className="text-xs text-white font-bold tracking-wide">
                            {isScanning ? "CAMERA ACTIVE" : "CAMERA OFF"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={isScanning ? stopScanner : startScanner}
                      className={`w-full py-4 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] ${isScanning
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                    >
                      {isScanning ? "Stop Camera" : "Activate Camera"}
                    </button>
                    {scannerError && (
                      <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg text-center w-full">{scannerError}</p>
                    )}
                  </div>

                  {/* Manual Entry Section - Full Width on Mobile */}
                  <div className="w-full lg:w-1/2 flex flex-col space-y-6">
                    <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 h-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span>Manual Entry</span>
                        <div className="h-px bg-gray-200 flex-grow"></div>
                      </h3>

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                            Visitor Unique Code
                          </label>
                          <input
                            type="text"
                            value={scanData.unique_code}
                            onChange={(e) =>
                              setScanData((prev) => ({
                                ...prev,
                                unique_code: e.target.value,
                              }))
                            }
                            placeholder="e.g. RFID-2551d30b------"
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all bg-white font-mono text-gray-800 font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                            Select Zone
                          </label>
                          <div className="relative">
                            <select
                              value={scanData.zone_id}
                              onChange={(e) =>
                                setScanData((prev) => ({
                                  ...prev,
                                  zone_id: e.target.value,
                                }))
                              }
                              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all bg-white text-gray-800 font-medium appearance-none"
                            >
                              <option value="">-- Choose Zone --</option>
                              {zones.map((zone) => (
                                <option key={zone.zone_id} value={zone.zone_id}>
                                  {zone.zone_name} (ID: {zone.zone_id})
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 border-l border-gray-100 pl-3">▼</div>
                          </div>
                        </div>

                        <button
                          onClick={handleZoneScan}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] mt-2"
                        >
                          Verify & Submit Entry
                        </button>
                      </div>
                    </div>

                    {/* Result Message */}
                    {scanResult && (
                      <div
                        className={`p-4 rounded-xl text-center text-sm font-bold border animate-fade-in ${scanResult.message.includes("✅")
                          ? "bg-green-50 text-green-700 border-green-200"
                          : scanResult.message.toLowerCase().includes("error")
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                      >
                        {scanResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone Details Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border-2 border-orange-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedZone.zone_name}
              </h2>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-orange-600 font-medium">Zone ID</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {selectedZone.zone_id}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-red-600 font-medium">
                    Current Count
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {selectedZone.density}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl text-center">
                <p className="text-sm text-orange-700 font-medium mb-2">
                  Density Status
                </p>
                <span
                  className={`px-4 py-2 rounded-full text-white font-bold ${getDensityStatus(selectedZone.density).color
                    }`}
                >
                  {getDensityStatus(selectedZone.density).text}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setScanData((prev) => ({
                      ...prev,
                      zone_id: selectedZone.zone_id,
                    }));
                    setSelectedZone(null);
                    setActiveTab("scanner");
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Scan This Zone
                </button>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
