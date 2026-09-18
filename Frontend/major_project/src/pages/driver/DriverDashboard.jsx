import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shipmentAPI } from '../../api/client';
import useAuthStore from '../../store/authStore';
import MapView from '../../components/MapView';
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  RefreshCw,
  History,
  Activity,
  Thermometer,
  Gauge,
  Play,
  Pause,
  Radio,
  Compass,
  Layers,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertOctagon,
  PhoneCall
} from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function DriverDashboard() {
  const toast = useToast();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Multi-tab support checking 'tab' param from URL search
  const currentTab = new URLSearchParams(location.search).get('tab') || 'active';

  const [shipments, setShipments] = useState([]);
  const [activeShipment, setActiveShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Interactive Transit Telemetry Simulation State
  const [simulating, setSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(62);
  const [simTemp, setSimTemp] = useState('2.1°C');
  const [simSignal, setSimSignal] = useState('RTK Locked (14 Satellites)');

  const [sosActive, setSosActive] = useState(false);

  const handleSOS = () => {
    setSosActive(true);
    toast.error('🚨 SOS Alert Sent!', 'Emergency alert has been sent to Admin and Producer. Help is on the way!');
    setTimeout(() => setSosActive(false), 5000);
  };

  const fetchDriverShipments = async () => {
    setLoading(true);
    try {
      const res = await shipmentAPI.getAll();
      const allData = res.data || [];
      setShipments(allData);

      // Filter shipments where driver_email === user.email
      const matched = allData.filter(s => s.driver_email === user?.email);
      const displayPool = matched.length > 0 ? matched : allData;

      if (displayPool.length > 0 && !activeShipment) {
        const active = displayPool.find(s => s.status === 'IN_TRANSIT') || displayPool.find(s => s.status === 'PICKED_UP') || displayPool[0];
        setActiveShipment(active);
      } else if (activeShipment) {
        const refreshed = displayPool.find(s => s._id === activeShipment._id) || displayPool[0];
        setActiveShipment(refreshed);
      }
    } catch (err) {
      console.error('Error loading driver trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverShipments();
  }, []);

  // Telemetry Simulation Loop
  useEffect(() => {
    let interval;
    if (simulating) {
      const speedSequence = [62, 65, 68, 64, 67, 63, 66];
      const tempSequence = ['2.1°C', '2.2°C', '2.4°C', '2.3°C', '2.0°C', '2.2°C'];
      const signalSequence = ['RTK Locked (14 Satellites)', 'RTK Locked (15 Satellites)', 'DGPS Active (12 Satellites)'];
      let step = 0;

      interval = setInterval(() => {
        step++;
        setSimSpeed(speedSequence[step % speedSequence.length]);
        setSimTemp(tempSequence[step % tempSequence.length]);
        setSimSignal(signalSequence[step % signalSequence.length]);
      }, 1500);
    } else {
      setSimSpeed(62);
      setSimTemp('2.1°C');
      setSimSignal('RTK Locked (14 Satellites)');
    }
    return () => clearInterval(interval);
  }, [simulating]);

  const handleStatusChange = async (newStatus) => {
    if (!activeShipment || updating) return;
    setUpdating(true);
    try {
      await shipmentAPI.updateStatus(activeShipment._id, newStatus);
      await fetchDriverShipments();
      if (newStatus === 'PICKED_UP') {
        toast.success('Apples Picked Up!', 'Status updated. Start driving to the delivery location.');
      } else if (newStatus === 'IN_TRANSIT') {
        toast.info('On the Way!', 'Status updated to In Transit. Drive safely!');
      } else if (newStatus === 'DELIVERED') {
        toast.success('Delivery Complete!', 'Apples delivered successfully. Great job!');
      }
    } catch (err) {
      alert('Failed to update trip status. Please check connection.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTabSwitch = (tabName) => {
    navigate(`/driver?tab=${tabName}`);
  };

  // Compute filtered shipments for display
  const matchedShipments = shipments.filter(s => s.driver_email === user?.email);
  const displayShipments = matchedShipments.length > 0 ? matchedShipments : shipments;
  const historyShipments = displayShipments.filter(s => s.status === 'DELIVERED' || s.status === 'COMPLETED');
  const finalHistoryPool = historyShipments.length > 0 ? historyShipments : displayShipments;

  if (loading && !shipments.length) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px] bg-black text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 shadow-[0_0_15px_#06b6d4]" />
          <span className="text-xs font-mono tracking-widest uppercase text-cyan-400">Loading your routes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 bg-black min-h-full text-neutral-100 font-sans selection:bg-neutral-800 selection:text-white">
      {/* Header (Clean, Full-Width, No Cramped Tabs inside) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 font-bold">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>My Delivery Dashboard (`Freshy`)</span>
            {matchedShipments.length === 0 && (
              <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px]">
                Showing Demo Pool
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]">
              <Truck className="w-6 h-6 text-cyan-400" />
            </div>
            <span>My Routes & Deliveries</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Track your delivery route, check truck temperature, and update your trip status.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSOS}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 cursor-pointer ${
              sosActive 
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_30px_-5px_rgba(239,68,68,0.8)]'
                : 'bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/40 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{sosActive ? 'SOS SENT!' : '🚨 SOS Emergency'}</span>
          </button>
          
          <button
            onClick={() => fetchDriverShipments().then(() => toast.success('Refreshed', 'Your routes have been updated.'))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-black font-bold text-xs transition shadow-[0_0_20px_-5px_rgba(6,182,212,0.6)] shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Routes</span>
          </button>
        </div>
      </div>

      {/* Temperature Alert Banner */}
      {activeShipment && simTemp && parseFloat(simTemp) > 4.0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/15 border border-red-500/50 shadow-[0_0_25px_-5px_rgba(239,68,68,0.3)] animate-pulse">
          <AlertOctagon className="w-6 h-6 text-red-400 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold text-red-400">⚠️ TRUCK TOO HOT! Apples May Spoil!</div>
            <div className="text-xs text-red-300/80 mt-0.5">Current temperature: {simTemp} — Must stay below 4.0°C. Pull over and check refrigeration unit immediately.</div>
          </div>
          <button onClick={handleSOS} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition cursor-pointer shrink-0">
            Send SOS
          </button>
        </div>
      )}

      {/* ACTIVE TAB */}
      {currentTab === 'active' && (
        <div className="space-y-8 animate-fadeIn">
          {activeShipment ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: MapView & Route Metadata */}
              <div className="lg:col-span-8 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-cyan-400 uppercase tracking-wider font-mono font-bold flex items-center gap-1.5">
                        <span>Current Delivery Route</span>
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                      <div className="font-bold text-base text-white mt-0.5">
                        {activeShipment.pickup_address.split(',')[0]} ➔ {activeShipment.delivery_address.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-neutral-300 bg-black px-3 py-1.5 rounded-lg border border-neutral-800">
                      ID: {activeShipment.tracking_id || activeShipment._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
                      activeShipment.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]'
                        : activeShipment.status === 'IN_TRANSIT'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_-3px_rgba(6,182,212,0.3)] animate-pulse'
                        : activeShipment.status === 'PICKED_UP'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-[0_0_12px_-3px_rgba(168,85,247,0.3)]'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {activeShipment.status}
                    </span>
                  </div>
                </div>

                {/* MapView passing required props: pickup, delivery, status, pickupAddress, deliveryAddress */}
                <MapView
                  pickup={activeShipment.pickup_coords}
                  delivery={activeShipment.delivery_coords}
                  status={activeShipment.status}
                  pickupAddress={activeShipment.pickup_address}
                  deliveryAddress={activeShipment.delivery_address}
                  driverName={activeShipment.driver_name || user?.name || 'Active Driver'}
                  trackingId={activeShipment.tracking_id}
                />

                {/* Route Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-800/80">
                  <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800/80 hover:border-cyan-500/30 transition">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Pick Up From</div>
                    <div className="text-xs font-bold text-white mt-1 truncate" title={activeShipment.pickup_address}>
                      {activeShipment.pickup_address}
                    </div>
                  </div>
                  <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800/80 hover:border-cyan-500/30 transition">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Deliver To</div>
                    <div className="text-xs font-bold text-white mt-1 truncate" title={activeShipment.delivery_address}>
                      {activeShipment.delivery_address}
                    </div>
                  </div>
                  <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800/80 hover:border-cyan-500/30 transition">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">What's in the Truck</div>
                    <div className="text-xs font-bold text-white mt-1">
                      {activeShipment.apple_variety || activeShipment.variety || 'Royal Gala'} ({activeShipment.batch_size_boxes || 50} boxes)
                    </div>
                  </div>
                  <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800/80 hover:border-cyan-500/30 transition">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Arrives In</div>
                    <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">
                      {activeShipment.eta_hours ? `${activeShipment.eta_hours} Hours` : 'In 4.5 Hours'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Transit Telemetry Box */}
              <div className="lg:col-span-4 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_35px_-10px_rgba(6,182,212,0.15)] space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span>Trip Controls</span>
                    </h3>
                    <span className={`w-2.5 h-2.5 rounded-full ${simulating ? 'bg-cyan-400 animate-ping' : 'bg-neutral-600'}`} />
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Update your speed, check truck temperature, and mark delivery steps.
                  </p>
                </div>

                {/* Simulate GPS Movement & Cold-Chain Telemetry Toggle */}
                <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-cyan-400" />
                        <span>Trip Simulator</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Test speed and temperature changes
                      </div>
                    </div>
                    <button
                      onClick={() => setSimulating(!simulating)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                        simulating
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)] scale-105'
                          : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-cyan-500/50'
                      }`}
                    >
                      {simulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{simulating ? 'ACTIVE' : 'START'}</span>
                    </button>
                  </div>

                  {/* Dynamic Telemetry Feedback Indicators */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
                    <div className="bg-neutral-900/80 p-3 rounded-lg border border-neutral-800">
                      <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between font-bold">
                        <span>SPEED</span>
                        <Gauge className="w-3 h-3 text-cyan-400" />
                      </div>
                      <div className="text-lg font-black text-white mt-1 font-mono flex items-baseline gap-1">
                        <span>{simSpeed}</span>
                        <span className="text-xs font-normal text-neutral-400">km/h</span>
                      </div>
                    </div>

                    <div className="bg-neutral-900/80 p-3 rounded-lg border border-neutral-800">
                      <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-between font-bold">
                        <span>TRUCK TEMP</span>
                        <Thermometer className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
                        {simTemp}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-300 bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-800 flex items-center justify-between">
                    <span className="text-neutral-400">GPS Signal Status:</span>
                    <span className="text-cyan-400 font-bold">{simSignal}</span>
                  </div>
                </div>

                {/* 3-Step Status Progression Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>Update Your Trip Status:</span>
                    <span className="text-[10px] text-cyan-400">Click the next step when ready</span>
                  </div>

                  {/* Step 1: PICKED_UP */}
                  <button
                    disabled={updating || activeShipment.status === 'PICKED_UP' || activeShipment.status === 'IN_TRANSIT' || activeShipment.status === 'DELIVERED'}
                    onClick={() => handleStatusChange('PICKED_UP')}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer border ${
                      activeShipment.status === 'PICKED_UP' || activeShipment.status === 'IN_TRANSIT' || activeShipment.status === 'DELIVERED'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-inner'
                        : 'bg-black hover:bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        activeShipment.status === 'PICKED_UP' || activeShipment.status === 'IN_TRANSIT' || activeShipment.status === 'DELIVERED' ? 'bg-purple-500 text-black font-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>1</div>
                      <span>✅ I Picked Up the Apples</span>
                    </div>
                    {(activeShipment.status === 'PICKED_UP' || activeShipment.status === 'IN_TRANSIT' || activeShipment.status === 'DELIVERED') && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>

                  {/* Step 2: IN_TRANSIT */}
                  <button
                    disabled={updating || activeShipment.status === 'IN_TRANSIT' || activeShipment.status === 'DELIVERED'}
                    onClick={() => handleStatusChange('IN_TRANSIT')}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer border ${
                      activeShipment.status === 'IN_TRANSIT'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black border-cyan-400 shadow-[0_0_20px_-3px_rgba(6,182,212,0.5)] font-black'
                        : activeShipment.status === 'DELIVERED'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-inner'
                        : 'bg-black hover:bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        activeShipment.status === 'IN_TRANSIT' ? 'bg-black text-cyan-400 font-black' : activeShipment.status === 'DELIVERED' ? 'bg-cyan-500 text-black font-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>2</div>
                      <span>🚚 I'm On the Way</span>
                    </div>
                    {activeShipment.status === 'IN_TRANSIT' && <Truck className="w-4 h-4 text-black animate-pulse" />}
                    {activeShipment.status === 'DELIVERED' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </button>

                  {/* Step 3: DELIVERED */}
                  <button
                    disabled={updating || activeShipment.status === 'DELIVERED'}
                    onClick={() => handleStatusChange('DELIVERED')}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer border ${
                      activeShipment.status === 'DELIVERED'
                        ? 'bg-gradient-to-r from-emerald-500 to-lime-500 text-black border-emerald-400 shadow-[0_0_20px_-3px_rgba(16,185,129,0.5)] font-black'
                        : 'bg-black hover:bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        activeShipment.status === 'DELIVERED' ? 'bg-black text-emerald-400 font-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>3</div>
                      <span>📦 I Delivered the Apples</span>
                    </div>
                    {activeShipment.status === 'DELIVERED' && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </button>
                </div>

                <div className="p-3 bg-black rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Picked From:</span>
                    <span className="text-white font-semibold">{activeShipment.producer_name || 'Orchard Depot'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivering To:</span>
                    <span className="text-white font-semibold">{activeShipment.retailer_name || 'Vashi APMC Hub'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 rounded-2xl border border-cyan-500/30 text-neutral-400 space-y-4 shadow-xl">
              <AlertCircle className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-white">No Delivery Selected</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Choose a delivery from the list below to start tracking.
                </p>
              </div>
              <button
                onClick={fetchDriverShipments}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-xs shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)] hover:brightness-110 transition"
              >
                Refresh My Routes
              </button>
            </div>
          )}

          {/* Quick Selector Pool for Active Tab */}
          <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800/80">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>My Assigned Deliveries ({displayShipments.length})</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                Tap a delivery to start
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayShipments.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setActiveShipment(s)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    activeShipment?._id === s._id
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] scale-[1.02]'
                      : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                      <Truck className={`w-3.5 h-3.5 ${activeShipment?._id === s._id ? 'text-cyan-400' : 'text-neutral-500'}`} />
                      <span>{s.tracking_id || s._id?.slice(-8).toUpperCase()}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      s.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : s.status === 'IN_TRANSIT'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="truncate text-white font-semibold">From: {s.pickup_address.split(',')[0]}</div>
                    <div className="truncate text-neutral-400">To: {s.delivery_address.split(',')[0]}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
                    <span className="font-mono text-cyan-400 font-bold">{s.apple_variety || 'Royal Gala'}</span>
                    <span className={`font-bold ${activeShipment?._id === s._id ? 'text-cyan-400' : 'text-neutral-400'}`}>
                      {activeShipment?._id === s._id ? '● Selected Route' : 'Select Route ➔'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {currentTab === 'history' && (
        <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <span>My Past Deliveries</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                All your completed deliveries and their details.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg">
              Total Records: <strong className="text-white">{finalHistoryPool.length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider bg-black/40">
                  <th className="py-3.5 px-4 rounded-tl-xl">Tracking ID</th>
                  <th className="py-3.5 px-4">From → To</th>
                  <th className="py-3.5 px-4">What Was Carried</th>
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70 text-xs text-neutral-300">
                {finalHistoryPool.map((s) => (
                  <tr key={s._id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-white">{s.tracking_id || s._id?.slice(-8).toUpperCase()}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white max-w-xs truncate">{s.pickup_address.split(',')[0]}</div>
                      <div className="text-[11px] text-neutral-400 max-w-xs truncate">➔ {s.delivery_address.split(',')[0]}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{s.apple_variety || 'Royal Gala'} ({s.batch_size_boxes || 50} boxes)</div>
                      <div className="text-[11px] font-mono text-emerald-400">{s.temp_threshold || '2.1°C Cold-Chain Verified'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{s.driver_name || user?.name || 'Suresh Kumar'}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{s.driver_phone || '+91 98230 44190'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveShipment(s);
                          handleTabSwitch('active');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                      >
                        View on Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
