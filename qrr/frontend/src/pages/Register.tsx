import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Car, Phone, Droplets, ArrowRight, MapPin, Zap, Award, Crown, Bike, Truck, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { validateVehicleNumber, formatVehicleNumber } from "@/lib/vehicle-validation";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const vehicleCategories = [
  { value: "2W", label: "Two Wheeler", icon: Bike },
  { value: "4W", label: "Four Wheeler", icon: Car },
  { value: "3W", label: "Three Wheeler", icon: Truck },
];

const plans = [
  { value: "general", label: "GENERAL", subtitle: "Digital QR Only", price: 50, orderType: "digital" as const, icon: Zap, features: ["Instant digital delivery", "Email + WhatsApp", "No admin approval needed"] },
  { value: "silver", label: "SILVER", subtitle: "Physical Sticker", price: 199, orderType: "physical" as const, icon: Award, features: ["Physical weatherproof sticker", "Shipped after admin approval", "Tracking provided"] },
  { value: "gold", label: "GOLD", subtitle: "Premium Sticker", price: 499, orderType: "physical" as const, icon: Crown, features: ["Premium quality sticker", "Priority processing", "Shipped after admin approval"] },
];

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [vehicleTouched, setVehicleTouched] = useState(false);
  const [formData, setFormData] = useState({
    vehicleCategory: "",
    planType: "",
    vehicleNumber: "",
    emergencyContact1: "",
    emergencyContact2: "",
    bloodGroup: "",
    fullAddress: "",
    pincode: "",
    city: "",
    state: "",
    landmark: "",
    referralCode: "",
    dealerCode: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const selectedPlan = plans.find(p => p.value === formData.planType);

  // Live vehicle number change handler
  const handleVehicleNumberChange = (raw: string) => {
    const formatted = formatVehicleNumber(raw);
    setFormData(prev => ({ ...prev, vehicleNumber: formatted }));
    if (vehicleTouched) {
      const result = validateVehicleNumber(formatted);
      setVehicleError(result.valid ? null : result.error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vehicle number validation
    const vResult = validateVehicleNumber(formData.vehicleNumber);
    if (!vResult.valid) {
      setVehicleError(vResult.error);
      setVehicleTouched(true);
      toast({ title: "Invalid Vehicle Number", description: vResult.error ?? "Please enter a valid Indian vehicle number.", variant: "destructive" });
      return;
    }
    if (!formData.emergencyContact1 || !formData.bloodGroup) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    // Phone digit validation
    const digits1 = formData.emergencyContact1.replace(/^\+91/, "");
    if (digits1.length !== 10) {
      toast({ title: "Invalid Phone", description: "Owner mobile must be a 10-digit number.", variant: "destructive" });
      return;
    }
    if (formData.emergencyContact2) {
      const digits2 = formData.emergencyContact2.replace(/^\+91/, "");
      if (digits2.length !== 10) {
        toast({ title: "Invalid Phone", description: "Emergency contact must be a 10-digit number.", variant: "destructive" });
        return;
      }
    }
    if (selectedPlan?.orderType === "physical" && (!formData.fullAddress || !formData.pincode || !formData.city || !formData.state)) {
      toast({ title: "Address Required", description: "Please fill complete address for physical delivery.", variant: "destructive" });
      return;
    }
    localStorage.setItem("registrationData", JSON.stringify({
      ...formData,
      orderType: selectedPlan?.orderType,
      amount: selectedPlan?.price,
    }));
    navigate("/payment");
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 lg:py-20 gradient-hero">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Buy Your QRR</h1>
              <p className="text-muted-foreground">Select vehicle, choose plan, and fill details</p>
            </div>

            {/* Step 1: Vehicle Category */}
            {step === 1 && (
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <CardTitle>Step 1: Select Vehicle Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {vehicleCategories.map(vc => (
                      <button key={vc.value} onClick={() => { setFormData({ ...formData, vehicleCategory: vc.value }); setStep(2); }}
                        className={`p-6 rounded-xl border-2 transition-all text-center hover:border-primary hover:bg-primary/5 ${formData.vehicleCategory === vc.value ? "border-primary bg-primary/5" : "border-border"}`}>
                        <vc.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="font-semibold text-foreground">{vc.label}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Plan Selection */}
            {step === 2 && (
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Step 2: Choose Plan ({vehicleCategories.find(v => v.value === formData.vehicleCategory)?.label})</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← Back</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {plans.map(plan => (
                      <button key={plan.value} onClick={() => { setFormData({ ...formData, planType: plan.value }); setStep(3); }}
                        className={`p-5 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary/5 ${formData.planType === plan.value ? "border-primary bg-primary/5" : "border-border"} ${plan.value === "gold" ? "ring-2 ring-primary/20" : ""}`}>
                        <plan.icon className={`w-8 h-8 mb-3 ${plan.value === "gold" ? "text-yellow-500" : plan.value === "silver" ? "text-gray-400" : "text-primary"}`} />
                        <p className="font-bold text-foreground text-lg">{plan.label}</p>
                        <p className="text-sm text-muted-foreground mb-2">{plan.subtitle}</p>
                        <p className="text-2xl font-bold text-primary">₹{plan.price + Math.round(plan.price * 0.18)}</p>
                        <p className="text-xs text-muted-foreground">₹{plan.price} + 18% GST</p>
                        <ul className="mt-3 space-y-1">
                          {plan.features.map(f => <li key={f} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-primary mt-0.5">✓</span>{f}</li>)}
                        </ul>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Details Form */}
            {step === 3 && selectedPlan && (
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Step 3: Vehicle & Emergency Details</CardTitle>
                      <CardDescription>{selectedPlan.label} Plan — ₹{selectedPlan.price}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Back</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" /> Vehicle Number
                        </Label>
                        <div className="relative">
                          <Input
                            placeholder="MH 12 AB 1234  or  23 BH 2345 AB"
                            value={formData.vehicleNumber}
                            onChange={(e) => handleVehicleNumberChange(e.target.value)}
                            onBlur={() => {
                              setVehicleTouched(true);
                              const r = validateVehicleNumber(formData.vehicleNumber);
                              setVehicleError(r.valid ? null : r.error);
                            }}
                            className={`h-12 uppercase pr-10 font-mono tracking-widest ${
                              vehicleTouched
                                ? vehicleError
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : formData.vehicleNumber
                                    ? "border-green-500 focus-visible:ring-green-500"
                                    : ""
                                : ""
                            }`}
                            maxLength={17}
                          />
                          {vehicleTouched && formData.vehicleNumber && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {vehicleError
                                ? <XCircle className="w-5 h-5 text-destructive" />
                                : <CheckCircle className="w-5 h-5 text-green-500" />
                              }
                            </div>
                          )}
                        </div>
                        {vehicleTouched && vehicleError && (
                          <p className="text-xs text-destructive flex items-start gap-1.5 mt-1">
                            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            {vehicleError}
                          </p>
                        )}
                        {vehicleTouched && !vehicleError && formData.vehicleNumber && (
                          <p className="text-xs text-green-600 flex items-center gap-1.5 mt-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Valid Indian vehicle number
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Standard: <span className="font-mono font-medium">MH 12 AB 1234</span>
                          &nbsp;·&nbsp;
                          BH series: <span className="font-mono font-medium">23 BH 2345 AB</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Droplets className="w-4 h-4 text-muted-foreground" /> Blood Group *</Label>
                        <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{bloodGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Owner Mobile *</Label>
                        <PhoneInput
                          value={formData.emergencyContact1}
                          onChange={(v) => setFormData({ ...formData, emergencyContact1: v })}
                          required />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Emergency Contact</Label>
                        <PhoneInput
                          value={formData.emergencyContact2}
                          onChange={(v) => setFormData({ ...formData, emergencyContact2: v })}
                          placeholder="98765 43210 (optional)" />
                      </div>
                    </div>

                    {/* Address - required for physical orders */}
                    {selectedPlan.orderType === "physical" && (
                      <>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Full Address *</Label>
                          <Input placeholder="House No, Street, Area..." value={formData.fullAddress}
                            onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })} className="h-12" required />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Pincode *</Label>
                            <Input placeholder="400001" value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="h-12" required />
                          </div>
                          <div className="space-y-2">
                            <Label>City *</Label>
                            <Input placeholder="City" value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-12" required />
                          </div>
                          <div className="space-y-2">
                            <Label>State *</Label>
                            <Input placeholder="State" value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="h-12" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Landmark</Label>
                            <Input placeholder="Near..." value={formData.landmark}
                              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="h-12" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Digital orders: optional city/state */}
                    {selectedPlan.orderType === "digital" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input placeholder="City" value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input placeholder="State" value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="h-12" />
                        </div>
                      </div>
                    )}

                    {/* Referral & Dealer Code */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Referral Code (optional)</Label>
                        <Input placeholder="Enter referral code" value={formData.referralCode}
                          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })} className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Dealer Code (optional)</Label>
                        <Input placeholder="Enter dealer code" value={formData.dealerCode}
                          onChange={(e) => setFormData({ ...formData, dealerCode: e.target.value })} className="h-12" />
                        {formData.referralCode && formData.dealerCode && (
                          <p className="text-xs text-yellow-600">⚠️ Referral code takes priority over dealer code</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" variant="hero" size="xl" className="w-full">
                      Continue to Payment — ₹{selectedPlan.price + Math.round(selectedPlan.price * 0.18)} (incl. GST) <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
