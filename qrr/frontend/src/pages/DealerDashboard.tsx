import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShoppingCart, QrCode, LogOut, RefreshCw, Download,
  FileText, Plus, Wallet, TrendingUp, ArrowDownCircle, Clock,
  CheckCircle2, XCircle, ChevronRight, BadgeIndianRupee,
  BanknoteIcon, Building2, CreditCard, X, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { downloadQRAsPNG, downloadQRAsPDF } from "@/lib/qr-generator";

const bloodGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const statusColor: Record<string, string> = {
  PAID:             "bg-green-100 text-green-700",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  APPROVED_SENT:    "bg-blue-100 text-blue-700",
  SHIPPED:          "bg-purple-100 text-purple-700",
  DELIVERED:        "bg-green-100 text-green-700",
  PENDING:          "bg-yellow-100 text-yellow-700",
  APPROVED:         "bg-green-100 text-green-700",
  REJECTED:         "bg-red-100 text-red-700",
  COMPLETED:        "bg-green-100 text-green-700",
};

const txIcon: Record<string, any> = {
  COMMISSION:            TrendingUp,
  WITHDRAWAL_REQUEST:    ArrowDownCircle,
  WITHDRAWAL_APPROVED:   CheckCircle2,
  WITHDRAWAL_REJECTED:   XCircle,
  PROCESSING_FEE:        BadgeIndianRupee,
};

