import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Download, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { downloadQRAsPNG, downloadQRAsPDF, generateBrandedQRCanvas } from "@/lib/qr-generator";

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user }    = useAuth();
  const [order,     setOrder]     = useState<any>(null);
  const [qrRecord,  setQrRecord]  = useState<any>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;
      try {
        // GET /api/orders/:id  →  { success, order, qrRecord }
        const data = await api.get(`/api/orders/${orderId}`);
        if (data.success && data.order) {
          setOrder(data.order);
          if (data.qrRecord) {
            setQrRecord(data.qrRecord);
            try {
              const canvas = await generateBrandedQRCanvas(data.order.emergencyContact1, data.order.vehicleNumber, data.qrRecord._id);
              setQrPreview(canvas.toDataURL("image/png"));
            } catch (e) {
              console.error("QR generation error", e);
            }
          }
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [orderId, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Order not found</div>;
  }

  const isDigital  = order.orderType === "digital";
  const planLabel  = order.planType ? order.planType.toUpperCase() : order.orderType.toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 lg:py-20 gradient-hero">
        <div className="container max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">Order ID: {order._id.slice(0, 8).toUpperCase()} • Plan: {planLabel}</p>
            </div>

            {/* Digital: show QR download */}
            {isDigital && qrRecord && qrPreview && (
              <Card className="shadow-elevated border-0">
                <CardContent className="p-6 text-center space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Your Digital QRR is Ready!</h2>
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <img src={qrPreview} alt="Your QR Code" className="w-64 h-auto mx-auto" />
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="hero" onClick={() => downloadQRAsPNG(order.emergencyContact1, order.vehicleNumber, qrRecord._id)}>
                      <Download className="w-4 h-4 mr-2" /> Download PNG
                    </Button>
                    <Button variant="outline" onClick={() => downloadQRAsPDF(order.emergencyContact1, order.vehicleNumber, qrRecord._id)}>
                      <FileText className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Print this QR and stick it on your vehicle for emergency identification.</p>
                </CardContent>
              </Card>
            )}

            {/* Physical: pending approval */}
            {!isDigital && (
              <Card className="shadow-elevated border-0">
                <CardContent className="p-6 text-center space-y-4">
                  <Clock className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-xl font-semibold text-foreground">Premium Sticker Order Placed</h2>
                  <p className="text-muted-foreground">Your order is pending admin approval. Your Emergency Safety QRR sticker will be shipped within 7 days after approval.</p>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground">Status: <span className="text-primary">{order.status.replace("_", " ")}</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Vehicle: {order.vehicleNumber}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Link to="/"><Button variant="outline" size="lg">Back to Home</Button></Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
