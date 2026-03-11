import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Share2, Copy, CheckCircle, Users, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";

const WalletDashboard = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [wallet,          setWallet]          = useState<any>(null);
  const [referrals,       setReferrals]       = useState<any[]>([]);
  const [withdrawals,     setWithdrawals]     = useState<any[]>([]);
  const [referralCode,    setReferralCode]    = useState<string>("");
  const [settings,        setSettings]        = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [showWithdraw,    setShowWithdraw]    = useState(false);
  const [withdrawAmount,  setWithdrawAmount]  = useState("");
  const [copied,          setCopied]          = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (user) fetchData();
  }, [user, authLoading]);

  // ── FETCH ─────────────────────────────────────────────────────────────────────
  // GET /api/wallet  →  { success, wallet, referrals, withdrawals, settings, referralCode }
  const fetchData = async () => {
    try {
      const data = await api.get("/api/wallet");
      if (data.success) {
        setWallet(data.wallet);
        setReferrals(data.referrals    || []);
        setWithdrawals(data.withdrawals || []);
        setSettings(data.settings);
        setReferralCode(data.referralCode || "");
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleCopyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Referral link copied!" });
  };

  const handleShareReferral = () => {
    if (!referralCode) return;
    const url  = `${window.location.origin}/auth?ref=${referralCode}`;
    const text = `Get your Emergency Safety QRR! Use my referral link: ${url}`;
    if (navigator.share) {
      navigator.share({ title: "Emergency Safety QRR", text, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  // ── WITHDRAW ──────────────────────────────────────────────────────────────────
  // POST /api/wallet/withdraw  →  { success, withdrawal, newBalance }
  const handleWithdraw = async () => {
    const amt = parseInt(withdrawAmount);
    if (!amt || amt <= 0) { toast({ title: "Invalid amount", variant: "destructive" }); return; }
    const min = settings?.minWithdrawal || 100;
    if (amt < min) { toast({ title: `Minimum withdrawal is ₹${min}`, variant: "destructive" }); return; }
    if (amt > (wallet?.balance || 0)) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }

    setWithdrawLoading(true);
    try {
      const data = await api.post("/api/wallet/withdraw", { amount: amt });
      if (!data.success) throw new Error(data.message);
      const fee    = Math.round((amt * (settings?.platformFeePercent || 20)) / 100);
      const payout = amt - fee;
      toast({ title: "Withdrawal Requested", description: `₹${payout} will be paid after admin approval (₹${fee} platform fee).` });
      setShowWithdraw(false);
      setWithdrawAmount("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const feePercent  = settings?.platformFeePercent || 20;
  const minWithdraw = settings?.minWithdrawal      || 100;
  const rewardAmt   = settings?.rewardPerReferral  || 50;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container max-w-4xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Wallet & Referrals</h1>
            <p className="text-muted-foreground">Earn money by referring friends to Emergency Safety QRR</p>
          </motion.div>

          {/* Balance Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-0 shadow-card">
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">₹{wallet?.balance || 0}</p>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <Button variant="hero" size="sm" className="mt-3"
                  onClick={() => setShowWithdraw(true)}
                  disabled={(wallet?.balance || 0) < minWithdraw}>
                  Withdraw
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardContent className="p-6 text-center">
                <ArrowDownCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">₹{wallet?.totalEarned || 0}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardContent className="p-6 text-center">
                <ArrowUpCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">₹{wallet?.totalWithdrawn || 0}</p>
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Share Card */}
          <Card className="border-0 shadow-card gradient-primary">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-primary-foreground mb-1">Share & Earn ₹{rewardAmt}</h3>
                  <p className="text-primary-foreground/80 text-sm">For every friend who orders via your referral link</p>
                  <div className="mt-3 flex items-center gap-2 bg-background/20 rounded-lg p-2">
                    <code className="text-xs text-primary-foreground flex-1 truncate">
                      {window.location.origin}/auth?ref={referralCode || "..."}
                    </code>
                    <Button variant="ghost" size="sm" className="text-primary-foreground" onClick={handleCopyReferral}>
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button size="lg" className="bg-background text-primary hover:bg-background/90" onClick={handleShareReferral}>
                  <Share2 className="w-4 h-4 mr-2" /> Share Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No referrals yet. Share your link to start earning!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((r, i) => (
                      <TableRow key={r._id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-semibold">₹{r.rewardAmount}</TableCell>
                        <TableCell><Badge variant={r.isPaid ? "default" : "outline"}>{r.isPaid ? "Paid" : "Pending"}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          {withdrawals.length > 0 && (
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5" /> Withdrawal History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((w) => (
                      <TableRow key={w._id}>
                        <TableCell>₹{w.amount}</TableCell>
                        <TableCell className="text-muted-foreground">₹{w.platformFee}</TableCell>
                        <TableCell className="font-semibold">₹{w.payoutAmount}</TableCell>
                        <TableCell>
                          <Badge className={w.status === "PAID" ? "bg-green-100 text-green-800" : w.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                            {w.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              A {feePercent}% platform fee will be deducted. Minimum withdrawal: ₹{minWithdraw}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available: <strong>₹{wallet?.balance || 0}</strong></p>
              <Input type="number" placeholder="Enter amount" value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)} />
              {withdrawAmount && parseInt(withdrawAmount) > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  You'll receive: <strong>₹{Math.round(parseInt(withdrawAmount) * (1 - feePercent / 100))}</strong>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleWithdraw} disabled={withdrawLoading}>
              {withdrawLoading ? "Processing..." : "Request Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletDashboard;
