import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Users, ShoppingCart, Wallet, Package,
  CheckCircle, XCircle, Truck, Eye, Search, RefreshCw, LogOut,
  Download, FileText, BanknoteIcon, TrendingUp, Clock, Building2,
  BadgeIndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { downloadQRAsPNG, downloadQRAsPDF } from "@/lib/qr-generator";

const orderStatusColors: Record<string, string> = {
  CREATED:          "bg-muted text-muted-foreground",
  PAID:             "bg-blue-100 text-blue-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED_SENT:    "bg-indigo-100 text-indigo-800",
  SHIPPED:          "bg-purple-100 text-purple-800",
  DELIVERED:        "bg-green-100 text-green-800",
  REJECTED:         "bg-red-100 text-red-800",
  CANCELLED:        "bg-red-100 text-red-800",
};

const wdStatusColors: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const AdminDashboard = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { user, signOut, loading: authLoading } = useAuth();

  const [loading,           setLoading]           = useState(true);
  const [orders,            setOrders]            = useState<any[]>([]);
  const [users,             setUsers]             = useState<any[]>([]);
  const [qrRecords,         setQrRecords]         = useState<any[]>([]);
  const [dealerWithdrawals, setDealerWithdrawals] = useState<any[]>([]);
  const [stats,             setStats]             = useState({ totalOrders: 0, totalUsers: 0, totalRevenue: 0, pendingOrders: 0, pendingWithdrawals: 0 });

  // Filters
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [wdFilter,     setWdFilter]     = useState("ALL");

  // Order detail dialog
  const [selectedOrder,   setSelectedOrder]   = useState<any>(null);
  const [adminNotes,      setAdminNotes]      = useState("");
  const [courierTracking, setCourierTracking] = useState("");

  // Dealer withdrawal review dialog
  const [selectedWD,    setSelectedWD]    = useState<any>(null);
  const [wdAdminNotes,  setWdAdminNotes]  = useState("");
  const [wdProcessing,  setWdProcessing]  = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) {
      if (user.role !== "admin") { toast({ title: "Access Denied", variant: "destructive" }); navigate("/"); return; }
      fetchAll();
    }
  }, [user, authLoading]);

  const fetchAll = async () => {
    try {
      const [statsData, ordersData, usersData, dealerWdData, qrData] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/orders?limit=200"),
        api.get("/api/admin/users"),
        api.get("/api/admin/dealer-withdrawals"),
        api.get("/api/admin/qr-records"),
      ]);
      if (statsData.success)    setStats(statsData.stats);
      if (ordersData.success)   setOrders(ordersData.orders          || []);
      if (usersData.success)    setUsers(usersData.users             || []);
      if (dealerWdData.success) setDealerWithdrawals(dealerWdData.withdrawals || []);
      if (qrData.success)       setQrRecords(qrData.qrRecords        || []);
    } catch { toast({ title: "Error loading data", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const data = await api.put(`/api/admin/orders/${orderId}/status`, {
      status,
      adminNotes:      adminNotes      || undefined,
      courierTracking: courierTracking || undefined,
    });
    if (data.success) {
      toast({ title: `Order ${status.replace(/_/g, " ")}` });
      setSelectedOrder(null); setAdminNotes(""); setCourierTracking("");
      fetchAll();
    } else { toast({ title: "Error", description: data.message, variant: "destructive" }); }
  };

  const processDealerWithdrawal = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedWD) return;
    setWdProcessing(true);
    try {
      const data = await api.put(`/api/admin/dealer-withdrawals/${selectedWD._id}/status`, {
        status, adminNotes: wdAdminNotes || undefined,
      });
      if (data.success) {
        toast({
          title: status === "APPROVED" ? "✅ Withdrawal Approved" : "❌ Withdrawal Rejected",
          description: status === "APPROVED"
            ? `₹${selectedWD.payableAmount} approved for ${selectedWD.dealerId?.fullName}`
            : `Rejected. ₹${selectedWD.requestedAmount} refunded to dealer wallet.`,
        });
        setSelectedWD(null); setWdAdminNotes("");
        fetchAll();
      } else { toast({ title: "Error", description: data.message, variant: "destructive" }); }
    } finally { setWdProcessing(false); }
  };

  const changeUserRole = async (userId: string, role: string) => {
    const data = await api.put(`/api/admin/users/${userId}/role`, { role });
    if (data.success) { toast({ title: `Role updated to ${role}` }); fetchAll(); }
  };

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    return (statusFilter === "ALL" || o.status === statusFilter) &&
      (!s || o.vehicleNumber?.toLowerCase().includes(s) || o._id?.toLowerCase().includes(s));
  });

  const filteredWD = dealerWithdrawals.filter(w =>
    wdFilter === "ALL" || w.status === wdFilter
  );

  const pendingWDCount = dealerWithdrawals.filter(w => w.status === "PENDING").length;

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold font-display tracking-wide">ADMIN PANEL — QRR</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAll}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-7xl">

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Orders",        value: stats.totalOrders,        icon: ShoppingCart,     bg: "bg-blue-50",   ic: "text-blue-600" },
            { label: "Total Users",         value: stats.totalUsers,         icon: Users,            bg: "bg-green-50",  ic: "text-green-600" },
            { label: "Revenue",             value: `₹${stats.totalRevenue}`, icon: BadgeIndianRupee, bg: "bg-red-50",    ic: "text-red-600" },
            { label: "Pending Approval",    value: stats.pendingOrders,      icon: Package,          bg: "bg-yellow-50", ic: "text-yellow-600" },
            { label: "Dealer Withdrawals",  value: pendingWDCount,           icon: BanknoteIcon,     bg: "bg-purple-50", ic: "text-purple-600" },
          ].map((s) => (
            <Card key={s.label} className={`border-0 shadow-card ${s.bg}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                  <s.icon className={`w-5 h-5 ${s.ic}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground leading-none mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="orders">
          <TabsList className="h-10">
            <TabsTrigger value="orders"      className="gap-1.5"><ShoppingCart className="w-3.5 h-3.5" />Orders</TabsTrigger>
            <TabsTrigger value="users"       className="gap-1.5"><Users className="w-3.5 h-3.5" />Users</TabsTrigger>
            <TabsTrigger value="dealer-wd"   className="gap-1.5 relative">
              <BanknoteIcon className="w-3.5 h-3.5" />Dealer Withdrawals
              {pendingWDCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingWDCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── ORDERS TAB ── */}
          <TabsContent value="orders" className="space-y-4 mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search vehicle / order ID..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {["PAID","PENDING_APPROVAL","APPROVED_SENT","SHIPPED","DELIVERED","REJECTED","CANCELLED"].map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Card className="border-0 shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => {
                    const qr = qrRecords.find((q: any) => q.orderId?._id === o._id || q.orderId === o._id);
                    return (
                      <TableRow key={o._id}>
                        <TableCell className="font-mono text-xs">{o._id.slice(0,8)}</TableCell>
                        <TableCell className="font-semibold">{o.vehicleNumber}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{(o.planType||o.orderType).toUpperCase()}</Badge></TableCell>
                        <TableCell className="font-medium">₹{o.amount}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {o.createdByDealer?.fullName ? (
                            <span className="text-green-700 font-medium">🏪 {o.createdByDealer.fullName}</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell><Badge className={`${orderStatusColors[o.status] || ""} text-xs`}>{o.status.replace(/_/g," ")}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(o); setAdminNotes(""); setCourierTracking(""); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {qr && <>
                              <Button variant="ghost" size="sm" onClick={() => downloadQRAsPNG(o.emergencyContact1, o.vehicleNumber, qr._id)}><Download className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => downloadQRAsPDF(o.emergencyContact1, o.vehicleNumber, qr._id)}><FileText className="w-4 h-4" /></Button>
                            </>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users" className="mt-4">
            <Card className="border-0 shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-semibold">{u.fullName}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">{u.phone}</TableCell>
                      <TableCell>
                        <Badge className={
                          u.role === "admin"  ? "bg-red-100 text-red-800" :
                          u.role === "dealer" ? "bg-green-100 text-green-800" :
                          "bg-muted text-muted-foreground"
                        }>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{u.referralCode || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(role) => changeUserRole(u._id, role)}>
                          <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="dealer">Dealer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ── DEALER WITHDRAWALS TAB ── */}
          <TabsContent value="dealer-wd" className="space-y-4 mt-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">Dealer Withdrawal Requests</h2>
                <p className="text-sm text-muted-foreground">Review and approve/reject dealer payout requests</p>
              </div>
              <Select value={wdFilter} onValueChange={setWdFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredWD.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="p-12 text-center">
                  <BanknoteIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground mb-1">No withdrawal requests</p>
                  <p className="text-sm text-muted-foreground">Dealer withdrawal requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Fee (10%)</TableHead>
                      <TableHead>Dealer Receives</TableHead>
                      <TableHead>Account No.</TableHead>
                      <TableHead>IFSC</TableHead>
                      <TableHead>Account Holder</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWD.map((w) => (
                      <TableRow key={w._id} className={w.status === "PENDING" ? "bg-yellow-50/40" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{w.dealerId?.fullName || "—"}</p>
                            <p className="text-xs text-muted-foreground">{w.dealerId?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-base">₹{w.requestedAmount}</TableCell>
                        <TableCell className="text-red-600 font-medium">-₹{w.processingFee}</TableCell>
                        <TableCell className="font-bold text-green-700 text-base">₹{w.payableAmount}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {w.bankAccountNumber?.slice(0,-4).replace(/./g,"•") + w.bankAccountNumber?.slice(-4)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{w.ifscCode}</TableCell>
                        <TableCell className="text-sm">{w.accountHolderName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(w.createdAt).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${wdStatusColors[w.status] || ""} gap-1`}>
                            {w.status === "APPROVED" && <CheckCircle className="w-3 h-3" />}
                            {w.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                            {w.status === "PENDING"  && <Clock className="w-3 h-3" />}
                            {w.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {w.status === "PENDING" ? (
                            <Button variant="outline" size="sm" className="text-xs h-8"
                              onClick={() => { setSelectedWD(w); setWdAdminNotes(""); }}>
                              Review
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {w.processedAt ? new Date(w.processedAt).toLocaleDateString("en-IN") : "—"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* ══════════════ ORDER DETAIL DIALOG ══════════════ */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order: {selectedOrder?._id.slice(0,8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Vehicle:</span> <strong>{selectedOrder.vehicleNumber}</strong></div>
                <div><span className="text-muted-foreground">Plan:</span> <strong>{(selectedOrder.planType||selectedOrder.orderType).toUpperCase()}</strong></div>
                <div><span className="text-muted-foreground">Amount:</span> <strong>₹{selectedOrder.amount}</strong></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={orderStatusColors[selectedOrder.status]}>{selectedOrder.status}</Badge></div>
                <div><span className="text-muted-foreground">Contact 1:</span> {selectedOrder.emergencyContact1}</div>
                <div><span className="text-muted-foreground">Contact 2:</span> {selectedOrder.emergencyContact2||"—"}</div>
                <div><span className="text-muted-foreground">Blood:</span> {selectedOrder.bloodGroup||"—"}</div>
                <div><span className="text-muted-foreground">Location:</span> {selectedOrder.city||"—"}, {selectedOrder.state||"—"}</div>
                {selectedOrder.fullAddress && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {selectedOrder.fullAddress}</div>}
                {selectedOrder.referralCodeUsed && <div><span className="text-muted-foreground">Referral:</span> {selectedOrder.referralCodeUsed}</div>}
                {selectedOrder.dealerCodeUsed   && <div><span className="text-muted-foreground">Dealer Code:</span> {selectedOrder.dealerCodeUsed}</div>}
                {selectedOrder.createdByDealer?.fullName && <div className="col-span-2"><span className="text-muted-foreground">Created by Dealer:</span> <strong className="text-green-700">{selectedOrder.createdByDealer.fullName}</strong></div>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Admin Notes</Label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Internal notes..." />
              </div>
              {selectedOrder.orderType === "physical" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Courier Tracking Number</Label>
                  <Input value={courierTracking} onChange={e => setCourierTracking(e.target.value)} placeholder="Tracking number..." />
                </div>
              )}
              <DialogFooter className="flex-wrap gap-2">
                {selectedOrder.status === "PENDING_APPROVAL" && <>
                  <Button onClick={() => updateOrderStatus(selectedOrder._id, "APPROVED_SENT")}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve & Send
                  </Button>
                  <Button variant="destructive" onClick={() => updateOrderStatus(selectedOrder._id, "CANCELLED")}>
                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </>}
                {selectedOrder.status === "APPROVED_SENT" && (
                  <Button onClick={() => updateOrderStatus(selectedOrder._id, "SHIPPED")}>
                    <Truck className="w-4 h-4 mr-1" /> Mark Shipped
                  </Button>
                )}
                {selectedOrder.status === "SHIPPED" && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateOrderStatus(selectedOrder._id, "DELIVERED")}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Mark Delivered
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════ DEALER WITHDRAWAL REVIEW DIALOG ══════════════ */}
      <Dialog open={!!selectedWD} onOpenChange={() => { setSelectedWD(null); setWdAdminNotes(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BanknoteIcon className="w-5 h-5 text-green-600" /> Review Withdrawal Request
            </DialogTitle>
            <DialogDescription>
              Submitted by <strong>{selectedWD?.dealerId?.fullName}</strong> on {selectedWD ? new Date(selectedWD.createdAt).toLocaleDateString("en-IN") : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedWD && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requested Amount</span>
                  <span className="font-bold text-base">₹{selectedWD.requestedAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee (10%)</span>
                  <span className="text-red-600 font-medium">- ₹{selectedWD.processingFee}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-green-700 pt-2 border-t border-border">
                  <span>Dealer Receives</span>
                  <span>₹{selectedWD.payableAmount}</span>
                </div>
              </div>

              {/* Bank details */}
              <div className="border border-border rounded-xl p-4 space-y-2.5">
                <p className="text-sm font-bold flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" />Bank Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Account Holder</p>
                    <p className="font-semibold">{selectedWD.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">IFSC Code</p>
                    <p className="font-mono font-semibold">{selectedWD.ifscCode}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Account Number</p>
                    <p className="font-mono font-semibold">{selectedWD.bankAccountNumber}</p>
                  </div>
                </div>
              </div>

              {/* Dealer info */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {selectedWD.dealerId?.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{selectedWD.dealerId?.fullName}</p>
                  <p className="text-muted-foreground text-xs">{selectedWD.dealerId?.email} · {selectedWD.dealerId?.phone}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Admin Notes (optional)</Label>
                <Textarea value={wdAdminNotes} onChange={e => setWdAdminNotes(e.target.value)}
                  placeholder="Reason for approval/rejection..." className="min-h-[80px]" />
              </div>

              <DialogFooter className="gap-2 pt-1">
                <Button variant="outline" onClick={() => { setSelectedWD(null); setWdAdminNotes(""); }}>
                  Cancel
                </Button>
                <Button variant="destructive" disabled={wdProcessing}
                  onClick={() => processDealerWithdrawal("REJECTED")}>
                  <XCircle className="w-4 h-4 mr-1.5" />
                  {wdProcessing ? "Processing..." : "Reject"}
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={wdProcessing}
                  onClick={() => processDealerWithdrawal("APPROVED")}>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  {wdProcessing ? "Processing..." : "Approve"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
