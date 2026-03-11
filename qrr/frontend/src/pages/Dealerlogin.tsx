import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, User, Phone, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const DealerAuth = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginData,  setLoginData]  = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ fullName: "", phone: "", email: "", password: "" });

  // ── DEALER LOGIN ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setLoading(false);

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      return;
    }

    // Role check — signIn stores user in localStorage
    const stored = localStorage.getItem("user");
    const u = stored ? JSON.parse(stored) : null;
    if (u?.role === "dealer" || u?.role === "admin") {
      toast({ title: "Dealer Logged In Successfully" });
      navigate("/dealer-dashboard");
    } else {
      toast({ title: "Access Denied", description: "You don't have dealer privileges.", variant: "destructive" });
      // clear token so user is signed out
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // ── DEALER SIGNUP ─────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.fullName, signupData.phone);
    setLoading(false);

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "Contact admin to get dealer access assigned." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 gradient-hero">
        <div className="container max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                <BadgeCheck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">DEALER PANEL</h1>
              <p className="text-muted-foreground">Login or Create Dealer Account</p>
            </div>

            <Card className="shadow-elevated border-0">
              <CardContent className="pt-6">
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* ── LOGIN ── */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> Email</Label>
                        <Input type="email" placeholder="dealer@email.com" value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Lock className="w-4 h-4 text-muted-foreground" /> Password</Label>
                        <Input type="password" placeholder="••••••••" value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                      </div>
                      <Button type="submit" size="xl" className="w-full" disabled={loading}>
                        {loading ? "Logging in..." : "Dealer Login"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* ── SIGNUP ── */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> Full Name</Label>
                        <Input placeholder="Your full name" value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Phone</Label>
                        <Input placeholder="+91 98765 43210" value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> Email</Label>
                        <Input type="email" placeholder="dealer@email.com" value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Lock className="w-4 h-4 text-muted-foreground" /> Password</Label>
                        <Input type="password" placeholder="Minimum 6 characters" value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required minLength={6} />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Dealer Account"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        After signup, contact admin to get dealer role assigned.
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DealerAuth;
