import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Shield, CheckCircle, Lock, Truck, Zap, Award, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

const planIcons: Record<string, any>    = { general: Zap, silver: Award, gold: Crown };
const planLabels: Record<string, string> = { general: "GENERAL (Digital)", silver: "SILVER (Physical)", gold: "GOLD (Premium)" };

// ── GST Calculator ────────────────────────────────────────────────────────────
// Base price is exclusive of GST. GST @ 18% (9% CGST + 9% SGST) added on top.
const calcGST = (baseAmount: number) => {
  const cgst  = Math.round(baseAmount * 0.09);
  const sgst  = Math.round(baseAmount * 0.09);
  const total = baseAmount + cgst + sgst;
  return { baseAmount, cgst, sgst, gstTotal: cgst + sgst, total };
};

const Payment = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { user }  = useAuth();
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("registrationData");
    if (!data) { navigate("/register"); return; }
    setRegistrationData(JSON.parse(data));
  }, [navigate]);

  if (!registrationData) return null;

  const baseAmount = registrationData.amount    || 50;
  const planType   = registrationData.planType  || "general";
  const isDigital  = registrationData.orderType === "digital";
  const PlanIcon   = planIcons[planType] || Zap;
  const gst        = calcGST(baseAmount);   // { baseAmount, cgst, sgst, gstTotal, total }

  const handlePayment = async () => {
    if (!user) { navigate("/auth"); return; }
    setProcessing(true);

    try {
      // 1. Create order
      // POST /api/orders  →  { success, order }
      const createRes = await api.post("/api/orders", {
        orderType:        registrationData.orderType,
        planType,
        vehicleNumber:    registrationData.vehicleNumber   || "N/A",
        vehicleType:      registrationData.vehicleCategory || "4W",
        emergencyContact1: registrationData.emergencyContact1,
        emergencyContact2: registrationData.emergencyContact2 || null,
        bloodGroup:       registrationData.bloodGroup,
        fullAddress:      registrationData.fullAddress  || null,
        pincode:          registrationData.pincode      || null,
        city:             registrationData.city         || null,
        state:            registrationData.state        || null,
        landmark:         registrationData.landmark     || null,
        referralCodeUsed: registrationData.referralCode || null,
        dealerCodeUsed:   registrationData.dealerCode   || null,
        amount:      gst.total,       // total including GST
        baseAmount:  gst.baseAmount,
        cgst:        gst.cgst,
        sgst:        gst.sgst,
      });
      if (!createRes.success) throw new Error(createRes.message);

      // 2. Simulate payment delay (replace with Razorpay/PhonePe)
      await new Promise((r) => setTimeout(r, 2000));

      // 3. Mark as paid
      // PUT /api/orders/:id/pay  →  { success, order, qrRecord }
      const payRes = await api.put(`/api/orders/${createRes.order._id}/pay`, {
        paymentId: "PAY_" + Date.now(),
      });
      if (!payRes.success) throw new Error(payRes.message);

      localStorage.removeItem("registrationData");
      toast({
        title: "Payment Successful!",
        description: isDigital
          ? "Your Digital QRR is ready! Download it now."
          : "Your order is placed. It will be shipped after admin approval.",
      });
      navigate(`/order-success/${createRes.order._id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 lg:py-20 gradient-hero">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                <CreditCard className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Order</h1>
              <p className="text-muted-foreground">One-time payment for lifetime protection</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* ── ORDER SUMMARY ── */}
              <Card className="shadow-elevated border-0">
                <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                      <PlanIcon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{planLabels[planType]}</h3>
                      <p className="text-sm text-muted-foreground">{isDigital ? "Instant digital delivery" : "Weatherproof premium sticker"}</p>
                      {registrationData.vehicleNumber && <p className="text-sm text-muted-foreground mt-1">Vehicle: {registrationData.vehicleNumber}</p>}
                      <p className="text-sm text-muted-foreground">Category: {registrationData.vehicleCategory || "4W"}</p>
                    </div>
                    <div className="text-lg font-bold text-foreground">₹{gst.baseAmount}</div>
                  </div>

                  {/* GST Breakdown */}
                  <div className="space-y-2.5 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="text-foreground font-medium">₹{gst.baseAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CGST (9%)</span>
                      <span className="text-foreground">₹{gst.cgst}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SGST (9%)</span>
                      <span className="text-foreground">₹{gst.sgst}</span>
                    </div>
                    <div className="flex justify-between text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <span className="text-amber-800 font-semibold">Total GST (18%)</span>
                      <span className="text-amber-800 font-semibold">₹{gst.gstTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    {registrationData.referralCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Referral Code</span>
                        <span className="text-primary font-medium">{registrationData.referralCode}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                      <span className="text-foreground">Total Payable</span>
                      <span className="text-primary">₹{gst.total}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Inclusive of 18% GST (9% CGST + 9% SGST) &nbsp;|&nbsp; SAC Code: 998439
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Lifetime validity
                    </div>
                    {isDigital ? (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 text-green-600" /> Instant delivery
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4 text-green-600" /> Ships within 7 days after approval
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── PAYMENT ── */}
              <Card className="shadow-elevated border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Secure Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-secondary/50 rounded-xl text-center">
                    <p className="text-muted-foreground mb-2">Payment gateway placeholder</p>
                    <p className="text-sm text-muted-foreground">Razorpay / PhonePe integration coming soon</p>
                  </div>
                  <Button variant="hero" size="xl" className="w-full" onClick={handlePayment} disabled={processing}>
                    {processing ? (
                      <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" /> Processing...</>
                    ) : (
                      <>Pay ₹{gst.total} (incl. GST)</>  
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" /> Your payment information is secure
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