const DealerDashboard = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { user, signOut, loading: authLoading } = useAuth();

  const [orders,       setOrders]      = useState<any[]>([]);
  const [qrRecords,    setQrRecords]   = useState<any[]>([]);
  const [wallet,       setWallet]      = useState({ balance: 0, totalEarned: 0, totalWithdrawn: 0 });
  const [transactions, setTransactions]= useState<any[]>([]);
  const [withdrawals,  setWithdrawals] = useState<any[]>([]);
  const [loading,      setLoading]     = useState(true);

  // Dialogs
  const [showNewOrder,    setShowNewOrder]    = useState(false);
  const [showWithdraw,    setShowWithdraw]    = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // New QR form
  const [formData, setFormData] = useState({
    vehicleNumber: "", vehicleType: "4W",
    emergencyContact1: "", emergencyContact2: "",
    bloodGroup: "", city: "", state: "",
  });

  // Withdrawal form
  const [wdForm, setWdForm] = useState({
    amount: "", bankAccountNumber: "", ifscCode: "", accountHolderName: "",
  });
  const [wdPreview, setWdPreview] = useState({ fee: 0, payout: 0 });

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) {
      if (user.role !== "dealer" && user.role !== "admin") {
        toast({ title: "Access Denied", variant: "destructive" });
        navigate("/");
        return;
      }
      fetchAll();
    }
  }, [user, authLoading]);

  // Update withdrawal preview when amount changes
  useEffect(() => {
    const amt = parseFloat(wdForm.amount) || 0;
    const fee = Math.round(amt * 0.10);
    setWdPreview({ fee, payout: amt - fee });
  }, [wdForm.amount]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, walletRes] = await Promise.all([
        api.get("/api/dealer/orders"),
        api.get("/api/dealer/wallet"),
      ]);
      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
        setQrRecords(ordersRes.qrRecords || []);
        setWallet(ordersRes.wallet || { balance: 0, totalEarned: 0, totalWithdrawn: 0 });
      }
      if (walletRes.success) {
        setWallet(walletRes.wallet || { balance: 0, totalEarned: 0, totalWithdrawn: 0 });
        setTransactions(walletRes.transactions || []);
        setWithdrawals(walletRes.withdrawals || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.emergencyContact1) {
      toast({ title: "Fill required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/api/dealer/orders", { ...formData, amount: 199 });
      if (!res.success) throw new Error(res.message);
      toast({
        title: `✅ QR Created! ₹${res.commission} commission credited`,
        description: `${formData.vehicleNumber} • Wallet: ₹${res.newBalance}`,
      });
      setShowNewOrder(false);
      setFormData({ vehicleNumber: "", vehicleType: "4W", emergencyContact1: "", emergencyContact2: "", bloodGroup: "", city: "", state: "" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(wdForm.amount);
    if (!amt || amt < 100) { toast({ title: "Minimum withdrawal is ₹100", variant: "destructive" }); return; }
    if (amt > wallet.balance) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
    if (!wdForm.bankAccountNumber || !wdForm.ifscCode || !wdForm.accountHolderName) {
      toast({ title: "Fill all bank details", variant: "destructive" }); return;
    }
    setWithdrawLoading(true);
    try {
      const res = await api.post("/api/dealer/wallet/withdraw", { ...wdForm, amount: amt });
      if (!res.success) throw new Error(res.message);
      toast({
        title: "Withdrawal Request Submitted!",
        description: `₹${amt} requested • You'll receive ₹${wdPreview.payout} after 10% fee`,
      });
      setShowWithdraw(false);
      setWdForm({ amount: "", bankAccountNumber: "", ifscCode: "", accountHolderName: "" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setWithdrawLoading(false); }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center pulse-emergency">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold font-display tracking-wider leading-none">DEALER PANEL</p>
              <p className="text-xs text-muted-foreground">{user?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAll}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-6xl">

        {/* ── Wallet Summary Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="border-0 shadow-card bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-700" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">Available</Badge>
                </div>
                <p className="text-2xl font-bold text-green-700 font-display">₹{wallet.balance}</p>
                <p className="text-sm text-green-600 font-medium mt-0.5">Wallet Balance</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-0 shadow-card bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-l-amber-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-700" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Lifetime</Badge>
                </div>
                <p className="text-2xl font-bold text-amber-700 font-display">₹{wallet.totalEarned}</p>
                <p className="text-sm text-amber-600 font-medium mt-0.5">Total Earned</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-card bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-blue-700" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-700 font-display">₹{wallet.totalWithdrawn}</p>
                <p className="text-sm text-blue-600 font-medium mt-0.5">Total Withdrawn</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-0 shadow-card bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-purple-700" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-700 font-display">{qrRecords.length}</p>
                <p className="text-sm text-purple-600 font-medium mt-0.5">QRs Generated</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Withdraw CTA */}
        <Card className="border-0 shadow-card bg-gradient-to-r from-green-600 to-emerald-700 text-white">
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-display text-xl font-bold">Available Balance: ₹{wallet.balance}</p>
              <p className="text-green-100 text-sm mt-0.5">10% processing fee applies on withdrawal • Minimum ₹100</p>
            </div>
            <Button
              onClick={() => setShowWithdraw(true)}
              disabled={wallet.balance < 100}
              className="bg-white text-green-700 hover:bg-green-50 font-bold shadow-md disabled:opacity-60"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" /> Withdraw Funds
            </Button>
          </CardContent>
        </Card>

        {/* ── Main Tabs ── */}
        <Tabs defaultValue="qr-orders">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <TabsList className="h-10">
              <TabsTrigger value="qr-orders" className="gap-1.5"><QrCode className="w-4 h-4" />QR Orders</TabsTrigger>
              <TabsTrigger value="transactions" className="gap-1.5"><TrendingUp className="w-4 h-4" />Transactions</TabsTrigger>
              <TabsTrigger value="withdrawals" className="gap-1.5"><BanknoteIcon className="w-4 h-4" />Withdrawals</TabsTrigger>
            </TabsList>
            <Button variant="hero" onClick={() => setShowNewOrder(true)}>
              <Plus className="w-4 h-4 mr-2" /> New QR Order
            </Button>
          </div>

          {/* QR Orders Tab */}
          <TabsContent value="qr-orders">
            <Card className="border-0 shadow-card overflow-hidden">
              {orders.length === 0 ? (
                <CardContent className="p-12 text-center">
                  <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground mb-1">No orders yet</p>
                  <p className="text-muted-foreground text-sm">Create your first QR order to start earning commissions</p>
                </CardContent>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission (20%)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => {
                      const qr         = qrRecords.find(q => q.orderId === o._id || q.orderId?._id === o._id);
                      const base        = o.baseAmount || o.amount;
                      const commission  = Math.round(base * 0.20);
                      return (
                        <TableRow key={o._id}>
                          <TableCell className="font-semibold font-mono">{o.vehicleNumber}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{o.vehicleType}</Badge></TableCell>
                          <TableCell className="font-medium">₹{o.amount}</TableCell>
                          <TableCell>
                            <span className="text-green-700 font-bold">+₹{commission}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] || "bg-gray-100 text-gray-700"}`}>
                              {o.status.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell>
                            {qr && (
                              <div className="flex gap-1">
                                <button onClick={() => downloadQRAsPNG(o.emergencyContact1, o.vehicleNumber, qr._id)}
                                  className="p-1.5 rounded-lg hover:bg-secondary" title="Download PNG">
                                  <Download className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button onClick={() => downloadQRAsPDF(o.emergencyContact1, o.vehicleNumber, qr._id)}
                                  className="p-1.5 rounded-lg hover:bg-secondary" title="Download PDF">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="border-0 shadow-card overflow-hidden">
              {transactions.length === 0 ? (
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground mb-1">No transactions yet</p>
                  <p className="text-muted-foreground text-sm">Commissions and withdrawals will appear here</p>
                </CardContent>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const Icon     = txIcon[tx.type] || TrendingUp;
                      const isCredit = tx.type === "COMMISSION" || tx.type === "WITHDRAWAL_REJECTED";
                      return (
                        <TableRow key={tx._id}>
                          <TableCell>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold
                              ${isCredit ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {tx.type.replace(/_/g, " ")}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">{tx.description}</TableCell>
                          <TableCell className={`font-bold ${isCredit ? "text-green-700" : "text-red-600"}`}>
                            {isCredit ? "+" : "-"}₹{tx.amount}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {tx.balanceAfter !== null ? `₹${tx.balanceAfter}` : "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[tx.status] || "bg-gray-100 text-gray-600"}`}>
                              {tx.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="border-0 shadow-card overflow-hidden">
              {withdrawals.length === 0 ? (
                <CardContent className="p-12 text-center">
                  <BanknoteIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground mb-1">No withdrawals yet</p>
                  <p className="text-muted-foreground text-sm">Your withdrawal requests will appear here</p>
                </CardContent>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested</TableHead>
                      <TableHead>Fee (10%)</TableHead>
                      <TableHead>You Receive</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>IFSC</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w._id}>
                        <TableCell className="font-bold">₹{w.requestedAmount}</TableCell>
                        <TableCell className="text-red-600">-₹{w.processingFee}</TableCell>
                        <TableCell className="font-bold text-green-700">₹{w.payableAmount}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {w.bankAccountNumber.slice(0,-4).replace(/./g,"•") + w.bankAccountNumber.slice(-4)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{w.ifscCode}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[w.status] || "bg-gray-100 text-gray-600"}`}>
                            {w.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                            {w.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                            {w.status === "PENDING"  && <Clock className="w-3 h-3" />}
                            {w.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(w.createdAt).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ══════════════════ NEW QR ORDER DIALOG ══════════════════ */}
      <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> Create New QR Order
            </DialogTitle>
            <DialogDescription>
              20% commission (₹{Math.round(199 * 0.20)}) will be credited to your wallet instantly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Vehicle Number *</Label>
                <Input placeholder="MH12AB1234" value={formData.vehicleNumber}
                  onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  className="font-mono uppercase h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label>Vehicle Type</Label>
                <Select value={formData.vehicleType} onValueChange={v => setFormData({ ...formData, vehicleType: v })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2W">Two Wheeler</SelectItem>
                    <SelectItem value="4W">Four Wheeler</SelectItem>
                    <SelectItem value="3W">Three Wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Emergency Contact 1 *</Label>
                <Input type="tel" placeholder="+91 98765 43210" value={formData.emergencyContact1}
                  onChange={e => setFormData({ ...formData, emergencyContact1: e.target.value })}
                  className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label>Emergency Contact 2</Label>
                <Input type="tel" placeholder="+91 98765 43210" value={formData.emergencyContact2}
                  onChange={e => setFormData({ ...formData, emergencyContact2: e.target.value })}
                  className="h-11" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={v => setFormData({ ...formData, bloodGroup: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{bloodGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input placeholder="City" value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input placeholder="State" value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })} className="h-11" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-green-800">Your Commission (20%)</p>
                <p className="text-xs text-green-600">Credited to wallet instantly on creation</p>
              </div>
              <p className="text-2xl font-bold text-green-700">+₹{Math.round(199 * 0.20)}</p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNewOrder(false)}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Creating..." : "Create QR & Earn ₹40"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════ WITHDRAWAL DIALOG ══════════════════ */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BanknoteIcon className="w-5 h-5 text-green-600" /> Withdraw Funds
            </DialogTitle>
            <DialogDescription>
              Available: <strong>₹{wallet.balance}</strong> · 10% processing fee applies
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label>Withdrawal Amount (₹) *</Label>
              <Input type="number" placeholder="Enter amount (min ₹100)"
                value={wdForm.amount}
                onChange={e => setWdForm({ ...wdForm, amount: e.target.value })}
                min="100" max={wallet.balance} className="h-11 text-lg font-bold" required />
            </div>

            {/* Fee preview */}
            {parseFloat(wdForm.amount) > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested Amount</span>
                  <span className="font-semibold">₹{parseFloat(wdForm.amount).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Processing Fee (10%)</span>
                  <span>- ₹{wdPreview.fee}</span>
                </div>
                <div className="flex justify-between font-bold text-green-700 text-base pt-1 border-t border-border">
                  <span>You Will Receive</span>
                  <span>₹{wdPreview.payout}</span>
                </div>
              </motion.div>
            )}

            {/* Bank details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="w-4 h-4 text-primary" /> Bank Account Details
              </div>
              <div className="space-y-1.5">
                <Label>Account Holder Name *</Label>
                <Input placeholder="As per bank records"
                  value={wdForm.accountHolderName}
                  onChange={e => setWdForm({ ...wdForm, accountHolderName: e.target.value })}
                  className="h-11" required />
              </div>
              <div className="space-y-1.5">
                <Label>Bank Account Number *</Label>
                <Input placeholder="Enter account number"
                  value={wdForm.bankAccountNumber}
                  onChange={e => setWdForm({ ...wdForm, bankAccountNumber: e.target.value })}
                  className="h-11 font-mono" required />
              </div>
              <div className="space-y-1.5">
                <Label>IFSC Code *</Label>
                <Input placeholder="e.g. SBIN0001234"
                  value={wdForm.ifscCode}
                  onChange={e => setWdForm({ ...wdForm, ifscCode: e.target.value.toUpperCase() })}
                  className="h-11 font-mono uppercase" required />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Withdrawal requests are reviewed by admin within 1-3 business days. The amount is held from your wallet until processed.</p>
            </div>

            <DialogFooter className="gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={withdrawLoading}>
                {withdrawLoading ? "Submitting..." : "Submit Withdrawal Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealerDashboard;
