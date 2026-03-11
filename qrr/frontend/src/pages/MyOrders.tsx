import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { downloadQRAsPNG, downloadQRAsPDF } from "@/lib/qr-generator";

const MyOrders = () => {
  const navigate  = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders,    setOrders]    = useState<any[]>([]);
  const [qrRecords, setQrRecords] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user) fetchOrders();
  }, [user, authLoading]);

  // ── FETCH ─────────────────────────────────────────────────────────────────────
  // GET /api/orders/with-qr  →  { success, orders, qrRecords }
  const fetchOrders = async () => {
    try {
      const data = await api.get("/api/orders/with-qr");
      if (data.success) {
        setOrders(data.orders    || []);
        setQrRecords(data.qrRecords || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-4xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">View and manage your Emergency Safety QRR orders</p>
          </motion.div>

          {orders.length === 0 ? (
            <Card className="border-0 shadow-card">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Get your first Emergency Safety QRR tag</p>
                <Link to="/register"><Button variant="hero">Register Vehicle</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => {
                    // qrRecords may be embedded in order or separate
                    const qr = o.qrRecord || qrRecords.find((q) => q.orderId === o._id || q.orderId?._id === o._id);
                    return (
                      <TableRow key={o._id}>
                        <TableCell className="font-semibold">{o.vehicleNumber}</TableCell>
                        <TableCell><Badge variant="outline">{o.orderType}</Badge></TableCell>
                        <TableCell>₹{o.amount}</TableCell>
                        <TableCell><Badge variant="outline">{o.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {qr && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => downloadQRAsPNG(o.emergencyContact1, o.vehicleNumber, qr._id)} title="Download PNG">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => downloadQRAsPDF(o.emergencyContact1, o.vehicleNumber, qr._id)} title="Download PDF">
                                  <FileText className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Link to={`/order-success/${o._id}`}>
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
