import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shipmentAPI, scanAPI } from '../../api/client';
import { useToast } from '../../components/Toast';
import {
  ShoppingBag,
  Cpu,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Package,
  Truck,
  FileText,
  Activity,
  ChevronRight,
  Eye,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';

export default function RetailerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'deliveries';

  const toast = useToast();
  const [deliveryActions, setDeliveryActions] = useState({});

  const [shipments, setShipments] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatedResult, setSimulatedResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Real image upload states for AI simulator
  const [simImageFile, setSimImageFile] = useState(null);
  const [simImagePreview, setSimImagePreview] = useState(null);
  const [simStatus, setSimStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, scRes] = await Promise.all([
        shipmentAPI.getAll(),
        scanAPI.getAll()
      ]);
      setShipments(sRes.data || []);
      setScans(scRes.data || []);
    } catch (err) {
      console.error('Error loading retailer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptDelivery = (shipmentId, trackingId) => {
    setDeliveryActions(prev => ({ ...prev, [shipmentId]: 'accepted' }));
    toast.success('Delivery Accepted!', `${trackingId} has been accepted. Apples are now in your inventory.`);
  };

  const handleRejectDelivery = (shipmentId, trackingId) => {
    setDeliveryActions(prev => ({ ...prev, [shipmentId]: 'rejected' }));
    toast.error('Delivery Rejected', `${trackingId} has been rejected. The producer will be notified.`);
  };

  const handleTabChange = (tabKey) => {
    navigate(`?tab=${tabKey}`);
  };

  const handleRunSimulator = async (e) => {
    e.preventDefault();
    if (!simImageFile) {
      toast.error('No Image', 'Please upload an apple photo first.');
      return;
    }
    setSimulating(true);
    setSimulatedResult(null);
    try {
      setSimStatus('🔍 Detecting apple in your photo...');
      const formData = new FormData();
      formData.append('image', simImageFile);

      setSimStatus('🧠 Running AI quality analysis (this takes 10-30 seconds)...');
      const res = await scanAPI.predictAndExplain(formData);
      setSimulatedResult(res.data);
      toast.success('AI Analysis Complete', `Grade: ${res.data.predicted_grade} — Confidence: ${(res.data.confidence * 100).toFixed(1)}%`);
    } catch (err) {
      console.error('AI prediction error:', err);
      toast.error('AI Error', 'Could not run AI analysis. Make sure the backend is running with ML models loaded.');
    } finally {
      setSimulating(false);
      setSimStatus('');
    }
  };

  if (loading && !scans.length && !shipments.length) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px] bg-black text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 shadow-[0_0_15px_#f59e0b]" />
          <span className="text-xs font-mono tracking-widest uppercase text-amber-400">Loading your deliveries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 bg-black min-h-full text-white font-sans selection:bg-neutral-800 selection:text-white">
      {/* Header Banner (Clean, Full-Width, No Cramped Tabs inside) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>My Shop Dashboard (`Freshy`)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-white shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
            </div>
            <span>Incoming Deliveries & Quality Checker</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Check incoming apple deliveries, see their quality grades, and understand why the AI gave each grade.
          </p>
        </div>

        <button
          onClick={async () => {
            await fetchData();
            toast.success('Refreshed', 'Delivery data updated.');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black font-bold text-xs rounded-xl transition shadow-[0_0_20px_-5px_rgba(245,158,11,0.6)] shrink-0 cursor-pointer"
          title="Refresh Dashboard"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab 1: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>Incoming Apple Deliveries</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                See what's coming to your shop, who's delivering it, and when it arrives.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-xl">
              Total Active: {shipments.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider bg-black/40">
                  <th className="py-3.5 px-4 rounded-tl-xl">Tracking ID</th>
                  <th className="py-3.5 px-4">Farm</th>
                  <th className="py-3.5 px-4">Apple Variety & Load</th>
                  <th className="py-3.5 px-4">Quality Grade</th>
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Status & Arrival</th>
                  <th className="py-3.5 px-4 rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70 text-xs text-neutral-300">
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                      No deliveries coming right now.
                    </td>
                  </tr>
                ) : (
                  shipments.map((s) => {
                    const matchingScan = scans.find(sc => sc.shipment_id === s._id) || scans[0];
                    const gradeText = matchingScan?.visual_grade || 'Grade A (Premium Export)';
                    const isGradeA = gradeText.includes('Grade A');
                    const isGradeB = gradeText.includes('Grade B');

                    return (
                      <tr key={s._id} className="hover:bg-neutral-800/40 transition">
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-amber-400" />
                            <span>{s.tracking_id || s._id?.slice(-8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-white">
                          {s.producer_name || 'Nashik Orchard Depot'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{s.variety || s.apple_variety || 'Royal Gala (Premium)'}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{s.batch_size_boxes || 50} boxes ({((s.batch_size_boxes || 50)*10).toLocaleString()} kg)</div>
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
                          {matchingScan?.rsl_days && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Timer className="w-3 h-3 text-amber-400" />
                              <span className={`text-[11px] font-mono font-bold ${
                                matchingScan.rsl_days > 15 ? 'text-emerald-400' : matchingScan.rsl_days > 8 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                Fresh for {matchingScan.rsl_days} days
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{s.driver_name || 'Suresh Kumar'}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{s.driver_phone || '+91 98230 44190'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-mono border ${
                            s.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : s.status === 'IN_TRANSIT'
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}>
                            <span>{s.status} ({s.estimated_delivery || 'In 4.5h'})</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {deliveryActions[s._id] === 'accepted' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle className="w-3.5 h-3.5" /> Accepted
                            </span>
                          ) : deliveryActions[s._id] === 'rejected' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptDelivery(s._id, s.tracking_id || s._id?.slice(-8).toUpperCase())}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => handleRejectDelivery(s._id, s.tracking_id || s._id?.slice(-8).toUpperCase())}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition cursor-pointer"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: XAI INSPECTION CARDS */}
      {activeTab === 'xai' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-amber-500/30 p-5 rounded-2xl shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Why Did the AI Give This Grade?</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Understand exactly what the AI looked at when grading each apple batch — color, shape, bruises, and freshness.
              </p>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-xl font-bold font-mono">
              AI Verified ✓
            </span>
          </div>

          {scans.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 text-xs">
              No quality reports available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scans.map((sc) => (
                <div
                  key={sc._id}
                  className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-6 shadow-2xl flex flex-col justify-between transition space-y-6"
                >
                  <div className="space-y-4">
                    {/* Header: apple_id & visual_grade */}
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-mono font-bold text-sm text-white tracking-wide">
                          {sc.apple_id || 'APPLE_BATCH_01'}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {sc.visual_grade || 'Grade A (Premium)'}
                      </span>
                    </div>

                    {/* ml_model_weights breakdown (Swin, ConvNeXt, ViT) */}
                    <div className="bg-black p-3.5 rounded-xl border border-neutral-800 space-y-2.5 shadow-inner">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between font-mono">
                        <span>AI Confidence Breakdown</span>
                        <span className="text-emerald-400 font-bold">
                          Conf: {(sc.visual_score * 100 || 96.4).toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                        <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[10px] text-neutral-400 uppercase">Swin</div>
                          <div className="font-bold text-amber-400 mt-0.5">
                            {sc.ml_model_weights?.swin || 0.52}
                          </div>
                        </div>
                        <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[10px] text-neutral-400 uppercase">ConvNeXt</div>
                          <div className="font-bold text-amber-400 mt-0.5">
                            {sc.ml_model_weights?.convnext || 0.31}
                          </div>
                        </div>
                        <div className="bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                          <div className="text-[10px] text-neutral-400 uppercase">ViT</div>
                          <div className="font-bold text-amber-400 mt-0.5">
                            {sc.ml_model_weights?.vit || 0.17}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complete xai_explanation text */}
                    <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Quality Summary</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                        {sc.xai_explanation || 'The ensemble model predicted Grade A for this sample with high confidence driven by cuticle uniformity and zero internal thermal degradation.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400">
                    <div>
                      What You Should Do:{' '}
                      <strong className="text-white font-semibold">
                        {sc.recommended_action || 'Premium Export / Top-Tier Supermarket Dispatch'}
                      </strong>
                    </div>
                    <span className="font-mono text-[11px] text-amber-400 font-bold">
                      RSL: {sc.rsl_days || 22.5} Days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Try the AI Apple Grader Yourself</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Adjust the quality settings below and see what grade the AI would give.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-xl">
              Live Testing
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Simulation Controls Form */}
            <form onSubmit={handleRunSimulator} className="lg:col-span-5 space-y-5 bg-black p-5 rounded-2xl border border-neutral-800 shadow-xl">
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3">
                    Upload an Apple Photo
                  </label>
                  <div className="flex flex-col items-center gap-4">
                    {simImagePreview ? (
                      <div className="relative">
                        <img src={simImagePreview} alt="Apple preview" className="w-40 h-40 object-cover rounded-2xl border-2 border-amber-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]" />
                        <button
                          type="button"
                          onClick={() => { setSimImageFile(null); setSimImagePreview(null); setSimulatedResult(null); }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-400 transition cursor-pointer"
                        >✕</button>
                      </div>
                    ) : (
                      <div className="w-40 h-40 rounded-2xl border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-500 gap-2">
                        <Eye className="w-8 h-8" />
                        <span className="text-xs font-mono">No photo yet</span>
                      </div>
                    )}
                    <label className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest cursor-pointer hover:bg-amber-500/30 transition">
                      📷 Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSimImageFile(file);
                            setSimImagePreview(URL.createObjectURL(file));
                            setSimulatedResult(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* AI Info */}
                <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                    How This Works
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Upload any apple photo. Our AI uses <strong className="text-amber-400">YOLO</strong> to detect the apple,
                    then passes it through <strong className="text-amber-400">3 trained models</strong> (Swin Transformer, ConvNeXt, ViT)
                    to extract quality features. An <strong className="text-amber-400">SVM classifier</strong> predicts the freshness grade,
                    and <strong className="text-amber-400">SHAP</strong> explains exactly why.
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">⏱️ Takes 10-30 seconds to process</p>
                </div>

                {/* Processing Status */}
                {simStatus && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500" />
                    <span className="text-xs font-mono text-amber-400">{simStatus}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={simulating || !simImageFile}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-black font-black py-3.5 px-4 rounded-xl shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50 text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {simulating ? '🧠 AI is analyzing...' : 'Check Apple Quality'}
                </span>
              </button>
            </form>

            {/* Dynamic Result Panel */}
            <div className="lg:col-span-7 bg-black p-6 rounded-2xl border border-neutral-800 min-h-[480px] flex flex-col justify-between shadow-xl">
              {simulatedResult ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-white tracking-wide">
                        Inference Output: {simulatedResult.apple_id}
                      </span>
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {simulatedResult.predicted_grade}
                    </span>
                  </div>

                  {/* Metrics Grid (`confidence`, `rsl_days`) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
                      <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider font-mono">
                        How Sure is the AI?
                      </div>
                      <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                        {(simulatedResult.confidence * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800">
                      <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider font-mono">
                        Days Until Apples Expire
                      </div>
                      <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                        {simulatedResult.rsl_days} Days
                      </div>
                    </div>
                  </div>

                  {/* shap_values_summary */}
                  <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-3">
                    <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                        <span>What Affected the Grade</span>
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">Important Factors</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {simulatedResult.shap_values_summary &&
                        Object.entries(simulatedResult.shap_values_summary).map(([featureKey, shapVal]) => (
                          <div
                            key={featureKey}
                            className="bg-black border border-neutral-800 px-3 py-2 rounded-lg flex items-center justify-between font-mono text-xs"
                          >
                            <span className="text-neutral-300 font-semibold">Feature {featureKey}</span>
                            <span className={`font-bold ${Number(shapVal) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {Number(shapVal) >= 0 ? '+' : ''}{Number(shapVal).toFixed(4)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* dynamically generated xai_explanation string */}
                  <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Explanation</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      {simulatedResult.xai_explanation}
                    </p>
                  </div>

                  {/* recommended_action */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <div>
                      What You Should Do:{' '}
                      <strong className="text-amber-400 font-bold font-mono">
                        {simulatedResult.recommended_action}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400 text-xs p-8 space-y-3">
                  <Eye className="w-12 h-12 opacity-30 text-amber-400 animate-pulse" />
                  <p className="max-w-md leading-relaxed">
                    Upload an apple photo on the left and click <strong className="text-amber-400 font-bold">"Check Apple Quality"</strong> to see the real AI grade with SHAP explanation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
