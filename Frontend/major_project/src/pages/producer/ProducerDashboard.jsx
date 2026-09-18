import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shipmentAPI, scanAPI } from '../../api/client';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/Toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Sprout,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  BarChart2,
  Sparkles,
  Calendar,
  Phone,
  User,
  FileText,
  Layers,
  Activity,
  TrendingUp,
  RefreshCw,
  Eye,
  ShieldCheck,
  Camera,
  Upload,
  Send,
  Sliders,
  AlertCircle,
  X,
  CloudSun,
  Wind,
  Droplets,
  Thermometer
} from 'lucide-react';

// Custom Tooltip for pure Black & Grey Recharts with glowing accents
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-950 border border-emerald-500/40 p-4 rounded-xl shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)] font-mono text-xs text-white">
        <div className="font-bold text-emerald-400 border-b border-neutral-800 pb-2 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">AI Verified</span>
        </div>
        <div className="flex items-center justify-between gap-6 py-1">
          <span className="text-neutral-400">Total Batch Load:</span>
          <span className="font-bold text-white text-sm">{payload[0].value} kg</span>
        </div>
        <div className="flex items-center justify-between gap-6 py-1">
          <span className="text-neutral-400">AI Grade A Share:</span>
          <span className="font-bold text-emerald-400">{payload[0].payload.gradeAShare}%</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function ProducerDashboard() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Multi-tab support checking 'tab' param from URL search
  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const [shipments, setShipments] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const weatherData = {
    location: 'Nashik, Maharashtra',
    temp: 28,
    humidity: 72,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    forecast: [
      { day: 'Today', high: 30, low: 22, icon: '☀️' },
      { day: 'Tomorrow', high: 28, low: 20, icon: '⛅' },
      { day: 'Wed', high: 26, low: 19, icon: '🌧️' },
    ]
  };

  // Modal state for testing real apple image and dispatching batch
  const [showTestModal, setShowTestModal] = useState(false);
  const [testImageFile, setTestImageFile] = useState(null);
  const [testImagePreview, setTestImagePreview] = useState(null);
  const [predictionStatus, setPredictionStatus] = useState('');
  const [testVariety, setTestVariety] = useState('Royal Gala (Premium Export)');
  const [testWeightKg, setTestWeightKg] = useState('1250');
  const [testRetailer, setTestRetailer] = useState('Vashi APMC Wholesale Market');
  const [testColorUnif, setTestColorUnif] = useState(0.95);
  const [testFirmLoss, setTestFirmLoss] = useState(0.04);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, scRes] = await Promise.all([
        shipmentAPI.getAll(),
        scanAPI.getAll()
      ]);
      setShipments(sRes.data || []);
      setScans(scRes.data || []);
      toast.success('Refreshed', 'Farm data updated.');
    } catch (err) {
      console.error('Error loading producer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabSwitch = (tabName) => {
    navigate(`/producer?tab=${tabName}`);
  };

  // Filter shipments where producer_email === user.email
  const matchedShipments = shipments.filter(s => s.producer_email === user?.email);
  const displayShipments = matchedShipments.length > 0 ? matchedShipments : shipments;

  // KPI calculations
  const totalDispatched = displayShipments.length;
  const gradeScans = scans.filter(sc => 
    displayShipments.some(s => s._id === sc.shipment_id) || true
  );
  const gradeACount = gradeScans.filter(s => s.visual_grade?.includes('Grade A')).length;
  const gradeAShare = gradeScans.length ? Math.round((gradeACount / gradeScans.length) * 100) : 88;
  const pendingPickups = displayShipments.filter(s => s.status === 'SCHEDULED' || s.status === 'PICKED_UP').length;

  // Apple batch sizes across varieties (Royal Gala, Golden Delicious, Red Delicious)
  const appleVarietiesData = [
    { variety: 'Royal Gala', batchSizeKg: 4350, batchesCount: 16, gradeAShare: 91, color: '#10b981' },
    { variety: 'Golden Delicious', batchSizeKg: 2890, batchesCount: 11, gradeAShare: 84, color: '#f59e0b' },
    { variety: 'Red Delicious', batchSizeKg: 3620, batchesCount: 14, gradeAShare: 89, color: '#06b6d4' },
  ];

  // Handle Real Apple Image Test & Dispatch Workflow
  const handleRunTestAndDispatch = async () => {
    if (!testImageFile) {
      alert('Please select an apple image first.');
      return;
    }
    setTestRunning(true);
    setTestResult(null);
    try {
      // 1. Run real AI prediction via image upload
      setPredictionStatus('🔍 Detecting apples in your photo...');
      const formData = new FormData();
      formData.append('image', testImageFile);

      const predRes = await scanAPI.predictAndExplain(formData);
      const prediction = predRes.data;

      setPredictionStatus('📦 Creating shipment...');

      // 2. Create new shipment
      const newShipment = {
        tracking_id: `TRK-LIVE-${Math.floor(Math.random() * 90000 + 10000)}`,
        producer_name: user?.name || 'Nashik Orchard Depot',
        producer_email: user?.email || 'producer@freshy.com',
        retailer_name: testRetailer,
        retailer_email: 'retailer@freshy.com',
        driver_name: 'Suresh Kumar (LogiFast)',
        driver_email: 'driver@freshy.com',
        driver_phone: '+91 98230 44190',
        pickup_address: 'Orchard Gate 4, Nashik Agro Hub, Maharashtra',
        delivery_address: `${testRetailer}, Mumbai, Maharashtra`,
        pickup_coords: { lat: 19.9975, lng: 73.7898 },
        delivery_coords: { lat: 19.0760, lng: 72.8777 },
        status: 'PICKED_UP',
        apple_variety: testVariety,
        batch_size_boxes: Math.round(parseInt(testWeightKg) / 10),
        temperature_c: 2.1,
        humidity_percent: 88,
        eta_hours: 6.5
      };

      const shipRes = await shipmentAPI.create(newShipment);
      const createdShipment = shipRes.data;

      // 3. Save the quality scan linked to this shipment
      await scanAPI.create({
        shipment_id: createdShipment._id || 'SHIP_LIVE_NEW',
        apple_id: prediction.apple_id,
        visual_grade: prediction.predicted_grade,
        visual_score: prediction.confidence,
        rsl_days: prediction.rsl_days,
        xai_explanation: prediction.xai_explanation,
        ml_model_weights: prediction.ml_model_weights,
        shap_values_summary: prediction.shap_values_summary
      });

      setTestResult({
        prediction,
        shipment: createdShipment
      });
      toast.success('Batch Sent!', `Tracking ID: ${createdShipment.tracking_id || 'New Batch'}`);

      // Refresh background data
      await fetchData();
    } catch (err) {
      console.error('Error in live test & dispatch:', err);
      toast.error('AI Error', 'Error running AI prediction. Please verify server connection.');
    } finally {
      setTestRunning(false);
      setPredictionStatus('');
    }
  };

  if (loading && !shipments.length) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px] bg-black text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 shadow-[0_0_15px_#10b981]" />
          <span className="text-xs font-mono tracking-widest uppercase text-emerald-400">Loading your farm data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-black min-h-full text-neutral-100 font-sans selection:bg-neutral-800 selection:text-white">
      {/* Header (Clean, Full-Width, No Cramped Tabs inside) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>My Farm Dashboard (`Freshy`)</span>
            {matchedShipments.length === 0 && (
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px]">
                Showing Demo Pool
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/20 border border-emerald-500/40 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <span>Apple Harvest & Delivery Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Check your apple quality grades, manage batches, and schedule driver pickups.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-bold transition shadow-sm cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-300" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>+ 📸 Upload Apple Photo & Send Batch</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Cards — Black theme with glowing emerald/lime edges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-emerald-500/30 hover:border-emerald-500/60 p-6 rounded-2xl shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)] relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Batches Sent</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{totalDispatched}</div>
              <div className="mt-2 text-xs text-emerald-400/80 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Batches currently on the road</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-lime-500/30 hover:border-lime-500/60 p-6 rounded-2xl shadow-[0_0_30px_-10px_rgba(132,204,22,0.15)] relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-lime-400 uppercase tracking-widest font-bold">Premium Quality %</span>
                <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/30">
                  <ShieldCheck className="w-5 h-5 text-lime-400" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{gradeAShare}%</div>
              <div className="mt-2 text-xs text-lime-400/80 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>Checked by AI Quality Scanner</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-cyan-500/30 hover:border-cyan-500/60 p-6 rounded-2xl shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">Waiting for Pickup</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{pendingPickups}</div>
              <div className="mt-2 text-xs text-cyan-400/80 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Driver will come to collect these</span>
              </div>
            </div>
          </div>

          {/* Local Weather — Harvest Planning */}
          <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold mb-1">
                  <CloudSun className="w-4 h-4" />
                  <span>Local Weather — Harvest Planning</span>
                </div>
                <h3 className="text-lg font-bold text-white">{weatherData.location}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-white">{weatherData.temp}°C</span>
                <span className="text-3xl">⛅</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-black/40 rounded-xl p-3 border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">Condition</div>
                <div className="text-sm font-bold text-white">{weatherData.condition}</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1 flex items-center gap-1"><Droplets className="w-3 h-3" /> Humidity</div>
                <div className="text-sm font-bold text-cyan-400">{weatherData.humidity}%</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1 flex items-center gap-1"><Wind className="w-3 h-3" /> Wind</div>
                <div className="text-sm font-bold text-white">{weatherData.windSpeed} km/h</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase font-mono mb-1">3-Day Forecast</div>
                <div className="flex items-center gap-2 text-sm">
                  {weatherData.forecast.map((f, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-neutral-400">{f.day}</div>
                      <div className="text-base">{f.icon}</div>
                      <div className="text-[10px] text-neutral-300 font-mono">{f.high}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
              <span className="font-bold">🌱 Harvest Tip:</span> {weatherData.humidity > 70 ? 'High humidity today — harvest early morning for best freshness and reduce post-harvest fungal risk.' : 'Good conditions for harvesting today.'}
            </div>
          </div>

          {/* Recharts + Quick Dispatch Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 border-b border-neutral-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">Batch Sizes by Apple Type</h3>
                      <p className="text-xs text-neutral-400 font-mono">Total weight of each apple variety</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    Current Season
                  </span>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appleVarietiesData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <XAxis
                        dataKey="variety"
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#262626' }}
                      />
                      <YAxis
                        stroke="#737373"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#262626' }}
                        tickFormatter={(v) => `${v}kg`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                      <Bar dataKey="batchSizeKg" radius={[8, 8, 0, 0]}>
                        {appleVarietiesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Action Preview Card */}
            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-emerald-500/30 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">How Our AI Checks Your Apples</h3>
                    <p className="text-xs text-neutral-400">AI Quality Process</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed bg-black/60 p-4 rounded-xl border border-neutral-800">
                  Every batch of apples is photographed and checked by our AI. It looks at color, shape, and bruises to decide the quality grade (A, B, or C) and estimates how many days the apples will stay fresh.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-300 font-medium">Grade A (Best Quality)</span>
                    <span className="font-mono font-bold text-emerald-400">Stays fresh: 20-25 days</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-300 font-medium">Grade B (Good Quality)</span>
                    <span className="font-mono font-bold text-amber-400">Stays fresh: 12-16 days</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTestModal(true)}
                className="w-full mt-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-lime-500 text-black shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Apple Photo Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCHES TAB */}
      {currentTab === 'batches' && (
        <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">My Apple Batches</h3>
              <p className="text-xs text-neutral-400">All your batches and their delivery status</p>
            </div>
            <button
              onClick={() => setShowTestModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>+ Send New Batch</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-mono text-neutral-400 uppercase tracking-widest bg-black/40">
                  <th className="py-3 px-4 rounded-tl-xl">Tracking / Batch ID</th>
                  <th className="py-3 px-4">Apple Variety & Load</th>
                  <th className="py-3 px-4">Quality Grade</th>
                  <th className="py-3 px-4">Days Fresh</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs text-neutral-300">
                {displayShipments.map((shipment) => {
                  const matchingScan = scans.find(sc => sc.shipment_id === shipment._id) || scans[0];
                  const gradeText = matchingScan?.visual_grade || 'Grade A (Premium Export)';
                  const rsl = matchingScan?.rsl_days || 21.5;
                  const score = matchingScan?.visual_score || 0.96;

                  const isGradeA = gradeText.includes('Grade A');
                  const isGradeB = gradeText.includes('Grade B');

                  return (
                    <tr key={shipment._id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-emerald-400" />
                          <span>{shipment.tracking_id || shipment._id?.slice(-8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{shipment.apple_variety || shipment.variety || 'Royal Gala (Premium)'}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{shipment.batch_size_boxes || 500} boxes ({((shipment.batch_size_boxes || 500) * 10).toLocaleString()} kg)</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isGradeA
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]'
                            : isGradeB
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          <span>{gradeText.split(' ')[0]} {gradeText.split(' ')[1]}</span>
                        </span>
                        <div className="text-[10px] text-neutral-400 font-mono mt-1">Conf: {(score * 100).toFixed(1)}%</div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                        {rsl} days RSL
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{shipment.driver_name || 'Suresh Kumar (LogiFast)'}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">{shipment.driver_phone || '+91 98230 44190'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${
                          shipment.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : shipment.status === 'IN_TRANSIT'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          {shipment.status || 'SCHEDULED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE TAB */}
      {currentTab === 'schedule' && (
        <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Driver Pickup Schedule</h3>
              <p className="text-xs text-neutral-400">When the driver will come to collect your batches</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-mono text-neutral-400 uppercase tracking-widest bg-black/40">
                  <th className="py-3 px-4 rounded-tl-xl">Scheduled Window</th>
                  <th className="py-3 px-4">Batch Reference</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">Phone & Address</th>
                  <th className="py-3 px-4 rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs text-neutral-300">
                {displayShipments.map((s, idx) => (
                  <tr key={s._id || idx} className="hover:bg-neutral-800/40 transition">
                    <td className="py-4 px-4 font-mono text-white font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Today, {0 + idx + 2}:00 PM - {0 + idx + 4}:00 PM</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      {s.tracking_id || s._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{s.driver_name || 'Suresh Kumar'}</div>
                      <div className="text-[11px] text-neutral-400">LogiFast Cold-Chain Division</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-neutral-300">{s.driver_phone || '+91 98230 44190'}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{s.pickup_address || 'Orchard Gate 4, Nashik Agro Hub'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(s.driver_phone || '+91 98230 44190');
                          alert('Driver contact copied to clipboard!');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-mono text-xs transition cursor-pointer"
                      >
                        Copy Phone
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERACTIVE MODAL: Test Real Apple Image & Dispatch Harvest */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-neutral-950 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/20 border border-emerald-500/40 text-emerald-400">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Upload Apple Photo & Send Batch</h2>
                <p className="text-xs text-neutral-400 font-mono">Upload an apple photo, check its quality, and send the batch to a driver</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Image Selector / Preview */}
              <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
                <label className="block text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  Step 1: Upload an Apple Photo
                </label>
                <div className="flex flex-col items-center gap-4">
                  {testImagePreview ? (
                    <div className="relative">
                      <img src={testImagePreview} alt="Apple preview" className="w-40 h-40 object-cover rounded-2xl border-2 border-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]" />
                      <button
                        onClick={() => { setTestImageFile(null); setTestImagePreview(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-400 transition cursor-pointer"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-500 gap-2">
                      <Camera className="w-8 h-8" />
                      <span className="text-xs font-mono">No photo yet</span>
                    </div>
                  )}
                  <label className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer hover:bg-emerald-500/30 transition">
                    📷 Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setTestImageFile(file);
                          setTestImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Batch Metadata Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Apple Variety</label>
                  <select
                    value={testVariety}
                    onChange={(e) => setTestVariety(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                  >
                    <option value="Royal Gala (Premium Export)">Royal Gala (Premium Export)</option>
                    <option value="Golden Delicious (High Crisp)">Golden Delicious (High Crisp)</option>
                    <option value="Red Delicious (Orchard Select)">Red Delicious (Orchard Select)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Batch Weight (kg)</label>
                  <input
                    type="number"
                    value={testWeightKg}
                    onChange={(e) => setTestWeightKg(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">Destination Retail Hub</label>
                  <select
                    value={testRetailer}
                    onChange={(e) => setTestRetailer(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none transition"
                  >
                    <option value="Vashi APMC Wholesale Market">Vashi APMC Wholesale Market (Mumbai)</option>
                    <option value="Nashik Premium Fruit Market">Nashik Premium Fruit Market</option>
                    <option value="HyperCity Cold Store Depot">HyperCity Cold Store Depot (Pune)</option>
                  </select>
                </div>
              </div>

              {/* AI Processing Status */}
              {predictionStatus && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
                  <span className="text-sm font-mono text-emerald-400">{predictionStatus}</span>
                </div>
              )}

              {/* Action Button / Results */}
              {!testResult ? (
                <button
                  onClick={handleRunTestAndDispatch}
                  disabled={testRunning || !testImageFile}
                  className="w-full py-4 rounded-2xl text-sm font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 text-black shadow-[0_0_30px_-5px_rgba(16,185,129,0.7)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                      <span>Checking quality and sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Check Quality & Send to Driver</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/40 p-5 rounded-2xl space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">✅ Batch Sent Successfully!</h4>
                      <p className="text-xs text-emerald-300 font-mono">Driver: Suresh Kumar will pick it up</p>
                    </div>
                  </div>

                  <div className="bg-black p-4 rounded-xl border border-neutral-800 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Tracking ID:</span>
                      <span className="font-bold text-emerald-400">{testResult.shipment.tracking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Quality Grade:</span>
                      <span className="font-bold text-white">{testResult.prediction.predicted_grade} ({(testResult.prediction.confidence * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Stays Fresh For:</span>
                      <span className="font-bold text-emerald-400">{testResult.prediction.rsl_days} Days</span>
                    </div>
                    
                    <div className="pt-3 border-t border-neutral-800 space-y-1">
                      <span className="block text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Tips for Better Quality:</span>
                      <span className="text-neutral-300 block">
                        {testFirmLoss > 0.1 ? "⚠️ Apples are a bit soft. Try cooling them faster after picking." : "✅ Firmness is excellent."} {testColorUnif < 0.85 ? "Apple color is uneven. Make sure trees get enough sunlight by pruning branches." : "Color uniformity is optimal for premium export."}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowTestModal(false);
                        navigate('/driver');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black font-black text-xs hover:bg-cyan-400 transition shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)] cursor-pointer"
                    >
                      Track Delivery 🚚
                    </button>
                    <button
                      onClick={() => {
                        setTestResult(null);
                        setShowTestModal(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
