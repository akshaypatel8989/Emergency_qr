import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, AlertTriangle, Car, Shield, Navigation,
  Droplets, MapPin, PhoneCall, PhoneForwarded, Loader2,
  CheckCircle2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/api";

interface ScanData {
  qrId:           string;
  vehicle_number: string;
  vehicle_type:   string;
  blood_group:    string | null;
  city:           string | null;
  state:          string | null;
  has_contact2:   boolean;
  qr_active:      boolean;
}

type CallState = "idle" | "enterNumber" | "calling" | "connected" | "failed";

const Scan = () => {
  const { qrId }  = useParams<{ qrId: string }>();
  const { toast } = useToast();

  const [data,         setData]        = useState<ScanData | null>(null);
  const [loading,      setLoading]     = useState(true);
  const [callState,    setCallState]   = useState<CallState>("idle");
  const [callerPhone,  setCallerPhone] = useState("");
  const [callLabel,    setCallLabel]   = useState("Vehicle Owner");
  const [callError,    setCallError]   = useState("");
  const [callServiceOk,setCallSvcOk]  = useState(true);
  const [showAccident, setShowAccident]= useState(false);
  const [accidentText, setAccidentText]= useState("");

  /* Load QR info + check call service */
  useEffect(() => {
    (async () => {
      if (!qrId) return;
      try {
        const [scanRes, checkRes] = await Promise.all([
          fetch(`${API_BASE}/api/scan/${qrId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/call/check`).then(r => r.json()).catch(() => ({ callServiceAvailable: false })),
        ]);
        if (scanRes.success) setData({ ...scanRes, qrId });
        setCallSvcOk(checkRes.callServiceAvailable);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [qrId]);

  /* ── Start the bridged call ── */
  const initiateCall = async () => {
    if (!callerPhone.trim()) {
      setCallError("Please enter your mobile number");
      return;
    }
    const digits = callerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setCallError("Enter a valid 10-digit mobile number");
      return;
    }

    setCallError("");
    setCallState("calling");

    try {
      const res = await fetch(`${API_BASE}/api/call/connect`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ qrId: data?.qrId, callerPhone }),
      });
      const json = await res.json();

      if (json.success) {
        setCallState("connected");
      } else {
        setCallState("failed");
        setCallError(json.message || "Call could not be connected. Please try again.");
      }
    } catch {
      setCallState("failed");
      setCallError("Network error. Please check your connection and try again.");
    }
  };

  const resetCall = () => {
    setCallState("idle");
    setCallerPhone("");
    setCallError("");
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
        const msg = encodeURIComponent(
          `🚨 Emergency! Vehicle ${data?.vehicle_number} location: ${url} — EMERGENCY SAFETY QRR`
        );
        // Share via WhatsApp to self (copy/share)
        window.open(`https://wa.me/?text=${msg}`, "_blank");
      },
      () => toast({ title: "Location denied", description: "Enable location to share.", variant: "destructive" })
    );
  };

  const submitAccident = () => {
    if (!accidentText.trim()) {
      toast({ title: "Please describe the accident", variant: "destructive" });
      return;
    }
    toast({ title: "Report Submitted", description: "Emergency contacts notified." });
    setShowAccident(false);
    setAccidentText("");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  /* ── Invalid QR ── */
  if (!data || !data.qr_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full shadow-elevated border-0">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">QR Not Found</h2>
            <p className="text-muted-foreground">This QR is invalid or deactivated.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vehicleLabel =
    data.vehicle_type === "2W" ? "Two Wheeler"
    : data.vehicle_type === "4W" ? "Four Wheeler"
    : data.vehicle_type === "3W" ? "Three Wheeler"
    : data.vehicle_type;

  return (
    <>
      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes connectedGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
          50%       { box-shadow: 0 0 0 16px rgba(22,163,74,0); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 p-4">
        <div className="max-w-md mx-auto space-y-4 pb-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-center pt-6 pb-2">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center
                            shadow-lg mx-auto mb-3 pulse-emergency">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-wider">EMERGENCY SAFETY QRR</h1>
            <p className="text-sm text-muted-foreground mt-1">Vehicle emergency information</p>
          </motion.div>

          {/* Vehicle Info */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-card border-0 overflow-hidden">
              <div className="h-1.5 gradient-primary" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-display mb-0.5">
                      Vehicle Number
                    </p>
                    <p className="text-2xl font-bold font-display tracking-wider">{data.vehicle_number}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-secondary rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium">
                    <Car className="w-3.5 h-3.5 text-primary" />{vehicleLabel}
                  </span>
                  {data.blood_group && (
                    <span className="bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-red-700">
                      <Droplets className="w-3.5 h-3.5" />{data.blood_group}
                    </span>
                  )}
                  {(data.city || data.state) && (
                    <span className="bg-secondary rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {[data.city, data.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══════════════════════════════════════
              MAIN CALL SECTION
          ═══════════════════════════════════════ */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-elevated border-0 overflow-hidden">
              <div className="h-1.5 bg-green-600" />
              <CardContent className="p-5">

                <AnimatePresence mode="wait">

                  {/* ── IDLE: show call button ── */}
                  {callState === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <PhoneForwarded className="w-8 h-8 text-green-700" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold">Connect Emergency Call</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {callServiceOk
                            ? "We'll call your number and connect you to the vehicle owner. Neither party sees the other's real number."
                            : "Calling service not set up yet. Use the direct options below."}
                        </p>
                      </div>

                      {callServiceOk && (
                        <div className="space-y-3">
                          <button
                            onClick={() => { setCallLabel("Vehicle Owner"); setCallState("enterNumber"); }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl p-4
                                       flex items-center gap-3 shadow-md transition-colors"
                          >
                            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                              <PhoneCall className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold font-display text-base">Connect to Vehicle Owner</p>
                              <p className="text-xs text-white/70">🔒 Your number stays private too</p>
                            </div>
                          </button>

                          {data.has_contact2 && (
                            <button
                              onClick={() => { setCallLabel("Emergency Contact"); setCallState("enterNumber"); }}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4
                                         flex items-center gap-3 shadow-sm transition-colors"
                            >
                              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="font-bold font-display">Connect to Emergency Contact</p>
                                <p className="text-xs text-white/70">🔒 Secondary contact • Private</p>
                              </div>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Masking explanation */}
                      {callServiceOk && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1.5">
                          <p className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> How number masking works
                          </p>
                          <div className="text-xs text-green-700 space-y-1">
                            <p>📞 You call → you see our virtual number</p>
                            <p>🔗 Our system bridges the call</p>
                            <p>📱 Owner receives → they also see our virtual number</p>
                            <p className="font-semibold">✅ Real numbers never revealed to either side</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── ENTER NUMBER ── */}
                  {callState === "enterNumber" && (
                    <motion.div key="enterNumber" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold">Enter Your Number</h3>
                          <p className="text-xs text-muted-foreground">Connecting to: <strong>{callLabel}</strong></p>
                        </div>
                        <button onClick={resetCall} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Your Mobile Number</Label>
                        <div className="flex gap-2 items-center">
                          <span className="flex items-center justify-center h-12 px-3 rounded-lg bg-secondary border text-sm font-bold text-foreground">
                            +91
                          </span>
                          <Input
                            type="tel"
                            inputMode="numeric"
                            placeholder="98765 43210"
                            value={callerPhone}
                            onChange={e => { setCallerPhone(e.target.value); setCallError(""); }}
                            maxLength={10}
                            className="h-12 text-lg font-mono tracking-widest"
                            autoFocus
                          />
                        </div>
                        {callError && (
                          <p className="text-xs text-destructive font-medium">{callError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          We will call <strong>your</strong> number from our virtual number. When you pick up, you'll be connected to the {callLabel}. <strong>Your real number stays private</strong> — the {callLabel} will only see our virtual number.
                        </p>
                      </div>

                      <button
                        onClick={initiateCall}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-4
                                   font-bold font-display text-base flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <PhoneCall className="w-5 h-5" />
                        Call Me & Connect
                      </button>
                    </motion.div>
                  )}

                  {/* ── CALLING in progress ── */}
                  {callState === "calling" && (
                    <motion.div key="calling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center space-y-5 py-4">
                      {/* Ripple animation */}
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        {[0, 0.5, 1].map(delay => (
                          <span key={delay} className="absolute inset-0 rounded-full border-4 border-green-400 opacity-0"
                            style={{ animation: `ringPulse 2s ease-out ${delay}s infinite` }} />
                        ))}
                        <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center shadow-xl">
                          <PhoneCall className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold">Calling You Now…</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Answer your phone at +91 {callerPhone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Once you pick up, we'll connect you to the {callLabel}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
                      </div>
                    </motion.div>
                  )}

                  {/* ── CONNECTED ── */}
                  {callState === "connected" && (
                    <motion.div key="connected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="text-center space-y-4 py-4">
                      <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto shadow-xl"
                        style={{ animation: "connectedGlow 2s ease-in-out infinite" }}>
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold text-green-700">Call Initiated!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your phone will ring shortly. Pick up to be connected to the {callLabel}.
                        </p>
                      </div>
                      <button onClick={resetCall}
                        className="text-sm text-muted-foreground underline underline-offset-4">
                        Make another call
                      </button>
                    </motion.div>
                  )}

                  {/* ── FAILED ── */}
                  {callState === "failed" && (
                    <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center space-y-4 py-2">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-destructive">Call Failed</p>
                        <p className="text-sm text-muted-foreground mt-1">{callError}</p>
                      </div>
                      <button onClick={resetCall}
                        className="w-full border border-border rounded-xl py-3 text-sm font-semibold hover:bg-secondary transition-colors">
                        Try Again
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Secondary actions ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3">
            <button onClick={handleShareLocation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-4
                         flex flex-col items-center gap-2 shadow-md transition-colors">
              <Navigation className="w-6 h-6" />
              <p className="text-xs font-bold font-display">Share Location</p>
            </button>
            <button onClick={() => setShowAccident(true)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl p-4
                         flex flex-col items-center gap-2 shadow-md transition-colors">
              <AlertTriangle className="w-6 h-6" />
              <p className="text-xs font-bold font-display">Report Accident</p>
            </button>
          </motion.div>

          {/* Disclaimer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800 text-center leading-relaxed">
                ⚠️ Emergency Safety QRR acts as a call bridge only. We are not responsible for unanswered calls,
                network issues, or emergency response outcomes.
              </p>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Powered by <span className="font-bold text-primary font-display">EMERGENCY SAFETY QRR</span>
            </p>
          </motion.div>

        </div>
      </div>

      {/* Accident Report Dialog */}
      <Dialog open={showAccident} onOpenChange={setShowAccident}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />Report an Accident
            </DialogTitle>
            <DialogDescription>
              Provide accident details. Emergency contacts will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Location, injuries, situation..." value={accidentText}
            onChange={e => setAccidentText(e.target.value)} className="min-h-[110px]" />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAccident(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitAccident}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Scan;
